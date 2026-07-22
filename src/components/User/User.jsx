import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Nav, Modal, Badge, Table } from 'react-bootstrap';
import './User.css';

const User = () => {
  const [activeTab, setActiveTab] = useState('perfil');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCuota, setSelectedCuota] = useState(null);

  // Lista interactiva de cuotas
  const [cuotas, setCuotas] = useState([
    { id: 1, concepto: 'Pase Premium Julio 2026', monto: 18000, fechaVenc: '15/07/2026', estado: 'Pendiente' },
    { id: 2, concepto: 'Pase Premium Junio 2026', monto: 17000, fechaVenc: '15/06/2026', estado: 'Pendiente' },
  ]);

  // Historial de pagos realizados
  const [historial] = useState([
    { id: 101, concepto: 'Pase Premium Mayo 2026', monto: 16000, fechaPago: '12/05/2026', metodo: 'Tarjeta de Crédito', comprobante: 'COMP-8921' },
    { id: 102, concepto: 'Pase Premium Abril 2026', monto: 16000, fechaPago: '10/04/2026', metodo: 'Mercado Pago', comprobante: 'COMP-7432' },
    { id: 103, concepto: 'Pase Premium Marzo 2026', monto: 15000, fechaPago: '14/03/2026', metodo: 'Transferencia', comprobante: 'COMP-6190' },
    { id: 104, concepto: 'Matrícula de Inscripción 2026', monto: 10000, fechaPago: '01/03/2026', metodo: 'Tarjeta de Débito', comprobante: 'COMP-5012' },
  ]);

  const handleOpenPayment = (cuota) => {
    setSelectedCuota(cuota);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    if (selectedCuota) {
      setCuotas(prev => prev.map(c => c.id === selectedCuota.id ? { ...c, estado: 'Pagado' } : c));
    }
    setShowPaymentModal(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'cuotas':
        return (
          <>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
              <h2 className="fw-bold text-white mb-0 header-gradient">Mis Cuotas y Pagos</h2>
              <Button 
                variant="outline-info" 
                size="sm" 
                className="fw-bold px-3 py-2"
                onClick={() => setShowHistoryModal(true)}
              >
                📜 Ver Historial Completo
              </Button>
            </div>

            <p className="text-light opacity-75 mb-4">
              Selecciona una cuota pendiente para realizar el pago online al instante.
            </p>

            {cuotas.map((cuota) => (
              <Card key={cuota.id} className="glass-card border-0 mb-3 p-3 text-white">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h5 className="mb-0 fw-bold text-white">{cuota.concepto}</h5>
                      <Badge bg={cuota.estado === 'Pagado' ? 'success' : 'warning'} className="px-2 py-1">
                        {cuota.estado}
                      </Badge>
                    </div>
                    <small className="text-light opacity-75">Vencimiento: {cuota.fechaVenc}</small>
                  </div>

                  <div className="text-end d-flex align-items-center gap-3">
                    <div>
                      <h4 className="mb-0 fw-bold text-gradient">${cuota.monto.toLocaleString('es-AR')}</h4>
                    </div>
                    {cuota.estado === 'Pendiente' ? (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="fw-bold px-4 py-2 hero-btn shadow"
                        onClick={() => handleOpenPayment(cuota)}
                      >
                        💳 Pagar
                      </Button>
                    ) : (
                      <Button variant="outline-success" size="sm" disabled className="px-3">
                        ✓ Pagado
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </>
        );

      case 'perfil':
      default:
        return (
          <>
            <h2 className="fw-bold text-white mb-4 header-gradient">Editar Perfil</h2>
            <Form className="usuario-form">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="nombres">
                    <Form.Label className="text-white fw-medium">Nombres</Form.Label>
                    <Form.Control type="text" defaultValue="Juan" className="custom-input" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="apellidos">
                    <Form.Label className="text-white fw-medium">Apellidos</Form.Label>
                    <Form.Control type="text" defaultValue="Perez" className="custom-input" />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label className="text-white fw-medium">Correo Electrónico</Form.Label>
                <Form.Control type="email" defaultValue="correo@example.com" className="custom-input" />
              </Form.Group>

              <Form.Group className="mb-4" controlId="bio">
                <Form.Label className="text-white fw-medium">Biografía o Meta</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Cuéntanos sobre tus objetivos fitness..." className="custom-input" />
              </Form.Group>

              <Button variant="primary" type="submit" className="custom-button px-4 py-2 fw-bold w-100 w-sm-auto">
                Guardar Cambios
              </Button>
            </Form>
          </>
        );
    }
  };

  return (
    <div className="user-page py-4">
      <Container fluid className="user-container">
        <Row className="h-100 justify-content-center">
          {/* Left Sidebar */}
          <Col md={4} lg={3} className="mb-4 mb-md-0">
            <Card className="glass-card h-100 border-0 shadow-sm">
              <Card.Body className="d-flex flex-column p-4">
                <div className="text-center mb-4">
                  <div className="avatar-placeholder mx-auto mb-3">
                    <span className="fw-bold fs-3 text-white">JP</span>
                  </div>
                  <h4 className="fw-bold text-white mb-0">Juan Perez</h4>
                  <p className="text-light opacity-75 small">Miembro Premium</p>
                </div>

                <Nav className="flex-column custom-nav mt-3">
                  <Nav.Link
                    className={`nav-item ${activeTab === 'perfil' ? 'active' : ''}`}
                    onClick={() => setActiveTab('perfil')}
                  >
                    👤 Editar Perfil
                  </Nav.Link>
                  <Nav.Link
                    className={`nav-item ${activeTab === 'cuotas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cuotas')}
                  >
                    💳 Ver Cuotas y Pagos
                  </Nav.Link>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          {/* Main Content */}
          <Col md={8} lg={7}>
            <Card className="glass-card h-100 border-0 shadow-sm">
              <Card.Body className="p-4 p-md-5">
                {renderContent()}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal de Pago */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered className="dark-modal">
        <Modal.Header closeButton className="border-secondary text-white">
          <Modal.Title className="fw-bold">Pagar Cuota</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-white">
          {selectedCuota && (
            <div>
              <p className="mb-2"><strong>Concepto:</strong> {selectedCuota.concepto}</p>
              <p className="mb-2"><strong>Monto a abonar:</strong> <span className="text-gradient fw-bold fs-5">${selectedCuota.monto.toLocaleString('es-AR')}</span></p>
              <hr className="border-secondary my-3" />
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Seleccionar Método de Pago</Form.Label>
                <Form.Select className="custom-input">
                  <option>💳 Tarjeta de Crédito / Débito</option>
                  <option>📱 Mercado Pago</option>
                  <option>🏦 Transferencia Bancaria</option>
                </Form.Select>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" className="fw-bold px-4" onClick={handleConfirmPayment}>
            Confirmar Pago
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Historial Completo */}
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg" centered className="dark-modal">
        <Modal.Header closeButton className="border-secondary text-white">
          <Modal.Title className="fw-bold">📜 Historial Completo de Pagos</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-white">
          <div className="table-responsive">
            <Table responsive borderless className="text-white align-middle custom-table">
              <thead>
                <tr className="border-bottom border-secondary text-light opacity-75">
                  <th>Concepto</th>
                  <th>Fecha de Pago</th>
                  <th>Método</th>
                  <th>Comprobante</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((item) => (
                  <tr key={item.id} className="border-bottom border-secondary opacity-90">
                    <td className="fw-bold">{item.concepto}</td>
                    <td>{item.fechaPago}</td>
                    <td>{item.metodo}</td>
                    <td><small className="text-info">{item.comprobante}</small></td>
                    <td className="fw-bold text-success">${item.monto.toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default User;
