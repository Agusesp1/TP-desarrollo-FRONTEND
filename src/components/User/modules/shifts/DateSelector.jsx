import React from 'react';
import { Button } from 'react-bootstrap';

const DateSelector = ({
  diasSemana,
  daySeleccionado,
  setDiaSeleccionado,
  dateHoyISO,
  esMismoDia,
  dayActualInfo,
  getMesYAnio
}) => {
  return (
    <>

      {/* Dates Scroll Cards */}
      <div className="dates-scroll-container mb-3">
        {diasSemana.map((d) => (
          <div 
            key={d.id} 
            className={`date-card ${daySeleccionado === d.id ? 'active' : ''}`}
            onClick={() => setDiaSeleccionado(d.id)}
          >
            {d.esHoy && <span className="hoy-tag">HOY</span>}
            <span className="day-num">{d.dayNumero}</span>
            <span className="day-nom">{d.dayNombre}</span>
            {daySeleccionado === d.id && <div className="dot-indicator"></div>}
          </div>
        ))}
      </div>

      {/* Banner de restricción: Solo shifts del mismo día */}
      {!esMismoDia && (
        <div className="day-restriction-banner mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2 text-warning flex-shrink-0">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>
              Visualizando cronograma del <strong>{dayActualInfo?.dayNombre} {dayActualInfo?.dayNumero} de {dayActualInfo?.monthNombre}</strong>. Por política del club, solo se permite reservar shifts para el <strong>día de hoy</strong>.
            </span>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            className="rounded-pill px-3 py-1 fw-bold"
            onClick={() => setDiaSeleccionado(dateHoyISO)}
          >
            Volver a Hoy
          </Button>
        </div>
      )}
    </>
  );
};

export default DateSelector;
