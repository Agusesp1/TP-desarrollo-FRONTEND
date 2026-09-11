import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Alert, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ProfileTab = ({ user, updateUser, logout }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || ''
  });

  const [mensaje, setMensaje] = useState(null);
  const [profileMsgType, setProfileMsgType] = useState('success');
  const [cargandoPerfil, setCargandoPerfil] = useState(false);

  // Modal Eliminar Cuenta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cargandoDelete, setCargandoDelete] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || ''
      });
    }
  }, [user]);

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

  const handleConfirmDelete = async () => {
    const userId = user?.id;
    if (!userId) {
      logout();
      navigate('/login');
      return;
    }

    setCargandoDelete(true);
    setDeleteError(null);

    try {
      const response = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok || !data.exito) {
        const detalle = data.detalles ? `: ${data.detalles}` : '';
        setDeleteError(`${data.mensaje || 'Error al dar de baja la cuenta'}${detalle}`);
      } else {
        setShowDeleteModal(false);
        logout();
        navigate('/login');
      }
    } catch (error) {
      console.error('Error al dar de baja el perfil:', error);
      setDeleteError('No se pudo conectar con el servidor backend.');
    } finally {
      setCargandoDelete(false);
    }
  };

  return (
    <Card className="glass-card border-0 p-4 text-white">
      <div className="mb-4">
        <h4 className="fw-bold mb-1 text-white">Datos Personales</h4>
        <p className="text-light opacity-75 small mb-0">
          Modifica tu información de contacto y credenciales de socio en FitApp.
        </p>
      </div>

      {mensaje && (
        <Alert variant={profileMsgType} dismissible onClose={() => setMensaje(null)} className="mb-4 text-center">
          {mensaje}
        </Alert>
      )}

      <Form onSubmit={handleSubmitProfile}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group controlId="nombre">
              <Form.Label className="small text-light">Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={profileData.nombre}
                onChange={handleChangeProfile}
                required
                className="bg-transparent text-white border-secondary"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="apellido">
              <Form.Label className="small text-light">Apellido</Form.Label>
              <Form.Control
                type="text"
                name="apellido"
                value={profileData.apellido}
                onChange={handleChangeProfile}
                required
                className="bg-transparent text-white border-secondary"
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group controlId="email">
              <Form.Label className="small text-light">Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleChangeProfile}
                required
                className="bg-transparent text-white border-secondary"
              />
            </Form.Group>
          </Col>

          <Col md={12} className="pt-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
            <Button
              variant="outline-danger"
              size="sm"
              className="rounded-pill px-3 py-2"
              onClick={() => setShowDeleteModal(true)}
            >
              Dar de baja mi cuenta
            </Button>

            <Button
              type="submit"
              variant="primary"
              className="hero-btn rounded-pill px-4 py-2 fw-bold"
              disabled={cargandoPerfil}
            >
              {cargandoPerfil ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Modal Confirmar Baja */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        contentClassName="glass-card text-white border-secondary"
      >
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title className="fw-bold text-danger d-flex align-items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
            Confirmar Baja de Cuenta
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && (
            <Alert variant="danger" className="mb-3 py-2 small">
              {deleteError}
            </Alert>
          )}
          <p className="mb-2">
            ¿Estás seguro de que deseas dar de baja tu membresía y cuenta en FitApp?
          </p>
          <small className="text-warning d-block">
            ⚠️ Perderás el acceso a tus clases reservadas y beneficios del pase activo.
          </small>
        </Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button variant="outline-light" onClick={() => setShowDeleteModal(false)} disabled={cargandoDelete} className="rounded-pill px-3">
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={cargandoDelete} className="rounded-pill px-4 fw-bold">
            {cargandoDelete ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Procesando...
              </>
            ) : (
              'Confirmar Baja'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default ProfileTab;
