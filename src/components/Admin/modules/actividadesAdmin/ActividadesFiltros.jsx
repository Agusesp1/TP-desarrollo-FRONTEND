import React from 'react';
import { Row, Col, InputGroup, Form, Button } from 'react-bootstrap';

const ActividadesFiltros = ({
  filtroTexto,
  setFiltroTexto,
  filtroSede,
  setFiltroSede,
  filtroProfesor,
  setFiltroProfesor,
  sedes = [],
  profesores = []
}) => {
  return (
    <Row className="g-3 mb-4">
      <Col md={5} lg={5}>
        <InputGroup>
          <InputGroup.Text>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Buscar por actividad o profesor..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
          />
          {filtroTexto && (
            <Button variant="outline-secondary" onClick={() => setFiltroTexto('')}>
              Limpiar
            </Button>
          )}
        </InputGroup>
      </Col>

      <Col md={3} lg={3}>
        <InputGroup>
          <InputGroup.Text title="Filtrar por sede">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </InputGroup.Text>
          <Form.Select
            value={filtroSede}
            onChange={(e) => setFiltroSede(e.target.value)}
          >
            <option value="todas">Todas las sedes</option>
            <option value="sin_sede">Sin sede asignada</option>
            {sedes && sedes.map((s) => (
              <option key={s.id} value={s.id.toString()}>
                {s.nombre}
              </option>
            ))}
          </Form.Select>
        </InputGroup>
      </Col>

      <Col md={4} lg={4}>
        <InputGroup>
          <InputGroup.Text title="Filtrar por profesor">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </InputGroup.Text>
          <Form.Select
            value={filtroProfesor}
            onChange={(e) => setFiltroProfesor(e.target.value)}
          >
            <option value="todos">Todos los profesores</option>
            <option value="sin_profesor">Sin profesor asignado</option>
            {profesores && profesores.map((p) => (
              <option key={p.id} value={p.id.toString()}>
                {p.nombre} {p.apellido}
              </option>
            ))}
          </Form.Select>
          {(filtroSede !== 'todas' || filtroProfesor !== 'todos') && (
            <Button
              variant="outline-secondary"
              onClick={() => {
                setFiltroSede('todas');
                setFiltroProfesor('todos');
              }}
              title="Restablecer filtros"
            >
              ✕
            </Button>
          )}
        </InputGroup>
      </Col>
    </Row>
  );
};

export default ActividadesFiltros;
