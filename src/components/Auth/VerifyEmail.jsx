import React, { useEffect, useState } from 'react';
import { Container, Card, Alert, Spinner, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'http://localhost:3000/api/auth';

const VerifyEmail = () => {
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Verificando tu cuenta...');
  const location = useLocation();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No se encontró el token de verificación.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Correo verificado exitosamente. Iniciando sesión...');
          
          if (data.user) {
            login(data.user);
            setTimeout(() => {
              if (data.user.role === 'admin' || data.user.email === 'administraciongymfit@gmail.com') {
                navigate('/admin');
              } else {
                navigate('/user');
              }
            }, 2000);
          } else {
            setTimeout(() => navigate('/login'), 3000);
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Error al verificar la cuenta.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('No se pudo conectar con el servidor.');
      }
    };

    verifyToken();
  }, [location, navigate]);

  return (
    <Container className="d-flex justify-content-center align-items-center auth-container" style={{ minHeight: '80vh' }}>
      <Card className="auth-card p-4 p-sm-5 border-0 shadow-lg text-center">
        <Card.Body>
          <h2 className="fw-bold mb-4 text-white">Verificación de Cuenta</h2>
          
          {status === 'loading' && (
            <div>
              <Spinner animation="border" variant="light" className="mb-3" />
              <p className="text-light">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <Alert variant="success">
              {message}
            </Alert>
          )}

          {status === 'error' && (
            <>
              <Alert variant="danger">
                {message}
              </Alert>
              <Button variant="outline-light" className="mt-3" onClick={() => navigate('/login')}>
                Ir al inicio de sesión
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VerifyEmail;
