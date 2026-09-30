import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { formatMonto } from './helpers';

const ModalPago = ({
  show,
  onHide,
  selectedCuota,
  currentUser,
  cargandoMP,
  mpPreference,
  procesandoPago,
  pagoExitosoMsg,
  onPagarMP,
  onPagarAlternativo
}) => {
  const [metodoPago, setMetodoPago] = useState('mp');
  const [comprobanteTransferencia, setComprobanteTransferencia] = useState('');
  const [datosTarjeta, setDatosTarjeta] = useState({
    numero: '4509 •••• •••• 8912',
    vencimiento: '08/29',
    cvv: '782',
    titular: currentUser ? `${currentUser.nombre} ${currentUser.apellido}` : 'Socio FitApp'
  });

  // Resetear estados al abrir con una nueva cuota
  useEffect(() => {
    if (show) {
      setMetodoPago('mp');
      setComprobanteTransferencia('');
      setDatosTarjeta({
        numero: '4509 •••• •••• 8912',
        vencimiento: '08/29',
        cvv: '782',
        titular: currentUser ? `${currentUser.nombre} ${currentUser.apellido}` : 'Socio FitApp'
      });
    }
  }, [show, currentUser]);

  const handleSubmitTarjeta = (e) => {
    e.preventDefault();
    onPagarAlternativo('tarjeta', '');
  };

  const handleSubmitTransferencia = (e) => {
    e.preventDefault();
    onPagarAlternativo('transferencia', comprobanteTransferencia);
  };

  return (
    <Modal
      show={show}
      onHide={() => !procesandoPago && onHide()}
      size="lg"
      centered
      contentClassName="glass-card text-white border-secondary"
    >
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title className="fw-bold d-flex align-items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" strokeWidth="2" />
          </svg>
          Pasarela de Pago Segura FitApp
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {pagoExitosoMsg && (
          <Alert variant="success" className="text-center py-2 mb-3 fw-semibold border-0 shadow">
            {pagoExitosoMsg}
          </Alert>
        )}

        {/* Resumen de la Cuota a abonar */}
        <div className="payment-summary p-3 mb-4 rounded-3 bg-dark border border-secondary">
          <Row className="gy-2">
            <Col sm={6}>
              <span className="text-light opacity-75 small d-block">Concepto / Período:</span>
              <span className="fw-bold text-white fs-6">
                {selectedCuota?.concepto || `Cuota #${selectedCuota?.numero_cuota} - ${selectedCuota?.periodo}`}
              </span>
            </Col>
            <Col sm={6} className="text-sm-end">
              <span className="text-light opacity-75 small d-block">Socio Titular:</span>
              <span className="text-white fw-medium">
                {currentUser ? `${currentUser.nombre} ${currentUser.apellido}` : 'Socio Registrado'}
              </span>
            </Col>
            <Col sm={6}>
              <span className="text-light opacity-75 small d-block">Fecha Vencimiento:</span>
              <span className="text-white">
                {selectedCuota?.fechaVenc || selectedCuota?.fecha_vencimiento} (Gracia hasta: {selectedCuota?.fechaLimite || selectedCuota?.fecha_limite_pago})
              </span>
            </Col>
            <Col sm={6} className="text-sm-end">
              <span className="text-light opacity-75 small d-block">Monto Total a Abonar:</span>
              <span className="fw-bold text-primary fs-4">
                ${formatMonto(selectedCuota?.monto)}
              </span>
            </Col>
          </Row>
        </div>

        <h6 className="fw-bold text-white mb-3">Selecciona el Medio de Pago:</h6>

        {/* Opciones de método de pago */}
        <div className="d-flex flex-column gap-3 mb-4">
          {/* Opción 1: Mercado Pago (DESTACADA) */}
          <div
            className={`p-3 rounded-3 border transition cursor-pointer ${
              metodoPago === 'mp'
                ? 'border-info shadow-lg'
                : 'border-secondary bg-dark bg-opacity-50'
            }`}
            style={{
              backgroundColor: metodoPago === 'mp' ? 'rgba(0, 158, 227, 0.12)' : undefined,
              cursor: 'pointer'
            }}
            onClick={() => setMetodoPago('mp')}
          >
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex align-items-center gap-3">
                <Form.Check
                  type="radio"
                  name="metodoPago"
                  checked={metodoPago === 'mp'}
                  onChange={() => setMetodoPago('mp')}
                  className="fs-5 text-info"
                />
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-white fs-6">Mercado Pago</span>
                    <span
                      className="badge text-white px-2 py-1"
                      style={{ backgroundColor: '#009EE3', fontSize: '0.72rem' }}
                    >
                      Recomendado • Instantáneo
                    </span>
                  </div>
                  <small className="text-light opacity-75 d-block">
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

            {/* Sub-panel exclusivo cuando Mercado Pago está seleccionado */}
            {metodoPago === 'mp' && (
              <div className="mt-3 pt-3 border-top border-secondary border-opacity-50">
                {cargandoMP ? (
                  <div className="text-center py-2">
                    <Spinner animation="border" size="sm" variant="info" className="me-2" />
                    <span className="small text-info">Generando orden de Mercado Pago...</span>
                  </div>
                ) : (
                  <div>
                    <div className="p-2 mb-3 rounded bg-dark border border-secondary small text-light opacity-75">
                      <div className="d-flex justify-content-between">
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
                        >
                          Abrir Checkout MP en pestaña nueva
                        </Button>
                      )}
                      <Button
                        variant="info"
                        className="rounded-pill px-4 fw-bold text-white shadow d-inline-flex align-items-center gap-2"
                        style={{ backgroundColor: '#009EE3', borderColor: '#009EE3' }}
                        onClick={onPagarMP}
                        disabled={procesandoPago}
                      >
                        {procesandoPago ? (
                          <>
                            <Spinner animation="border" size="sm" />
                            Acreditando en Mercado Pago...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                            Confirmar Pago con Mercado Pago (${formatMonto(selectedCuota?.monto)})
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Opción 2: Tarjeta de Crédito / Débito */}
          <div
            className={`p-3 rounded-3 border transition cursor-pointer ${
              metodoPago === 'tarjeta'
                ? 'border-primary shadow'
                : 'border-secondary bg-dark bg-opacity-50'
            }`}
            style={{
              backgroundColor: metodoPago === 'tarjeta' ? 'rgba(88, 86, 240, 0.12)' : undefined,
              cursor: 'pointer'
            }}
            onClick={() => setMetodoPago('tarjeta')}
          >
            <div className="d-flex align-items-center gap-3">
              <Form.Check
                type="radio"
                name="metodoPago"
                checked={metodoPago === 'tarjeta'}
                onChange={() => setMetodoPago('tarjeta')}
                className="fs-5"
              />
              <div>
                <div className="fw-bold text-white fs-6">Tarjeta de Crédito / Débito Directa</div>
                <small className="text-light opacity-75">
                  Visa, Mastercard, Cabal o American Express
                </small>
              </div>
            </div>

            {metodoPago === 'tarjeta' && (
              <Form onSubmit={handleSubmitTarjeta} className="mt-3 pt-3 border-top border-secondary border-opacity-50">
                <Row className="g-2 mb-3">
                  <Col md={12}>
                    <Form.Label className="small text-light">Número de Tarjeta</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={datosTarjeta.numero}
                      onChange={(e) => setDatosTarjeta({ ...datosTarjeta, numero: e.target.value })}
                      className="bg-transparent text-white border-secondary"
                      placeholder="16 dígitos"
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="small text-light">Vencimiento (MM/AA)</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={datosTarjeta.vencimiento}
                      onChange={(e) => setDatosTarjeta({ ...datosTarjeta, vencimiento: e.target.value })}
                      className="bg-transparent text-white border-secondary"
                      placeholder="MM/AA"
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="small text-light">Código de Seguridad (CVV)</Form.Label>
                    <Form.Control
                      type="password"
                      required
                      maxLength="4"
                      value={datosTarjeta.cvv}
                      onChange={(e) => setDatosTarjeta({ ...datosTarjeta, cvv: e.target.value })}
                      className="bg-transparent text-white border-secondary"
                      placeholder="3 o 4 dígitos"
                    />
                  </Col>
                  <Col md={12}>
                    <Form.Label className="small text-light">Titular de la tarjeta</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={datosTarjeta.titular}
                      onChange={(e) => setDatosTarjeta({ ...datosTarjeta, titular: e.target.value })}
                      className="bg-transparent text-white border-secondary"
                      placeholder="Nombre y Apellido tal como figura"
                    />
                  </Col>
                </Row>

                <div className="text-end">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={procesandoPago}
                    className="hero-btn rounded-pill px-4 fw-bold"
                  >
                    {procesandoPago ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Abonando...
                      </>
                    ) : (
                      `Pagar $${formatMonto(selectedCuota?.monto)} con Tarjeta`
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </div>

          {/* Opción 3: Transferencia Bancaria */}
          <div
            className={`p-3 rounded-3 border transition cursor-pointer ${
              metodoPago === 'transferencia'
                ? 'border-primary shadow'
                : 'border-secondary bg-dark bg-opacity-50'
            }`}
            style={{
              backgroundColor: metodoPago === 'transferencia' ? 'rgba(88, 86, 240, 0.12)' : undefined,
              cursor: 'pointer'
            }}
            onClick={() => setMetodoPago('transferencia')}
          >
            <div className="d-flex align-items-center gap-3">
              <Form.Check
                type="radio"
                name="metodoPago"
                checked={metodoPago === 'transferencia'}
                onChange={() => setMetodoPago('transferencia')}
                className="fs-5"
              />
              <div>
                <div className="fw-bold text-white fs-6">Transferencia Bancaria Inmediata</div>
                <small className="text-light opacity-75">
                  Transfiere desde tu banco o billetera virtual e informa el comprobante
                </small>
              </div>
            </div>

            {metodoPago === 'transferencia' && (
              <Form onSubmit={handleSubmitTransferencia} className="mt-3 pt-3 border-top border-secondary border-opacity-50">
                <div className="p-3 mb-3 rounded bg-dark border border-secondary small">
                  <div className="text-secondary-accent fw-bold mb-1">Datos de la Cuenta FitApp:</div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-light opacity-75">Banco:</span>
                    <span className="text-white">Banco Galicia</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-light opacity-75">CBU:</span>
                    <span className="text-white font-monospace">0000003100012345678901</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-light opacity-75">Alias:</span>
                    <span className="text-white font-monospace text-primary fw-bold">FITAPP.GYM.PAGOS</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-light opacity-75">CUIT:</span>
                    <span className="text-white font-monospace">30-71234567-9</span>
                  </div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label className="small text-light">
                    N° de Transacción / Comprobante Bancario (opcional)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: TRF-8912401"
                    value={comprobanteTransferencia}
                    onChange={(e) => setComprobanteTransferencia(e.target.value)}
                    className="bg-transparent text-white border-secondary"
                  />
                </Form.Group>

                <div className="text-end">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={procesandoPago}
                    className="hero-btn rounded-pill px-4 fw-bold"
                  >
                    {procesandoPago ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Registrando Transferencia...
                      </>
                    ) : (
                      `Confirmar Transferencia por $${formatMonto(selectedCuota?.monto)}`
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-secondary">
        <Button
          variant="outline-light"
          onClick={onHide}
          disabled={procesandoPago}
          className="rounded-pill px-4"
        >
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalPago;
