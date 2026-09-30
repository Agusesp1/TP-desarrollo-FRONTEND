import React from 'react';
import { Modal, Row, Col, Button } from 'react-bootstrap';
import { formatMonto } from './helpers';

const ModalComprobanteAdmin = ({ show, onHide, cuota }) => {
  if (!cuota) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName="glass-card text-white border-secondary"
    >
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title className="fw-bold">Comprobante de Cobro Registrado</Modal.Title>
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
            <span className="text-secondary small">N° Comprobante:</span>
            <div className="fw-bold font-monospace text-warning fs-5">
              {cuota.comprobante || `REC-${cuota.id}`}
            </div>
          </div>

          <hr className="border-secondary my-2" />

          <Row className="g-2 small mb-3">
            <Col xs={6}>
              <span className="text-secondary d-block">Socio:</span>
              <strong className="text-white">
                {cuota.usuario ? `${cuota.usuario.nombre} ${cuota.usuario.apellido}` : 'Socio'}
              </strong>
            </Col>
            <Col xs={6} className="text-end">
              <span className="text-secondary d-block">DNI:</span>
              <strong className="text-white">{cuota.usuario?.dni || 'Sin DNI'}</strong>
            </Col>
            <Col xs={6}>
              <span className="text-secondary d-block">Período:</span>
              <strong className="text-white">
                {cuota.concepto || cuota.periodo}
              </strong>
            </Col>
            <Col xs={6} className="text-end">
              <span className="text-secondary d-block">Fecha de Pago:</span>
              <strong className="text-white">
                {cuota.fechaPago || (cuota.fecha_pago ? cuota.fecha_pago.substring(0, 10) : '-')}
              </strong>
            </Col>
            <Col xs={6}>
              <span className="text-secondary d-block">Método:</span>
              <strong className="text-white">
                {cuota.metodo || cuota.metodo_pago || 'Pago en Caja'}
              </strong>
            </Col>
            <Col xs={6} className="text-end">
              <span className="text-secondary d-block">Importe Acreditado:</span>
              <strong className="text-success fs-6">
                ${formatMonto(cuota.monto)}
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
