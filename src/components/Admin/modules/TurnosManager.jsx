import React, { useState } from 'react';
import { Card, Button, Row, Col, Table, Form, Modal, Spinner } from 'react-bootstrap';

const TurnosManager = ({
  turnos,
  actividades,
  profesores,
  sedes,
  cargando,
  onRecargar,
  onMostrarAlerta,
  onPedirEliminar,
  apiBase
}) => {
  const [filtroActividad, setFiltroActividad] = useState('todas');
  const [filtroDia, setFiltroDia] = useState('todos');
  const [filtroSede, setFiltroSede] = useState('');

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
      setFormData({
        actividad_id: actividades.length > 0 ? actividades[0].id : '',
        horarioInicio: '07:00',
        horaFin: '09:00',
        dia_semana: 'Lunes a Sábado',
        profesor_id: profesores.length > 0 ? profesores[0].id : '',
        sede_id: sedes.length > 0 ? sedes[0].id : ''
      });
    }
    setShowModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
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
              {turnosFiltrados.map((t) => (
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
                    onChange={(e) => setFormData({ ...formData, actividad_id: e.target.value })}
                  >
                    <option value="">-- Seleccionar Actividad --</option>
                    {actividades.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Horario de Inicio * (HH:MM)</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="07:00"
                    value={formData.horarioInicio}
                    onChange={(e) => setFormData({ ...formData, horarioInicio: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Horario de Fin * (HH:MM)</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="09:00"
                    value={formData.horaFin}
                    onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                  />
                </Form.Group>
              </Col>
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
                  <Form.Label>Profesor a Cargo</Form.Label>
                  <Form.Select
                    value={formData.profesor_id}
                    onChange={(e) => setFormData({ ...formData, profesor_id: e.target.value })}
                  >
                    <option value="">-- Sin profesor asignado --</option>
                    {profesores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.apellido} ({p.especialidad})
                      </option>
                    ))}
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
