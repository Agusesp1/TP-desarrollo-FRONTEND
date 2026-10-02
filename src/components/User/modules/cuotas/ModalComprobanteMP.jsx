import React from 'react';
import { Modal, Row, Col, Badge, Button } from 'react-bootstrap';
import { formatMonto, formatearFechaSegura } from './helpers';

const ModalComprobanteMP = ({ show, onHide, cuota, currentUser }) => {
  const safeCuota = cuota || {};

  const limpiarModal = () => {
    setTimeout(() => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove());
    }, 150);
  };

  const nombreSocio = currentUser
    ? `${currentUser.nombre} ${currentUser.apellido}`.trim()
    : safeCuota.usuario
    ? `${safeCuota.usuario.nombre} ${safeCuota.usuario.apellido}`.trim()
    : 'Socio Titular';

  const dniSocio = currentUser?.dni || safeCuota?.usuario?.dni || 'Registrado';

  const numeroComprobante =
    safeCuota.comprobante ||
    (safeCuota.mp_payment_id ? `MP-${safeCuota.mp_payment_id}` : `MP-${safeCuota.id || Date.now()}`);

  const conceptoPeriodo =
    safeCuota.concepto ||
    (safeCuota.numero_cuota ? `Cuota #${safeCuota.numero_cuota} - ${safeCuota.periodo}` : (safeCuota.periodo || 'Cuota Gimnasio'));

  // Formato de fecha y hora del pago
  const obtenerFechaHoraPago = () => {
    if (typeof safeCuota.fechaPago === 'string' && safeCuota.fechaPago.includes(':')) {
      return safeCuota.fechaPago;
    }
    const fechaObj = safeCuota.fecha_pago ? new Date(safeCuota.fecha_pago) : new Date();
    if (isNaN(fechaObj.getTime())) {
      return safeCuota.fechaPago || new Date().toLocaleDateString('es-AR');
    }
    return `${fechaObj.toLocaleDateString('es-AR')} ${fechaObj.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    })} hs`;
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      onExited={limpiarModal}
      centered
      size="md"
      contentClassName="glass-card text-white border-success shadow-lg"
      backdrop="static"
    >
      {/* Header Verde con Insignia de Éxito */}
      <Modal.Header
        closeButton
        closeVariant="white"
        className="bg-success bg-opacity-25 border-bottom border-success border-opacity-50 py-3"
      >
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center p-2 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <Modal.Title className="fw-bold fs-5 text-white mb-0">
              ¡Pago Acreditado con Éxito!
            </Modal.Title>
            <small className="text-success-emphasis fw-medium">
              Transacción aprobada por Mercado Pago
            </small>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Mensaje descriptivo */}
        <p className="text-light opacity-90 mb-4 text-center">
          Tu cuota ha sido procesada y acreditada correctamente a través de Mercado Pago.
        </p>

        {/* Mini Comprobante Oficial */}
        <div
          className="p-4 rounded-3 bg-dark border border-secondary shadow-sm printable-receipt"
          style={{
            background: 'linear-gradient(180deg, rgba(22, 27, 46, 0.95) 0%, rgba(13, 17, 30, 0.98) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.12)'
          }}
        >
          {/* Encabezado con logo FitApp y título */}
          <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary border-opacity-50">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, #5856F0 0%, #009EE3 100%)'
                }}
              >
                F
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-white letter-spacing-wide">FITAPP</h6>
                <small className="text-light opacity-75" style={{ fontSize: '0.75rem' }}>
                  Comprobante de Pago Oficial
                </small>
              </div>
            </div>

            {/* Badge verde de estado */}
            <Badge
              bg="success"
              className="px-3 py-2 fw-bold text-uppercase d-inline-flex align-items-center gap-1 shadow-sm"
              style={{ fontSize: '0.78rem', letterSpacing: '0.5px' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              APROBADO
            </Badge>
          </div>

          {/* Monto Abonado en tipografía grande y destacada */}
          <div className="text-center my-3 py-2 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-25">
            <span className="text-success small text-uppercase fw-semibold d-block">
              Monto Total Abonado
            </span>
            <div className="fw-bold text-white display-6 my-1">
              ${formatMonto(safeCuota.monto)}
            </div>
            <span
              className="badge px-2 py-1 text-white fw-medium"
              style={{ backgroundColor: '#009EE3', fontSize: '0.72rem' }}
            >
              Mercado Pago (Instantáneo)
            </span>
          </div>

          {/* Detalles del Comprobante */}
          <div className="my-3">
            <Row className="g-2 small">
              <Col xs={6}>
                <span className="text-light opacity-75 d-block">N° de Comprobante:</span>
                <strong className="text-warning font-monospace fs-6">
                  {numeroComprobante}
                </strong>
              </Col>
              <Col xs={6} className="text-end">
                <span className="text-light opacity-75 d-block">Fecha y Hora:</span>
                <strong className="text-white">
                  {obtenerFechaHoraPago()}
                </strong>
              </Col>

              <Col xs={12}>
                <hr className="border-secondary border-opacity-50 my-1" />
              </Col>

              <Col xs={6}>
                <span className="text-light opacity-75 d-block">Socio Titular:</span>
                <strong className="text-white">{nombreSocio}</strong>
              </Col>
              <Col xs={6} className="text-end">
                <span className="text-light opacity-75 d-block">DNI:</span>
                <strong className="text-white">{dniSocio}</strong>
              </Col>

              <Col xs={12}>
                <span className="text-light opacity-75 d-block">Concepto / Período:</span>
                <strong className="text-white">{conceptoPeriodo}</strong>
              </Col>

              <Col xs={12}>
                <span className="text-light opacity-75 d-block">Método:</span>
                <strong className="text-info">Mercado Pago (Instantáneo)</strong>
              </Col>
            </Row>
          </div>

          {/* Pie de seguridad del Comprobante */}
          <div className="p-2 rounded bg-black bg-opacity-40 text-center small text-light opacity-75 font-monospace mt-3" style={{ fontSize: '0.7rem' }}>
            ID Transacción: {safeCuota.mp_preference_id || safeCuota.mp_payment_id || `AUTH-${safeCuota.id || 'MP'}-SECURE`}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-secondary border-opacity-50 justify-content-between">
        <Button
          variant="outline-light"
          onClick={handleImprimir}
          className="rounded-pill px-3 d-inline-flex align-items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect width="12" height="8" x="6" y="14" />
          </svg>
          Imprimir / Guardar Comprobante
        </Button>

        <Button
          variant="success"
          onClick={onHide}
          className="rounded-pill px-4 fw-bold shadow-sm"
        >
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalComprobanteMP;
