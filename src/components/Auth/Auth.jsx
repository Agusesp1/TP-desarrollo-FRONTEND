import { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(isLogin ? "Iniciando sesión..." : "Registrando...");
  };

  return (
    <Container className="d-flex justify-content-center align-items-center auth-container">
      <Card className="auth-card p-4 p-sm-5 border-0 shadow-lg">
        <Card.Body>
          <div className="text-center mb-4 auth-header">
            <h2 className="fw-bold">{isLogin ? 'Bienvenido nuevamente' : 'Crear cuenta'}</h2>
            <p className="text-light">
              {isLogin ? 'Ingrese datos para iniciar sesión' : 'Registrarse para poder ingresar'}
            </p>
          </div>

          <Form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <Form.Group className="mb-3" controlId="name">
                <Form.Label className="fw-medium text-white">Nombre completo</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Juan Perez"
                  required
                  className="custom-input"
                  onInvalid={e => e.target.setCustomValidity('Por favor completá este campo')}
                  onInput={e => e.target.setCustomValidity('')}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3" controlId="email">
              <Form.Label className="fw-medium text-white">Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="tu-email@gmail.com"
                required
                className="custom-input"
                onInvalid={e => e.target.setCustomValidity(e.target.value === '' ? 'Por favor completá este campo' : 'Ingresá un correo electrónico válido')}
                onInput={e => e.target.setCustomValidity('')}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label className="fw-medium text-white">Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                required
                className="custom-input"
                onInvalid={e => e.target.setCustomValidity('Por favor completá este campo')}
                onInput={e => e.target.setCustomValidity('')}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 fw-bold auth-button py-2">
              {isLogin ? 'Iniciar sesión' : 'Registrarse'}
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
