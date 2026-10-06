import React from 'react';
import { Button, Badge } from 'react-bootstrap';

const ClaseCard = ({ shift, index, esMismoDia, onPedirReserva, onPedirCancelar }) => {
  const capacityMax = shift.capacity_maximo || shift.activity?.capacity || 20;
  const capacityActual = shift.cupos_ocupados || 0;
  const cuposDisponibles = Math.max(0, capacityMax - capacityActual);
  const isFull = shift.esta_lleno || cuposDisponibles <= 0;
  const reservadoPorMi = shift.reservado_por_mi;
  const porcentaje = Math.min(100, Math.round((capacityActual / capacityMax) * 100));

  let fillClass = 'fill-available';
  if (isFull) fillClass = 'fill-full';
  else if (porcentaje >= 80) fillClass = 'fill-warning';

  const borderStyles = ['border-indigo', 'border-lavender', 'border-cyan'];
  const borderClass = reservadoPorMi
    ? 'card-reservado'
    : isFull
    ? 'card-lleno'
    : borderStyles[index % borderStyles.length];

  return (
    <div className={`clase-card mb-3 ${borderClass}`}>
      <div className="p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          {/* Schedule y Pase */}
          <div className="d-flex flex-column align-items-start">
            <div className="time-tag fw-bold rounded px-2 py-1 mb-2">
              {shift.startTime} - {shift.endTime} hs
            </div>
            <div className="coins-tag d-flex align-items-center gap-1 border rounded px-2 py-1">
              <span className="fw-bold">🪙 Incluido</span>
            </div>
          </div>

          {/* Name y Teacher */}
          <div className="flex-grow-1 ms-3">
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <h6 className="fw-bold mb-0 text-white text-truncate" style={{ maxWidth: '240px' }}>
                {shift.activity?.name?.toUpperCase() || 'CLASE'}
              </h6>
              {reservadoPorMi && (
                <Badge bg="success" className="px-2 py-0.5 rounded-pill small">
                  ✓ Reservado
                </Badge>
              )}
            </div>
            <p className="text-secondary small mb-1">
              GYM • {shift.activity?.duration || 60} MIN
            </p>
            <div className="d-flex align-items-center">
              <div
                className="teacher-icon rounded-circle me-2 d-flex align-items-center justify-content-center"
                style={{ width: '24px', height: '24px' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <span className="text-secondary small">
                {shift.teacher
                  ? `${shift.teacher.name} ${shift.teacher.lastname}`
                  : shift.activity?.teacher
                  ? `${shift.activity.teacher.name} ${shift.activity.teacher.lastname}`
                  : 'Teacher del Staff'}
              </span>
            </div>
          </div>

          {/* Cupos y Barra de progreso real */}
          <div className="d-flex flex-column align-items-end" style={{ minWidth: '75px' }}>
            <span className="fw-bold text-white small">
              {capacityActual}/{capacityMax}
            </span>
            <div className="progress-bar-bg mt-1 rounded-pill">
              <div
                className={`progress-bar-fill rounded-pill ${fillClass}`}
                style={{ width: `${Math.max(5, porcentaje)}%` }}
              ></div>
            </div>
            <span
              className={`small mt-1 ${isFull ? 'text-danger' : porcentaje >= 80 ? 'text-warning' : 'text-success'}`}
              style={{ fontSize: '0.72rem' }}
            >
              {isFull ? 'Agotado' : `${cuposDisponibles} libres`}
            </span>
          </div>
        </div>

        {/* Footer con Branch y Botón Interactivo */}
        <div className="location-footer border-top pt-2 mt-2 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center text-secondary small">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1 text-secondary-accent">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span className="text-truncate" style={{ maxWidth: '200px' }}>
              {shift.branch?.name?.toUpperCase() || 'BRANCH GENERAL'}
            </span>
          </div>

          <div>
            {reservadoPorMi ? (
              <Button
                variant="outline-danger"
                size="sm"
                className="rounded-pill px-3 py-1 fw-bold"
                onClick={() => onPedirCancelar(shift.mi_reservation_id, shift.activity?.name || 'Clase')}
              >
                Cancelar
              </Button>
            ) : !esMismoDia ? (
              <Button
                variant="outline-secondary"
                size="sm"
                className="rounded-pill px-3 py-1 text-secondary opacity-75"
                disabled
                title="Las reservations se habilitan solo el mismo día de la clase"
              >
                Solo en el día
              </Button>
            ) : isFull ? (
              <Button
                variant="outline-danger"
                size="sm"
                className="rounded-pill px-3 py-1"
                disabled
              >
                Capacity Lleno
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="hero-btn rounded-pill px-3 py-1 fw-bold shadow-sm"
                onClick={() => onPedirReserva(shift)}
              >
                Reservar Shift
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaseCard;
