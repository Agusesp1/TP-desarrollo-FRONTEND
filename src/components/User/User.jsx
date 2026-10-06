import { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Nav, Badge } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './User.css';

import ProfileTab from './modules/ProfileTab';
import SecurityTab from './modules/SecurityTab';
import QuotasTab from './modules/QuotasTab';
import ShiftsTab from './modules/ShiftsTab';
import TeacherAgendaTab from './modules/TeacherAgendaTab';

const User = () => {
  const { user, updateUser, logout } = useAuth();
  const [searchParams] = useSearchParams();

  const esAdmin = user && (user.role === 'admin' || user.email === 'administraciongymfit@gmail.com');
  const esProfesor = user && user.role === 'teacher';

  const hasCuotasParam =
    searchParams.get('tab') === 'quotas' ||
    searchParams.has('payment') ||
    searchParams.has('status') ||
    searchParams.has('collection_status');

  const [activeTab, setActiveTab] = useState(() => {
    if (hasCuotasParam && !esProfesor && !esAdmin) {
      return 'quotas';
    }
    return user?.role === 'teacher' ? 'agenda' : 'profile';
  });

  // Si en la URL vienen parámetros como tab=quotas, payment, status, o collection_status, activar automáticamente quotas
  useEffect(() => {
    if (hasCuotasParam && !esProfesor && !esAdmin) {
      setActiveTab('quotas');
    }
  }, [hasCuotasParam, esProfesor, esAdmin]);

  // Limpiar de forma preventiva cualquier clase modal-open o estilo overflow/padding-right residual y backdrops huérfanos
  useEffect(() => {
    const limpiarResiduosModal = () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach((b) => b.remove());
    };

    limpiarResiduosModal();

    return () => {
      limpiarResiduosModal();
    };
  }, [activeTab]);

  // Control de acceso por role
  useEffect(() => {
    if (esProfesor && (activeTab === 'quotas' || activeTab === 'shifts')) {
      setActiveTab('agenda');
    } else if (esAdmin && activeTab === 'quotas') {
      setActiveTab('profile');
    }
  }, [esProfesor, esAdmin, activeTab]);


  return (
    <div className="user-page py-4">
      <Container className="user-container">
        {/* Header de User */}
        <Card className="user-header-card mb-4 border-0 text-white p-4">
          <Row className="align-items-center gy-3">
            <Col md={8} className="d-flex align-items-center gap-3">
              <div className="user-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h3 className="fw-bold mb-0">
                    {user ? `${user.name} ${user.lastname}` : 'Profile del Sistema'}
                  </h3>
                  {esAdmin ? (
                    <Badge bg="warning" className="text-dark px-3 py-1 rounded-pill fw-bold">
                      Administrador del Sistema
                    </Badge>
                  ) : esProfesor ? (
                    <Badge bg="info" className="text-dark px-3 py-1 rounded-pill fw-bold">
                      Teacher del Staff FitApp
                    </Badge>
                  ) : (
                    <Badge bg="primary" className="px-3 py-1 rounded-pill">
                      {user?.category || 'Member FitApp'}
                    </Badge>
                  )}
                </div>
                <p className="text-light opacity-75 mb-0 small">
                  {user?.email || 'user@gymfit.com'}
                </p>
              </div>
            </Col>

            <Col md={4} className="text-md-end d-flex gap-2 justify-content-md-end">
              {esAdmin && (
                <Button as={Link} to="/admin" variant="primary" size="sm" className="hero-btn rounded-pill px-3 fw-bold">
                  Ir al Panel Admin
                </Button>
              )}
              <Button
                variant="outline-danger"
                size="sm"
                className="rounded-pill px-3"
                onClick={logout}
              >
                Cerrar Sesión
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Navegación por Pestañas */}
        <Nav className="user-nav-tabs mb-4 gap-2 border-0 flex-wrap">
          {/* Pestaña exclusiva de Teachers */}
          {esProfesor && (
            <Nav.Item>
              <Nav.Link
                className={activeTab === 'agenda' ? 'active' : ''}
                onClick={() => setActiveTab('agenda')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Mis Clases, Branches & Schedules
              </Nav.Link>
            </Nav.Item>
          )}

          <Nav.Item>
            <Nav.Link
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Datos Personales
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              className={activeTab === 'seguridad' ? 'active' : ''}
              onClick={() => setActiveTab('seguridad')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Seguridad & Contraseña
            </Nav.Link>
          </Nav.Item>

          {/* Únicamente mostrar Pestañas de Quotas y Shifts a los Members/Users regulares */}
          {!esAdmin && !esProfesor && (
            <>
              <Nav.Item>
                <Nav.Link
                  className={activeTab === 'quotas' ? 'active' : ''}
                  onClick={() => setActiveTab('quotas')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" strokeWidth="2" />
                  </svg>
                  Quotas y Payments
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link
                  className={activeTab === 'shifts' ? 'active' : ''}
                  onClick={() => setActiveTab('shifts')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Shifts y Reservations
                </Nav.Link>
              </Nav.Item>
            </>
          )}
        </Nav>

        {/* Renderizado de Módulos */}
        {esProfesor && activeTab === 'agenda' && (
          <TeacherAgendaTab user={user} />
        )}

        {activeTab === 'profile' && (
          <ProfileTab user={user} updateUser={updateUser} logout={logout} />
        )}

        {activeTab === 'seguridad' && (
          <SecurityTab user={user} />
        )}

        {!esAdmin && !esProfesor && activeTab === 'quotas' && (
          <QuotasTab user={user} />
        )}

        {!esAdmin && !esProfesor && activeTab === 'shifts' && (
          <ShiftsTab user={user} />
        )}
      </Container>
    </div>
  );
};

export default User;
