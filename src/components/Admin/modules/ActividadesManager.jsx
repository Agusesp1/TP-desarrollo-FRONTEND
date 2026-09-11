import React, { useState } from 'react';
import { Card, Button, Row, Col, Table, Form, InputGroup, Modal, Spinner } from 'react-bootstrap';

const ActividadesManager = ({
  actividades,
  cargando,
  onRecargar,
  onMostrarAlerta,
  onPedirEliminar,
  apiBase
}) => {
  const [filtroTexto, setFiltroTexto] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [actividadEditando, setActividadEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    duracion: 60,
    cupo: 20,
    descripcion: ''
  });

  const handleAbrirModal = (actividad = null) => {
    if (actividad) {
      setActividadEditando(actividad);
      setFormData({
        nombre: actividad.nombre || '',
        duracion: actividad.duracion || 60,
        cupo: actividad.cupo || 20,
        descripcion: actividad.descripcion || ''
      });
    } else {
      setActividadEditando(null);
      setFormData({
        nombre: '',
        duracion: 60,
        cupo: 20,
        descripcion: ''
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

  const actividadesFiltradas = actividades.filter((a) => {
    const texto = `${a.nombre} ${a.descripcion || ''}`.toLowerCase();
    return texto.includes(filtroTexto.toLowerCase());
  });

  return (
    <Card className="glass-card border-0 p-4 text-white">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-white">Gestión de Actividades y Clases</h4>
          <p className="text-secondary small mb-0">
            Administra disciplinas deportivas, cupos máximos por clase y duraciones.
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
        <Col md={12}>
          <InputGroup>
            <InputGroup.Text>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar actividad por nombre o descripción..."
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
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-secondary">Cargando actividades...</p>
        </div>
      ) : actividadesFiltradas.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <p className="mb-0">No se encontraron actividades registradas.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>Actividad</th>
                <th>Descripción</th>
                <th>Duración</th>
                <th>Cupo Máximo</th>
                <th>Turnos Creados</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {actividadesFiltradas.map((act) => (
                <tr key={act.id}>
                  <td>
                    <div className="fw-bold text-white fs-6">{act.nombre}</div>
                  </td>
                  <td style={{ maxWidth: '280px' }}>
                    <small className="text-secondary text-truncate d-block">
                      {act.descripcion || 'Sin descripción'}
                    </small>
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
              ))}
            </tbody>
          </Table>
        </div>
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
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Duración (en minutos) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="10"
                    step="5"
                    required
                    value={formData.duracion}
                    onChange={(e) => setFormData({ ...formData, duracion: parseInt(e.target.value, 10) || 0 })}
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
