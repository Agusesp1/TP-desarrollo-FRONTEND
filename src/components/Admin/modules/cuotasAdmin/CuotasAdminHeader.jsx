import React from 'react';
import { Button } from 'react-bootstrap';

const CuotasAdminHeader = ({ subTab, setSubTab, totalCuotas = 0, totalPrecios = 0 }) => {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h4 className="fw-bold mb-1 text-white">Gestión y Control de Cuotas & Tarifas</h4>
        <p className="text-secondary small mb-0">
          Administra el cronograma de precios programados y fiscaliza el estado de cobranza de los socios.
        </p>
      </div>

      {/* Botonera de Sub-pestañas */}
      <div className="d-flex gap-2 p-1 rounded-3 bg-dark border border-secondary">
        <Button
          size="sm"
          variant={subTab === 'socios' ? 'primary' : 'dark'}
          className={`rounded-pill px-3 fw-medium ${subTab === 'socios' ? 'hero-btn' : 'border-0 text-light'}`}
          onClick={() => setSubTab('socios')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Cuotas de Socios ({totalCuotas})
        </Button>

        <Button
          size="sm"
          variant={subTab === 'precios' ? 'primary' : 'dark'}
          className={`rounded-pill px-3 fw-medium ${subTab === 'precios' ? 'hero-btn' : 'border-0 text-light'}`}
          onClick={() => setSubTab('precios')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Programación de Precios ({totalPrecios})
        </Button>
      </div>
    </div>
  );
};

export default CuotasAdminHeader;
