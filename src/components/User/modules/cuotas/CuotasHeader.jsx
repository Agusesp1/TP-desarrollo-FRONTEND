import React from 'react';
import { Button } from 'react-bootstrap';

const CuotasHeader = ({ cargando, onRecargar, onVerHistorial, totalHistorial = 0 }) => {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h4 className="fw-bold mb-1 text-white">Estado de Cuotas y Membresía</h4>
        <p className="text-light opacity-75 small mb-0">
          Revisa tus vencimientos mensuales, abona de forma instantánea con Mercado Pago y consulta tus comprobantes.
        </p>
      </div>

      <div className="d-flex gap-2">
        <Button
          variant="outline-light"
          className="rounded-pill px-3 py-2 fw-medium d-inline-flex align-items-center gap-2"
          onClick={onRecargar}
          disabled={cargando}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
          </svg>
          {cargando ? 'Actualizando...' : 'Actualizar'}
        </Button>

        <Button
          variant="outline-light"
          className="rounded-pill px-3 py-2 fw-medium d-inline-flex align-items-center gap-2"
          onClick={onVerHistorial}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Historial de Recibos ({totalHistorial})
        </Button>
      </div>
    </div>
  );
};

export default CuotasHeader;
