import React from 'react';
import { Row, Col, InputGroup, Form, Button } from 'react-bootstrap';

const SociosCuotasFiltros = ({
  filtroTexto,
  setFiltroTexto,
  filtroEstado,
  setFiltroEstado
}) => {
  const opcionesEstado = [
    { id: 'vencidas', label: 'Solo Vencidas' },
    { id: 'todos', label: 'Todas las Cuotas' },
    { id: 'en demora', label: 'En Demora' },
    { id: 'no pagado', label: 'No Pagados' },
    { id: 'pendiente', label: 'Pendientes' },
    { id: 'pagado', label: 'Pagados' }
  ];

  return (
    <div className="mb-4">
      {/* Selector rápido / Toggle de solo cuotas vencidas */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 px-1">
        <Form.Check
          type="switch"
          id="switch-solo-vencidas"
          className="user-select-none"
          label={
            <span className="small fw-semibold text-white opacity-90 ms-1">
              Filtrar únicamente cuotas vencidas (Demora y No pagado)
            </span>
          }
          checked={filtroEstado === 'vencidas'}
          onChange={(e) => setFiltroEstado(e.target.checked ? 'vencidas' : 'todos')}
        />
      </div>

      <Row className="g-3">
        <Col lg={5} md={6}>
          <InputGroup>
            <InputGroup.Text>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar por socio, correo, DNI o período..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="text-white"
            />
            {filtroTexto && (
              <Button variant="outline-secondary" onClick={() => setFiltroTexto('')}>
                Limpiar
              </Button>
            )}
          </InputGroup>
        </Col>

        <Col lg={7} md={6}>
          <div className="d-flex gap-1 overflow-auto pb-1 align-items-center">
            {opcionesEstado.map((item) => {
              const esActivo = filtroEstado === item.id;
              return (
                <Button
                  key={item.id}
                  size="sm"
                  variant={esActivo ? 'primary' : 'outline-secondary'}
                  className={`rounded-pill px-3 py-1 text-nowrap fw-medium ${esActivo ? 'hero-btn' : ''}`}
                  onClick={() => setFiltroEstado(item.id)}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SociosCuotasFiltros;
