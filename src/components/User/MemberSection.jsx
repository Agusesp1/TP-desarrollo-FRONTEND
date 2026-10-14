import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import QuotasTab from './modules/QuotasTab';
import ShiftsTab from './modules/ShiftsTab';
import './User.css';

const SECTIONS = {
  turnos: {
    title: 'Turnos y Reservas',
    subtitle: 'Reservá tus clases y gestioná tus turnos',
    Component: ShiftsTab,
  },
  cuotas: {
    title: 'Cuotas y Pagos',
    subtitle: 'Consultá tu estado de cuenta y pagá tus cuotas',
    Component: QuotasTab,
  },
};

/**
 * Secciones de socio (turnos y cuotas) con ruta propia, accesibles desde la barra de navegación.
 */
const MemberSection = ({ section }) => {
  const { user } = useAuth();
  const { title, subtitle, Component } = SECTIONS[section];

  // Limpiar residuos de modales al entrar/salir de la sección
  useEffect(() => {
    const limpiar = () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove());
    };
    limpiar();
    return limpiar;
  }, [section]);

  if (!user) return <Navigate to="/login" state={{ mode: 'login' }} replace />;

  const esAdmin = user.role === 'admin' || user.email === 'administraciongymfit@gmail.com';
  const esProfesor = user.role === 'teacher';
  if (esAdmin || esProfesor) return <Navigate to="/user" replace />;

  return (
    <div className="user-page py-4">
      <Container className="user-container">
        <div className="mb-4">
          <h2 className="fw-bold text-white mb-1">{title}</h2>
          <p className="text-light opacity-75 mb-0">{subtitle}</p>
        </div>
        <Component user={user} />
      </Container>
    </div>
  );
};

export default MemberSection;
