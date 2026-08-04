import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const [contactData, setContactData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  const [contactoEnviado, setContactoEnviado] = useState(false);

  useEffect(() => {
    if (user) {
      setContactData((prev) => ({
        ...prev,
        nombre: `${user.nombre || ''} ${user.apellido || ''}`.trim(),
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactoEnviado(true);
    setTimeout(() => {
      setContactoEnviado(false);
      setContactData({
        nombre: user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() : '',
        email: user ? user.email || '' : '',
        asunto: '',
        mensaje: ''
      });
    }, 4000);
  };

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
                {user ? (
                  <>
                    ¡Hola, <span className="text-gradient">{user.nombre || 'Socio'}</span>! Bienvenid@ a FitApp
                  </>
                ) : (
                  <>
                    Bienvenido a <span className="text-gradient">FitApp Premium</span>
                  </>
                )}
              </h1>
              <p className="lead mb-5 text-light opacity-75">
                Un espacio diseñado para superar tus límites con equipamiento de alta gama,
                entrenadores certificados y planes personalizados a tu medida.
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                {user ? (
                  <>
                    <Button 
                      as={Link} 
                      to="/user" 
                      variant="primary" 
                      size="lg" 
                      className="px-4 py-3 fw-bold hero-btn shadow-lg d-inline-flex align-items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Ir a Mi Perfil
                    </Button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="feature-icon mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="feature-icon-svg">
                      <path d="m6.5 6.5 11 11" />
                      <path d="m21 21-1-1" />
                      <path d="m3 3 1 1" />
                      <path d="m18 22 4-4" />
                      <path d="m2 6 4-4" />
                      <path d="m3 10 7-7" />
                      <path d="m14 21 7-7" />
                      <path d="M6.5 12.5 12.5 6.5" />
                      <path d="m11.5 17.5 6-6" />
                    </svg>
                  </div>
                  <Card.Title className="fw-bold mb-3 text-white">Equipamiento Moderno</Card.Title>
                  <Card.Text className="text-light opacity-75">
                    Máquinas e instalaciones de última generación para asegurar un entrenamiento eficiente y seguro.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="feature-card h-100 p-4 border-0 shadow text-center">
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="feature-icon mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="feature-icon-svg">
                      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <path d="M9 12h6" />
                      <path d="M9 16h6" />
                      <path d="M9 8h6" />
                    </svg>
                  </div>
                  <Card.Title className="fw-bold mb-3 text-white">Planes Personalizados</Card.Title>
                  <Card.Text className="text-light opacity-75">
                    Rutinas y seguimiento nutricional adaptados específicamente a tus metas personales.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="feature-card h-100 p-4 border-0 shadow text-center">
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="feature-icon mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="feature-icon-svg">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                    </svg>
                  </div>
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
                  <h5 className="fw-bold text-white mb-1 d-flex align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon text-primary">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Sede Central (Centro)
                  </h5>
                  <p className="small text-light opacity-75 mb-1">Av. Corrientes 1234, CABA</p>
                  <small className="text-primary">Lun a Vie: 06:00 - 23:00 hs | Sáb: 08:00 - 20:00 hs</small>
                </div>
                <div className="sede-item p-3 mb-3 rounded-3">
                  <h5 className="fw-bold text-white mb-1 d-flex align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon text-primary">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Sede Norte (Palermo)
                  </h5>
                  <p className="small text-light opacity-75 mb-1">Av. Santa Fe 4567, CABA</p>
                  <small className="text-primary">Lun a Vie: 06:00 - 23:00 hs | Sáb: 08:00 - 20:00 hs</small>
                </div>
                <div className="sede-item p-3 rounded-3">
                  <h5 className="fw-bold text-white mb-1 d-flex align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon text-primary">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Sede Belgrano
                  </h5>
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
                {contactoEnviado && (
                  <Alert variant="success" className="text-center mb-4">
                    ¡Gracias por tu mensaje! Nos pondremos en contacto a la brevedad.
                  </Alert>
                )}
                <Form onSubmit={handleContactSubmit}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group controlId="contactName">
                        <Form.Label className="text-white fw-medium">Nombre Completo</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="Tu nombre" 
                          value={contactData.nombre}
                          onChange={(e) => setContactData({ ...contactData, nombre: e.target.value })}
                          className="custom-input" 
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="contactEmail">
                        <Form.Label className="text-white fw-medium">Correo Electrónico</Form.Label>
                        <Form.Control 
                          type="email" 
                          placeholder="tu-email@gmail.com" 
                          value={contactData.email}
                          onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                          className="custom-input" 
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group controlId="contactSubject">
                        <Form.Label className="text-white fw-medium">Asunto</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="Consulta sobre planes, clases, etc." 
                          value={contactData.asunto}
                          onChange={(e) => setContactData({ ...contactData, asunto: e.target.value })}
                          className="custom-input" 
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group controlId="contactMessage">
                        <Form.Label className="text-white fw-medium">Mensaje</Form.Label>
                        <Form.Control 
                          as="textarea" 
                          rows={4} 
                          placeholder="Escribe tu mensaje aquí..." 
                          value={contactData.mensaje}
                          onChange={(e) => setContactData({ ...contactData, mensaje: e.target.value })}
                          className="custom-input" 
                          required 
                        />
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
            <h2 className="fw-bold mb-3">
              {user ? '¡Continúa alcanzando tus objetivos!' : '¿Listo para comenzar tu transformación?'}
            </h2>
            <p className="lead mb-4 opacity-75">
              {user ? 'Gestiona tus cuotas y consulta tus horarios en tu perfil.' : 'Únete hoy y obtén tu primera sesión de evaluación totalmente gratuita.'}
            </p>
            {user ? (
              <Button 
                as={Link} 
                to="/user" 
                variant="primary" 
                size="lg" 
                className="px-5 py-3 fw-bold shadow"
              >
                Acceder a Mi Perfil
              </Button>
            ) : (
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
            )}
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Home;
