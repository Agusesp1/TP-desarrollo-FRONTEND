import React from 'react';
import { Button, Badge, Spinner } from 'react-bootstrap';

const MisReservasView = ({
  cargando,
  misReservas,
  dateHoyISO,
  onPedirCancelar,
  onVolverAClases
}) => {
  return (
    <div className="mis-reservations-view py-2">
      <div className="d-flex align-items-center justify-content-between mb-3 px-1">
        <h6 className="fw-bold text-white mb-0">Tus Reservations Confirmadas</h6>
        <Badge bg="primary" className="px-3 py-1 rounded-pill">
          Total: {misReservas.length}
        </Badge>
      </div>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-secondary small mt-2">Cargando tus reservations...</p>
        </div>
      ) : misReservas.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <div className="mb-3 opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <p className="fw-medium text-white mb-1">Aún no tienes shifts reservados</p>
          <p className="small mb-3">Selecciona una clase del día de hoy para asegurar tu lugar en el gym.</p>
          <Button variant="primary" size="sm" className="rounded-pill px-4" onClick={onVolverAClases}>
            Ver Clases de Hoy
          </Button>
        </div>
      ) : (
        <div className="row g-3">
          {misReservas.map((reservation) => {
            const t = reservation.shift;
            const esDeHoy = reservation.date === dateHoyISO;

            return (
              <div key={reservation.id} className="col-12 col-md-6">
                <div className="clase-card card-reservado p-3 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="time-tag rounded px-2 py-1 fw-bold">
                        {t?.startTime} - {t?.endTime} hs
                      </span>
                      <Badge bg={esDeHoy ? 'success' : 'secondary'} className="rounded-pill px-2 py-1">
                        {esDeHoy ? '📅 Para Hoy' : reservation.date}
                      </Badge>
                    </div>
                    <h6 className="fw-bold text-white mb-1 text-truncate">
                      {t?.activity?.name?.toUpperCase() || 'CLASE'}
                    </h6>
                    <p className="text-secondary small mb-2">
                      Teacher: {t?.teacher ? `${t.teacher.name} ${t.teacher.lastname}` : 'Sin Teacher'}
                    </p>
                    <p className="text-secondary small mb-0">
                      Branch: <span className="text-white">{t?.branch?.name || 'Branch Central'}</span>
                    </p>
                  </div>

                  <div className="border-top location-footer pt-3 mt-3 d-flex justify-content-between align-items-center">
                    <span className="text-success small fw-medium">
                      ✓ Lugar confirmado
                    </span>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="rounded-pill px-3 py-1"
                      onClick={() => onPedirCancelar(reservation.id, t?.activity?.name || 'Clase')}
                    >
                      Cancelar Shift
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MisReservasView;
