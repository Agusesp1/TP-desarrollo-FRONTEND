import React from 'react';
import { Badge } from 'react-bootstrap';

export const QuotasBadge = ({ quota }) => {
  const status = quota?.status?.toLowerCase();

  if (status === 'pagado') {
    return (
      <Badge bg="success" className="px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Pagado
      </Badge>
    );
  }

  if (status === 'en demora') {
    return (
      <div>
        <Badge bg="warning" text="dark" className="px-3 py-2 fw-bold mb-1 d-inline-flex align-items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          En Demora
        </Badge>
        <div className="small text-warning" style={{ fontSize: '0.78rem' }}>
          Plazo de gracia hasta el {quota.dateLimite || quota.date_limite_payment} (+5 días)
        </div>
      </div>
    );
  }

  if (status === 'no pagado') {
    return (
      <div>
        <Badge bg="danger" className="px-3 py-2 fw-semibold mb-1 d-inline-flex align-items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          No Pagado / Vencido
        </Badge>
        <div className="small text-danger opacity-75" style={{ fontSize: '0.78rem' }}>
          Plazo de gracia de 5 días expirado
        </div>
      </div>
    );
  }

  // Por defecto: Pendiente
  return (
    <Badge bg="primary" className="px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      Pendiente / Al día
    </Badge>
  );
};

export default QuotasBadge;
