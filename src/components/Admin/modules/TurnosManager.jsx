import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Table, Form, Modal, Spinner, Pagination } from 'react-bootstrap';

const TurnosManager = ({
  turnos = [],
  actividades = [],
  profesores = [],
  sedes = [],
  cargando,
  onRecargar,
  onMostrarAlerta,
  onPedirEliminar,
  apiBase
}) => {
  const [filtroActividad, setFiltroActividad] = useState('todas');
  const [filtroDia, setFiltroDia] = useState('todos');
  const [filtroSede, setFiltroSede] = useState('');

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 8;

  useEffect(() => {
    setPaginaActual(1);
  }, [filtroActividad, filtroDia, filtroSede]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [turnoEditando, setTurnoEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    actividad_id: '',
    horarioInicio: '07:00',
    horaFin: '09:00',
    dia_semana: 'Lunes a Sábado',
    profesor_id: '',
    sede_id: ''
  });

  const esHoraValida = (hora) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(hora?.trim() || '');

  const convertirHoraAMin = (hora) => {
    if (!esHoraValida(hora)) return null;
    const [h, m] = hora.trim().split(':').map(Number);
    return h * 60 + m;
  };

  const handleAbrirModal = (turno = null) => {
    if (turno) {
      setTurnoEditando(turno);
      setFormData({
        actividad_id: turno.actividad_id || '',
        horarioInicio: turno.horarioInicio || '07:00',
        horaFin: turno.horaFin || '09:00',
        dia_semana: turno.dia_semana || 'Lunes a Sábado',
        profesor_id: turno.profesor_id || '',
        sede_id: turno.sede_id || ''
      });
    } else {
      setTurnoEditando(null);
      const primeraAct = actividades.length > 0 ? actividades[0] : null;
      setFormData({
        actividad_id: primeraAct ? primeraAct.id : '',
        horarioInicio: '07:00',
        horaFin: '09:00',
        dia_semana: 'Lunes a Sábado',
        profesor_id: primeraAct?.profesor_id ? primeraAct.profesor_id.toString() : (profesores.length > 0 ? profesores[0].id : ''),
        sede_id: primeraAct?.sede_id ? primeraAct.sede_id.toString() : (sedes.length > 0 ? sedes[0].id : '')
      });
    }
    setShowModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();

    // Validar formato y coherencia de horarios reales
    if (!esHoraValida(formData.horarioInicio)) {
      onMostrarAlerta('Debe ingresar un horario de inicio válido entre 00:00 y 23:59.', 'danger');
      return;
    }
    if (!esHoraValida(formData.horaFin)) {
      onMostrarAlerta('Debe ingresar un horario de fin válido entre 00:00 y 23:59.', 'danger');
      return;
    }
    const minInicio = convertirHoraAMin(formData.horarioInicio);
    const minFin = convertirHoraAMin(formData.horaFin);
    if (minFin <= minInicio) {
      onMostrarAlerta(`El horario de fin (${formData.horaFin}) debe ser posterior al horario de inicio (${formData.horarioInicio}).`, 'danger');
      return;
    }

    // Validar coincidencia de sede entre el Profesor y la Sede de la actividad/turno
    if (formData.profesor_id) {
      const prof = profesores.find((p) => p.id?.toString() === formData.profesor_id.toString());
      
      // Determinar la sede efectiva del turno
      let effectiveSedeId = formData.sede_id;
      if (!effectiveSedeId && formData.actividad_id) {
        const act = actividades.find((a) => a.id?.toString() === formData.actividad_id.toString());
        if (act && act.sede_id) effectiveSedeId = act.sede_id.toString();
      }

      if (prof && prof.sede_id && effectiveSedeId && prof.sede_id.toString() !== effectiveSedeId.toString()) {
        const sedeProfObj = sedes.find((s) => s.id?.toString() === prof.sede_id.toString());
        const sedeTurnoObj = sedes.find((s) => s.id?.toString() === effectiveSedeId.toString());

        const nomSedeProf = sedeProfObj ? sedeProfObj.nombre : `Sede #${prof.sede_id}`;
        const nomSedeTurno = sedeTurnoObj ? sedeTurnoObj.nombre : `Sede #${effectiveSedeId}`;

        onMostrarAlerta(
          `El profesor ${prof.nombre} ${prof.apellido} está asignado a ${nomSedeProf} y no puede dictar clases en ${nomSedeTurno}.`,
          'danger'
        );
        return;
      }
    }

    setGuardando(true);

    try {
      const endpoint = turnoEditando
        ? `${apiBase}/turnos/${turnoEditando.id}`
        : `${apiBase}/turnos`;
      const method = turnoEditando ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.exito) {
        onMostrarAlerta(data.mensaje);
        setShowModal(false);
        onRecargar();
      } else {
        onMostrarAlerta(data.mensaje || 'Error al guardar turno', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al guardar turno', 'danger');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      const res = await fetch(`${apiBase}/turnos/${id}/toggle-estado`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok && data.exito) {
        onMostrarAlerta(data.mensaje);
        onRecargar();
      } else {
        onMostrarAlerta(data.mensaje || 'Error al cambiar estado del turno', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al actualizar estado', 'danger');
    }
  };

  const turnosFiltrados = turnos.filter((t) => {
    const coincideActividad =
      filtroActividad === 'todas' ||
      !filtroActividad ||
      (t.actividad_id && t.actividad_id.toString() === filtroActividad.toString());

    const coincideDia =
      filtroDia === 'todos' ||
      !filtroDia ||
      t.dia_semana === filtroDia;

    const coincideSede =
      !filtroSede ||
      (t.sede_id && t.sede_id.toString() === filtroSede.toString());

    return coincideActividad && coincideDia && coincideSede;
  });

  // Cálculo de paginación
  const totalPaginas = Math.ceil(turnosFiltrados.length / elementosPorPagina) || 1;
  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const turnosPaginados = turnosFiltrados.slice(indiceInicio, indiceInicio + elementosPorPagina);

  // Sede efectiva seleccionada en el formulario
  const selectedActividad = actividades.find((a) => a.id?.toString() === formData.actividad_id.toString());
  const effectiveSedeForm = formData.sede_id || (selectedActividad?.sede_id ? selectedActividad.sede_id.toString() : '');

  return (
    <Card className="glass-card border-0 p-4 text-white">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-white">Gestión y Programación de Turnos</h4>
          <p className="text-secondary small mb-0">
            Organiza los bloques horarios por días (Lunes a Sábado), sedes y profesores asignados.
          </p>
        </div>

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

      {/* Filtros */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label className="small text-secondary">Filtrar por Actividad</Form.Label>
            <Form.Select
              value={filtroActividad}
              onChange={(e) => setFiltroActividad(e.target.value)}
            >
              <option value="todas">Todas las Actividades</option>
              {actividades.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="small text-secondary">Filtrar por Días</Form.Label>
            <Form.Select
              value={filtroDia}
              onChange={(e) => setFiltroDia(e.target.value)}
            >
              <option value="todos">Todos los Días</option>
              <option value="Lunes a Sábado">Lunes a Sábado</option>
              <option value="Lunes a Viernes">Lunes a Viernes</option>
              <option value="Lunes, Miércoles y Viernes">Lunes, Miércoles y Viernes</option>
              <option value="Martes y Jueves">Martes y Jueves</option>
              <option value="Sábados">Sábados</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="small text-secondary">Filtrar por Sede</Form.Label>
            <Form.Select
              value={filtroSede}
              onChange={(e) => setFiltroSede(e.target.value)}
            >
              <option value="">Todas las Sedes</option>
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.ciudad})
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
      ) : turnosFiltrados.length === 0 ? (
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
                {turnosPaginados.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="fw-bold text-white">
                        {t.actividad?.nombre || 'Actividad sin asignar'}
                      </div>
                    </td>
                    <td>
                      <span className="badge-token-accent">
                        {t.horarioInicio} - {t.horaFin} hs
                      </span>
                    </td>
                    <td>
                      <span className="text-white small">{t.dia_semana}</span>
                    </td>
                    <td>
                      {t.profesor ? (
                        <span className="fw-medium text-white small">
                          {t.profesor.nombre} {t.profesor.apellido}
                        </span>
                      ) : (
                        <span className="text-secondary small">Sin profesor</span>
                      )}
                    </td>
                    <td>
                      {t.sede ? (
                        <span className="small text-white">{t.sede.nombre}</span>
                      ) : (
                        <span className="text-secondary small">General</span>
                      )}
                    </td>
                    <td>
                      <span className={t.estado ? 'badge-status-active' : 'badge-status-inactive'}>
                        {t.estado ? 'Disponible' : 'Pausado'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <Button
                          size="sm"
                          className="btn-token-outline-warning rounded-pill px-3 py-1"
                          onClick={() => handleToggleEstado(t.id)}
                          title={t.estado ? 'Pausar turno' : 'Habilitar turno'}
                        >
                          {t.estado ? 'Pausar' : 'Habilitar'}
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
                          onClick={() => onPedirEliminar({
                            type: 'turno',
                            id: t.id,
                            nombre: `${t.actividad?.nombre || 'Turno'} (${t.horarioInicio} - ${t.horaFin})`
                          })}
                          title="Eliminar permanentemente"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Controls de Paginación */}
          {totalPaginas > 1 && (
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-4 pt-3 border-top border-secondary">
              <span className="small text-secondary">
                Mostrando turnos {indiceInicio + 1} a {Math.min(indiceInicio + elementosPorPagina, turnosFiltrados.length)} de {turnosFiltrados.length}
              </span>

              <Pagination className="mb-0 admin-pagination">
                <Pagination.Prev
                  disabled={paginaActual === 1}
                  onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                />
                {[...Array(totalPaginas)].map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={paginaActual === i + 1}
                    onClick={() => setPaginaActual(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Modal Crear / Editar Turno */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="glass-card text-white">
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title className="fw-bold">
            {turnoEditando ? 'Editar Turno Horario' : 'Crear Nuevo Turno'}
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
                    value={formData.actividad_id}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const act = actividades.find((a) => a.id?.toString() === selectedId);
                      setFormData((prev) => {
                        let nuevaHoraFin = prev.horaFin;
                        if (act?.duracion && esHoraValida(prev.horarioInicio)) {
                          const [h, m] = prev.horarioInicio.split(':').map(Number);
                          const total = Math.min(23 * 60 + 59, h * 60 + m + act.duracion);
                          nuevaHoraFin = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
                        }
                        return {
                          ...prev,
                          actividad_id: selectedId,
                          profesor_id: act?.profesor_id ? act.profesor_id.toString() : (act?.profesor?.id ? act.profesor.id.toString() : prev.profesor_id),
                          sede_id: act?.sede_id ? act.sede_id.toString() : (act?.sede?.id ? act.sede.id.toString() : prev.sede_id),
                          horaFin: nuevaHoraFin
                        };
                      });
                    }}
                  >
                    <option value="">-- Seleccionar Actividad --</option>
                    {actividades.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre} {a.profesor ? `(Prof. ${a.profesor.nombre} ${a.profesor.apellido})` : ''}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
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
                    value={formData.horarioInicio}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => {
                        const act = actividades.find((a) => a.id?.toString() === prev.actividad_id?.toString());
                        const dur = act?.duracion || 60;
                        let nuevaHoraFin = prev.horaFin;
                        if (esHoraValida(val)) {
                          const [h, m] = val.split(':').map(Number);
                          const total = Math.min(23 * 60 + 59, h * 60 + m + dur);
                          nuevaHoraFin = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
                        }
                        return { ...prev, horarioInicio: val, horaFin: nuevaHoraFin };
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
                    value={formData.horaFin}
                    onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                  />
                </Form.Group>
              </Col>
              {esHoraValida(formData.horarioInicio) && esHoraValida(formData.horaFin) && convertirHoraAMin(formData.horaFin) <= convertirHoraAMin(formData.horarioInicio) && (
                <Col md={12}>
                  <div className="alert alert-danger py-1 px-2 small mb-0 d-flex align-items-center gap-1">
                    <span>⚠️ El horario de fin ({formData.horaFin}) debe ser posterior al inicio ({formData.horarioInicio}).</span>
                  </div>
                </Col>
              )}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Días de la Semana *</Form.Label>
                  <Form.Select
                    value={formData.dia_semana}
                    onChange={(e) => setFormData({ ...formData, dia_semana: e.target.value })}
                  >
                    <option value="Lunes a Sábado">Lunes a Sábado (Todos los días)</option>
                    <option value="Lunes a Viernes">Lunes a Viernes</option>
                    <option value="Lunes, Miércoles y Viernes">Lunes, Miércoles y Viernes</option>
                    <option value="Martes y Jueves">Martes y Jueves</option>
                    <option value="Sábados">Sábados</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Sede</Form.Label>
                  <Form.Select
                    value={formData.sede_id}
                    onChange={(e) => setFormData({ ...formData, sede_id: e.target.value })}
                  >
                    <option value="">-- Todas las Sedes --</option>
                    {sedes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} ({s.ciudad})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Profesor a Cargo</Form.Label>
                  <Form.Select
                    value={formData.profesor_id}
                    onChange={(e) => setFormData({ ...formData, profesor_id: e.target.value })}
                  >
                    <option value="">-- Sin profesor asignado --</option>
                    {profesores.map((p) => {
                      const sedeProfObj = sedes.find((s) => s.id?.toString() === p.sede_id?.toString());
                      const esMismaSede = !effectiveSedeForm || !p.sede_id || p.sede_id.toString() === effectiveSedeForm.toString();

                      return (
                        <option key={p.id} value={p.id} disabled={!esMismaSede}>
                          {p.nombre} {p.apellido} ({p.especialidad}){sedeProfObj ? ` • ${sedeProfObj.nombre}` : ''}{!esMismaSede ? ' [Sede incompatible]' : ''}
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
              ) : turnoEditando ? (
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

export default TurnosManager;
