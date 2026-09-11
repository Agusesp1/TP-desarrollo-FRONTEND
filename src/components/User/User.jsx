import React, { useState } from 'react';
import { Container, Card, Row, Col, Button, Nav, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './User.css';

import ProfileTab from './modules/ProfileTab';
import SecurityTab from './modules/SecurityTab';
import CuotasTab from './modules/CuotasTab';
import TurnosTab from './modules/TurnosTab';

const User = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');

  const esAdmin = user && (user.rol === 'admin' || user.email === 'administraciongymfit@gmail.com');

  return (
    <div className="user-page py-4">
      <Container className="user-container">
        {/* Header de Usuario */}
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
                    {user ? `${user.nombre} ${user.apellido}` : 'Perfil del Sistema'}
                  </h3>
                  {esAdmin ? (
                    <Badge bg="warning" className="text-dark px-3 py-1 rounded-pill fw-bold">
                      Administrador del Sistema
                    </Badge>
                  ) : (
                    <Badge bg="primary" className="px-3 py-1 rounded-pill">
                      {user?.categoria || 'Socio FitApp'}
                    </Badge>
                  )}
                </div>
                <p className="text-light opacity-75 mb-0 small">
                  {user?.email || 'usuario@gymfit.com'}
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
          <Nav.Item>
            <Nav.Link
              className={activeTab === 'perfil' ? 'active' : ''}
              onClick={() => setActiveTab('perfil')}
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

          {/* Únicamente mostrar Pestañas de Cuotas y Turnos a los Socios/Usuarios regulares */}
          {!esAdmin && (
            <>
              <Nav.Item>
                <Nav.Link
                  className={activeTab === 'cuotas' ? 'active' : ''}
                  onClick={() => setActiveTab('cuotas')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" strokeWidth="2" />
                  </svg>
                  Cuotas y Pagos
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link
                  className={activeTab === 'turnos' ? 'active' : ''}
                  onClick={() => setActiveTab('turnos')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Turnos y Reservas
                </Nav.Link>
              </Nav.Item>
            </>
          )}
        </Nav>

        {/* Renderizado de Módulos */}
        {activeTab === 'perfil' && (
          <ProfileTab user={user} updateUser={updateUser} logout={logout} />
        )}

        {activeTab === 'seguridad' && (
          <SecurityTab user={user} />
        )}

        {!esAdmin && activeTab === 'cuotas' && (
          <CuotasTab user={user} />
        )}

        {!esAdmin && activeTab === 'turnos' && (
          <TurnosTab user={user} />
        )}
      </Container>
    </div>
  );
};

export default User;
