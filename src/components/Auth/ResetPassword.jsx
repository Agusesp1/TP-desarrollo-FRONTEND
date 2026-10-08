import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';

const API_BASE_URL = 'http://localhost:3000/api/auth';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState('danger');
  const [cargando, setCargando] = useState(false);
  const [token, setToken] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setTipoMensaje('danger');
      setMensaje('Enlace no válido. No se encontró el token de seguridad.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);

    if (!token) {
      setTipoMensaje('danger');
      setMensaje('Token inválido. Solicita un nuevo enlace.');
      return;
    }

    if (newPassword.length < 6) {
      setTipoMensaje('danger');
      setMensaje('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setTipoMensaje('danger');
      setMensaje('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setTipoMensaje('danger');
        setMensaje(data.message || 'Error al restablecer la contraseña.');
      } else {
        setTipoMensaje('success');
        setMensaje('¡Contraseña actualizada con éxito! Redirigiendo al login...');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setTipoMensaje('danger');
      setMensaje('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center auth-container" style={{ minHeight: '80vh' }}>
      <Card className="auth-card p-4 p-sm-5 border-0 shadow-lg">
        <Card.Body>
          <div className="text-center mb-4 auth-header">
            <h2 className="fw-bold">Restablecer Contraseña</h2>
            <p className="text-light">Ingresa tu nueva contraseña</p>
          </div>

          {message && (
            <Alert variant={tipoMensaje} className="mb-4 text-center">
              {message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} className="auth-form">
            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label className="fw-medium text-white">Nueva contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="custom-input"
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="confirmPassword">
              <Form.Label className="fw-medium text-white">Confirmar contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="custom-input"
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={cargando || !token} className="w-100 fw-bold auth-button py-2">
              {cargando ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> : null}
              {cargando ? 'Actualizando...' : 'Restablecer contraseña'}
            </Button>
          </Form>

          <div className="text-center mt-4 text-light">
            <Button variant="link" className="p-0 text-decoration-none toggle-btn fw-bold" onClick={() => navigate('/login')}>
              Volver al inicio de sesión
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ResetPassword;
