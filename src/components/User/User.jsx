import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Nav, Modal, Badge, Table, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './User.css';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486z"/>
    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
    <path d="M3.35 5.47q-.27.242-.518.487A13 13 0 0 0 1.172 8s3 5.5 8 5.5c.82 0 1.603-.15 2.336-.407l.79.79a9 9 0 0 1-3.126.617C3 14.5 0 8 0 8s1.077-1.97 2.656-3.473z"/>
    <path d="M1.354 1.354a.5.5 0 0 1 .708 0l12.5 12.5a.5.5 0 0 1-.708.708l-12.5-12.5a.5.5 0 0 1 0-.708"/>
  </svg>
);

const User = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCuota, setSelectedCuota] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  // Form State for User Profile
  const [profileData, setProfileData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || ''
  });

  // State for Password Change
  const [passwordData, setPasswordData] = useState({
    actual: '',
    nueva: '',
    confirmar: ''
  });
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordMsgType, setPasswordMsgType] = useState('success');

  useEffect(() => {
    if (user) {
      setProfileData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || ''
      });
    }
  }, [user]);

  // Lista interactiva de cuotas
  const [cuotas, setCuotas] = useState([
    { id: 1, concepto: 'Pase Premium Julio 2026', monto: 18000, fechaVenc: '15/07/2026', estado: 'Pendiente' },
    { id: 2, concepto: 'Pase Premium Junio 2026', monto: 17000, fechaVenc: '15/06/2026', estado: 'Pendiente' },
  ]);

  // Historial de pagos realizados
  const [historial] = useState([
    { id: 101, concepto: 'Pase Premium Mayo 2026', monto: 16000, fechaPago: '12/05/2026', metodo: 'Tarjeta de Crédito', comprobante: 'COMP-8921' },
    { id: 102, concepto: 'Pase Premium Abril 2026', monto: 16000, fechaPago: '10/04/2026', metodo: 'Mercado Pago', comprobante: 'COMP-7432' },
    { id: 103, concepto: 'Pase Premium Marzo 2026', monto: 15000, fechaPago: '14/03/2026', metodo: 'Transferencia', comprobante: 'COMP-6190' },
    { id: 104, concepto: 'Matrícula de Inscripción 2026', monto: 10000, fechaPago: '01/03/2026', metodo: 'Tarjeta de Débito', comprobante: 'COMP-5012' },
  ]);

  const [profileMsgType, setProfileMsgType] = useState('success');
  const [cargandoPerfil, setCargandoPerfil] = useState(false);
  const [cargandoPassword, setCargandoPassword] = useState(false);

  const handleChangeProfile = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setMensaje(null);

    const userId = user?.id;
    if (!userId) {
      updateUser(profileData);
      setProfileMsgType('success');
      setMensaje('¡Perfil actualizado en sesión local!');
      setTimeout(() => setMensaje(null), 3000);
      return;
    }

    setCargandoPerfil(true);

    try {
      const response = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok || !data.exito) {
        setProfileMsgType('danger');
        const detalle = data.detalles ? `: ${data.detalles}` : '';
        setMensaje(`${data.mensaje || 'Error al actualizar el perfil'}${detalle}`);
      } else {
        setProfileMsgType('success');
        setMensaje(data.mensaje || '¡Perfil actualizado con éxito!');
        if (data.usuario) {
          updateUser(data.usuario);
        } else {
          updateUser(profileData);
        }
        setTimeout(() => setMensaje(null), 3000);
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setProfileMsgType('danger');
      setMensaje('No se pudo conectar con el servidor backend. Asegurate de que esté corriendo.');
    } finally {
      setCargandoPerfil(false);
    }
  };

  const handleChangePassword = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!passwordData.actual) {
      setPasswordMsgType('danger');
      setPasswordMsg('Debes ingresar tu contraseña actual');
      return;
    }
    if (passwordData.nueva.length < 6) {
      setPasswordMsgType('danger');
      setPasswordMsg('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (passwordData.nueva !== passwordData.confirmar) {
      setPasswordMsgType('danger');
      setPasswordMsg('La nueva contraseña y su confirmación no coinciden');
      return;
    }

    const userId = user?.id;
    if (!userId) {
      setPasswordMsgType('danger');
      setPasswordMsg('Debes haber iniciado sesión con un usuario guardado en la base de datos');
      return;
    }

    setCargandoPassword(true);

    try {
      const response = await fetch(`http://localhost:3000/api/usuarios/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          actualPassword: passwordData.actual,
          nuevaPassword: passwordData.nueva
        })
      });

      const data = await response.json();

      if (!response.ok || !data.exito) {
        setPasswordMsgType('danger');
        const detalle = data.detalles ? `: ${data.detalles}` : '';
        setPasswordMsg(`${data.mensaje || 'Error al cambiar la contraseña'}${detalle}`);
      } else {
        setPasswordMsgType('success');
        setPasswordMsg(data.mensaje || '¡Contraseña actualizada exitosamente!');
        setPasswordData({ actual: '', nueva: '', confirmar: '' });
        setTimeout(() => setPasswordMsg(null), 4000);
      }
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      setPasswordMsgType('danger');
      setPasswordMsg('No se pudo conectar con el servidor backend.');
    } finally {
      setCargandoPassword(false);
    }
  };

  const handleOpenPayment = (cuota) => {
    setSelectedCuota(cuota);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    if (selectedCuota) {
      setCuotas(prev => prev.map(c => c.id === selectedCuota.id ? { ...c, estado: 'Pagado' } : c));
    }
    setShowPaymentModal(false);
  };

  // Compute Initials
  const inicialNombre = (user?.nombre || profileData.nombre || 'U').charAt(0).toUpperCase();
  const inicialApellido = (user?.apellido || profileData.apellido || '').charAt(0).toUpperCase();
  const iniciales = `${inicialNombre}${inicialApellido}`;
  const nombreCompleto = user 
    ? `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Usuario Registrado'
    : 'Invitado';

  const renderContent = () => {
    switch (activeTab) {
      case 'cuotas':
        return (
          <>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
              <h2 className="fw-bold text-white mb-0 header-gradient">Mis Cuotas y Pagos</h2>
              <Button 
                variant="outline-info" 
                size="sm" 
                className="fw-bold px-3 py-2 d-inline-flex align-items-center"
                onClick={() => setShowHistoryModal(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon text-info">
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  <path d="M10 9H8" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                </svg>
                Ver Historial Completo
              </Button>
            </div>

            <p className="text-light opacity-75 mb-4">
              Selecciona una cuota pendiente para realizar el pago online al instante.
            </p>

            {cuotas.map((cuota) => (
              <Card key={cuota.id} className="glass-card border-0 mb-3 p-3 text-white">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h5 className="mb-0 fw-bold text-white">{cuota.concepto}</h5>
                      <Badge bg={cuota.estado === 'Pagado' ? 'success' : 'warning'} className="px-2 py-1">
                        {cuota.estado}
                      </Badge>
                    </div>
                    <small className="text-light opacity-75">Vencimiento: {cuota.fechaVenc}</small>
                  </div>

                  <div className="text-end d-flex align-items-center gap-3">
                    <div>
                      <h4 className="mb-0 fw-bold text-gradient">${cuota.monto.toLocaleString('es-AR')}</h4>
                    </div>
                    {cuota.estado === 'Pendiente' ? (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="fw-bold px-4 py-2 hero-btn shadow d-inline-flex align-items-center"
                        onClick={() => handleOpenPayment(cuota)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon">
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                        Pagar
                      </Button>
                    ) : (
                      <Button variant="outline-success" size="sm" disabled className="px-3">
                        ✓ Pagado
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </>
        );

      case 'password':
        return (
          <>
            <h2 className="fw-bold text-white mb-4 header-gradient">Cambiar Contraseña</h2>
            
            {passwordMsg && (
              <Alert variant={passwordMsgType} dismissible onClose={() => setPasswordMsg(null)} className="mb-4 text-center">
                {passwordMsg}
              </Alert>
            )}

            <Form className="usuario-form" onSubmit={handleSubmitPassword}>
              <Form.Group className="mb-3" controlId="actualPassword">
                <Form.Label className="text-white fw-medium">Contraseña Actual</Form.Label>
                <InputGroup>
                  <Form.Control 
                    type={showActual ? 'text' : 'password'} 
                    name="actual"
                    value={passwordData.actual} 
                    onChange={handleChangePassword}
                    placeholder="••••••••"
                    className="custom-input" 
                    required
                  />
                  <Button 
                    variant="link" 
                    type="button"
                    onClick={() => setShowActual(!showActual)}
                    className="text-white opacity-75 text-decoration-none border-0 bg-transparent px-3 d-flex align-items-center shadow-none"
                    title={showActual ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showActual ? <EyeSlashIcon /> : <EyeIcon />}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3" controlId="newPassword">
                <Form.Label className="text-white fw-medium">Nueva Contraseña</Form.Label>
                <InputGroup>
                  <Form.Control 
                    type={showNueva ? 'text' : 'password'} 
                    name="nueva"
                    value={passwordData.nueva} 
                    onChange={handleChangePassword}
                    placeholder="••••••••"
                    className="custom-input" 
                    required
                  />
                  <Button 
                    variant="link" 
                    type="button"
                    onClick={() => setShowNueva(!showNueva)}
                    className="text-white opacity-75 text-decoration-none border-0 bg-transparent px-3 d-flex align-items-center shadow-none"
                    title={showNueva ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showNueva ? <EyeSlashIcon /> : <EyeIcon />}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4" controlId="confirmPassword">
                <Form.Label className="text-white fw-medium">Confirmar Nueva Contraseña</Form.Label>
                <InputGroup>
                  <Form.Control 
                    type={showConfirmar ? 'text' : 'password'} 
                    name="confirmar"
                    value={passwordData.confirmar} 
                    onChange={handleChangePassword}
                    placeholder="••••••••"
                    className="custom-input" 
                    required
                  />
                  <Button 
                    variant="link" 
                    type="button"
                    onClick={() => setShowConfirmar(!showConfirmar)}
                    className="text-white opacity-75 text-decoration-none border-0 bg-transparent px-3 d-flex align-items-center shadow-none"
                    title={showConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmar ? <EyeSlashIcon /> : <EyeIcon />}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Button variant="primary" type="submit" disabled={cargandoPassword} className="custom-button px-4 py-2 fw-bold w-100 w-sm-auto">
                {cargandoPassword ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Contraseña'
                )}
              </Button>
            </Form>
          </>
        );

      case 'perfil':
      default:
        return (
          <>
            <h2 className="fw-bold text-white mb-4 header-gradient">Editar Perfil</h2>
            
            {mensaje && (
              <Alert variant={profileMsgType} dismissible onClose={() => setMensaje(null)} className="mb-4 text-center">
                {mensaje}
              </Alert>
            )}

            <Form className="usuario-form" onSubmit={handleSubmitProfile}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="nombres">
                    <Form.Label className="text-white fw-medium">Nombre</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="nombre"
                      value={profileData.nombre} 
                      onChange={handleChangeProfile}
                      placeholder="Tu nombre"
                      className="custom-input" 
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="apellidos">
                    <Form.Label className="text-white fw-medium">Apellido</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="apellido"
                      value={profileData.apellido} 
                      onChange={handleChangeProfile}
                      placeholder="Tu apellido"
                      className="custom-input" 
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-4" controlId="email">
                    <Form.Label className="text-white fw-medium">Correo Electrónico</Form.Label>
                    <Form.Control 
                      type="email" 
                      name="email"
                      value={profileData.email} 
                      onChange={handleChangeProfile}
                      placeholder="correo@example.com"
                      className="custom-input" 
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button variant="primary" type="submit" disabled={cargandoPerfil} className="custom-button px-4 py-2 fw-bold w-100 w-sm-auto">
                {cargandoPerfil ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </Form>
          </>
        );
    }
  };

  if (!user) {
    return (
      <Container className="py-5 text-center text-white">
        <Card className="glass-card p-5 mx-auto" style={{ maxWidth: '600px' }}>
          <Card.Body>
            <h3 className="fw-bold mb-3">Acceso Restringido</h3>
            <p className="opacity-75 mb-4">
              Debes estar registrado e iniciar sesión para ver y editar tu perfil o cuotas.
            </p>
            <Button as={Link} to="/login" variant="primary" className="fw-bold px-4 py-2 hero-btn">
              Iniciar Sesión / Registrarse
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <div className="user-page py-4">
      <Container fluid className="user-container">
        <Row className="h-100 justify-content-center">
          {/* Left Sidebar */}
          <Col md={4} lg={3} className="mb-4 mb-md-0">
            <Card className="glass-card h-100 border-0 shadow-sm">
              <Card.Body className="d-flex flex-column p-4">
                <div className="text-center mb-4">
                  <div className="avatar-placeholder mx-auto mb-3">
                    <span className="fw-bold fs-3 text-white">{iniciales}</span>
                  </div>
                  <h4 className="fw-bold text-white mb-1">{nombreCompleto}</h4>
                  <Badge bg="info" className="mb-2 px-3 py-1 text-dark fw-bold">
                    Categoría: {user.categoria || 'Inicial'}
                  </Badge>
                  {user.dni && (
                    <p className="text-light opacity-75 small mb-0">DNI: {user.dni}</p>
                  )}
                </div>

                <Nav className="flex-column custom-nav mt-3">
                  <Nav.Link
                    className={`nav-item ${activeTab === 'perfil' ? 'active' : ''} d-flex align-items-center`}
                    onClick={() => setActiveTab('perfil')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Editar Perfil
                  </Nav.Link>
                  <Nav.Link
                    className={`nav-item ${activeTab === 'password' ? 'active' : ''} d-flex align-items-center`}
                    onClick={() => setActiveTab('password')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Cambiar Contraseña
                  </Nav.Link>
                  <Nav.Link
                    className={`nav-item ${activeTab === 'cuotas' ? 'active' : ''} d-flex align-items-center`}
                    onClick={() => setActiveTab('cuotas')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                    Ver Cuotas y Pagos
                  </Nav.Link>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          {/* Main Content */}
          <Col md={8} lg={7}>
            <Card className="glass-card h-100 border-0 shadow-sm">
              <Card.Body className="p-4 p-md-5">
                {renderContent()}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal de Pago */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered className="dark-modal">
        <Modal.Header closeButton className="border-secondary text-white">
          <Modal.Title className="fw-bold">Pagar Cuota</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-white">
          {selectedCuota && (
            <div>
              <p className="mb-2"><strong>Concepto:</strong> {selectedCuota.concepto}</p>
              <p className="mb-2"><strong>Monto a abonar:</strong> <span className="text-gradient fw-bold fs-5">${selectedCuota.monto.toLocaleString('es-AR')}</span></p>
              <hr className="border-secondary my-3" />
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Seleccionar Método de Pago</Form.Label>
                <Form.Select className="custom-input">
                  <option>💳 Tarjeta de Crédito / Débito</option>
                  <option>📱 Mercado Pago</option>
                  <option>🏦 Transferencia Bancaria</option>
                </Form.Select>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" className="fw-bold px-4" onClick={handleConfirmPayment}>
            Confirmar Pago
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Historial Completo */}
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg" centered className="dark-modal">
        <Modal.Header closeButton className="border-secondary text-white">
          <Modal.Title className="fw-bold d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon text-info">
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M10 9H8" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
            </svg>
            Historial Completo de Pagos
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-white">
          <div className="table-responsive">
            <Table responsive borderless className="text-white align-middle custom-table">
              <thead>
                <tr className="border-bottom border-secondary text-light opacity-75">
                  <th>Concepto</th>
                  <th>Fecha de Pago</th>
                  <th>Método</th>
                  <th>Comprobante</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((item) => (
                  <tr key={item.id} className="border-bottom border-secondary opacity-90">
                    <td className="fw-bold">{item.concepto}</td>
                    <td>{item.fechaPago}</td>
                    <td>{item.metodo}</td>
                    <td><small className="text-info">{item.comprobante}</small></td>
                    <td className="fw-bold text-success">${item.monto.toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default User;
