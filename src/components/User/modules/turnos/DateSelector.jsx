import React from 'react';
import { Button } from 'react-bootstrap';

const DateSelector = ({
  diasSemana,
  diaSeleccionado,
  setDiaSeleccionado,
  fechaHoyISO,
  esMismoDia,
  diaActualInfo,
  getMesYAnio
}) => {
  return (
    <>
      {/* Month & Year Banner */}
      <div className="d-flex align-items-center justify-content-center mb-3">
        <button 
          type="button" 
          className="month-nav-btn me-2"
          onClick={() => setDiaSeleccionado(fechaHoyISO)}
          title="Día actual"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span className="fw-bold text-white fs-6 text-uppercase" style={{ letterSpacing: '0.5px' }}>
          {getMesYAnio()}
        </span>
        <button 
          type="button" 
          className="month-nav-btn ms-2"
          onClick={() => {
            const ultimoDia = diasSemana[diasSemana.length - 1]?.id;
            if (ultimoDia) setDiaSeleccionado(ultimoDia);
          }}
          title="Próximos días"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Dates Scroll Cards */}
      <div className="dates-scroll-container mb-3">
        {diasSemana.map((d) => (
          <div 
            key={d.id} 
            className={`date-card ${diaSeleccionado === d.id ? 'active' : ''}`}
            onClick={() => setDiaSeleccionado(d.id)}
          >
            {d.esHoy && <span className="hoy-tag">HOY</span>}
            <span className="dia-num">{d.diaNumero}</span>
            <span className="dia-nom">{d.diaNombre}</span>
            {diaSeleccionado === d.id && <div className="dot-indicator"></div>}
          </div>
        ))}
      </div>

      {/* Banner de restricción: Solo turnos del mismo día */}
      {!esMismoDia && (
        <div className="day-restriction-banner mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2 text-warning flex-shrink-0">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>
              Visualizando cronograma del <strong>{diaActualInfo?.diaNombre} {diaActualInfo?.diaNumero} de {diaActualInfo?.mesNombre}</strong>. Por política del club, solo se permite reservar turnos para el <strong>día de hoy</strong>.
            </span>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            className="rounded-pill px-3 py-1 fw-bold"
            onClick={() => setDiaSeleccionado(fechaHoyISO)}
          >
            Volver a Hoy
          </Button>
        </div>
      )}
    </>
  );
};

export default DateSelector;
