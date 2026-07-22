import React from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section text-center text-light d-flex align-items-center justify-content-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={10} lg={8}>
              <span className="badge bg-primary px-3 py-2 rounded-pill text-uppercase mb-3 tracking-wider">
                Transforma Tu Estilo de Vida
              </span>
              <h1 className="display-3 fw-bold mb-4 hero-title">
                Bienvenido a <span className="text-gradient">FitApp Premium</span>
              </h1>
              <p className="lead mb-5 text-light opacity-75">
                Un espacio diseñado para superar tus límites con equipamiento de alta gama,
                entrenadores certificados y planes personalizados a tu medida.
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <Button 
                  as={Link} 
                  to="/login" 
                  state={{ mode: 'register' }}
                  variant="primary" 
                  size="lg" 
                  className="px-4 py-3 fw-bold hero-btn shadow-lg"
                >
                  Registrarse Ahora
                </Button>
                <Button 
                  as={Link} 
                  to="/login" 
                  state={{ mode: 'login' }}
                  variant="outline-light" 
                  size="lg" 
                  className="px-4 py-3 fw-bold hero-btn-outline"
                >
                  Iniciar Sesión
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Características principales */}
      <section className="features-section py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold section-title">¿Por qué elegirnos?</h2>
            <p className="text-light opacity-75">
              Todo lo que necesitas para alcanzar tus metas físicas en un solo lugar
            </p>
          </div>

          <Row className="g-4">
            <Col md={4}>
              <Card className="feature-card h-100 p-4 border-0 shadow text-center">
                <Card.Body>
                  <div className="feature-icon mb-3">🏋️‍♂️</div>
                  <Card.Title className="fw-bold mb-3 text-white">Equipamiento Moderno</Card.Title>
                  <Card.Text className="text-light opacity-75">
                    Máquinas e instalaciones de última generación para asegurar un entrenamiento eficiente y seguro.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="feature-card h-100 p-4 border-0 shadow text-center">
                <Card.Body>
                  <div className="feature-icon mb-3">📋</div>
                  <Card.Title className="fw-bold mb-3 text-white">Planes Personalizados</Card.Title>
                  <Card.Text className="text-light opacity-75">
                    Rutinas y seguimiento nutricional adaptados específicamente a tus metas personales.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="feature-card h-100 p-4 border-0 shadow text-center">
                <Card.Body>
                  <div className="feature-icon mb-3">🔥</div>
                  <Card.Title className="fw-bold mb-3 text-white">Clases Guiadas</Card.Title>
                  <Card.Text className="text-light opacity-75">
                    Spinning, Yoga, Crossfit y más con entrenadores profesionales listos para motivarte.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Sección Sobre Nosotros */}
      <section id="nosotros" className="about-section py-5">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <span className="text-primary fw-bold text-uppercase tracking-wider">Sobre Nosotros</span>
              <h2 className="display-5 fw-bold text-white mb-4">Más que un gimnasio, tu comunidad fitness</h2>
              <p className="text-light opacity-75 mb-3">
                En <strong>FitApp Premium</strong> nacimos con la misión de impulsar a cada persona a descubrir su máximo potencial. Con más de 10 años de trayectoria, contamos con espacios pensados para el alto rendimiento y la salud integral.
              </p>
              <p className="text-light opacity-75 mb-4">
                Ofrecemos asesoría constante, tecnología de vanguardia y un ambiente positivo donde entrenar se convierte en el mejor momento de tu día.
              </p>
              <Row className="g-3 text-center">
                <Col sm={4}>
                  <div className="stat-card p-3 rounded-3">
                    <h3 className="fw-bold text-gradient mb-0">+5,000</h3>
                    <small className="text-light opacity-75">Socios Activos</small>
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="stat-card p-3 rounded-3">
                    <h3 className="fw-bold text-gradient mb-0">+25</h3>
                    <small className="text-light opacity-75">Entrenadores</small>
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="stat-card p-3 rounded-3">
                    <h3 className="fw-bold text-gradient mb-0">3</h3>
                    <small className="text-light opacity-75">Sedes Premium</small>
                  </div>
                </Col>
              </Row>
            </Col>

            <Col lg={6}>
              <div className="about-image-card p-4 rounded-4 shadow-lg">
                <h4 className="fw-bold text-white mb-3">Nuestras Sedes</h4>
                <div className="sede-item p-3 mb-3 rounded-3">
                  <h5 className="fw-bold text-white mb-1">📍 Sede Central (Centro)</h5>
                  <p className="small text-light opacity-75 mb-1">Av. Corrientes 1234, CABA</p>
                  <small className="text-primary">Lun a Vie: 06:00 - 23:00 hs | Sáb: 08:00 - 20:00 hs</small>
                </div>
                <div className="sede-item p-3 mb-3 rounded-3">
                  <h5 className="fw-bold text-white mb-1">📍 Sede Norte (Palermo)</h5>
                  <p className="small text-light opacity-75 mb-1">Av. Santa Fe 4567, CABA</p>
                  <small className="text-primary">Lun a Vie: 06:00 - 23:00 hs | Sáb: 08:00 - 20:00 hs</small>
                </div>
                <div className="sede-item p-3 rounded-3">
                  <h5 className="fw-bold text-white mb-1">📍 Sede Belgrano</h5>
                  <p className="small text-light opacity-75 mb-1">Cabildo 2345, CABA</p>
                  <small className="text-primary">24 horas los 7 días de la semana</small>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Sección Contacto */}
      <section id="contacto" className="contact-section py-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center mb-5">
              <span className="text-primary fw-bold text-uppercase tracking-wider">Contacto</span>
              <h2 className="display-5 fw-bold text-white">¿Tienes alguna consulta?</h2>
              <p className="text-light opacity-75">
                Escríbenos y un asesor te responderá a la brevedad.
              </p>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Card className="contact-card p-4 p-md-5 border-0 shadow-lg">
                <Form onSubmit={(e) => e.preventDefault()}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group controlId="contactName">
                        <Form.Label className="text-white fw-medium">Nombre Completo</Form.Label>
                        <Form.Control type="text" placeholder="Tu nombre" className="custom-input" required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="contactEmail">
                        <Form.Label className="text-white fw-medium">Correo Electrónico</Form.Label>
                        <Form.Control type="email" placeholder="tu-email@gmail.com" className="custom-input" required />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group controlId="contactSubject">
                        <Form.Label className="text-white fw-medium">Asunto</Form.Label>
                        <Form.Control type="text" placeholder="Consulta sobre planes, clases, etc." className="custom-input" required />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group controlId="contactMessage">
                        <Form.Label className="text-white fw-medium">Mensaje</Form.Label>
                        <Form.Control as="textarea" rows={4} placeholder="Escribe tu mensaje aquí..." className="custom-input" required />
                      </Form.Group>
                    </Col>
                    <Col md={12} className="text-center mt-4">
                      <Button variant="primary" type="submit" size="lg" className="px-5 py-3 fw-bold hero-btn shadow">
                        Enviar Consulta
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Banner de Registro CTA */}
      <section className="cta-section py-5 my-4">
        <Container>
          <div className="cta-card p-5 rounded-4 text-center text-light">
            <h2 className="fw-bold mb-3">¿Listo para comenzar tu transformación?</h2>
            <p className="lead mb-4 opacity-75">
              Únete hoy y obtén tu primera sesión de evaluación totalmente gratuita.
            </p>
            <Button 
              as={Link} 
              to="/login" 
              state={{ mode: 'register' }}
              variant="primary" 
              size="lg" 
              className="px-5 py-3 fw-bold shadow"
            >
              Crear mi cuenta gratis
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Home;
