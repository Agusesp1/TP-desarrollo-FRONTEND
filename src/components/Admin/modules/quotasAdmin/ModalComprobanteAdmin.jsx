import React from 'react';
import { Modal, Row, Col, Button } from 'react-bootstrap';
import { formatMonto } from './helpers';

const ModalComprobanteAdmin = ({ show, onHide, quota }) => {
  if (!quota) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName="glass-card text-white border-secondary"
    >
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title className="fw-bold">Receipt de Cobro Registrado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="p-4 rounded-3 bg-dark border border-secondary text-white">
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary pb-3">
            <div>
              <h5 className="fw-bold mb-0 text-primary">ADMINISTRACIÓN FITAPP</h5>
              <small className="text-secondary">Recibo Oficial de Cobranza</small>
            </div>
            <span className="badge-status-active">
              COBRADO
            </span>
          </div>

          <div className="mb-2">
            <span className="text-secondary small">N° Receipt:</span>
            <div className="fw-bold font-monospace text-warning fs-5">
              {quota.receipt || `REC-${quota.id}`}
            </div>
          </div>

          <hr className="border-secondary my-2" />

          <Row className="g-2 small mb-3">
            <Col xs={6}>
              <span className="text-secondary d-block">Member:</span>
              <strong className="text-white">
                {quota.user ? `${quota.user.name} ${quota.user.lastname}` : 'Member'}
              </strong>
            </Col>
            <Col xs={6} className="text-end">
              <span className="text-secondary d-block">DNI:</span>
              <strong className="text-white">{quota.user?.dni || 'Sin DNI'}</strong>
            </Col>
            <Col xs={6}>
              <span className="text-secondary d-block">Período:</span>
              <strong className="text-white">
                {quota.concepto || quota.periodo}
              </strong>
            </Col>
            <Col xs={6} className="text-end">
              <span className="text-secondary d-block">Date de Payment:</span>
              <strong className="text-white">
                {quota.datePago || (quota.date_payment ? quota.date_payment.substring(0, 10) : '-')}
              </strong>
            </Col>
            <Col xs={6}>
              <span className="text-secondary d-block">Método:</span>
              <strong className="text-white">
                {quota.metodo || quota.metodo_payment || 'Payment en Caja'}
              </strong>
            </Col>
            <Col xs={6} className="text-end">
              <span className="text-secondary d-block">Importe Acreditado:</span>
              <strong className="text-success fs-6">
                ${formatMonto(quota.amount)}
              </strong>
            </Col>
          </Row>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-secondary">
        <Button
          variant="outline-light"
          onClick={() => window.print()}
          className="rounded-pill px-3"
        >
          Imprimir Recibo
        </Button>
        <Button
          variant="primary"
          onClick={onHide}
          className="rounded-pill px-4"
        >
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalComprobanteAdmin;
