import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Footer.css';

const Footer = () => {
  const { user } = useAuth();

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
              <p className="mb-1 d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon text-primary">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <strong>Teléfono:</strong>&nbsp;+54 11 4321-8765
              </p>
              <p className="mb-1 d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon text-primary">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <strong>Email:</strong>&nbsp;administraciongymfit@gmail.com
              </p>
              <p className="mb-0 d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon text-primary">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <strong>WhatsApp:</strong>&nbsp;+54 9 11 9876-5432
              </p>
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
                    <a href="/#nosotros" className="text-light text-decoration-none opacity-75">Sobre Nosotros</a>
                  </li>
                  <li className="mb-2">
                    <a href="/#contacto" className="text-light text-decoration-none opacity-75">Contacto</a>
                  </li>
                </ul>
              </Col>
              <Col xs={6}>
                <ul className="list-unstyled">
                  {user ? (
                    <>
                      <li className="mb-2">
                        <Link to="/user" className="text-light text-decoration-none opacity-75">Mi Perfil</Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="mb-2">
                        <Link to="/login" state={{ mode: 'login' }} className="text-light text-decoration-none opacity-75">Iniciar Sesión</Link>
                      </li>
                      <li className="mb-2">
                        <Link to="/login" state={{ mode: 'register' }} className="text-light text-decoration-none opacity-75">Registrarse</Link>
                      </li>
                    </>
                  )}
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
            Desarrollado para DSW
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
