import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { timeToMinutes } from './branchesHelpers';

const BranchScheduleSection = ({
  diasHorarios = [],
  onDiaChange,
  onCopiarLunesAViernes,
  onMarcarLunSab,
  onMarcarTodos,
  horarioResumenStr
}) => {
  return (
    <div className="branch-section-card">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div>
          <h6 className="text-uppercase text-secondary fw-bold small mb-1 d-flex align-items-center gap-2">
            <span className="badge-token-accent">2</span> Días de Atención & Schedules por Día
          </h6>
          <p className="text-secondary small mb-0">
            Selecciona qué días abre la branch y configura con precisión la hora de apertura y cierre para cada día.
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn branch-quick-btn"
            onClick={onCopiarLunesAViernes}
            title="Copia el schedule de Lunes a Martes, Miércoles, Jueves y Viernes"
          >
            ⚡ Copiar Lun a Mar-Vie
          </button>
          <button
            type="button"
            className="btn branch-quick-btn"
            onClick={onMarcarLunSab}
          >
            Lun a Sáb
          </button>
          <button
            type="button"
            className="btn branch-quick-btn"
            onClick={onMarcarTodos}
          >
            Todos los días
          </button>
        </div>
      </div>

      {/* Lista de Días de la Semana */}
      <Row className="g-3 mb-4">
        {diasHorarios.map((item, index) => {
          const horasAbierto = item.abierto && item.hora_home && item.hora_fin
            ? ((timeToMinutes(item.hora_fin) - timeToMinutes(item.hora_home)) / 60).toFixed(1).replace('.0', '')
            : 0;

          return (
            <Col xs={12} md={6} lg={4} key={item.day}>
              <div className={`branch-day-card h-100 ${item.abierto ? 'abierto' : 'cerrado'}`}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold text-white fs-6">
                    {item.day}
                  </span>
                  <Form.Check
                    type="switch"
                    id={`switch-day-${item.day}`}
                    label={item.abierto ? 'Abierto' : 'Cerrado'}
                    checked={item.abierto}
                    onChange={(e) => onDiaChange(index, 'abierto', e.target.checked)}
                    className="small fw-semibold"
                  />
                </div>

                {item.abierto ? (
                  <>
                    <Row className="g-3 align-items-end mb-1">
                      <Col xs={6}>
                        <Form.Label className="small text-secondary mb-1" style={{ fontSize: '0.72rem' }}>
                          Apertura
                        </Form.Label>
                        <Form.Control
                          type="time"
                          size="sm"
                          className="custom-time-input text-center"
                          value={item.hora_home}
                          onChange={(e) => onDiaChange(index, 'hora_home', e.target.value)}
                          required={item.abierto}
                        />
                      </Col>
                      <Col xs={6}>
                        <Form.Label className="small text-secondary mb-1" style={{ fontSize: '0.72rem' }}>
                          Cierre
                        </Form.Label>
                        <Form.Control
                          type="time"
                          size="sm"
                          className="custom-time-input text-center"
                          value={item.hora_fin}
                          onChange={(e) => onDiaChange(index, 'hora_fin', e.target.value)}
                          required={item.abierto}
                        />
                      </Col>
                    </Row>
                    <div className="mt-2 d-flex justify-content-between align-items-center">
                      <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
                        {timeToMinutes(item.hora_fin) > timeToMinutes(item.hora_home)
                          ? `${horasAbierto} hs de atención`
                          : '⚠️ Schedule inválido'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-3 text-secondary small fst-italic">
                    Cerrado todo el día
                  </div>
                )}
              </div>
            </Col>
          );
        })}
      </Row>

      {/* Resumen del Schedule */}
      <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-50 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div>
          <span className="text-secondary small fw-semibold d-block">Resumen Formateado:</span>
          <span className="fw-bold text-info small">{horarioResumenStr}</span>
        </div>
      </div>
    </div>
  );
};

export default BranchScheduleSection;
