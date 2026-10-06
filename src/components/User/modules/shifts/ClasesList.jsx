import React from 'react';
import { Spinner } from 'react-bootstrap';
import ClaseCard from './ClaseCard';

const ClasesList = ({
  cargando,
  shiftsFiltrados,
  esMismoDia,
  onPedirReserva,
  onPedirCancelar
}) => {
  if (cargando) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="text-secondary small mt-2">Sincronizando cupos en tiempo real...</p>
      </div>
    );
  }

  if (shiftsFiltrados.length === 0) {
    return (
      <div className="text-center py-5 text-secondary">
        <div className="mb-2 opacity-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </div>
        <p className="mb-1 text-white fw-medium">No hay clases programadas</p>
        <p className="small mb-0">No se encontraron shifts activos para los filters y el día seleccionado.</p>
      </div>
    );
  }

  return (
    <div className="clases-list pb-2">
      {shiftsFiltrados.map((shift, index) => (
        <ClaseCard
          key={shift.id}
          shift={shift}
          index={index}
          esMismoDia={esMismoDia}
          onPedirReserva={onPedirReserva}
          onPedirCancelar={onPedirCancelar}
        />
      ))}
    </div>
  );
};

export default ClasesList;
