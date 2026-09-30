import React from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import { formatMonto } from './helpers';

const ModalCobroManual = ({
  show,
  onHide,
  cuota,
  metodoCobro,
  setMetodoCobro,
  comprobanteCobro,
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
          Registrar Cobro Manual de Cuota
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={onConfirmar}>
        <Modal.Body>
          <div className="p-3 mb-3 rounded-3 bg-dark border border-secondary">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-secondary small">Socio:</span>
              <span className="fw-bold text-white">
                {cuota?.usuario?.nombre} {cuota?.usuario?.apellido}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-secondary small">DNI:</span>
              <span className="text-white">{cuota?.usuario?.dni || 'Sin DNI'}</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-secondary small">Concepto:</span>
              <span className="text-white">
                {cuota?.concepto || `Cuota #${cuota?.numero_cuota} - ${cuota?.periodo}`}
              </span>
            </div>
            <hr className="my-2 border-secondary" />
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold text-white">Importe a Cobrar:</span>
              <span className="fw-bold text-primary fs-4">
                ${formatMonto(cuota?.monto)}
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
              <option value="Mercado Pago (Cobro QR Mostrador)">Mercado Pago (Cobro QR Mostrador)</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small text-light">N° de Recibo o Comprobante Interno</Form.Label>
            <Form.Control
              type="text"
              required
              value={comprobanteCobro}
              onChange={(e) => setComprobanteCobro(e.target.value)}
            />
            <Form.Text className="text-secondary" style={{ fontSize: '0.75rem' }}>
              Se asignará automáticamente al comprobante del socio.
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

export default ModalCobroManual;
