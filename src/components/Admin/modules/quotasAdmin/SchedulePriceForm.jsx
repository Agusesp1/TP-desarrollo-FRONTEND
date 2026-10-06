import React from 'react';
import { Card, Form, Row, Col, InputGroup, Button, Spinner } from 'react-bootstrap';

const SchedulePriceForm = ({
  formPrecio,
  setFormPrecio,
  onSubmit,
  guardandoPrecio
}) => {
  return (
    <Card className="border-secondary bg-dark bg-opacity-75 p-4 mb-4 rounded-3 text-white">
      <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        Programar o Actualizar Nuevo Price de Quota
      </h5>

      <p className="text-secondary small mb-3">
        Define con anticipación el nuevo importe y la <strong>date de entrada en vigencia</strong>. A partir de esa date, todas las nuevas quotas emitidas o recalculadas tomarán dicho valor.
      </p>

      <Form onSubmit={onSubmit}>
        <Row className="g-3">
          <Col md={4}>
            <Form.Label className="small text-light">Amount de la Quota ($) *</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                required
                min="100"
                step="100"
                placeholder="Ej: 22000"
                value={formPrecio.amount}
                onChange={(e) => setFormPrecio({ ...formPrecio, amount: e.target.value })}
              />
            </InputGroup>
          </Col>

          <Col md={4}>
            <Form.Label className="small text-light">
              Vigente a partir de (start_date) *
            </Form.Label>
            <Form.Control
              type="date"
              required
              value={formPrecio.start_date}
              onChange={(e) => setFormPrecio({ ...formPrecio, start_date: e.target.value })}
            />
            <Form.Text className="text-secondary" style={{ fontSize: '0.75rem' }}>
              Date exacta en que entra en vigencia
            </Form.Text>
          </Col>

          <Col md={4}>
            <Form.Label className="small text-light">Descripción o Motivo</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Actualización tarifaria Noviembre 2026"
              value={formPrecio.description}
              onChange={(e) => setFormPrecio({ ...formPrecio, description: e.target.value })}
            />
          </Col>
        </Row>

        <div className="text-end mt-4">
          <Button
            type="submit"
            variant="primary"
            className="hero-btn rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2"
            disabled={guardandoPrecio}
          >
            {guardandoPrecio ? (
              <>
                <Spinner animation="border" size="sm" />
                Guardando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Guardar / Programar Tarifa
              </>
            )}
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default SchedulePriceForm;
