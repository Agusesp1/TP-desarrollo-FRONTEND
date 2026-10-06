import React from 'react';
import { Badge } from 'react-bootstrap';

const ShiftsHeader = ({
  esMismoDia,
  dayActualInfo,
  onVolverAHoy,
  vistaActiva,
  setVistaActiva,
  reservationsHoyCount
}) => {
  return (
    <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
      <div className="d-flex align-items-center">
        <div 
          className="reservations-header-btn me-3" 
          onClick={onVolverAHoy}
          title="Volver al día de hoy"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div>
          <h4 className="fw-bold mb-0 text-white" style={{ fontSize: '1.35rem', letterSpacing: '-0.3px' }}>
            Reservar Clases
          </h4>
          <p className="text-secondary small mb-0">
            {esMismoDia ? 'Elige tu clase para el día de hoy' : `Schedules para el ${dayActualInfo?.dayNombre} ${dayActualInfo?.dayNumero}`}
          </p>
        </div>
      </div>

      {/* Selector de Vista: Shifts vs Mis Reservations */}
      <div className="shifts-toggle-tabs">
        <button 
          type="button"
          className={`shifts-tab-btn ${vistaActiva === 'shifts' ? 'active' : ''}`}
          onClick={() => setVistaActiva('shifts')}
        >
          Clases Disponibles
        </button>
        <button 
          type="button"
          className={`shifts-tab-btn ${vistaActiva === 'mis-reservations' ? 'active' : ''}`}
          onClick={() => setVistaActiva('mis-reservations')}
        >
          Mis Reservations
          {reservationsHoyCount > 0 && (
            <Badge bg="brand" className="ms-2 px-2 py-0.5 rounded-pill text-dark fw-bold">
              {reservationsHoyCount}
            </Badge>
          )}
        </button>
      </div>
    </div>
  );
};

export default ShiftsHeader;
