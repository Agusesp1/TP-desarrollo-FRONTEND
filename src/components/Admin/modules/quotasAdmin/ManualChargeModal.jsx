import React from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import { formatMonto } from './helpers';

const ManualChargeModal = ({
  show,
  onHide,
  quota,
  metodoCobro,
  setMetodoCobro,
  receiptCobro,
  setComprobanteCobro,
  procesandoCobro,
  onConfirmar
}) => {
  return (
    <Modal
      show={show}
      onHide={() => !procesandoCobro && onHide()}
      centered
      contentClassName="glass-card text-white border-secondary"
    >
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title className="fw-bold d-flex align-items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Registrar Cobro Manual de Quota
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={onConfirmar}>
        <Modal.Body>
          <div className="p-3 mb-3 rounded-3 bg-dark border border-secondary">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-secondary small">Member:</span>
              <span className="fw-bold text-white">
                {quota?.user?.name} {quota?.user?.lastname}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-secondary small">DNI:</span>
              <span className="text-white">{quota?.user?.dni || 'Sin DNI'}</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-secondary small">Concepto:</span>
              <span className="text-white">
                {quota?.concepto || `Quota #${quota?.numero_quota} - ${quota?.periodo}`}
              </span>
            </div>
            <hr className="my-2 border-secondary" />
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold text-white">Importe a Cobrar:</span>
              <span className="fw-bold text-primary fs-4">
                ${formatMonto(quota?.amount)}
              </span>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="small text-light">Canal / Método de Cobro</Form.Label>
            <Form.Select
              value={metodoCobro}
              onChange={(e) => setMetodoCobro(e.target.value)}
            >
              <option value="Efectivo en Caja">Efectivo en Caja / Recepción</option>
              <option value="Tarjeta Débito (POSnet)">Tarjeta de Débito (POSnet en Mostrador)</option>
              <option value="Tarjeta Crédito (POSnet)">Tarjeta de Crédito (POSnet en Mostrador)</option>
              <option value="Transferencia Bancaria Directa">Transferencia Bancaria Directa</option>
              <option value="Mercado Payment (Cobro QR Mostrador)">Mercado Payment (Cobro QR Mostrador)</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small text-light">N° de Recibo o Receipt Interno</Form.Label>
            <Form.Control
              type="text"
              required
              value={receiptCobro}
              onChange={(e) => setComprobanteCobro(e.target.value)}
            />
            <Form.Text className="text-secondary" style={{ fontSize: '0.75rem' }}>
              Se asignará automáticamente al receipt del member.
            </Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="border-secondary">
          <Button
            variant="outline-light"
            onClick={onHide}
            disabled={procesandoCobro}
            className="rounded-pill px-3"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={procesandoCobro}
            className="hero-btn rounded-pill px-4 fw-bold"
          >
            {procesandoCobro ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Acreditando...
              </>
            ) : (
              'Confirmar Cobro y Acreditar'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ManualChargeModal;
