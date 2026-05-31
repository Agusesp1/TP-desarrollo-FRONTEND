import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import './User.css';

const User = () => {
  return (
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
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content */}
        <Col md={8} lg={7}>
          <Card className="glass-card h-100 border-0 shadow-sm">
            <Card.Body className="p-4 p-md-5">
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default User;
