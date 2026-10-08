import React, { useState } from 'react';
import { Card, Button, Row, Col, Table, Form, InputGroup, Modal, Spinner, Alert } from 'react-bootstrap';

const TeachersManager = ({
  teachers,
  branches,
  cargando,
  onRecargar,
  onMostrarAlerta,
  onPedirEliminar,
  apiBase
}) => {
  const [filterTexto, setFiltroTexto] = useState('');
  const [filterSede, setFiltroSede] = useState('');
  const [filterEspecialidad, setFiltroEspecialidad] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [teacherEditando, setProfesorEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [modalAlerta, setModalAlerta] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    dni: '',
    email: '',
    phone: '',
    specialty: 'Musculación & Hipertrofia',
    shift: 'Mañana',
    branch_id: '',
    password: ''
  });

  const handleAbrirModal = (teacher = null) => {
    setModalAlerta(null);
    if (teacher) {
      setProfesorEditando(teacher);
      setFormData({
        name: teacher.name || '',
        lastname: teacher.lastname || '',
        dni: teacher.dni || '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        specialty: teacher.specialty || 'Musculación & Hipertrofia',
        shift: teacher.shift || 'Mañana',
        branch_id: teacher.branch_id || '',
        password: ''
      });
    } else {
      setProfesorEditando(null);
      setFormData({
        name: '',
        lastname: '',
        dni: '',
        email: '',
        phone: '',
        specialty: 'Musculación & Hipertrofia',
        shift: 'Mañana',
        branch_id: branches.length > 0 ? branches[0].id : '',
        password: ''
      });
    }
    setShowModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setModalAlerta(null);

    try {
      const endpoint = teacherEditando
        ? `${apiBase}/teachers/${teacherEditando.id}`
        : `${apiBase}/teachers`;
      const method = teacherEditando ? 'PUT' : 'POST';

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
        const errorMsg = data.message || 'Error al guardar teacher';
        setModalAlerta(errorMsg);
        onMostrarAlerta(errorMsg, 'danger');
      }
    } catch (err) {
      const errorMsg = 'Error de red al guardar teacher';
      setModalAlerta(errorMsg);
      onMostrarAlerta(errorMsg, 'danger');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      const res = await fetch(`${apiBase}/teachers/${id}/toggle-status`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok && data.success) {
        onMostrarAlerta(data.message);
        onRecargar();
      } else {
        onMostrarAlerta(data.message || 'Error al cambiar status', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al actualizar status', 'danger');
    }
  };

  const teachersFiltrados = teachers.filter((p) => {
    const texto = `${p.name} ${p.lastname} ${p.specialty} ${p.dni}`.toLowerCase();
    const coincideTexto = texto.includes(filterTexto.toLowerCase());
    const coincideSede = !filterSede || (p.branch_id && p.branch_id.toString() === filterSede.toString());
    const coincideEspecialidad = !filterEspecialidad || p.specialty === filterEspecialidad;
    return coincideTexto && coincideSede && coincideEspecialidad;
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
        <Col md={5}>
          <InputGroup>
            <InputGroup.Text>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar profesor..."
              value={filterTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />
            {filterTexto && (
              <Button variant="outline-secondary" onClick={() => setFiltroTexto('')}>
                Limpiar
              </Button>
            )}
          </InputGroup>
        </Col>

        <Col md={4}>
          <Form.Select
            value={filterEspecialidad}
            onChange={(e) => setFiltroEspecialidad(e.target.value)}
          >
            <option value="">Todas las Especialidades</option>
            <option value="Musculación & Hipertrofia">Musculación & Hipertrofia</option>
            <option value="Crossfit & Funcional">Crossfit & Funcional</option>
            <option value="Spinning & Cardio">Spinning & Cardio</option>
            <option value="Yoga & Pilates">Yoga & Pilates</option>
            <option value="Zumba & Ritmos">Zumba & Ritmos</option>
            <option value="Boxeo & Artes Marciales">Boxeo & Artes Marciales</option>
          </Form.Select>
        </Col>

        <Col md={3}>
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
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-secondary">Cargando profesores...</p>
        </div>
      ) : teachersFiltrados.length === 0 ? (
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
                <th>Shift</th>
                <th>Sede Asignada</th>
                <th>Status</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {teachersFiltrados.map((teacher) => (
                <tr key={teacher.id}>
                  <td>
                    <div className="fw-bold text-white">{teacher.name} {teacher.lastname}</div>
                    <small className="text-secondary">DNI: {teacher.dni}</small>
                  </td>
                  <td>
                    <div className="small text-white">{teacher.email}</div>
                    <small className="text-secondary">{teacher.phone || 'Sin teléfono'}</small>
                  </td>
                  <td>
                    <span className="badge-token-accent">
                      {teacher.specialty}
                    </span>
                  </td>
                  <td>
                    <span className="badge-token-subdued">{teacher.shift}</span>
                  </td>
                  <td>
                    {teacher.branch ? (
                      <span className="text-white small fw-medium">{teacher.branch.name}</span>
                    ) : (
                      <span className="text-secondary small">Sin sede asignada</span>
                    )}
                  </td>
                  <td>
                    <span className={teacher.status ? 'badge-status-active' : 'badge-status-inactive'}>
                      {teacher.status ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <Button
                        size="sm"
                        className="btn-token-outline-warning rounded-pill px-3 py-1"
                        onClick={() => handleToggleEstado(teacher.id)}
                        title={teacher.status ? 'Desactivar profesor' : 'Activar profesor'}
                      >
                        {teacher.status ? 'Pausar' : 'Activar'}
                      </Button>
                      <Button
                        size="sm"
                        className="btn-token-outline-primary rounded-pill px-3 py-1"
                        onClick={() => handleAbrirModal(teacher)}
                        title="Editar datos del profesor"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        className="btn-token-outline-danger rounded-pill px-3 py-1"
                        onClick={() => onPedirEliminar({
                          type: 'teacher',
                          id: teacher.id,
                          name: `${teacher.name} ${teacher.lastname}`
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
            {teacherEditando ? 'Editar Profesor' : 'Cargar Nuevo Profesor'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGuardar}>
          <Modal.Body>
            {modalAlerta && (
              <Alert
                variant="danger"
                dismissible
                onClose={() => setModalAlerta(null)}
                className="py-2 mb-3 text-center small border-0 shadow-sm"
              >
                {modalAlerta}
              </Alert>
            )}
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Lastname *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>DNI *</Form.Label>
                  <Form.Control
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Solo números (ej: 38123456)"
                    required
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Teléfono (solo números)</Form.Label>
                  <Form.Control
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Solo números (ej: 3516112233)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Correo Electrónico *</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    placeholder="profe@gymfit.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Contraseña de acceso</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder={teacherEditando ? "Dejar en blanco para conservar actual" : "Por defecto su DNI"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Especialidad</Form.Label>
                  <Form.Select
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
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
                  <Form.Label>Shift Preferencial</Form.Label>
                  <Form.Select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
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
                  <Form.Label>Sede Asignada *</Form.Label>
                  <Form.Select
                    required
                    value={formData.branch_id}
                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  >
                    <option value="">-- Seleccione una sede --</option>
                    {branches.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.city})
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
              ) : teacherEditando ? (
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

export default TeachersManager;
