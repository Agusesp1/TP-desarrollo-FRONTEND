import React from 'react';
import { Button, Badge, Spinner } from 'react-bootstrap';

const MisReservasView = ({
  cargando,
  misReservas,
  fechaHoyISO,
  onPedirCancelar,
  onVolverAClases
}) => {
  return (
    <div className="mis-reservas-view py-2">
      <div className="d-flex align-items-center justify-content-between mb-3 px-1">
        <h6 className="fw-bold text-white mb-0">Tus Reservas Confirmadas</h6>
        <Badge bg="primary" className="px-3 py-1 rounded-pill">
          Total: {misReservas.length}
        </Badge>
      </div>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-secondary small mt-2">Cargando tus reservas...</p>
        </div>
      ) : misReservas.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <div className="mb-3 opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <p className="fw-medium text-white mb-1">Aún no tienes turnos reservados</p>
          <p className="small mb-3">Selecciona una clase del día de hoy para asegurar tu lugar en el gimnasio.</p>
          <Button variant="primary" size="sm" className="rounded-pill px-4" onClick={onVolverAClases}>
            Ver Clases de Hoy
          </Button>
        </div>
      ) : (
        <div className="row g-3">
          {misReservas.map((reserva) => {
            const t = reserva.turno;
            const esDeHoy = reserva.fecha === fechaHoyISO;

            return (
              <div key={reserva.id} className="col-12 col-md-6">
                <div className="clase-card card-reservado p-3 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="time-tag rounded px-2 py-1 fw-bold">
                        {t?.horarioInicio} - {t?.horaFin} hs
                      </span>
                      <Badge bg={esDeHoy ? 'success' : 'secondary'} className="rounded-pill px-2 py-1">
                        {esDeHoy ? '📅 Para Hoy' : reserva.fecha}
                      </Badge>
                    </div>
                    <h6 className="fw-bold text-white mb-1 text-truncate">
                      {t?.actividad?.nombre?.toUpperCase() || 'CLASE'}
                    </h6>
                    <p className="text-secondary small mb-2">
                      Profesor: {t?.profesor ? `${t.profesor.nombre} ${t.profesor.apellido}` : 'Sin Profesor'}
                    </p>
                    <p className="text-secondary small mb-0">
                      Sede: <span className="text-white">{t?.sede?.nombre || 'Sede Central'}</span>
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
                      onClick={() => onPedirCancelar(reserva.id, t?.actividad?.nombre || 'Clase')}
                    >
                      Cancelar Turno
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
