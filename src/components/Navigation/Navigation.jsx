
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const isUserPage = location.pathname === '/user';

  return (
    <Navbar expand="lg" variant="dark" className="glass-navbar sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold brand-gradient">
          FitApp Premium
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="fw-medium mx-2">
              Inicio
            </Nav.Link>

            {!isUserPage ? (
              <>
                <Nav.Link as="a" href="/#nosotros" className="fw-medium mx-2">
                  Nosotros
                </Nav.Link>
                <Nav.Link as="a" href="/#contacto" className="fw-medium mx-2">
                  Contacto
                </Nav.Link>
                <Nav.Link as={Link} to="/user" className="fw-medium mx-2">
                  Mi Perfil
                </Nav.Link>
                <Nav.Link as={Link} to="/login" className="fw-medium mx-2">
                  Ingresar
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/user" className="fw-medium mx-2">
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
