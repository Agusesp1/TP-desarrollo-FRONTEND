import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

export const ModalConfirmarReserva = ({
  modalReserva,
  setModalReserva,
  guardando,
  dateHoyISO,
  onConfirmar
}) => {
  const shift = modalReserva.shift;

  return (
    <Modal 
      show={modalReserva.open} 
      onHide={() => !guardando && setModalReserva({ open: false, shift: null })} 
      centered
      className="dark-modal"
    >
      <Modal.Header closeButton closeVariant="white" className="border-0 pb-0">
        <Modal.Title className="text-white fw-bold fs-5">
          Confirmar Reservation
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3">
        {shift && (
          <div>
            <p className="text-secondary small mb-3">
              Estás a punto de reservar tu lugar en la siguiente clase:
            </p>

            <div className="reservation-detail-box p-3 mb-3">
              <h5 className="fw-bold text-white mb-2">
                {shift.activity?.name?.toUpperCase()}
              </h5>
              <div className="reservation-detail-item mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Hoy ({dateHoyISO}) de {shift.startTime} a {shift.endTime} hs</span>
              </div>
              <div className="reservation-detail-item mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{shift.branch?.name} ({shift.branch?.address})</span>
              </div>
              <div className="reservation-detail-item mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Teacher: {shift.teacher ? `${shift.teacher.name} ${shift.teacher.lastname}` : 'Sin Asignar'}</span>
              </div>
              <div className="reservation-detail-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>Cupos disponibles actuales: <strong className="text-success">{shift.cupos_disponibles}</strong></span>
              </div>
            </div>

            <div className="p-2 rounded bg-dark border border-secondary border-opacity-25 small text-secondary">
              💡 <span className="text-light">Importante:</span> Presentate con 5 minutos de anticipación y calzado deportivo adecuado.
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button 
          variant="outline-secondary" 
          className="rounded-pill px-3" 
          onClick={() => setModalReserva({ open: false, shift: null })}
          disabled={guardando}
        >
          Volver
        </Button>
        <Button 
          variant="primary" 
          className="hero-btn rounded-pill px-4 fw-bold" 
          onClick={onConfirmar}
          disabled={guardando}
        >
          {guardando ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
              Confirmando...
            </>
          ) : (
            'Confirmar Reservation'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export const ModalCancelarReserva = ({
  modalCancelar,
  setModalCancelar,
  guardando,
  onConfirmar
}) => {
  return (
    <Modal 
      show={modalCancelar.open} 
      onHide={() => !guardando && setModalCancelar({ open: false, reservationId: null, nameClase: '' })} 
      centered
      className="dark-modal"
    >
      <Modal.Header closeButton closeVariant="white" className="border-0 pb-0">
        <Modal.Title className="text-white fw-bold fs-5">
          Cancelar Reservation
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3">
        <p className="text-light mb-2">
          ¿Estás seguro de que deseas cancelar tu shift para <strong>{modalCancelar.nameClase}</strong>?
        </p>
        <p className="text-secondary small mb-0">
          Tu lugar será liberado inmediatamente para que otro member pueda reservarlo.
        </p>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button 
          variant="outline-secondary" 
          className="rounded-pill px-3" 
          onClick={() => setModalCancelar({ open: false, reservationId: null, nameClase: '' })}
          disabled={guardando}
        >
          Conservar Shift
        </Button>
        <Button 
          variant="outline-danger" 
          className="rounded-pill px-4 fw-bold" 
          onClick={onConfirmar}
          disabled={guardando}
        >
          {guardando ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
              Cancelando...
            </>
          ) : (
            'Sí, Cancelar Shift'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
