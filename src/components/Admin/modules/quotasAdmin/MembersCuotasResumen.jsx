import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { formatMonto } from './helpers';

const MembersCuotasResumen = ({
  totalAlDia,
  totalEnDemora,
  totalNoPagadas,
  totalRecaudado,
  cantidadPagadas
}) => {
  return (
    <Row className="g-3 mb-4">
      <Col lg={3} sm={6}>
        <div className="stat-card p-3 h-100">
          <span className="small text-light opacity-75 text-uppercase fw-semibold" style={{ fontSize: '0.74rem' }}>
            Quotas al Día / Pendientes
          </span>
          <div className="d-flex align-items-baseline gap-2 mt-1">
            <h3 className="fw-bold mb-0 text-white">{totalAlDia}</h3>
            <span className="badge-token-accent">Al día</span>
          </div>
        </div>
      </Col>

      <Col lg={3} sm={6}>
        <div className="stat-card p-3 h-100">
          <span className="small text-light opacity-75 text-uppercase fw-semibold" style={{ fontSize: '0.74rem' }}>
            En Demora (+5 días)
          </span>
          <div className="d-flex align-items-baseline gap-2 mt-1">
            <h3 className="fw-bold mb-0 text-white">{totalEnDemora}</h3>
            <span className="badge-token-brand">Plazo de gracia</span>
          </div>
        </div>
      </Col>

      <Col lg={3} sm={6}>
        <div className="stat-card p-3 h-100">
          <span className="small text-light opacity-75 text-uppercase fw-semibold" style={{ fontSize: '0.74rem' }}>
            Vencidas sin Pagar
          </span>
          <div className="d-flex align-items-baseline gap-2 mt-1">
            <h3 className="fw-bold mb-0 text-white">{totalNoPagadas}</h3>
            <span className="badge-token-subdued">Impagas</span>
          </div>
        </div>
      </Col>

      <Col lg={3} sm={6}>
        <div className="stat-card p-3 h-100">
          <span className="small text-light opacity-75 text-uppercase fw-semibold" style={{ fontSize: '0.74rem' }}>
            Recaudación Cobrada
          </span>
          <div className="d-flex align-items-baseline gap-2 mt-1">
            <h3 className="fw-bold mb-0 text-white">
              ${formatMonto(totalRecaudado)}
            </h3>
            <span className="badge-status-active">{cantidadPagadas} cobradas</span>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default MembersCuotasResumen;
