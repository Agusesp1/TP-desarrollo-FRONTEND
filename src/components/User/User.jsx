import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Nav } from 'react-bootstrap';
import './User.css';

const User = () => {
  const [activeTab, setActiveTab] = useState('perfil');

  const renderContent = () => {
    switch (activeTab) {
      case 'cuotas':
        return (
          <>
            <h2 className="fw-bold text-white mb-4 header-gradient">Mis Cuotas</h2>
            <div className="text-white">
              <p className="text-white">Aquí podrás ver el estado de tus pagos y vencimientos.</p>

              <Card className="glass-card border-0 mb-3 p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1 fw-bold text-white">Pase Premium Mensual</h5>
                    <small className="text-success fw-medium">Al día</small>
                  </div>
                  <div className="text-end">
                    <h4 className="mb-0 fw-bold text-warning">$15.000</h4>
                    <small className="text-white">Vence: 15/06/2026</small>
                  </div>
                </div>
              </Card>

              <Card className="glass-card border-0 mb-3 p-3 opacity-75">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1 fw-bold text-white">Pase Premium Mensual</h5>
                    <small className="text-white fw-medium">Pagado</small>
                  </div>
                  <div className="text-end">
                    <h4 className="mb-0 fw-bold text-success">$15.000</h4>
                    <small className="text-white">Pagado: 15/05/2026</small>
                  </div>
                </div>
              </Card>
            </div>
          </>
        );
      case 'rutinas':
        return (
          <>
            <h2 className="fw-bold text-white mb-4 header-gradient">Mis Rutinas</h2>
            <div className="text-white">
              <p className="text-muted">Tus planes de entrenamiento personalizados.</p>
              <div className="d-grid gap-3">
                <Button variant="outline-light" className="text-start p-3 custom-input d-flex justify-content-between align-items-center">
                  <span className="fw-medium">Día 1: Pecho y Tríceps</span>
                  <span className="text-primary">Ver rutina ➔</span>
                </Button>
                <Button variant="outline-light" className="text-start p-3 custom-input d-flex justify-content-between align-items-center">
                  <span className="fw-medium">Día 2: Espalda y Bíceps</span>
                  <span className="text-primary">Ver rutina ➔</span>
                </Button>
                <Button variant="outline-light" className="text-start p-3 custom-input d-flex justify-content-between align-items-center">
                  <span className="fw-medium">Día 3: Piernas y Hombros</span>
                  <span className="text-primary">Ver rutina ➔</span>
                </Button>
              </div>
            </div>
          </>
        );
      case 'perfil':
      default:
        return (
          <>
            <h2 className="fw-bold text-white mb-4 header-gradient">Editar Perfil</h2>
            <Form className="usuario-form">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="nombres">
                    <Form.Label className="text-white fw-medium">Nombres</Form.Label>
                    <Form.Control type="text" defaultValue="Juan" className="custom-input" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="apellidos">
                    <Form.Label className="text-white fw-medium">Apellidos</Form.Label>
                    <Form.Control type="text" defaultValue="Perez" className="custom-input" />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label className="text-white fw-medium">Correo Electrónico</Form.Label>
                <Form.Control type="email" defaultValue="correo@example.com" className="custom-input" />
              </Form.Group>

              <Form.Group className="mb-4" controlId="bio">
                <Form.Label className="text-white fw-medium">Biografía o Meta</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Cuéntanos sobre tus objetivos fitness..." className="custom-input" />
              </Form.Group>

              <Button variant="primary" type="submit" className="custom-button px-4 py-2 fw-bold w-100 w-sm-auto">
                Guardar Cambios
              </Button>
            </Form>
          </>
        );
    }
  };

  return (
    <div className="user-page">
    <Container fluid className="user-container py-4">
      <Row className="h-100 justify-content-center">
        {/* Left Sidebar */}
        <Col md={4} lg={3} className="mb-4 mb-md-0">
          <Card className="glass-card h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column p-4">
              <div className="text-center mb-4">
                <div className="avatar-placeholder mx-auto mb-3">
                  <span className="fw-bold fs-3 text-white">JP</span>
                </div>
                <h4 className="fw-bold text-white mb-0">Juan Perez</h4>
                <p className="text-muted small">Miembro Premium</p>
              </div>

              <Nav className="flex-column custom-nav mt-3">
                <Nav.Link 
                  className={`nav-item ${activeTab === 'perfil' ? 'active' : ''}`}
                  onClick={() => setActiveTab('perfil')}
                >
                  Editar Perfil
                </Nav.Link>
                <Nav.Link 
                  className={`nav-item ${activeTab === 'cuotas' ? 'active' : ''}`}
                  onClick={() => setActiveTab('cuotas')}
                >
                  Ver Cuotas
                </Nav.Link>
                <Nav.Link 
                  className={`nav-item ${activeTab === 'rutinas' ? 'active' : ''}`}
                  onClick={() => setActiveTab('rutinas')}
                >
                  Mis Rutinas
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
    </div>
  );
};

export default User;
