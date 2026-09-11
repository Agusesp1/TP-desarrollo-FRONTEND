import React, { useState } from 'react';
import { Card, Button, Row, Col, Table, Form, InputGroup, Modal, Spinner } from 'react-bootstrap';

const ProfesoresManager = ({
  profesores,
  sedes,
  cargando,
  onRecargar,
  onMostrarAlerta,
  onPedirEliminar,
  apiBase
}) => {
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroSede, setFiltroSede] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [profesorEditando, setProfesorEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    especialidad: 'Musculación & Hipertrofia',
    turno: 'Mañana',
    sede_id: ''
  });

  const handleAbrirModal = (profesor = null) => {
    if (profesor) {
      setProfesorEditando(profesor);
      setFormData({
        nombre: profesor.nombre || '',
        apellido: profesor.apellido || '',
        dni: profesor.dni || '',
        email: profesor.email || '',
        telefono: profesor.telefono || '',
        especialidad: profesor.especialidad || 'Musculación & Hipertrofia',
        turno: profesor.turno || 'Mañana',
        sede_id: profesor.sede_id || ''
      });
    } else {
      setProfesorEditando(null);
      setFormData({
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
        especialidad: 'Musculación & Hipertrofia',
        turno: 'Mañana',
        sede_id: sedes.length > 0 ? sedes[0].id : ''
      });
    }
    setShowModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const endpoint = profesorEditando
        ? `${apiBase}/profesores/${profesorEditando.id}`
        : `${apiBase}/profesores`;
      const method = profesorEditando ? 'PUT' : 'POST';

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
        onMostrarAlerta(data.mensaje || 'Error al guardar profesor', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al guardar profesor', 'danger');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      const res = await fetch(`${apiBase}/profesores/${id}/toggle-estado`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok && data.exito) {
        onMostrarAlerta(data.mensaje);
        onRecargar();
      } else {
        onMostrarAlerta(data.mensaje || 'Error al cambiar estado', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al actualizar estado', 'danger');
    }
  };

  const profesoresFiltrados = profesores.filter((p) => {
    const texto = `${p.nombre} ${p.apellido} ${p.especialidad} ${p.dni}`.toLowerCase();
    const coincideTexto = texto.includes(filtroTexto.toLowerCase());
    const coincideSede = !filtroSede || (p.sede_id && p.sede_id.toString() === filtroSede.toString());
    return coincideTexto && coincideSede;
  });

  return (
    <Card className="glass-card border-0 p-4 text-white">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-white">Listado y Carga de Profesores</h4>
          <p className="text-secondary small mb-0">
            Agrega, asigna sedes, edita especialidades y gestiona el cuerpo docente de FitApp.
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
          Cargar Profesor
        </Button>
      </div>

      <Row className="g-3 mb-4">
        <Col md={7} lg={8}>
          <InputGroup>
            <InputGroup.Text>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar profesor por nombre, especialidad o DNI..."
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

        <Col md={5} lg={4}>
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
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-secondary">Cargando profesores...</p>
        </div>
      ) : profesoresFiltrados.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <p className="mb-0">No se encontraron profesores con los filtros aplicados.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>Profesor / DNI</th>
                <th>Contacto</th>
                <th>Especialidad</th>
                <th>Turno</th>
                <th>Sede Asignada</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {profesoresFiltrados.map((prof) => (
                <tr key={prof.id}>
                  <td>
                    <div className="fw-bold text-white">{prof.nombre} {prof.apellido}</div>
                    <small className="text-secondary">DNI: {prof.dni}</small>
                  </td>
                  <td>
                    <div className="small text-white">{prof.email}</div>
                    <small className="text-secondary">{prof.telefono || 'Sin teléfono'}</small>
                  </td>
                  <td>
                    <span className="badge-token-accent">
                      {prof.especialidad}
                    </span>
                  </td>
                  <td>
                    <span className="badge-token-subdued">{prof.turno}</span>
                  </td>
                  <td>
                    {prof.sede ? (
                      <span className="text-white small fw-medium">{prof.sede.nombre}</span>
                    ) : (
                      <span className="text-secondary small">Sin sede asignada</span>
                    )}
                  </td>
                  <td>
                    <span className={prof.estado ? 'badge-status-active' : 'badge-status-inactive'}>
                      {prof.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <Button
                        size="sm"
                        className="btn-token-outline-warning rounded-pill px-3 py-1"
                        onClick={() => handleToggleEstado(prof.id)}
                        title={prof.estado ? 'Desactivar profesor' : 'Activar profesor'}
                      >
                        {prof.estado ? 'Pausar' : 'Activar'}
                      </Button>
                      <Button
                        size="sm"
                        className="btn-token-outline-primary rounded-pill px-3 py-1"
                        onClick={() => handleAbrirModal(prof)}
                        title="Editar datos del profesor"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        className="btn-token-outline-danger rounded-pill px-3 py-1"
                        onClick={() => onPedirEliminar({
                          type: 'profesor',
                          id: prof.id,
                          nombre: `${prof.nombre} ${prof.apellido}`
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

      {/* Modal Crear / Editar Profesor */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="glass-card text-white">
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title className="fw-bold">
            {profesorEditando ? 'Editar Profesor' : 'Cargar Nuevo Profesor'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGuardar}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Apellido *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>DNI *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
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
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Correo Electrónico *</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Especialidad</Form.Label>
                  <Form.Select
                    value={formData.especialidad}
                    onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                  >
                    <option value="Musculación & Hipertrofia">Musculación & Hipertrofia</option>
                    <option value="Crossfit & Funcional">Crossfit & Funcional</option>
                    <option value="Spinning & Cardio">Spinning & Cardio</option>
                    <option value="Yoga & Pilates">Yoga & Pilates</option>
                    <option value="Zumba & Ritmos">Zumba & Ritmos</option>
                    <option value="Boxeo & Artes Marciales">Boxeo & Artes Marciales</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Turno Preferencial</Form.Label>
                  <Form.Select
                    value={formData.turno}
                    onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                  >
                    <option value="Mañana">Mañana</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noche">Noche</option>
                    <option value="Rotativo">Rotativo</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Sede Asignada</Form.Label>
                  <Form.Select
                    value={formData.sede_id}
                    onChange={(e) => setFormData({ ...formData, sede_id: e.target.value })}
                  >
                    <option value="">-- Sin sede asignada --</option>
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
              ) : profesorEditando ? (
                'Guardar Cambios'
              ) : (
                'Registrar Profesor'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
};

export default ProfesoresManager;
