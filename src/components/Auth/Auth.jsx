import { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const API_BASE_URL = 'http://localhost:3000/api/auth';

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

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(location.state?.mode !== 'register');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fechaNac: '',
    email: '',
    password: ''
  });

  const [mensaje, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState('danger'); 
  const [cargando, setCargando] = useState(false);

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
    setMensaje(null);
  };

  const formatearFechaAuto = (val) => {
    // Eliminar cualquier carácter que no sea número
    const digitos = val.replace(/\D/g, '').slice(0, 8);
    if (digitos.length > 4) {
      return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
    }
    if (digitos.length > 2) {
      return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
    }
    return digitos;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'fechaNac') {
      const fechaFormateada = formatearFechaAuto(value);
      setFormData((prev) => ({
        ...prev,
        fechaNac: fechaFormateada
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setCargando(true);

    if (!isLogin && formData.password.length < 6) {
      setTipoMensaje('danger');
      setMensaje('La contraseña debe tener al menos 6 caracteres');
      setCargando(false);
      return;
    }

    const endpoint = isLogin ? `${API_BASE_URL}/login` : `${API_BASE_URL}/registro`;

    const bodyData = isLogin
      ? { email: formData.email, password: formData.password }
      : { ...formData };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();

      if (!response.ok || !data.exito) {
        setTipoMensaje('danger');
        const detalleTexto = data.detalles ? `: ${data.detalles}` : '';
        setMensaje(`${data.mensaje || 'Ocurrió un error al procesar la solicitud'}${detalleTexto}`);
      } else {
        setTipoMensaje('success');
        setMensaje(data.mensaje || (isLogin ? '¡Inicio de sesión exitoso!' : '¡Registro completado exitosamente! Redirigiendo...'));
        
        // Guardar usuario en el contexto global de autenticación
        const usuarioValido = data.usuario || {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          dni: formData.dni,
          fechaNac: formData.fechaNac
        };

        authLogin(usuarioValido);

        // Redirigir al panel de administración o inicio después de un breve delay
        setTimeout(() => {
          if (usuarioValido.rol === 'admin' || usuarioValido.email === 'administraciongymfit@gmail.com') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error de red al autenticar:', error);
      setTipoMensaje('danger');
      setMensaje('No se pudo conectar con el servidor backend. Asegurate de que esté corriendo en http://localhost:3000');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center auth-container">
      <Card className={`auth-card p-4 p-sm-5 border-0 shadow-lg ${!isLogin ? 'auth-card-wide' : ''}`}>
        <Card.Body>
          <div className="text-center mb-4 auth-header">
            <h2 className="fw-bold">{isLogin ? 'Bienvenido nuevamente' : 'Crear cuenta'}</h2>
            <p className="text-light">
              {isLogin ? 'Ingrese datos para iniciar sesión' : 'Registrarse para poder ingresar'}
            </p>
          </div>

          {mensaje && (
            <Alert variant={tipoMensaje} onClose={() => setMensaje(null)} dismissible className="mb-4 text-center">
              {mensaje}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} className="auth-form">
            <Row>
              {!isLogin && (
                <>
                  <Col xs={12} sm={6}>
                    <Form.Group className="mb-3" controlId="nombre">
                      <Form.Label className="fw-medium text-white">Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        placeholder="Juan"
                        value={formData.nombre}
                        onChange={handleChange}
                        maxLength={100}
                        required
                        className="custom-input"
                        onInvalid={e => e.target.setCustomValidity('Por favor completá este campo')}
                        onInput={e => e.target.setCustomValidity('')}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Form.Group className="mb-3" controlId="apellido">
                      <Form.Label className="fw-medium text-white">Apellido</Form.Label>
                      <Form.Control
                        type="text"
                        name="apellido"
                        placeholder="Pérez"
                        value={formData.apellido}
                        onChange={handleChange}
                        maxLength={100}
                        required
                        className="custom-input"
                        onInvalid={e => e.target.setCustomValidity('Por favor completá este campo')}
                        onInput={e => e.target.setCustomValidity('')}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Form.Group className="mb-3" controlId="dni">
                      <Form.Label className="fw-medium text-white">DNI</Form.Label>
                      <Form.Control
                        type="text"
                        name="dni"
                        placeholder="12345678"
                        value={formData.dni}
                        onChange={handleChange}
                        maxLength={20}
                        required
                        className="custom-input"
                        onInvalid={e => e.target.setCustomValidity('Por favor completá este campo')}
                        onInput={e => e.target.setCustomValidity('')}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Form.Group className="mb-3" controlId="fechaNac">
                      <Form.Label className="fw-medium text-white">Fecha de Nacimiento</Form.Label>
                      <Form.Control
                        type="text"
                        name="fechaNac"
                        placeholder="29/04/2004"
                        value={formData.fechaNac}
                        onChange={handleChange}
                        maxLength={10}
                        required
                        className="custom-input"
                        onInvalid={e => e.target.setCustomValidity('Por favor completá este campo')}
                        onInput={e => e.target.setCustomValidity('')}
                      />
                    </Form.Group>
                  </Col>
                </>
              )}

              <Col xs={12} sm={isLogin ? 12 : 6}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label className="fw-medium text-white">Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="tu-email@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    maxLength={150}
                    required
                    className="custom-input"
                    onInvalid={e => e.target.setCustomValidity(e.target.value === '' ? 'Por favor completá este campo' : 'Ingresá un correo electrónico válido')}
                    onInput={e => e.target.setCustomValidity('')}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} sm={isLogin ? 12 : 6}>
                <Form.Group className="mb-4" controlId="password">
                  <Form.Label className="fw-medium text-white">Contraseña</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      minLength={isLogin ? undefined : 6}
                      maxLength={100}
                      required
                      className="custom-input"
                      onInvalid={e => e.target.setCustomValidity('Por favor completá este campo')}
                      onInput={e => e.target.setCustomValidity('')}
                    />
                    <Button 
                      variant="link" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-white opacity-75 text-decoration-none border-0 bg-transparent px-3 d-flex align-items-center shadow-none"
                      title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Button variant="primary" type="submit" disabled={cargando} className="w-100 fw-bold auth-button py-2">
              {cargando ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  {isLogin ? 'Iniciando sesión...' : 'Registrando...'}
                </>
              ) : (
                isLogin ? 'Iniciar sesión' : 'Registrarse'
              )}
            </Button>
          </Form>

          <div className="text-center mt-4 auth-footer text-light">
            {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes una cuenta? "}
            <Button variant="link" className="p-0 text-decoration-none toggle-btn fw-bold" onClick={toggleAuthMode}>
              {isLogin ? 'Registrarse' : 'Iniciar sesión'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Auth;
