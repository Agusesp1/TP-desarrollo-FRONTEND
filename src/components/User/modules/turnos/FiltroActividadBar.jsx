import React from 'react';
import { Form, Badge } from 'react-bootstrap';

const FiltroActividadBar = ({
  actividades,
  sedeSeleccionada,
  filtroActividad,
  setFiltroActividad,
  cantidadClases
}) => {
  return (
    <div className="mb-4">
      <div className="filter-dropdown-dark d-flex align-items-center justify-content-between p-2">
        <div className="d-flex align-items-center flex-grow-1 me-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-secondary-accent me-2 ms-2"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <Form.Select
            className="border-0 shadow-none p-0 text-white fw-medium"
            value={filtroActividad}
            onChange={(e) => setFiltroActividad(e.target.value)}
          >
            <option value="todas">Todas las clases</option>
            {actividades
              .filter(
                (a) =>
                  sedeSeleccionada === 'todas' ||
                  !a.sede_id ||
                  a.sede_id.toString() === sedeSeleccionada.toString()
              )
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
          </Form.Select>
        </div>
        <div className="d-flex align-items-center me-2">
          <Badge bg="primary" className="rounded-pill px-2 py-1">
            {cantidadClases} {cantidadClases === 1 ? 'clase' : 'clases'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default FiltroActividadBar;
