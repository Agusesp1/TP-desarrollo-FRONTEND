import React from 'react';
import { Row, Col, Button, Form, InputGroup } from 'react-bootstrap';

const BranchesHeader = ({
  filterTexto,
  setFiltroTexto,
  onNuevaBranch
}) => {
  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-white">Gestión de Sedes</h4>
          <p className="text-secondary small mb-0">
            Administra los establecimientos físicos, días de apertura, horarios y generación automática de turnos.
          </p>
        </div>

        <Button
          variant="primary"
          className="hero-btn fw-bold px-4 py-2 d-inline-flex align-items-center gap-2 rounded-pill shadow"
          onClick={onNuevaBranch}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Nueva Sede
        </Button>
      </div>

      <Row className="g-3 mb-4">
        <Col md={12}>
          <InputGroup>
            <InputGroup.Text>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar sedes por nombre, dirección o ciudad..."
              value={filterTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />
            {filterTexto && (
              <Button variant="outline-secondary" onClick={() => setFiltroTexto('')}>
                Limpiar
              </Button>
            )}
          </InputGroup>
        </Col>
      </Row>
    </>
  );
};

export default BranchesHeader;
