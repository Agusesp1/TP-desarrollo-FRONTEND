import React, { useState } from 'react';
import { Card, Button, Row, Col, Table, Form, InputGroup, Modal, Spinner } from 'react-bootstrap';

const SedesManager = ({
  sedes,
  cargando,
  onRecargar,
  onMostrarAlerta,
  onPedirEliminar,
  apiBase
}) => {
  const [filtroTexto, setFiltroTexto] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [sedeEditando, setSedeEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: 'Córdoba Capital',
    telefono: '',
    email: '',
    horario_apertura: '07:00 a 23:00 hs',
    capacidad: 150
  });

  const handleAbrirModal = (sede = null) => {
    if (sede) {
      setSedeEditando(sede);
      setFormData({
        nombre: sede.nombre || '',
        direccion: sede.direccion || '',
        ciudad: sede.ciudad || 'Córdoba Capital',
        telefono: sede.telefono || '',
        email: sede.email || '',
        horario_apertura: sede.horario_apertura || '07:00 a 23:00 hs',
        capacidad: sede.capacidad || 150
      });
    } else {
      setSedeEditando(null);
      setFormData({
        nombre: '',
        direccion: '',
        ciudad: 'Córdoba Capital',
        telefono: '',
        email: '',
        horario_apertura: '07:00 a 23:00 hs',
        capacidad: 150
      });
    }
    setShowModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const endpoint = sedeEditando
        ? `${apiBase}/sedes/${sedeEditando.id}`
        : `${apiBase}/sedes`;
      const method = sedeEditando ? 'PUT' : 'POST';

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
        onMostrarAlerta(data.mensaje || 'Error al guardar sede', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al guardar sede', 'danger');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      const res = await fetch(`${apiBase}/sedes/${id}/toggle-estado`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok && data.exito) {
        onMostrarAlerta(data.mensaje);
        onRecargar();
      } else {
        onMostrarAlerta(data.mensaje || 'Error al cambiar estado de la sede', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al actualizar estado', 'danger');
    }
  };

  const sedesFiltradas = sedes.filter((s) => {
    const texto = `${s.nombre} ${s.direccion} ${s.ciudad} ${s.email}`.toLowerCase();
    return texto.includes(filtroTexto.toLowerCase());
  });

  return (
    <Card className="glass-card border-0 p-4 text-white">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-white">Gestión de Sedes y Sucursales</h4>
          <p className="text-secondary small mb-0">
            Administra los establecimientos físicos, horarios de atención y capacidades máximas.
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
          Nueva Sede
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
              placeholder="Buscar sede por nombre, dirección o ciudad..."
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
          <p className="mt-2 text-secondary">Cargando sedes...</p>
        </div>
      ) : sedesFiltradas.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <p className="mb-0">No se encontraron sedes.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>Nombre / Ciudad</th>
                <th>Ubicación</th>
                <th>Contacto</th>
                <th>Horarios</th>
                <th>Capacidad</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sedesFiltradas.map((sede) => (
                <tr key={sede.id}>
                  <td>
                    <div className="fw-bold text-white">{sede.nombre}</div>
                    <small className="text-secondary fw-medium">{sede.ciudad}</small>
                  </td>
                  <td>
                    <div className="small text-white">{sede.direccion}</div>
                  </td>
                  <td>
                    <div className="small text-white">{sede.email || '-'}</div>
                    <small className="text-secondary">{sede.telefono || '-'}</small>
                  </td>
                  <td>
                    <span className="badge-token-subdued">{sede.horario_apertura}</span>
                  </td>
                  <td>
                    <span className="fw-bold text-white">{sede.capacidad} personas</span>
                  </td>
                  <td>
                    <span className={sede.estado ? 'badge-status-active' : 'badge-status-inactive'}>
                      {sede.estado ? 'Operativa' : 'Pausada'}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <Button
                        size="sm"
                        className="btn-token-outline-warning rounded-pill px-3 py-1"
                        onClick={() => handleToggleEstado(sede.id)}
                        title={sede.estado ? 'Pausar sede' : 'Habilitar sede'}
                      >
                        {sede.estado ? 'Pausar' : 'Habilitar'}
                      </Button>
                      <Button
                        size="sm"
                        className="btn-token-outline-primary rounded-pill px-3 py-1"
                        onClick={() => handleAbrirModal(sede)}
                        title="Editar sede"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        className="btn-token-outline-danger rounded-pill px-3 py-1"
                        onClick={() => onPedirEliminar({
                          type: 'sede',
                          id: sede.id,
                          nombre: sede.nombre
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

      {/* Modal Crear / Editar Sede */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="glass-card text-white">
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title className="fw-bold">
            {sedeEditando ? 'Editar Sede' : 'Crear Nueva Sede'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGuardar}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Nombre de la Sede *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Ej: FitApp Sede Centro"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={7}>
                <Form.Group>
                  <Form.Label>Dirección *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Ej: Av. Colón 850"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label>Ciudad</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email de Contacto</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={7}>
                <Form.Group>
                  <Form.Label>Horario de Apertura</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: 07:00 a 23:00 hs"
                    value={formData.horario_apertura}
                    onChange={(e) => setFormData({ ...formData, horario_apertura: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label>Capacidad Máxima</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={formData.capacidad}
                    onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value, 10) || 0 })}
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
              ) : sedeEditando ? (
                'Guardar Cambios'
              ) : (
                'Crear Sede'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
};

export default SedesManager;
