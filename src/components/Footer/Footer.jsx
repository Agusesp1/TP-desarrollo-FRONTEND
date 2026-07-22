import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container py-5 text-light border-top border-secondary-subtle mt-auto">
      <Container>
        <Row className="g-4 mb-4">
          {/* Info general y contacto */}
          <Col lg={4} md={6}>
            <h5 className="fw-bold brand-gradient mb-3">FitApp Premium</h5>
            <p className="small opacity-75 mb-3">
              Tu centro de salud y entrenamiento integral. Ofrecemos las mejores instalaciones y profesionales dedicados a tu bienestar físico.
            </p>
            <div className="contact-info small opacity-75">
              <p className="mb-1"><strong>📞 Teléfono:</strong> +54 11 4321-8765</p>
              <p className="mb-1"><strong>✉️ Email:</strong> contacto@fitapppremium.com</p>
              <p className="mb-0"><strong>💬 WhatsApp:</strong> +54 9 11 9876-5432</p>
            </div>
          </Col>

          {/* Sedes del Gimnasio */}
          <Col lg={4} md={6}>
            <h5 className="fw-bold text-white mb-3">Nuestras Sedes</h5>
            <ul className="list-unstyled small opacity-75 sedes-list">
              <li className="mb-2">
                <span className="fw-bold text-primary">• Sede Centro:</span> Av. Corrientes 1234, CABA
              </li>
              <li className="mb-2">
                <span className="fw-bold text-primary">• Sede Palermo:</span> Av. Santa Fe 4567, CABA
              </li>
              <li className="mb-2">
                <span className="fw-bold text-primary">• Sede Belgrano:</span> Av. Cabildo 2345, CABA (24hs)
              </li>
            </ul>
          </Col>

          {/* Mapa del sitio */}
          <Col lg={4} md={12}>
            <h5 className="fw-bold text-white mb-3">Mapa del Sitio</h5>
            <Row className="small sitemap-links">
              <Col xs={6}>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <Link to="/" className="text-light text-decoration-none opacity-75">Inicio</Link>
                  </li>
                  <li className="mb-2">
                    <a href="#nosotros" className="text-light text-decoration-none opacity-75">Sobre Nosotros</a>
                  </li>
                  <li className="mb-2">
                    <a href="#contacto" className="text-light text-decoration-none opacity-75">Contacto</a>
                  </li>
                </ul>
              </Col>
              <Col xs={6}>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <Link to="/login" state={{ mode: 'login' }} className="text-light text-decoration-none opacity-75">Iniciar Sesión</Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/login" state={{ mode: 'register' }} className="text-light text-decoration-none opacity-75">Registrarse</Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/user" className="text-light text-decoration-none opacity-75">Mi Perfil</Link>
                  </li>
                </ul>
              </Col>
            </Row>
          </Col>
        </Row>

        <hr className="my-4 border-secondary opacity-25" />

        <Row className="align-items-center small opacity-75">
          <Col md={6} className="text-center text-md-start">
            &copy; {new Date().getFullYear()} FitApp Premium. Todos los derechos reservados.
          </Col>
          <Col md={6} className="text-center text-md-end mt-2 mt-md-0">
            Desarrollado para el TP de Desarrollo Frontend.
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
