
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/';

  return (
    <Navbar expand="lg" variant="dark" className="glass-navbar sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold brand-gradient">
          FitApp Premium
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {isAuthPage ? (
              <Nav.Link as={Link} to="/usuario" className="fw-medium">
                Ver Demo Perfil
              </Nav.Link>
            ) : (
              <>
                <Nav.Link as={Link} to="/usuario" className="fw-medium mx-2">
                  Mi Perfil
                </Nav.Link>
                <Nav.Link as={Link} to="/" className="fw-medium mx-2 text-danger">
                  Cerrar Sesión
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
