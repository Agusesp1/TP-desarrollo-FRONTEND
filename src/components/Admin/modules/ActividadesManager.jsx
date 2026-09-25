import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Row, Col, Table, Form, InputGroup, Modal, Spinner, Pagination } from 'react-bootstrap';

const ActividadesManager = ({
  actividades,
  sedes,
  profesores = [],
  cargando,
  onRecargar,
  onMostrarAlerta,
  onPedirEliminar,
  apiBase
}) => {
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroSede, setFiltroSede] = useState('todas');
  const [filtroProfesor, setFiltroProfesor] = useState('todos');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [actividadEditando, setActividadEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    duracion: 60,
    cupo: 20,
    descripcion: '',
    sede_id: '',
    profesor_id: '',
    dia_semana: 'Lunes a Viernes',
    horarioInicio: '08:00',
    horaFin: '09:00'
  });

  const autoCalcularHoraFin = (inicio, duracionMin) => {
    if (!inicio || !inicio.includes(':')) return;
    const parts = inicio.split(':');
    const hh = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10);
    if (isNaN(hh) || isNaN(mm)) return;
    const totalMinutos = hh * 60 + mm + parseInt(duracionMin || 0, 10);
    const finH = Math.floor(totalMinutos / 60) % 24;
    const finM = totalMinutos % 60;
    const horaFinCalc = `${String(finH).padStart(2, '0')}:${String(finM).padStart(2, '0')}`;
    setFormData((prev) => ({ ...prev, horaFin: horaFinCalc }));
  };

  const handleAbrirModal = (actividad = null) => {
    if (actividad) {
      setActividadEditando(actividad);
      const primerTurno = actividad.turnos && actividad.turnos.length > 0 ? actividad.turnos[0] : null;
      setFormData({
        nombre: actividad.nombre || '',
        duracion: actividad.duracion || 60,
        cupo: actividad.cupo || 20,
        descripcion: actividad.descripcion || '',
        sede_id: (actividad.sede_id ?? actividad.sede?.id ?? '').toString(),
        profesor_id: (actividad.profesor_id ?? actividad.profesor?.id ?? '').toString(),
        dia_semana: primerTurno?.dia_semana || 'Lunes a Viernes',
        horarioInicio: primerTurno?.horarioInicio || '08:00',
        horaFin: primerTurno?.horaFin || '09:00'
      });
    } else {
      setActividadEditando(null);
      setFormData({
        nombre: '',
        duracion: 60,
        cupo: 20,
        descripcion: '',
        sede_id: '',
        profesor_id: '',
        dia_semana: 'Lunes a Viernes',
        horarioInicio: '08:00',
        horaFin: '09:00'
      });
    }
    setShowModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const endpoint = actividadEditando
        ? `${apiBase}/actividades/${actividadEditando.id}`
        : `${apiBase}/actividades`;
      const method = actividadEditando ? 'PUT' : 'POST';

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
        onMostrarAlerta(data.mensaje || 'Error al guardar actividad', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al guardar actividad', 'danger');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      const res = await fetch(`${apiBase}/actividades/${id}/toggle-estado`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok && data.exito) {
        onMostrarAlerta(data.mensaje);
        onRecargar();
      } else {
        onMostrarAlerta(data.mensaje || 'Error al cambiar estado de la actividad', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al actualizar estado', 'danger');
    }
  };

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 5;

  useEffect(() => {
    setPaginaActual(1);
  }, [filtroTexto, filtroSede, filtroProfesor]);

  // Agrupar actividades por nombre (ej: agrupar los múltiples turnos de Musculación)
  const actividadesAgrupadas = useMemo(() => {
    const map = new Map();
    actividades.forEach((act) => {
      const clave = act.nombre.trim().toLowerCase();
      if (map.has(clave)) {
        const existente = map.get(clave);
        const turnosCombinados = [...(existente.turnos || []), ...(act.turnos || [])];
        const turnosUnicos = Array.from(new Map(turnosCombinados.map((t) => [t.id, t])).values());
        map.set(clave, {
          ...existente,
          turnos: turnosUnicos
        });
      } else {
        map.set(clave, { ...act, turnos: act.turnos ? [...act.turnos] : [] });
      }
    });
    return Array.from(map.values());
  }, [actividades]);

  const actividadesFiltradas = actividadesAgrupadas.filter((a) => {
    const profObj = a.profesor || (profesores && profesores.find((p) => p.id?.toString() === a.profesor_id?.toString()));
    const texto = `${a.nombre} ${a.descripcion || ''} ${profObj ? `${profObj.nombre} ${profObj.apellido}` : ''}`.toLowerCase();
    const coincideTexto = texto.includes(filtroTexto.toLowerCase());

    let coincideSede = true;
    if (filtroSede === 'sin_sede') {
      coincideSede = !a.sede_id && !a.sede;
    } else if (filtroSede !== 'todas') {
      const actSedeId = a.sede_id?.toString() || a.sede?.id?.toString();
      coincideSede = actSedeId === filtroSede.toString();
    }

    let coincideProfesor = true;
    if (filtroProfesor === 'sin_profesor') {
      coincideProfesor = !a.profesor_id && !a.profesor;
    } else if (filtroProfesor !== 'todos') {
      const actProfId = a.profesor_id?.toString() || a.profesor?.id?.toString();
      coincideProfesor = actProfId === filtroProfesor.toString();
    }

    return coincideTexto && coincideSede && coincideProfesor;
  });

  const totalPaginas = Math.ceil(actividadesFiltradas.length / elementosPorPagina);
  const inicioIndex = (paginaActual - 1) * elementosPorPagina;
  const actividadesPaginadas = actividadesFiltradas.slice(inicioIndex, inicioIndex + elementosPorPagina);

  // Formateador de resumen de horarios (agrupa turnos de Musculación)
  const obtenerResumenHorarios = (act) => {
    if (!act.turnos || act.turnos.length === 0) {
      return {
        horariosTexto: 'Sin horario',
        diasTexto: 'Sin días asignados',
        esGrupal: false,
        cantidadTurnos: 0
      };
    }

    if (act.turnos.length === 1) {
      const t = act.turnos[0];
      return {
        horariosTexto: `${t.horarioInicio} - ${t.horaFin} hs`,
        diasTexto: t.dia_semana,
        esGrupal: false,
        cantidadTurnos: 1
      };
    }

    const horasInicio = act.turnos.map((t) => t.horarioInicio).sort();
    const horasFin = act.turnos.map((t) => t.horaFin).sort();
    const primerHorario = horasInicio[0];
    const ultimoHorario = horasFin[horasFin.length - 1];
    const diasUnicos = Array.from(new Set(act.turnos.map((t) => t.dia_semana))).join(', ');
    const esMusculacion = act.nombre.toLowerCase().includes('musculac');

    return {
      horariosTexto: `${primerHorario} a ${ultimoHorario} hs`,
      diasTexto: esMusculacion ? `${diasUnicos} (Turnos continuos)` : diasUnicos,
      esGrupal: true,
      cantidadTurnos: act.turnos.length
    };
  };

  return (
    <Card className="glass-card border-0 p-4 text-white">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-white">Gestión de Actividades y Clases</h4>
          <p className="text-secondary small mb-0">
            Administra disciplinas deportivas, profesores a cargo, sedes y cupos máximos por clase.
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
          Nueva Actividad
        </Button>
      </div>

      <Row className="g-3 mb-4">
        <Col md={5} lg={5}>
          <InputGroup>
            <InputGroup.Text>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar por actividad o profesor..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />
            {filtroTexto && (
              <Button variant="outline-secondary" onClick={() => setFiltroTexto('')}>
                Limpiar
              </Button>
            )}
          </InputGroup>
        </Col>

        <Col md={3} lg={3}>
          <InputGroup>
            <InputGroup.Text title="Filtrar por sede">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </InputGroup.Text>
            <Form.Select
              value={filtroSede}
              onChange={(e) => setFiltroSede(e.target.value)}
            >
              <option value="todas">Todas las sedes</option>
              <option value="sin_sede">Sin sede asignada</option>
              {sedes && sedes.map((s) => (
                <option key={s.id} value={s.id.toString()}>
                  {s.nombre}
                </option>
              ))}
            </Form.Select>
          </InputGroup>
        </Col>

        <Col md={4} lg={4}>
          <InputGroup>
            <InputGroup.Text title="Filtrar por profesor">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </InputGroup.Text>
            <Form.Select
              value={filtroProfesor}
              onChange={(e) => setFiltroProfesor(e.target.value)}
            >
              <option value="todos">Todos los profesores</option>
              <option value="sin_profesor">Sin profesor asignado</option>
              {profesores && profesores.map((p) => (
                <option key={p.id} value={p.id.toString()}>
                  {p.nombre} {p.apellido}
                </option>
              ))}
            </Form.Select>
            {(filtroSede !== 'todas' || filtroProfesor !== 'todos') && (
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setFiltroSede('todas');
                  setFiltroProfesor('todos');
                }}
                title="Restablecer filtros"
              >
                ✕
              </Button>
            )}
          </InputGroup>
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-secondary">Cargando actividades...</p>
        </div>
      ) : actividadesFiltradas.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <p className="mb-0">
            No se encontraron actividades {filtroSede !== 'todas' || filtroProfesor !== 'todos' || filtroTexto ? 'con los filtros seleccionados.' : 'registradas.'}
          </p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <Table className="admin-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Actividad</th>
                  <th>Días y Horarios</th>
                  <th>Sede Asignada</th>
                  <th>Profesor a Cargo</th>
                  <th>Duración</th>
                  <th>Cupo Máximo</th>
                  <th>Turnos Creados</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {actividadesPaginadas.map((act) => {
                  const sedeObj = act.sede || (sedes && sedes.find(s => s.id?.toString() === act.sede_id?.toString()));
                  const profObj = act.profesor || (profesores && profesores.find(p => p.id?.toString() === act.profesor_id?.toString()));
                  const resumen = obtenerResumenHorarios(act);

                  return (
                  <tr key={act.id}>
                    <td>
                      <div className="fw-bold text-white fs-6">{act.nombre}</div>
                    </td>
                    <td>
                      {resumen.cantidadTurnos > 0 ? (
                        <div>
                          <span className={`badge-token-accent d-inline-flex align-items-center gap-1 mb-1 ${resumen.esGrupal ? 'bg-primary bg-opacity-25 border-primary text-info' : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {resumen.horariosTexto}
                          </span>
                          <div className="small text-white-50">{resumen.diasTexto}</div>
                        </div>
                      ) : (
                        <span className="badge bg-secondary text-white-50 px-2 py-1">Sin horario</span>
                      )}
                    </td>
                    <td>
                      {sedeObj ? (
                        <span className="badge bg-dark border border-secondary text-info px-2 py-1 d-inline-flex align-items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          {sedeObj.nombre}
                        </span>
                      ) : (
                        <span className="badge bg-secondary text-white-50 px-2 py-1">Sin sede</span>
                      )}
                    </td>
                    <td>
                      {profObj ? (
                        <span className="badge bg-dark border border-secondary text-light px-2 py-1 d-inline-flex align-items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          {profObj.nombre} {profObj.apellido}
                        </span>
                      ) : (
                        <span className="badge bg-secondary text-white-50 px-2 py-1">Sin profesor</span>
                      )}
                    </td>
                    <td>
                      <span className="badge-token-subdued">{act.duracion} min</span>
                    </td>
                    <td>
                      <span className="fw-bold text-white">{act.cupo} alumnos</span>
                    </td>
                    <td>
                      <span className="badge-token-accent">
                        {act.turnos?.length || 0} turnos
                      </span>
                    </td>
                    <td>
                      <span className={act.estado ? 'badge-status-active' : 'badge-status-inactive'}>
                        {act.estado ? 'Activa' : 'Pausada'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <Button
                          size="sm"
                          className="btn-token-outline-warning rounded-pill px-3 py-1"
                          onClick={() => handleToggleEstado(act.id)}
                          title={act.estado ? 'Pausar actividad' : 'Activar actividad'}
                        >
                          {act.estado ? 'Pausar' : 'Activar'}
                        </Button>
                        <Button
                          size="sm"
                          className="btn-token-outline-primary rounded-pill px-3 py-1"
                          onClick={() => handleAbrirModal(act)}
                          title="Editar actividad"
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          className="btn-token-outline-danger rounded-pill px-3 py-1"
                          onClick={() => onPedirEliminar({
                            type: 'actividad',
                            id: act.id,
                            nombre: act.nombre
                          })}
                          title="Eliminar permanentemente"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 pt-3 border-top border-secondary border-opacity-25">
              <div className="small text-secondary mb-2 mb-md-0">
                Mostrando <span className="text-white fw-bold">{inicioIndex + 1}</span> a{' '}
                <span className="text-white fw-bold">
                  {Math.min(inicioIndex + elementosPorPagina, actividadesFiltradas.length)}
                </span>{' '}
                de <span className="text-white fw-bold">{actividadesFiltradas.length}</span> actividades
              </div>
              <Pagination className="mb-0 custom-admin-pagination">
                <Pagination.Prev
                  disabled={paginaActual === 1}
                  onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                />
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                  <Pagination.Item
                    key={num}
                    active={num === paginaActual}
                    onClick={() => setPaginaActual(num)}
                  >
                    {num}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Modal Crear / Editar Actividad */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="glass-card text-white">
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title className="fw-bold">
            {actividadEditando ? 'Editar Actividad' : 'Nueva Actividad'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGuardar}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Nombre de la Actividad *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Ej: Funcional & Cross Training"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </Form.Group>
              </Col>
              
              {/* Sección Días y Horarios */}
              <Col md={12}>
                <div className="p-3 border border-secondary border-opacity-50 rounded-3 bg-dark bg-opacity-50">
                  <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Días y Horarios de Dictado *
                  </h6>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small text-light">Días de la Semana *</Form.Label>
                        <Form.Select
                          required
                          value={formData.dia_semana}
                          onChange={(e) => setFormData({ ...formData, dia_semana: e.target.value })}
                        >
                          <option value="Lunes a Viernes">Lunes a Viernes</option>
                          <option value="Lunes a Sábado">Lunes a Sábado (Todos los días)</option>
                          <option value="Lunes, Miércoles y Viernes">Lunes, Miércoles y Viernes</option>
                          <option value="Martes y Jueves">Martes y Jueves</option>
                          <option value="Sábados">Sábados</option>
                          <option value="Lunes">Lunes</option>
                          <option value="Martes">Martes</option>
                          <option value="Miércoles">Miércoles</option>
                          <option value="Jueves">Jueves</option>
                          <option value="Viernes">Viernes</option>
                          <option value="Domingo">Domingo</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label className="small text-light">Hora Inicio *</Form.Label>
                        <Form.Control
                          type="text"
                          required
                          placeholder="08:00"
                          value={formData.horarioInicio}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({ ...formData, horarioInicio: val });
                            autoCalcularHoraFin(val, formData.duracion);
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label className="small text-light">Hora Fin *</Form.Label>
                        <Form.Control
                          type="text"
                          required
                          placeholder="09:00"
                          value={formData.horaFin}
                          onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Sede</Form.Label>
                  <Form.Select
                    value={formData.sede_id}
                    onChange={(e) => setFormData({ ...formData, sede_id: e.target.value })}
                  >
                    <option value="">Seleccione una sede...</option>
                    {sedes && sedes.map(sede => (
                      <option key={sede.id} value={sede.id}>{sede.nombre}</option>
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
                    {profesores && profesores.map(prof => (
                      <option key={prof.id} value={prof.id}>
                        {prof.nombre} {prof.apellido} ({prof.especialidad})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Duración (en minutos) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="10"
                    step="5"
                    required
                    value={formData.duracion}
                    onChange={(e) => {
                      const dur = parseInt(e.target.value, 10) || 0;
                      setFormData({ ...formData, duracion: dur });
                      autoCalcularHoraFin(formData.horarioInicio, dur);
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Cupo Máximo de Personas *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    required
                    value={formData.cupo}
                    onChange={(e) => setFormData({ ...formData, cupo: parseInt(e.target.value, 10) || 0 })}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Detalles sobre los beneficios y estilo de la clase..."
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  />
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
              ) : actividadEditando ? (
                'Guardar Cambios'
              ) : (
                'Crear Actividad'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
};

export default ActividadesManager;
