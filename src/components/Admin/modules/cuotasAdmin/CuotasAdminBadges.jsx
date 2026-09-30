import React from 'react';

export const RenderBadgeEstadoAdmin = ({ estado, fechaLimite }) => {
  switch (estado?.toLowerCase()) {
    case 'pagado':
      return (
        <span className="badge-status-active d-inline-flex align-items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Pagado
        </span>
      );
    case 'en demora':
      return (
        <div>
          <span className="badge-token-brand d-inline-flex align-items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            En Demora
          </span>
          {fechaLimite && (
            <div className="small text-secondary" style={{ fontSize: '0.74rem' }}>
              Gracia hasta {fechaLimite} (+5d)
            </div>
          )}
        </div>
      );
    case 'no pagado':
      return (
        <div>
          <span className="badge-status-inactive d-inline-flex align-items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            No Pagado
          </span>
          <div className="small text-secondary" style={{ fontSize: '0.74rem' }}>
            Plazo superado
          </div>
        </div>
      );
    case 'pendiente':
    default:
      return (
        <span className="badge-token-accent d-inline-flex align-items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Pendiente / Al día
        </span>
      );
  }
};

export const RenderEstadoPrecioAdmin = ({ precioItem, precioVigente, fechaConsulta }) => {
  const hoyStr = fechaConsulta || new Date().toISOString().substring(0, 10);
  const fechaItem = precioItem?.fecha_desde;

  if (precioVigente && precioItem?.id === precioVigente.id) {
    return (
      <span className="badge-status-active">
        Vigente hoy
      </span>
    );
  }

  if (fechaItem > hoyStr) {
    return (
      <span className="badge-token-brand">
        Programado a futuro
      </span>
    );
  }

  return (
    <span className="badge-token-subdued">
      Anterior / Histórico
    </span>
  );
};
