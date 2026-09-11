import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoHome = (e) => {
    e.preventDefault();
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar expand="lg" variant="dark" className="glass-navbar sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" onClick={handleGoHome} className="fw-bold brand-gradient">
          FitApp Premium
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-2">
            <Nav.Link as={Link} to="/" onClick={handleGoHome} className="fw-medium mx-1">
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
                {(user.rol === 'admin' || user.email === 'administraciongymfit@gmail.com') && (
                  <Nav.Link as={Link} to="/admin" className="fw-bold mx-1 text-white d-flex align-items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon text-white">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    Panel Admin
                  </Nav.Link>
                )}

                <Nav.Link as={Link} to="/user" className="fw-medium mx-1 text-white d-flex align-items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Mi Perfil
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
                className="fw-bold mx-1 btn hero-btn text-white px-4 py-1 rounded-pill ms-lg-2"
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
