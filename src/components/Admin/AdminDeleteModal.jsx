import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

const AdminDeleteModal = ({ show, onHide, item, onConfirm, eliminando }) => {
  return (
    <Modal show={show} onHide={onHide} centered contentClassName="glass-card text-white border-secondary">
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title className="fw-bold text-danger d-flex align-items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
          Confirmar Eliminación
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-2">
          ¿Estás completamente seguro de que deseas eliminar permanentemente{' '}
          {item?.type === 'profesor' && 'al profesor'}
          {item?.type === 'sede' && 'la sede'}
          {item?.type === 'actividad' && 'la actividad'}
          {item?.type === 'turno' && 'el turno horario'}{' '}
          <strong>&quot;{item?.nombre}&quot;</strong>?
        </p>
        <small className="text-warning d-block">
          ⚠️ Esta acción eliminará el registro de la base de datos y no se podrá deshacer.
        </small>
      </Modal.Body>
      <Modal.Footer className="border-secondary">
        <Button variant="outline-light" onClick={onHide} disabled={eliminando} className="rounded-pill px-3">
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={eliminando} className="rounded-pill px-4 fw-bold">
          {eliminando ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Eliminando...
            </>
          ) : (
            'Eliminar Definitivamente'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AdminDeleteModal;
