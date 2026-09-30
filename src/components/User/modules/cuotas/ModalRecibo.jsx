import React from 'react';
import { Modal, Row, Col, Badge, Button } from 'react-bootstrap';
import { formatMonto } from './helpers';

const ModalRecibo = ({ show, onHide, recibo, currentUser }) => {
  if (!recibo) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName="glass-card text-white border-secondary"
    >
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title className="fw-bold">Comprobante de Pago Oficial</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="p-4 rounded-3 bg-dark border border-secondary text-white">
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary pb-3">
            <div>
              <h5 className="fw-bold mb-0 text-primary">FITAPP GIMNASIO</h5>
              <small className="text-secondary">Comprobante Electrónico Válido</small>
            </div>
            <Badge bg="success" className="px-3 py-2 fw-bold">
              PAGO ACREDITADO
            </Badge>
          </div>

          <div className="mb-2">
            <span className="text-light opacity-75 small">N° de Comprobante:</span>
            <div className="fw-bold font-monospace text-warning fs-5">
              {recibo.comprobante || `REC-${recibo.id}`}
            </div>
          </div>

          <hr className="border-secondary my-2" />

          <Row className="g-2 small mb-3">
            <Col xs={6}>
              <span className="text-light opacity-75 d-block">Socio:</span>
              <strong className="text-white">
                {currentUser ? `${currentUser.nombre} ${currentUser.apellido}` : 'Socio Titular'}
              </strong>
            </Col>
            <Col xs={6} className="text-end">
              <span className="text-light opacity-75 d-block">DNI:</span>
              <strong className="text-white">{currentUser?.dni || 'Registrado'}</strong>
            </Col>
            <Col xs={6}>
              <span className="text-light opacity-75 d-block">Concepto:</span>
              <strong className="text-white">
                {recibo.concepto || `Cuota #${recibo.numero_cuota} - ${recibo.periodo}`}
              </strong>
            </Col>
            <Col xs={6} className="text-end">
              <span className="text-light opacity-75 d-block">Fecha de Pago:</span>
              <strong className="text-white">
                {recibo.fechaPago || recibo.fecha_pago?.substring(0, 10) || '-'}
              </strong>
            </Col>
            <Col xs={6}>
              <span className="text-light opacity-75 d-block">Método Utilizado:</span>
              <strong className="text-white">
                {recibo.metodo || recibo.metodo_pago || 'Mercado Pago'}
              </strong>
            </Col>
            <Col xs={6} className="text-end">
              <span className="text-light opacity-75 d-block">Total Acreditado:</span>
              <strong className="text-success fs-6">
                ${formatMonto(recibo.monto)}
              </strong>
            </Col>
          </Row>

          <div className="p-2 rounded bg-black bg-opacity-50 text-center small text-light opacity-75 font-monospace">
            Verificación Hash: FIT-{recibo.id || '01'}-SECURE-AUTH
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-secondary">
        <Button
          variant="outline-light"
          onClick={() => window.print()}
          className="rounded-pill px-3"
        >
          Imprimir Comprobante
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
