import React, { useState, useEffect, useMemo } from 'react';
import { procesarErrorApi } from '../../../utils/errorHandler';
import { Card, Button, Row, Col, Table, Form, Modal, Spinner, Pagination } from 'react-bootstrap';
import { agruparTurnosMusculacion, coincideFiltroDia } from './shiftsGroupingHelper';

const ShiftsManager = ({
  shifts = [],
  activities = [],
  teachers = [],
  branches = [],
  cargando,
  onRecargar,
  onMostrarAlerta,
  onPedirEliminar,
  apiBase
}) => {
  const [filterActividad, setFiltroActividad] = useState('todas');
  const [filterDia, setFiltroDia] = useState('todos');
  const [filterSede, setFiltroSede] = useState('');

  // Agrupación / Resumen de Musculación
  const [resumirMusculacion, setResumirMusculacion] = useState(true);
  const [turnosExpandidos, setTurnosExpandidos] = useState({});

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 8;

  useEffect(() => {
    setPaginaActual(1);
  }, [filterActividad, filterDia, filterSede, resumirMusculacion]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [shiftEditando, setTurnoEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    activity_id: '',
    startTime: '07:00',
    endTime: '09:00',
    dayOfWeek: 'Lunes a Sábado',
    teacher_id: '',
    branch_id: ''
  });

  const esHoraValida = (hora) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(hora?.trim() || '');

  const convertirHoraAMin = (hora) => {
    if (!esHoraValida(hora)) return null;
    const [h, m] = hora.trim().split(':').map(Number);
    return h * 60 + m;
  };

  const handleAbrirModal = (shift = null) => {
    if (shift) {
      setTurnoEditando(shift);
      setFormData({
        activity_id: shift.activity_id || (shift.activity?.id ? shift.activity.id.toString() : ''),
        startTime: shift.startTime || '07:00',
        endTime: shift.endTime || '09:00',
        dayOfWeek: shift.dayOfWeek || 'Lunes a Sábado',
        teacher_id: shift.teacher_id || (shift.teacher?.id ? shift.teacher.id.toString() : ''),
        branch_id: shift.branch_id || (shift.branch?.id ? shift.branch.id.toString() : '')
      });
    } else {
      setTurnoEditando(null);
      const primeraAct = activities.length > 0 ? activities[0] : null;
      setFormData({
        activity_id: primeraAct ? primeraAct.id : '',
        startTime: '07:00',
        endTime: '09:00',
        dayOfWeek: 'Lunes a Sábado',
        teacher_id: primeraAct?.teacher_id ? primeraAct.teacher_id.toString() : (teachers.length > 0 ? teachers[0].id : ''),
        branch_id: primeraAct?.branch_id ? primeraAct.branch_id.toString() : (branches.length > 0 ? branches[0].id : '')
      });
    }
    setShowModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();

    // Validar formato y coherencia de horarios reales (solo si no es edición grupal de sede/profesor)
    if (!shiftEditando?.isGroup) {
      if (!esHoraValida(formData.startTime)) {
        onMostrarAlerta('Debe ingresar un horario de inicio válido entre 00:00 y 23:59.', 'danger');
        return;
      }
      if (!esHoraValida(formData.endTime)) {
        onMostrarAlerta('Debe ingresar un horario de fin válido entre 00:00 y 23:59.', 'danger');
        return;
      }
      const minInicio = convertirHoraAMin(formData.startTime);
      const minFin = convertirHoraAMin(formData.endTime);
      if (minFin <= minInicio) {
        onMostrarAlerta(`El horario de fin (${formData.endTime}) debe ser posterior al horario de inicio (${formData.startTime}).`, 'danger');
        return;
      }
    }

    // Validar coincidencia de sede entre el Profesor y la Sede de la actividad/turno
    if (formData.teacher_id) {
      const teacher = teachers.find((p) => p.id?.toString() === formData.teacher_id.toString());

      // Determinar la sede efectiva del turno
      let effectiveSedeId = formData.branch_id;
      if (!effectiveSedeId && formData.activity_id) {
        const act = activities.find((a) => a.id?.toString() === formData.activity_id.toString());
        if (act && act.branch_id) effectiveSedeId = act.branch_id.toString();
      }

      if (teacher && teacher.branch_id && effectiveSedeId && teacher.branch_id.toString() !== effectiveSedeId.toString()) {
        const branchProfObj = branches.find((s) => s.id?.toString() === teacher.branch_id.toString());
        const branchTurnoObj = branches.find((s) => s.id?.toString() === effectiveSedeId.toString());

        const nomSedeProf = branchProfObj ? branchProfObj.name : `Sede #${teacher.branch_id}`;
        const nomSedeTurno = branchTurnoObj ? branchTurnoObj.name : `Sede #${effectiveSedeId}`;

        onMostrarAlerta(
          `El profesor ${teacher.name} ${teacher.lastname} está asignado a ${nomSedeProf} y no puede dictar clases en ${nomSedeTurno}.`,
          'danger'
        );
        return;
      }
    }

    setGuardando(true);

    try {
      if (shiftEditando?.isGroup && shiftEditando.subShifts?.length > 0) {
        // Actualización masiva de profesor o sede para el grupo de musculación
        await Promise.all(
          shiftEditando.subShifts.map((s) =>
            fetch(`${apiBase}/shifts/${s.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                activity_id: formData.activity_id || s.activity_id,
                teacher_id: formData.teacher_id ? parseInt(formData.teacher_id, 10) : null,
                branch_id: formData.branch_id ? parseInt(formData.branch_id, 10) : null
              })
            })
          )
        );
        onMostrarAlerta(`Se actualizaron exitosamente ${shiftEditando.subShifts.length} turnos.`);
        setShowModal(false);
        onRecargar();
        return;
      }

      const endpoint = shiftEditando
        ? `${apiBase}/shifts/${shiftEditando.id}`
        : `${apiBase}/shifts`;
      const method = shiftEditando ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onMostrarAlerta(data.message);
        setShowModal(false);
        onRecargar();
      } else {
        const msg = procesarErrorApi(null, data, 'Guardar Turno');
        onMostrarAlerta(msg, 'danger');
      }
    } catch {
      const msg = procesarErrorApi(new Error('Network error'), null, 'Guardar Turno');
      onMostrarAlerta(msg, 'danger');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      const res = await fetch(`${apiBase}/shifts/${id}/toggle-status`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok && data.success) {
        onMostrarAlerta(data.message);
        onRecargar();
      } else {
        const msg = procesarErrorApi(null, data, 'Toggle Estado Turno');
        onMostrarAlerta(msg, 'danger');
      }
    } catch {
      const msg = procesarErrorApi(new Error('Network error'), null, 'Toggle Estado Turno');
      onMostrarAlerta(msg, 'danger');
    }
  };

  const handleToggleEstadoGrupo = async (subShifts, estadoActual) => {
    try {
      const targetStatus = !estadoActual;
      const turnosACambiar = subShifts.filter((s) => s.status !== targetStatus);

      await Promise.all(
        turnosACambiar.map((s) =>
          fetch(`${apiBase}/shifts/${s.id}/toggle-status`, { method: 'PATCH' })
        )
      );

      onMostrarAlerta(
        `Se ${targetStatus ? 'habilitaron' : 'pausaron'} ${turnosACambiar.length} turnos exitosamente.`
      );
      onRecargar();
    } catch {
      const msg = procesarErrorApi(new Error('Network error'), null, 'Toggle Estado Grupo');
      onMostrarAlerta(msg, 'danger');
    }
  };

  const toggleExpandir = (id) => {
    setTurnosExpandidos((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filtrado de turnos iniciales
  const shiftsFiltrados = useMemo(() => {
    return shifts.filter((t) => {
      const coincideActividad =
        filterActividad === 'todas' ||
        !filterActividad ||
        (t.activity_id && t.activity_id.toString() === filterActividad.toString());

      const coincideDia = coincideFiltroDia(t, filterDia);

      const coincideSede =
        !filterSede ||
        (t.branch_id && t.branch_id.toString() === filterSede.toString());

      return coincideActividad && coincideDia && coincideSede;
    });
  }, [shifts, filterActividad, filterDia, filterSede]);

  // Agrupar turnos de Musculación si la opción está activa
  const itemsParaMostrar = useMemo(() => {
    if (!resumirMusculacion) {
      return shiftsFiltrados.map((t) => ({ ...t, isGroup: false }));
    }
    return agruparTurnosMusculacion(shiftsFiltrados, activities);
  }, [shiftsFiltrados, resumirMusculacion, activities]);

  // Cálculo de paginación
  const totalPaginas = Math.ceil(itemsParaMostrar.length / elementosPorPagina) || 1;
  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const itemsPaginados = itemsParaMostrar.slice(indiceInicio, indiceInicio + elementosPorPagina);

  // Asegurar que la página actual nunca exceda el total de páginas
  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(Math.max(1, totalPaginas));
    }
  }, [totalPaginas, paginaActual]);

  // Sede efectiva seleccionada en el formulario
  const selectedActividad = activities.find((a) => a.id?.toString() === formData.activity_id.toString());
  const effectiveSedeForm = formData.branch_id || (selectedActividad?.branch_id ? selectedActividad.branch_id.toString() : '');

  // Renderizador inteligente de paginación con elipsis
  const renderPagination = () => {
    if (totalPaginas <= 1) return null;

    const items = [];
    const maxButtons = 5;
    const hayPrev = paginaActual > 1;
    const hayNext = paginaActual < totalPaginas;

    let startPage = Math.max(1, paginaActual - 2);
    let endPage = Math.min(totalPaginas, paginaActual + 2);

    if (paginaActual <= 3) {
      endPage = Math.min(totalPaginas, maxButtons);
    } else if (paginaActual >= totalPaginas - 2) {
      startPage = Math.max(1, totalPaginas - maxButtons + 1);
    }

    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} active={paginaActual === 1} onClick={() => setPaginaActual(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
      }
    }

    for (let p = startPage; p <= endPage; p++) {
      items.push(
        <Pagination.Item
          key={p}
          active={p === paginaActual}
          onClick={() => setPaginaActual(p)}
        >
          {p}
        </Pagination.Item>
      );
    }

    if (endPage < totalPaginas) {
      if (endPage < totalPaginas - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
      }
      items.push(
        <Pagination.Item
          key={totalPaginas}
          active={paginaActual === totalPaginas}
          onClick={() => setPaginaActual(totalPaginas)}
        >
          {totalPaginas}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="mb-0 custom-admin-pagination">
        <Pagination.First
          disabled={!hayPrev}
          onClick={() => setPaginaActual(1)}
          title="Primera página"
        />
        <Pagination.Prev
          disabled={!hayPrev}
          onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
          title="Página anterior"
        />
        {items}
        <Pagination.Next
          disabled={!hayNext}
          onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
          title="Página siguiente"
        />
        <Pagination.Last
          disabled={!hayNext}
          onClick={() => setPaginaActual(totalPaginas)}
          title="Última página"
        />
      </Pagination>
    );
  };

  return (
    <Card className="glass-card border-0 p-4 text-white">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-white">Gestión y Programación de Turnos</h4>
          <p className="text-secondary small mb-0">
            Organiza los bloques horarios por días (Lunes a Sábado), sedes y profesores asignados.
          </p>
        </div>

        <div className="d-flex align-items-center flex-wrap gap-3">
          <Form.Check
            type="switch"
            id="switch-resumir-musculacion"
            label="Resumir turnos de Musculación"
            checked={resumirMusculacion}
            onChange={(e) => setResumirMusculacion(e.target.checked)}
            className="text-white small fw-medium"
            title="Agrupa los horarios repetitivos de Musculación según sus días y franjas horarias"
          />

          <Button
            variant="primary"
            className="hero-btn fw-bold px-4 py-2 d-inline-flex align-items-center gap-2 rounded-pill shadow"
            onClick={() => handleAbrirModal()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Nuevo Turno
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label className="small text-secondary">Filtrar por Actividad</Form.Label>
            <Form.Select
              value={filterActividad}
              onChange={(e) => setFiltroActividad(e.target.value)}
            >
              <option value="todas">Todas las Actividades</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="small text-secondary">Filtrar por Días</Form.Label>
            <Form.Select
              value={filterDia}
              onChange={(e) => setFiltroDia(e.target.value)}
            >
              <option value="todos">Todos los Días</option>
              <option value="Lunes a Sábado">Lunes a Sábado</option>
              <option value="Lunes a Viernes">Lunes a Viernes</option>
              <option value="Lunes, Miércoles y Viernes">Lunes, Miércoles y Viernes</option>
              <option value="Martes y Jueves">Martes y Jueves</option>
              <option value="Sábados">Sábados</option>
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="small text-secondary">Filtrar por Sede</Form.Label>
            <Form.Select
              value={filterSede}
              onChange={(e) => setFiltroSede(e.target.value)}
            >
              <option value="">Todas las Sedes</option>
              {branches.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-secondary">Cargando turnos...</p>
        </div>
      ) : itemsParaMostrar.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <p className="mb-0">No se encontraron turnos con los filtros seleccionados.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <Table className="admin-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Actividad</th>
                  <th>Horario</th>
                  <th>Días</th>
                  <th>Profesor a Cargo</th>
                  <th>Sede</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {itemsPaginados.map((t) => {
                  const estaExpandido = !!turnosExpandidos[t.id];

                  return (
                    <React.Fragment key={t.id}>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center flex-wrap gap-2">
                            <span className="fw-bold text-white">
                              {t.activity?.name || 'Actividad sin asignar'}
                            </span>
                            {t.isGroup && (
                              <span
                                className="badge bg-primary bg-opacity-25 text-info border border-info border-opacity-25 rounded-pill px-2 py-1"
                                style={{ fontSize: '0.74rem' }}
                                title="Resumen de turnos de musculación"
                              >
                                {t.totalTurnos} turnos
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="badge-token-accent">
                            {t.startTime} - {t.endTime} hs
                          </span>
                          {t.isGroup && (
                            <div className="text-secondary small mt-1" style={{ fontSize: '0.75rem' }}>
                              Franja horaria continua
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="text-white small fw-medium">{t.dayOfWeek}</span>
                        </td>
                        <td>
                          {t.teacher ? (
                            <span className="fw-medium text-white small">
                              {t.teacher.name} {t.teacher.lastname}
                            </span>
                          ) : (
                            <span className="text-secondary small">Sin profesor</span>
                          )}
                        </td>
                        <td>
                          {t.branch ? (
                            <span className="small text-white">{t.branch.name}</span>
                          ) : (
                            <span className="text-secondary small">General</span>
                          )}
                        </td>
                        <td>
                          {t.isGroup && t.isPartialStatus ? (
                            <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-25 rounded-pill px-2 py-1 small">
                              Parcial ({t.activosCount}/{t.totalTurnos})
                            </span>
                          ) : (
                            <span className={t.status ? 'badge-status-active' : 'badge-status-inactive'}>
                              {t.status ? 'Disponible' : 'Pausado'}
                            </span>
                          )}
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex align-items-center gap-2">
                            {t.isGroup ? (
                              <>
                                <Button
                                  size="sm"
                                  className={t.status ? 'btn-token-outline-warning rounded-pill px-3 py-1' : 'btn-token-outline-primary rounded-pill px-3 py-1'}
                                  onClick={() => handleToggleEstadoGrupo(t.subShifts, t.status)}
                                  title={t.status ? 'Pausar todos los turnos del grupo' : 'Habilitar todos los turnos del grupo'}
                                >
                                  {t.status ? 'Pausar' : 'Habilitar'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-info"
                                  className="rounded-pill px-3 py-1 small"
                                  onClick={() => toggleExpandir(t.id)}
                                  title="Ver lista de turnos individuales"
                                >
                                  {estaExpandido ? 'Ocultar' : `Ver ${t.totalTurnos}`}
                                </Button>
                                <Button
                                  size="sm"
                                  className="btn-token-outline-primary rounded-pill px-3 py-1"
                                  onClick={() => handleAbrirModal(t)}
                                  title="Editar sede y profesor del grupo"
                                >
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  className="btn-token-outline-danger rounded-pill px-3 py-1"
                                  onClick={() =>
                                    onPedirEliminar({
                                      type: 'shift-group',
                                      id: t.id,
                                      ids: t.subShifts.map((s) => s.id),
                                      name: `${t.activity?.name || 'Musculación'} - ${t.dayOfWeek} (${t.startTime} a ${t.endTime}) [${t.totalTurnos} turnos]`
                                    })
                                  }
                                  title="Eliminar todos los turnos del grupo"
                                >
                                  Eliminar
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  className="btn-token-outline-warning rounded-pill px-3 py-1"
                                  onClick={() => handleToggleEstado(t.id)}
                                  title={t.status ? 'Pausar turno' : 'Habilitar turno'}
                                >
                                  {t.status ? 'Pausar' : 'Habilitar'}
                                </Button>
                                <Button
                                  size="sm"
                                  className="btn-token-outline-primary rounded-pill px-3 py-1"
                                  onClick={() => handleAbrirModal(t)}
                                  title="Editar turno"
                                >
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  className="btn-token-outline-danger rounded-pill px-3 py-1"
                                  onClick={() =>
                                    onPedirEliminar({
                                      type: 'shift',
                                      id: t.id,
                                      name: `${t.activity?.name || 'Turno'} (${t.startTime} - ${t.endTime})`
                                    })
                                  }
                                  title="Eliminar permanentemente"
                                >
                                  Eliminar
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Desglose desplegable de turnos individuales si es un grupo */}
                      {t.isGroup && estaExpandido && (
                        <tr className="bg-dark bg-opacity-50">
                          <td colSpan={7} className="p-3 border-0">
                            <div
                              className="p-3 rounded-3"
                              style={{
                                background: 'rgba(15, 23, 42, 0.75)',
                                border: '1px solid rgba(88, 86, 240, 0.25)'
                              }}
                            >
                              <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                                <span className="small text-white fw-bold">
                                  Turnos individuales ({t.subShifts.length} turnos de {t.activity?.duration || 60} min):
                                </span>
                                <span className="small text-secondary">
                                  Puedes pausar, editar o eliminar turnos individuales si lo deseas.
                                </span>
                              </div>
                              <div className="d-flex flex-wrap gap-2">
                                {t.subShifts.map((sub) => (
                                  <div
                                    key={sub.id}
                                    className={`d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill small border ${
                                      sub.status
                                        ? 'border-primary border-opacity-50 text-white'
                                        : 'border-secondary text-secondary opacity-75'
                                    }`}
                                    style={{
                                      background: sub.status ? 'rgba(88, 86, 240, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    <span className="fw-semibold">
                                      {sub.dayOfWeek ? `${sub.dayOfWeek.slice(0, 3)} ` : ''}
                                      {sub.startTime} - {sub.endTime} hs
                                    </span>
                                    <button
                                      type="button"
                                      className="btn btn-link p-0 text-decoration-none d-inline-flex align-items-center opacity-75"
                                      onClick={() => handleToggleEstado(sub.id)}
                                      title={sub.status ? 'Pausar este turno específico' : 'Habilitar este turno específico'}
                                    >
                                      {sub.status ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning">
                                          <rect x="6" y="4" width="4" height="16" />
                                          <rect x="14" y="4" width="4" height="16" />
                                        </svg>
                                      ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                                          <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-link p-0 text-decoration-none d-inline-flex align-items-center opacity-75"
                                      onClick={() => handleAbrirModal(sub)}
                                      title="Editar este turno específico"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-info">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-link p-0 text-decoration-none d-inline-flex align-items-center opacity-75"
                                      onClick={() =>
                                        onPedirEliminar({
                                          type: 'shift',
                                          id: sub.id,
                                          name: `${sub.activity?.name || 'Turno'} (${sub.startTime} - ${sub.endTime} - ${sub.dayOfWeek})`
                                        })
                                      }
                                      title="Eliminar este turno específico"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {/* Controles de Paginación */}
          {itemsParaMostrar.length > 0 && (
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-4 pt-3 border-top border-secondary border-opacity-25">
              <span className="small text-secondary">
                Mostrando turnos {indiceInicio + 1} a {Math.min(indiceInicio + elementosPorPagina, itemsParaMostrar.length)} de {itemsParaMostrar.length}
                {resumirMusculacion && shiftsFiltrados.length !== itemsParaMostrar.length && (
                  <span className="text-info ms-1">({shiftsFiltrados.length} turnos en total)</span>
                )}
              </span>

              {renderPagination()}
            </div>
          )}
        </>
      )}

      {/* Modal Crear / Editar Turno */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="glass-card text-white">
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title className="fw-bold">
            {shiftEditando?.isGroup
              ? `Editar Grupo de Musculación (${shiftEditando.totalTurnos} turnos)`
              : shiftEditando
              ? 'Editar Horario de Turno'
              : 'Crear Nuevo Turno'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGuardar}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Actividad *</Form.Label>
                  <Form.Select
                    required
                    value={formData.activity_id}
                    disabled={!!shiftEditando?.isGroup}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const act = activities.find((a) => a.id?.toString() === selectedId);
                      setFormData((prev) => {
                        let nuevaHoraFin = prev.endTime;
                        if (act?.duration && esHoraValida(prev.startTime)) {
                          const [h, m] = prev.startTime.split(':').map(Number);
                          const total = Math.min(23 * 60 + 59, h * 60 + m + act.duration);
                          nuevaHoraFin = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
                        }
                        return {
                          ...prev,
                          activity_id: selectedId,
                          teacher_id: act?.teacher_id ? act.teacher_id.toString() : (act?.teacher?.id ? act.teacher.id.toString() : prev.teacher_id),
                          branch_id: act?.branch_id ? act.branch_id.toString() : (act?.branch?.id ? act.branch.id.toString() : prev.branch_id),
                          endTime: nuevaHoraFin
                        };
                      });
                    }}
                  >
                    <option value="">-- Seleccionar Actividad --</option>
                    {activities.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} {a.teacher ? `(Prof. ${a.teacher.name} ${a.teacher.lastname})` : ''}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {!shiftEditando?.isGroup && (
                <>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="d-flex align-items-center gap-1 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Horario de Inicio *
                      </Form.Label>
                      <Form.Control
                        type="time"
                        required
                        step="60"
                        className="custom-time-input"
                        value={formData.startTime}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => {
                            const act = activities.find((a) => a.id?.toString() === prev.activity_id?.toString());
                            const dur = act?.duration || 60;
                            let nuevaHoraFin = prev.endTime;
                            if (esHoraValida(val)) {
                              const [h, m] = val.split(':').map(Number);
                              const total = Math.min(23 * 60 + 59, h * 60 + m + dur);
                              nuevaHoraFin = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
                            }
                            return { ...prev, startTime: val, endTime: nuevaHoraFin };
                          });
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="d-flex align-items-center gap-1 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Horario de Fin *
                      </Form.Label>
                      <Form.Control
                        type="time"
                        required
                        step="60"
                        className="custom-time-input"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  {esHoraValida(formData.startTime) && esHoraValida(formData.endTime) && convertirHoraAMin(formData.endTime) <= convertirHoraAMin(formData.startTime) && (
                    <Col md={12}>
                      <div className="alert alert-danger py-1 px-2 small mb-0 d-flex align-items-center gap-1">
                        <span>⚠️ El horario de fin ({formData.endTime}) debe ser posterior al de inicio ({formData.startTime}).</span>
                      </div>
                    </Col>
                  )}
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Días de la Semana *</Form.Label>
                      <Form.Select
                        value={formData.dayOfWeek}
                        onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                      >
                        <option value="Lunes a Sábado">Lunes a Sábado (Todos los días)</option>
                        <option value="Lunes a Viernes">Lunes a Viernes</option>
                        <option value="Lunes, Miércoles y Viernes">Lunes, Miércoles y Viernes</option>
                        <option value="Martes y Jueves">Martes y Jueves</option>
                        <option value="Sábados">Sábados</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </>
              )}

              {shiftEditando?.isGroup && (
                <Col md={12}>
                  <div className="p-3 rounded-3" style={{ background: 'rgba(88, 86, 240, 0.1)', border: '1px solid rgba(88, 86, 240, 0.3)' }}>
                    <div className="fw-semibold text-white mb-1">
                      {shiftEditando.activity?.name} • {shiftEditando.dayOfWeek}
                    </div>
                    <div className="small text-secondary mb-0">
                      Franja horaria: <span className="text-info">{shiftEditando.startTime} a {shiftEditando.endTime} hs</span> ({shiftEditando.totalTurnos} bloques horarios). Puedes reasignar la sede o el profesor a cargo para todos los turnos del grupo.
                    </div>
                  </div>
                </Col>
              )}

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Sede</Form.Label>
                  <Form.Select
                    value={formData.branch_id}
                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  >
                    <option value="">-- Todas las Sedes --</option>
                    {branches.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.city})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Profesor a Cargo</Form.Label>
                  <Form.Select
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                  >
                    <option value="">-- Sin profesor asignado --</option>
                    {teachers.map((p) => {
                      const branchProfObj = branches.find((s) => s.id?.toString() === p.branch_id?.toString());
                      const esMismaSede = !effectiveSedeForm || !p.branch_id || p.branch_id.toString() === effectiveSedeForm.toString();

                      return (
                        <option key={p.id} value={p.id} disabled={!esMismaSede}>
                          {p.name} {p.lastname} ({p.specialty}){branchProfObj ? ` • ${branchProfObj.name}` : ''}{!esMismaSede ? ' [Sede incompatible]' : ''}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-secondary">
            <Button variant="outline-light" onClick={() => setShowModal(false)} disabled={guardando} className="rounded-pill px-3">
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={guardando} className="hero-btn rounded-pill px-4 fw-bold">
              {guardando ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Guardando...
                </>
              ) : shiftEditando ? (
                'Guardar Cambios'
              ) : (
                'Crear Turno'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
};

export default ShiftsManager;
