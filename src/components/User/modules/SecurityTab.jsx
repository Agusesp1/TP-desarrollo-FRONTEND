import React, { useState } from 'react';
import { Card, Form, Row, Col, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';

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

const SecurityTab = ({ user }) => {
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
  const [cargandoPassword, setCargandoPassword] = useState(false);

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

    if (passwordData.nueva !== passwordData.confirmar) {
      setPasswordMsgType('danger');
      setPasswordMsg('La nueva contraseña y su confirmación no coinciden');
      return;
    }

    if (passwordData.nueva.length < 6) {
      setPasswordMsgType('danger');
      setPasswordMsg('La contraseña debe contener al menos 6 caracteres');
      return;
    }

    const userId = user?.id;
    if (!userId) {
      setPasswordMsgType('success');
      setPasswordMsg('¡Contraseña actualizada en sesión!');
      setPasswordData({ actual: '', nueva: '', confirmar: '' });
      setTimeout(() => setPasswordMsg(null), 3500);
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
        setPasswordMsg(`${data.mensaje || 'Error al actualizar la contraseña'}${detalle}`);
      } else {
        setPasswordMsgType('success');
        setPasswordMsg(data.mensaje || '¡Contraseña actualizada exitosamente!');
        setPasswordData({ actual: '', nueva: '', confirmar: '' });
        setTimeout(() => setPasswordMsg(null), 3500);
      }
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      setPasswordMsgType('danger');
      setPasswordMsg('No se pudo conectar con el servidor backend.');
    } finally {
      setCargandoPassword(false);
    }
  };

  return (
    <Card className="glass-card border-0 p-4 text-white">
      <div className="mb-4">
        <h4 className="fw-bold mb-1 text-white">Seguridad y Acceso</h4>
        <p className="text-light opacity-75 small mb-0">
          Actualiza tu clave de ingreso periódicamente para mantener tu cuenta protegida.
        </p>
      </div>

      {passwordMsg && (
        <Alert variant={passwordMsgType} dismissible onClose={() => setPasswordMsg(null)} className="mb-4 text-center">
          {passwordMsg}
        </Alert>
      )}

      <Form onSubmit={handleSubmitPassword}>
        <Row className="g-3">
          <Col md={12}>
            <Form.Group controlId="actual">
              <Form.Label className="small text-light">Contraseña Actual</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showActual ? 'text' : 'password'}
                  name="actual"
                  value={passwordData.actual}
                  onChange={handleChangePassword}
                  required
                  placeholder="••••••••"
                  className="bg-transparent text-white border-secondary"
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowActual(!showActual)}
                  type="button"
                >
                  {showActual ? <EyeSlashIcon /> : <EyeIcon />}
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="nueva">
              <Form.Label className="small text-light">Nueva Contraseña</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showNueva ? 'text' : 'password'}
                  name="nueva"
                  value={passwordData.nueva}
                  onChange={handleChangePassword}
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="bg-transparent text-white border-secondary"
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowNueva(!showNueva)}
                  type="button"
                >
                  {showNueva ? <EyeSlashIcon /> : <EyeIcon />}
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="confirmar">
              <Form.Label className="small text-light">Confirmar Nueva Contraseña</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showConfirmar ? 'text' : 'password'}
                  name="confirmar"
                  value={passwordData.confirmar}
                  onChange={handleChangePassword}
                  required
                  placeholder="Repite la nueva contraseña"
                  className="bg-transparent text-white border-secondary"
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirmar(!showConfirmar)}
                  type="button"
                >
                  {showConfirmar ? <EyeSlashIcon /> : <EyeIcon />}
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>

          <Col md={12} className="pt-3 text-end">
            <Button
              type="submit"
              variant="primary"
              className="hero-btn rounded-pill px-4 py-2 fw-bold"
              disabled={cargandoPassword}
            >
              {cargandoPassword ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Contraseña'
              )}
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default SecurityTab;
