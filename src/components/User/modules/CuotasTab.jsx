import React, { useState } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';

const CuotasTab = ({ user }) => {
  // Cuotas pendientes
  const [cuotas, setCuotas] = useState([
    { id: 1, concepto: 'Pase Premium Julio 2026', monto: 18000, fechaVenc: '15/07/2026', estado: 'Pendiente' },
    { id: 2, concepto: 'Pase Premium Junio 2026', monto: 17000, fechaVenc: '15/06/2026', estado: 'Pendiente' },
  ]);

  // Historial de pagos
  const [historial, setHistorial] = useState([
    { id: 101, concepto: 'Pase Premium Mayo 2026', monto: 16000, fechaPago: '12/05/2026', metodo: 'Tarjeta de Crédito', comprobante: 'COMP-8921' },
    { id: 102, concepto: 'Pase Premium Abril 2026', monto: 16000, fechaPago: '10/04/2026', metodo: 'Mercado Pago', comprobante: 'COMP-7432' },
    { id: 103, concepto: 'Pase Premium Marzo 2026', monto: 15000, fechaPago: '14/03/2026', metodo: 'Transferencia', comprobante: 'COMP-6190' },
    { id: 104, concepto: 'Matrícula de Inscripción 2026', monto: 10000, fechaPago: '01/03/2026', metodo: 'Tarjeta de Débito', comprobante: 'COMP-5012' },
  ]);

  // Modales
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedCuota, setSelectedCuota] = useState(null);
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [pagoExitosoMsg, setPagoExitosoMsg] = useState(null);

  const handleAbrirPago = (cuota) => {
    setSelectedCuota(cuota);
    setPagoExitosoMsg(null);
    setShowPaymentModal(true);
  };

  const handleProcesarPago = (e) => {
    e.preventDefault();
    setProcesandoPago(true);

    setTimeout(() => {
      setProcesandoPago(false);
      // Actualizar cuota a Pagada
      setCuotas((prev) => prev.filter((c) => c.id !== selectedCuota.id));
      // Agregar al historial
      const nuevoComprobante = {
        id: Date.now(),
        concepto: selectedCuota.concepto,
        monto: selectedCuota.monto,
        fechaPago: new Date().toLocaleDateString('es-AR'),
        metodo: metodoPago === 'tarjeta' ? 'Tarjeta de Crédito/Débito' : (metodoPago === 'mp' ? 'Mercado Pago' : 'Transferencia'),
        comprobante: `COMP-${Math.floor(1000 + Math.random() * 9000)}`
      };
      setHistorial((prev) => [nuevoComprobante, ...prev]);
      setPagoExitosoMsg('¡Pago registrado con éxito! Tu cuota ha sido acreditada.');
      setTimeout(() => {
        setShowPaymentModal(false);
        setPagoExitosoMsg(null);
      }, 2000);
    }, 1500);
  };

  return (
    <Card className="glass-card border-0 p-4 text-white">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-white">Estado de Cuotas y Membresía</h4>
          <p className="text-light opacity-75 small mb-0">
            Revisa tus vencimientos, efectúa pagos seguros o consulta el historial de recibos.
          </p>
        </div>

        <Button
          variant="outline-light"
          className="rounded-pill px-3 py-2 fw-medium d-inline-flex align-items-center gap-2"
          onClick={() => setShowHistoryModal(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Historial de Recibos
        </Button>
      </div>

      <div className="table-responsive">
        <Table hover variant="dark" className="align-middle admin-table mb-0">
          <thead>
            <tr>
              <th>Concepto / Período</th>
              <th>Monto</th>
              <th>Vencimiento</th>
              <th>Estado</th>
              <th className="text-end">Acción</th>
            </tr>
          </thead>
          <tbody>
            {cuotas.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-success fw-medium">
                  🎉 ¡Felicitaciones! Te encuentras al día con todas tus cuotas.
                </td>
              </tr>
            ) : (
              cuotas.map((cuota) => (
                <tr key={cuota.id}>
                  <td>
                    <div className="fw-bold text-white">{cuota.concepto}</div>
                    <small className="text-light opacity-75">Suscripción recurrente mensual</small>
                  </td>
                  <td>
                    <span className="fw-bold text-white fs-6">
                      ${cuota.monto.toLocaleString('es-AR')}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-secondary">{cuota.fechaVenc}</span>
                  </td>
                  <td>
                    <Badge bg="warning" className="text-dark fw-bold">
                      {cuota.estado}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Button
                      variant="primary"
                      size="sm"
                      className="hero-btn rounded-pill px-3 py-1 fw-bold"
                      onClick={() => handleAbrirPago(cuota)}
                    >
                      Pagar Cuota
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal Pagar Cuota */}
      <Modal
        show={showPaymentModal}
        onHide={() => !procesandoPago && setShowPaymentModal(false)}
        centered
        contentClassName="glass-card text-white border-secondary"
      >
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
            Pasarela de Pago FitApp
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleProcesarPago}>
          <Modal.Body>
            {pagoExitosoMsg && (
              <Alert variant="success" className="text-center py-2 mb-3">
                {pagoExitosoMsg}
              </Alert>
            )}

            <div className="payment-summary p-3 mb-3 rounded-3 bg-dark border border-secondary">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-light opacity-75 small">Concepto:</span>
                <span className="fw-medium text-white">{selectedCuota?.concepto}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-light opacity-75 small">Socio:</span>
                <span className="text-white">{user?.nombre} {user?.apellido}</span>
              </div>
              <hr className="my-2 border-secondary" />
              <div className="d-flex justify-content-between">
                <span className="fw-bold text-white">Total a Pagar:</span>
                <span className="fw-bold text-primary fs-5">
                  ${selectedCuota?.monto.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="small text-light">Selecciona el Medio de Pago</Form.Label>
              <Form.Select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="bg-transparent text-white border-secondary mb-3"
              >
                <option value="tarjeta" className="bg-dark text-white">Tarjeta de Crédito / Débito</option>
                <option value="mp" className="bg-dark text-white">Mercado Pago / Dinero en cuenta</option>
                <option value="transferencia" className="bg-dark text-white">Transferencia Bancaria Inmediata</option>
              </Form.Select>
            </Form.Group>

            {metodoPago === 'tarjeta' && (
              <Row className="g-2">
                <Col md={12}>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Número de tarjeta (16 dígitos)"
                    defaultValue="4509 •••• •••• 8912"
                    className="bg-transparent text-white border-secondary"
                  />
                </Col>
                <Col md={6}>
                  <Form.Control
                    type="text"
                    required
                    placeholder="MM/AA"
                    defaultValue="08/29"
                    className="bg-transparent text-white border-secondary"
                  />
                </Col>
                <Col md={6}>
                  <Form.Control
                    type="password"
                    required
                    maxLength="4"
                    placeholder="CVC / CVV"
                    defaultValue="782"
                    className="bg-transparent text-white border-secondary"
                  />
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer className="border-secondary">
            <Button
              variant="outline-light"
              onClick={() => setShowPaymentModal(false)}
              disabled={procesandoPago}
              className="rounded-pill px-3"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={procesandoPago}
              className="hero-btn rounded-pill px-4 fw-bold"
            >
              {procesandoPago ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Acreditando Pago...
                </>
              ) : (
                `Abonar $${selectedCuota?.monto.toLocaleString('es-AR')}`
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Historial de Comprobantes */}
      <Modal
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        size="lg"
        centered
        contentClassName="glass-card text-white border-secondary"
      >
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Historial de Pagos y Comprobantes
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <Table hover variant="dark" className="align-middle mb-0">
              <thead>
                <tr>
                  <th>N° Comprobante</th>
                  <th>Concepto</th>
                  <th>Fecha de Pago</th>
                  <th>Método</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="badge bg-dark border border-secondary text-primary font-monospace">
                        {item.comprobante}
                      </span>
                    </td>
                    <td>{item.concepto}</td>
                    <td>{item.fechaPago}</td>
                    <td><small className="text-light opacity-75">{item.metodo}</small></td>
                    <td className="fw-bold text-success">${item.monto.toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button variant="outline-light" onClick={() => setShowHistoryModal(false)} className="rounded-pill px-4">
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default CuotasTab;
