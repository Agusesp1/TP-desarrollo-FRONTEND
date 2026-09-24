import React from 'react';

const SedesSelector = ({ sedes, sedeSeleccionada, setSedeSeleccionada }) => {
  return (
    <div className="sedes-scroll-container mb-3">
      <button 
        type="button"
        className={`sede-pill ${sedeSeleccionada === 'todas' ? 'active' : ''}`}
        onClick={() => setSedeSeleccionada('todas')}
      >
        TODAS LAS SEDES
      </button>
      {sedes.map((s) => (
        <button 
          key={s.id}
          type="button"
          className={`sede-pill ${sedeSeleccionada?.toString() === s.id.toString() ? 'active' : ''}`}
          onClick={() => setSedeSeleccionada(s.id)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {s.nombre.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default SedesSelector;
