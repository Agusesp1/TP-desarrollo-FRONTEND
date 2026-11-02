import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

const AdminDeleteModal = ({ show, onHide, item, onConfirm, eliminando }) => {
  const esBajaLogicaTurno = item?.type === 'shift' || item?.type === 'shift-group';

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="glass-card text-white border-secondary">
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title className={`fw-bold d-flex align-items-center gap-2 ${esBajaLogicaTurno ? 'text-warning' : 'text-danger'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {esBajaLogicaTurno ? (
              <>
                <circle cx="12" cy="12" r="10" />
                <line x1="10" y1="15" x2="10" y2="9" />
                <line x1="14" y1="15" x2="14" y2="9" />
              </>
            ) : (
              <>
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </>
            )}
          </svg>
          {esBajaLogicaTurno ? 'Confirmar Baja Lógica de Turno' : 'Confirmar Eliminación'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-2">
          {esBajaLogicaTurno ? (
            <>
              ¿Estás seguro de que deseas dar de baja lógica{' '}
              {item?.type === 'shift' && 'el turno'}
              {item?.type === 'shift-group' && 'el grupo de turnos'}{' '}
              <strong>&quot;{item?.name}&quot;</strong>?
            </>
          ) : (
            <>
              ¿Estás completamente seguro de que deseas eliminar permanentemente{' '}
              {item?.type === 'teacher' && 'al profesor'}
              {item?.type === 'branch' && 'la sede'}
              {item?.type === 'activity' && 'la actividad'}{' '}
              <strong>&quot;{item?.name}&quot;</strong>?
            </>
          )}
        </p>
        {esBajaLogicaTurno ? (
          <small className="text-info d-block">
            ℹ️ El turno pasará a estado inactivo/pausado (baja lógica por mantenimiento o fuera de servicio). Los datos se conservarán y podrás reactivarlo en cualquier momento.
          </small>
        ) : (
          <small className="text-warning d-block">
            ⚠️ Esta acción eliminará el registro de la base de datos y no se podrá deshacer.
          </small>
        )}
      </Modal.Body>
      <Modal.Footer className="border-secondary">
        <Button variant="outline-light" onClick={onHide} disabled={eliminando} className="rounded-pill px-3">
          Cancelar
        </Button>
        <Button
          variant={esBajaLogicaTurno ? 'warning' : 'danger'}
          onClick={onConfirm}
          disabled={eliminando}
          className="rounded-pill px-4 fw-bold"
        >
          {eliminando ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Procesando...
            </>
          ) : esBajaLogicaTurno ? (
            'Confirmar Baja'
          ) : (
            'Eliminar Definitivamente'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AdminDeleteModal;
