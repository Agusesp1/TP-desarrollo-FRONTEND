
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar expand="lg" variant="dark" className="glass-navbar sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold brand-gradient">
          FitApp Premium
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-2">
            <Nav.Link as={Link} to="/" className="fw-medium mx-1">
              Inicio
            </Nav.Link>
            <Nav.Link as="a" href="/#nosotros" className="fw-medium mx-1">
              Nosotros
            </Nav.Link>
            <Nav.Link as="a" href="/#contacto" className="fw-medium mx-1">
              Contacto
            </Nav.Link>

            {user ? (
              <>
                <Nav.Link as={Link} to="/user" className="fw-medium mx-1 text-info">
                  👤 Mi Perfil
                </Nav.Link>
                
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="ms-lg-2 px-3 fw-bold rounded-pill"
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <Nav.Link 
                as={Link} 
                to="/login" 
                state={{ mode: 'login' }} 
                className="fw-bold mx-1 btn btn-primary text-white px-4 py-1 rounded-pill ms-lg-2"
              >
                Ingresar
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
