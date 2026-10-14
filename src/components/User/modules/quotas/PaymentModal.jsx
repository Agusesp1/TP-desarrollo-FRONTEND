import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { formatMonto } from './helpers';

const PaymentModal = ({
  show,
  onHide,
  selectedCuota,
  currentUser,
  cargandoMP,
  mpPreference,
  procesandoPago,
  paymentExitosoMsg,
  onPagarMP
}) => {
  const [redirigiendo, setRedirigiendo] = useState(false);

  // Resetear estados al abrir el modal
  useEffect(() => {
    if (show) {
      setRedirigiendo(false);
    }
  }, [show]);

  const handlePagarMP = () => {
    setRedirigiendo(true);
    setTimeout(() => {
      // Desmontar el modal de Bootstrap y limpiar scroll de body antes de redirigir a Mercado Payment
      if (onHide) onHide();
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach((b) => b.remove());
      if (onPagarMP) onPagarMP();
    }, 750);
  };

  const limpiarModal = () => {
    setRedirigiendo(false);
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
      onHide={() => !procesandoPago && !redirigiendo && onHide()}
      onExited={limpiarModal}
      size="lg"
      centered
      contentClassName="glass-card text-white border-secondary"
    >
      <Modal.Header closeButton={!redirigiendo} closeVariant="white">
        <Modal.Title className="fw-bold d-flex align-items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" strokeWidth="2" />
          </svg>
          Pasarela de Pago Segura FitApp
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {paymentExitosoMsg && (
          <Alert variant="success" className="text-center py-2 mb-3 fw-semibold border-0 shadow">
            {paymentExitosoMsg}
          </Alert>
        )}

        {/* Cartel de aviso cuando se está redirigiendo a la web de Mercado Pago */}
        {redirigiendo && (
          <Alert
            variant="info"
            className="d-flex align-items-center justify-content-center gap-3 py-3 mb-4 border-0 shadow text-white fw-semibold rounded-3 animate__animated animate__fadeIn"
            style={{ backgroundColor: '#009EE3' }}
          >
            <Spinner animation="border" size="sm" variant="light" />
            <span className="fs-6">Redirigiendo a la plataforma oficial de Mercado Pago... Por favor aguarde un momento.</span>
          </Alert>
        )}

        {/* Resumen de la Quota a abonar */}
        <div className="payment-summary p-3 mb-4 rounded-3 bg-dark border border-secondary">
          <Row className="gy-2">
            <Col sm={6}>
              <span className="text-light opacity-75 small d-block">Concepto / Período:</span>
              <span className="fw-bold text-white fs-6">
                {selectedCuota?.concepto || `Cuota #${selectedCuota?.numero_quota} - ${selectedCuota?.periodo}`}
              </span>
            </Col>
            <Col sm={6} className="text-sm-end">
              <span className="text-light opacity-75 small d-block">Socio Titular:</span>
              <span className="text-white fw-medium">
                {currentUser ? `${currentUser.name} ${currentUser.lastname}` : 'Socio Registrado'}
              </span>
            </Col>
            <Col sm={6}>
              <span className="text-light opacity-75 small d-block">Fecha de Vencimiento:</span>
              <span className="text-white">
                {selectedCuota?.dateVenc || selectedCuota?.date_vencimiento} (Gracia hasta: {selectedCuota?.dateLimite || selectedCuota?.date_limite_payment})
              </span>
            </Col>
            <Col sm={6} className="text-sm-end">
              <span className="text-light opacity-75 small d-block">Monto Total a Abonar:</span>
              <span className="fw-bold text-primary fs-4">
                ${formatMonto(selectedCuota?.amount)}
              </span>
            </Col>
          </Row>
        </div>

        <h6 className="fw-bold text-white mb-3">Medio de Pago Habilitado:</h6>

        {/* Única Opción: Mercado Pago */}
        <div
          className="p-3 rounded-3 border border-info shadow-lg mb-4"
          style={{ backgroundColor: 'rgba(0, 158, 227, 0.12)' }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold text-white fs-5">Mercado Pago</span>
                  <span
                    className="badge text-white px-2 py-1"
                    style={{ backgroundColor: '#009EE3', fontSize: '0.72rem' }}
                  >
                    Oficial • Instantáneo
                  </span>
                </div>
                <small className="text-light opacity-75 d-block mt-1">
                  Abona con dinero en cuenta, Débito, Crédito o código QR con acreditación al instante.
                </small>
              </div>
            </div>

            <div className="text-end">
              <span className="badge rounded-pill bg-dark border border-info text-info px-3 py-1">
                0% Comisión
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-top border-secondary border-opacity-50">
            {cargandoMP ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" variant="info" className="me-2" />
                <span className="small text-info">Generando orden de Mercado Pago...</span>
              </div>
            ) : (
              <div>
                <div className="p-3 mb-3 rounded bg-dark border border-secondary small text-light opacity-75">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Preferencia ID:</span>
                    <span className="text-info font-monospace">
                      {mpPreference?.preferenceId || 'MP-PREF-FITAPP'}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Seguridad:</span>
                    <span className="text-success">Checkout protegido SSL 256 bits</span>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 justify-content-end">
                  {mpPreference?.init_point && (
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="rounded-pill px-3"
                      href={mpPreference.init_point}
                      target="_blank"
                      rel="noopener noreferrer"
                      disabled={redirigiendo}
                      onClick={() => {
                        setRedirigiendo(true);
                        setTimeout(() => {
                          if (onHide) onHide();
                          document.body.classList.remove('modal-open');
                          document.body.style.overflow = '';
                          document.body.style.paddingRight = '';
                        }, 750);
                      }}
                    >
                      Abrir Checkout MP en pestaña nueva
                    </Button>
                  )}
                  <Button
                    variant="info"
                    className="rounded-pill px-4 py-2 fw-bold text-white shadow d-inline-flex align-items-center gap-2"
                    style={{ backgroundColor: '#009EE3', borderColor: '#009EE3' }}
                    onClick={handlePagarMP}
                    disabled={procesandoPago || redirigiendo}
                  >
                    {redirigiendo ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        Redirigiendo a Mercado Pago...
                      </>
                    ) : procesandoPago ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        Acreditando en Mercado Pago...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                        Confirmar Pago con Mercado Pago (${formatMonto(selectedCuota?.amount)})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-secondary">
        <Button
          variant="outline-light"
          onClick={onHide}
          disabled={procesandoPago || redirigiendo}
          className="rounded-pill px-4"
        >
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;

