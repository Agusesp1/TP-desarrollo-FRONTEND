import React, { useState, useMemo } from 'react';
import { procesarErrorApi } from '../../../utils/errorHandler';
import { Card, Button, Row, Col, Table, Form, InputGroup, Modal, Spinner, Alert, Badge } from 'react-bootstrap';

const ESPECIALIDADES_BASE = [
  'Musculación & Hipertrofia',
  'Crossfit & Funcional',
  'Spinning & Cardio',
  'Yoga & Pilates',
  'Zumba & Ritmos',
  'Boxeo & Artes Marciales'
];

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

  const especialidadesDisponibles = useMemo(() => {
    const desdeBD = (teachers || [])
      .map((p) => p.specialty?.trim())
      .filter(Boolean);
    return Array.from(new Set([...ESPECIALIDADES_BASE, ...desdeBD]));
  }, [teachers]);

  // Modal Crear / Editar State
  const [showModal, setShowModal] = useState(false);
  const [teacherEditando, setProfesorEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [modalAlerta, setModalAlerta] = useState(null);

  // Modal Detalle del Profesor
  const [teacherDetalle, setTeacherDetalle] = useState(null);
  const [showModalDetalle, setShowModalDetalle] = useState(false);

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

  const handleVerDetalle = (teacher) => {
    setTeacherDetalle(teacher);
    setShowModalDetalle(true);
  };

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
        const errorMsg = procesarErrorApi(null, data, 'Guardar Profesor');
        setModalAlerta(errorMsg);
        onMostrarAlerta(errorMsg, 'danger');
      }
    } catch {
      const errorMsg = procesarErrorApi(new Error('Network error'), null, 'Guardar Profesor');
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
        const msg = procesarErrorApi(null, data, 'Toggle Estado Profesor');
        onMostrarAlerta(msg, 'danger');
      }
    } catch {
      const msg = procesarErrorApi(new Error('Network error'), null, 'Toggle Estado Profesor');
      onMostrarAlerta(msg, 'danger');
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No registrada';
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return String(fecha);
    return d.toLocaleDateString('es-AR');
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
            Agrega, asigna sedes, edita especialidades, consulta detalles y gestiona el cuerpo docente de FitApp.
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
              placeholder="Buscar profesor por nombre, DNI o especialidad..."
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
            {especialidadesDisponibles.map((esp) => (
              <option key={esp} value={esp}>
                {esp}
              </option>
            ))}
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
                <th>Turno</th>
                <th>Sede Asignada</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {teachersFiltrados.map((teacher) => (
                <tr key={teacher.id}>
                  <td>
                    <div
                      className="fw-bold text-white"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleVerDetalle(teacher)}
                      title="Ver detalle del profesor"
                    >
                      {teacher.name} {teacher.lastname}
                    </div>
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
                    <div className="d-inline-flex gap-2 flex-wrap justify-content-end">
                      <Button
                        size="sm"
                        className="btn-token-outline-primary rounded-pill px-3 py-1"
                        onClick={() => handleVerDetalle(teacher)}
                        title="Ver ficha completa del profesor"
                      >
                        Ver Detalle
                      </Button>
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

      {/* Modal Detalle del Profesor */}
      <Modal
        show={showModalDetalle}
        onHide={() => {
          setShowModalDetalle(false);
          setTeacherDetalle(null);
        }}
        size="lg"
        centered
        contentClassName="glass-card border-0 text-white"
      >
        <Modal.Header closeButton closeVariant="white" className="border-secondary border-opacity-25 pb-2">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <div className="p-2 rounded-circle bg-primary bg-opacity-25 text-primary d-inline-flex">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <span className="fs-5">Detalle del Profesor #{teacherDetalle?.id}</span>
              <div className="small text-secondary fw-normal">
                Ficha institucional de profesor y asignación de sede
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-3">
          {teacherDetalle && (
            <>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25 h-100">
                    <div className="small text-secondary mb-1">Nombre y Apellido</div>
                    <div className="fw-bold fs-6 text-white">
                      {teacherDetalle.name} {teacherDetalle.lastname}
                    </div>
                    <div className="small text-secondary mt-2 mb-1">Documento (DNI)</div>
                    <div className="fw-semibold text-white">{teacherDetalle.dni}</div>
                    <div className="small text-secondary mt-2 mb-1">Fecha de Alta</div>
                    <div className="text-white">{formatearFecha(teacherDetalle.date_alta)}</div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25 h-100">
                    <div className="small text-secondary mb-1">Correo Electrónico</div>
                    <div className="fw-semibold text-white">{teacherDetalle.email}</div>
                    <div className="small text-secondary mt-2 mb-1">Teléfono de Contacto</div>
                    <div className="text-white">{teacherDetalle.phone || 'Sin teléfono registrado'}</div>
                    <div className="small text-secondary mt-2 mb-1">Estado de Cuenta</div>
                    <div>
                      <Badge bg={teacherDetalle.status ? 'success' : 'danger'} className="px-3 py-1 rounded-pill">
                        {teacherDetalle.status ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                <Row className="g-3 align-items-center">
                  <Col sm={4}>
                    <div className="small text-secondary mb-1">Especialidad</div>
                    <span className="badge-token-accent">{teacherDetalle.specialty}</span>
                  </Col>
                  <Col sm={4}>
                    <div className="small text-secondary mb-1">Turno Preferencial</div>
                    <span className="badge-token-subdued">{teacherDetalle.shift}</span>
                  </Col>
                  <Col sm={4}>
                    <div className="small text-secondary mb-1">Sede Asignada</div>
                    <div className="fw-bold text-white">
                      {teacherDetalle.branch
                        ? `${teacherDetalle.branch.name} (${teacherDetalle.branch.city || 'Rosario'})`
                        : 'Sin sede asignada'}
                    </div>
                    {teacherDetalle.branch?.address && (
                      <small className="text-secondary d-block">{teacherDetalle.branch.address}</small>
                    )}
                  </Col>
                </Row>
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="border-secondary border-opacity-25 pt-2 d-flex justify-content-between">
          <Button
            variant="primary"
            className="hero-btn rounded-pill px-4 fw-bold"
            onClick={() => {
              const profe = teacherDetalle;
              setShowModalDetalle(false);
              handleAbrirModal(profe);
            }}
          >
            Editar Profesor
          </Button>
          <Button
            variant="outline-secondary"
            className="rounded-pill px-4"
            onClick={() => {
              setShowModalDetalle(false);
              setTeacherDetalle(null);
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

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
                  <Form.Label>Nombre *</Form.Label>
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
                  <Form.Label>Apellido *</Form.Label>
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
                    placeholder={teacherEditando ? 'Dejar en blanco para conservar actual' : 'Por defecto su DNI'}
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
                    {especialidadesDisponibles.map((esp) => (
                      <option key={esp} value={esp}>
                        {esp}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Turno Preferencial</Form.Label>
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
