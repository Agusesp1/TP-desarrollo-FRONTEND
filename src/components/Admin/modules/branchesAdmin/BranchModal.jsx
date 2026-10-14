import React from 'react';
import { Modal, Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import BranchScheduleSection from './BranchScheduleSection';
import BranchMusculacionSection from './BranchMusculacionSection';

const BranchModal = ({
  show,
  onHide,
  branchEditando,
  guardando,
  formData,
  setFormData,
  diasHorarios,
  onDiaChange,
  onCopiarLunesAViernes,
  onMarcarLunSab,
  onMarcarTodos,
  horarioResumenStr,
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
  setMostrarPreviewSlots,
  onSubmit
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      scrollable
      size="xl"
      className="branch-modal-xl"
      contentClassName="glass-card text-white"
    >
      <Modal.Header closeButton closeVariant="white" className="border-secondary px-4 py-3">
        <Modal.Title className="fw-bold d-flex align-items-center gap-2">
          <span className="p-2 rounded-3 bg-primary bg-opacity-25 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          {branchEditando ? `Editar Branch: ${branchEditando.name}` : 'Registrar Nueva Branch & Configurar Shifts'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3 p-md-4">
        <Form id="branch-form" onSubmit={onSubmit}>
          
          {/* SECCIÓN 1: Datos Principales de la Branch */}
          <div className="branch-section-card">
            <h6 className="text-uppercase text-secondary fw-bold small mb-3 d-flex align-items-center gap-2">
              <span className="badge-token-accent">1</span> Información General del Establecimiento
            </h6>
            
            <Row className="g-3">
              <Col md={7}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-white">Name de la Branch *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Ej: FitApp Branch Centro Norte"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-white">City *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Ej: Rosario"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={8}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-white">Dirección Completa *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Ej: Av. Rafael Núñez 4200, B° Cerro de las Rosas"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-white">Capacity Máxima *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    required
                    placeholder="Ej: 200"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 0 })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-white">Teléfono de Contacto</Form.Label>
                  <Form.Control
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Solo números (ej: 3514451234)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-white">Email de la Branch</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ej: contacto.branch@gymfit.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* SECCIÓN 2: Días Abiertos y Schedules Específicos por Día */}
          <BranchScheduleSection
            diasHorarios={diasHorarios}
            onDiaChange={onDiaChange}
            onCopiarLunesAViernes={onCopiarLunesAViernes}
            onMarcarLunSab={onMarcarLunSab}
            onMarcarTodos={onMarcarTodos}
            horarioResumenStr={horarioResumenStr}
          />

          {/* SECCIÓN 3: Generación Automática de Shifts de Musculación */}
          {!branchEditando && (
            <BranchMusculacionSection
              generarMusculacion={generarMusculacion}
              setGenerarMusculacion={setGenerarMusculacion}
              durationMusculacion={durationMusculacion}
              setDuracionMusculacion={setDuracionMusculacion}
              capacityMusculacion={capacityMusculacion}
              setCupoMusculacion={setCupoMusculacion}
              teacherMusculacion={teacherMusculacion}
              setProfesorMusculacion={setProfesorMusculacion}
              teachers={teachers}
              totalTurnosSemanales={totalTurnosSemanales}
              shiftsPorDiaCalculados={shiftsPorDiaCalculados}
              mostrarPreviewSlots={mostrarPreviewSlots}
              setMostrarPreviewSlots={setMostrarPreviewSlots}
            />
          )}

        </Form>
      </Modal.Body>

      <Modal.Footer className="border-secondary px-4 py-3">
        <Button
          variant="outline-light"
          onClick={onHide}
          disabled={guardando}
          className="rounded-pill px-4"
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          type="submit"
          form="branch-form"
          disabled={guardando}
          className="hero-btn rounded-pill px-5 fw-bold"
        >
          {guardando ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Guardando Branch...
            </>
          ) : branchEditando ? (
            'Guardar Cambios'
          ) : (
            'Crear Branch & Generar Shifts'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BranchModal;
