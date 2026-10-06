import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { formatMonto } from './helpers';

const PricesVigentesCard = ({ priceVigente, dateConsulta, cargandoPrecios, onRecargar }) => {
  return (
    <div className="p-4 mb-4 rounded-3 bg-dark border border-secondary">
      <Row className="align-items-center gy-3">
        <Col md={8}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge-status-active">
              Tarifa Vigente Hoy
            </span>
            <span className="small text-secondary">
              Date de consulta: {dateConsulta || new Date().toISOString().substring(0, 10)}
            </span>
          </div>
          <h2 className="fw-bold mb-1 text-white">
            ${priceVigente?.amount ? formatMonto(priceVigente.amount) : '18.000'}
            <span className="text-secondary fs-6 fw-normal ms-2">/ quota mensual</span>
          </h2>
          <p className="text-light opacity-75 small mb-0">
            <strong>Vigente desde:</strong> {priceVigente?.start_date || 'Home de ciclo'} •{' '}
            <strong>Descripción:</strong> {priceVigente?.description || 'Tarifa general de membresía estándar'}
          </p>
        </Col>

        <Col md={4} className="text-md-end">
          <Button
            className="btn-token-outline-primary rounded-pill px-3 py-2 fw-medium d-inline-flex align-items-center gap-2"
            onClick={onRecargar}
            disabled={cargandoPrecios}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            {cargandoPrecios ? 'Actualizando...' : 'Recargar Tarifas'}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default PricesVigentesCard;
