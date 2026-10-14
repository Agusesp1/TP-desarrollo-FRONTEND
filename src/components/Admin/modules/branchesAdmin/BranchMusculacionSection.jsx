import React from 'react';
import { Row, Col, Form, Button, Collapse } from 'react-bootstrap';

const BranchMusculacionSection = ({
  generarMusculacion,
  setGenerarMusculacion,
  durationMusculacion,
  setDuracionMusculacion,
  capacityMusculacion,
  setCupoMusculacion,
  teacherMusculacion,
  setProfesorMusculacion,
  teachers = [],
  totalTurnosSemanales,
  shiftsPorDiaCalculados = [],
  mostrarPreviewSlots,
  setMostrarPreviewSlots
}) => {
  return (
    <div className="branch-section-card border-primary border-opacity-50">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h6 className="text-uppercase text-white fw-bold small mb-1 d-flex align-items-center gap-2">
            <span className="badge-token-brand">3</span> Generación Automática de Shifts de Musculación
          </h6>
          <p className="text-secondary small mb-0">
            Crea automáticamente la activity <strong>"Musculación & Sala de Pesas"</strong> y todos sus shifts adaptados al schedule de cada día.
          </p>
        </div>
        <Form.Check
          type="switch"
          id="switch-musculacion"
          checked={generarMusculacion}
          onChange={(e) => setGenerarMusculacion(e.target.checked)}
          className="fs-5"
        />
      </div>

      {generarMusculacion && (
        <>
          <Row className="g-3 mb-3">
            <Col xs={12} sm={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold text-white">
                  Intervalo / Duración del Shift *
                </Form.Label>
                <Form.Select
                  value={durationMusculacion}
                  onChange={(e) => setDuracionMusculacion(parseInt(e.target.value, 10))}
                >
                  <option value={60}>60 minutos (1 hora - Recomendado)</option>
                  <option value={90}>90 minutos (1h 30m)</option>
                  <option value={120}>120 minutos (2 horas)</option>
                  <option value={45}>45 minutos</option>
                  <option value={30}>30 minutos</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} sm={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold text-white">
                  Capacity Máximo por Shift *
                </Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={capacityMusculacion}
                  onChange={(e) => setCupoMusculacion(parseInt(e.target.value, 10) || 1)}
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold text-white">
                  Profesor a Cargo (Opcional)
                </Form.Label>
                <Form.Select
                  value={teacherMusculacion}
                  onChange={(e) => setProfesorMusculacion(e.target.value)}
                >
                  <option value="">Sin teacher asignado inicialmente</option>
                  {teachers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.lastname} ({p.specialty})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Caja de Vista Previa de Shifts */}
          <div className="preview-shifts-box">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary rounded-pill px-3 py-1 fw-bold fs-6">
                  {totalTurnosSemanales} shifts
                </span>
                <span className="small text-white fw-semibold">
                  se generarán automáticamente cada semana
                </span>
              </div>

              <Button
                variant="outline-info"
                size="sm"
                className="rounded-pill px-3 py-1 small"
                onClick={() => setMostrarPreviewSlots(!mostrarPreviewSlots)}
              >
                {mostrarPreviewSlots ? 'Ocultar Detalle' : 'Ver Detalle de Schedules'}
              </Button>
            </div>

            <Collapse in={mostrarPreviewSlots}>
              <div className="mt-3 pt-3 border-top border-secondary border-opacity-50">
                <Row className="g-2">
                  {shiftsPorDiaCalculados.map(item => (
                    <Col xs={12} md={6} key={item.day}>
                      <div className="p-2 rounded bg-dark bg-opacity-75">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="fw-bold text-white small">{item.day}:</span>
                          <span className="text-secondary small">
                            {item.abierto ? `${item.slots.length} shifts` : 'Cerrado'}
                          </span>
                        </div>
                        {item.abierto && item.slots.length > 0 ? (
                          <div className="d-flex flex-wrap gap-1">
                            {item.slots.map((s, idx) => (
                              <span key={idx} className="slot-pill-preview">
                                {s.home} - {s.fin}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-secondary small fst-italic">Sin shifts para este día</span>
                        )}
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Collapse>
          </div>
        </>
      )}
    </div>
  );
};

export default BranchMusculacionSection;
