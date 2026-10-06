import React from 'react';
import { Modal, Row, Col, Badge, Button } from 'react-bootstrap';
import { formatMonto, formatearFechaSegura } from './helpers';

const ModalRecibo = ({ show, onHide, recibo, currentUser }) => {
  const dataRecibo = recibo || {};

  const limpiarModal = () => {
    setTimeout(() => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove());
    }, 150);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      onExited={limpiarModal}
      centered
      contentClassName="glass-card text-white border-secondary"
    >
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title className="fw-bold">Receipt de Payment Oficial</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="p-4 rounded-3 bg-dark border border-secondary text-white">
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary pb-3">
            <div>
              <h5 className="fw-bold mb-0 text-primary">FITAPP GYM</h5>
              <small className="text-secondary">Receipt Electrónico Válido</small>
            </div>
            <Badge bg="success" className="px-3 py-2 fw-bold">
              PAYMENT ACREDITADO
            </Badge>
          </div>

          <div className="mb-2">
            <span className="text-light opacity-75 small">N° de Receipt:</span>
            <div className="fw-bold font-monospace text-warning fs-5">
              {dataRecibo.receipt || (dataRecibo.id ? `REC-${dataRecibo.id}` : '-')}
            </div>
          </div>

          <hr className="border-secondary my-2" />

          <Row className="g-2 small mb-3">
            <Col xs={6}>
              <span className="text-light opacity-75 d-block">Member:</span>
              <strong className="text-white">
                {currentUser ? `${currentUser.name} ${currentUser.lastname}` : 'Member Titular'}
              </strong>
            </Col>
            <Col xs={6} className="text-end">
              <span className="text-light opacity-75 d-block">DNI:</span>
              <strong className="text-white">{currentUser?.dni || 'Registrado'}</strong>
            </Col>
            <Col xs={6}>
              <span className="text-light opacity-75 d-block">Concepto:</span>
              <strong className="text-white">
                {dataRecibo.concepto || (dataRecibo.numero_quota ? `Quota #${dataRecibo.numero_quota} - ${dataRecibo.periodo}` : '-')}
              </strong>
            </Col>
            <Col xs={6} className="text-end">
              <span className="text-light opacity-75 d-block">Date de Payment:</span>
              <strong className="text-white">
                {dataRecibo.datePago || formatearFechaSegura(dataRecibo.date_payment)}
              </strong>
            </Col>
            <Col xs={6}>
              <span className="text-light opacity-75 d-block">Método Utilizado:</span>
              <strong className="text-white">
                {dataRecibo.metodo || dataRecibo.metodo_payment || 'Mercado Payment'}
              </strong>
            </Col>
            <Col xs={6} className="text-end">
              <span className="text-light opacity-75 d-block">Total Acreditado:</span>
              <strong className="text-success fs-6">
                ${formatMonto(dataRecibo.amount)}
              </strong>
            </Col>
          </Row>

          <div className="p-2 rounded bg-black bg-opacity-50 text-center small text-light opacity-75 font-monospace">
            Verificación Hash: FIT-{dataRecibo.id || '01'}-SECURE-AUTH
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-secondary">
        <Button
          variant="outline-light"
          onClick={() => window.print()}
          className="rounded-pill px-3"
        >
          Imprimir Receipt
        </Button>
        <Button
          variant="primary"
          onClick={onHide}
          className="rounded-pill px-4"
        >
          Listo
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRecibo;
