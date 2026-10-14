import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';

const ResumenCards = ({ resumen }) => {
  return (
    <Row className="g-3 mb-4">
      <Col md={3} sm={6}>
        <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary h-100">
          <span className="small text-secondary-accent text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
            Cuotas Pendientes
          </span>
          <div className="d-flex align-items-baseline gap-2 mt-1">
            <h3 className="fw-bold mb-0 text-white">{resumen?.totalPendientes ?? 0}</h3>
            <Badge bg="primary" className="fw-normal">Al día</Badge>
          </div>
        </div>
      </Col>

      <Col md={3} sm={6}>
        <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary h-100">
          <span className="small text-warning text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
            En Demora (+5 días)
          </span>
          <div className="d-flex align-items-baseline gap-2 mt-1">
            <h3 className="fw-bold mb-0 text-warning">{resumen?.totalEnDemora ?? 0}</h3>
            <Badge bg="warning" text="dark" className="fw-normal">Plazo gracia</Badge>
          </div>
        </div>
      </Col>

      <Col md={3} sm={6}>
        <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary h-100">
          <span className="small text-danger text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
            No Pagadas / Vencidas
          </span>
          <div className="d-flex align-items-baseline gap-2 mt-1">
            <h3 className="fw-bold mb-0 text-danger">{resumen?.totalNoPagadas ?? 0}</h3>
            <Badge bg="danger" className="fw-normal">Vencidas</Badge>
          </div>
        </div>
      </Col>

      <Col md={3} sm={6}>
        <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary h-100">
          <span className="small text-success text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
            Cuotas Acreditadas
          </span>
          <div className="d-flex align-items-baseline gap-2 mt-1">
            <h3 className="fw-bold mb-0 text-success">{resumen?.totalPagadas ?? 0}</h3>
            <Badge bg="success" className="fw-normal">Historial</Badge>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default ResumenCards;
