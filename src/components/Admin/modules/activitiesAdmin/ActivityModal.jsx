import React from 'react';
import { Modal, Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import { esHoraValida, convertirHoraAMin } from './activitiesHelpers';

const ActivityModal = ({
  showModal,
  setShowModal,
  activityEditando,
  formData,
  setFormData,
  guardando,
  handleGuardar,
  autoCalcularHoraFin,
  branches = [],
  teachers = []
}) => {
  const hayErrorHorario =
    esHoraValida(formData.startTime) &&
    esHoraValida(formData.endTime) &&
    convertirHoraAMin(formData.endTime) <= convertirHoraAMin(formData.startTime);

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered contentClassName="glass-card text-white">
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title className="fw-bold">
          {activityEditando ? 'Editar Activity' : 'Nueva Activity'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleGuardar}>
        <Modal.Body>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Name de la Activity *</Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="Ej: Funcional & Cross Training"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Form.Group>
            </Col>

            {/* Sección Días y Schedules */}
            <Col md={12}>
              <div className="p-3 border border-secondary border-opacity-50 rounded-3 bg-dark bg-opacity-50">
                <h6 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Días y Schedules de Dictado *
                </h6>
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-white">Días de la Semana *</Form.Label>
                      <Form.Select
                        required
                        value={formData.dayOfWeek}
                        onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                      >
                        <option value="Lunes a Viernes">Lunes a Viernes</option>
                        <option value="Lunes a Sábado">Lunes a Sábado (Todos los días)</option>
                        <option value="Lunes, Miércoles y Viernes">Lunes, Miércoles y Viernes</option>
                        <option value="Martes y Jueves">Martes y Jueves</option>
                        <option value="Sábados">Sábados</option>
                        <option value="Lunes">Lunes</option>
                        <option value="Martes">Martes</option>
                        <option value="Miércoles">Miércoles</option>
                        <option value="Jueves">Jueves</option>
                        <option value="Viernes">Viernes</option>
                        <option value="Domingo">Domingo</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-white d-flex align-items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Hora Home *
                      </Form.Label>
                      <Form.Control
                        type="time"
                        required
                        step="60"
                        className="custom-time-input"
                        value={formData.startTime}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, startTime: val });
                          autoCalcularHoraFin(val, formData.duration);
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-white d-flex align-items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Hora Fin *
                      </Form.Label>
                      <Form.Control
                        type="time"
                        required
                        step="60"
                        className="custom-time-input"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  {hayErrorHorario && (
                    <Col md={12}>
                      <div className="alert alert-danger py-1 px-2 small mb-0 d-flex align-items-center gap-1">
                        <span>⚠️ El schedule de fin ({formData.endTime}) debe ser posterior al home ({formData.startTime}).</span>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Branch</Form.Label>
                <Form.Select
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                >
                  <option value="">Seleccione una branch...</option>
                  {branches && branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Teacher a Cargo</Form.Label>
                <Form.Select
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                >
                  <option value="">-- Sin teacher asignado --</option>
                  {teachers && teachers.map((teacher) => {
                    const branchProfObj = branches && branches.find((s) => s.id?.toString() === teacher.branch_id?.toString());
                    const esMismaSede = !formData.branch_id || !teacher.branch_id || teacher.branch_id.toString() === formData.branch_id.toString();

                    return (
                      <option key={teacher.id} value={teacher.id} disabled={!esMismaSede}>
                        {teacher.name} {teacher.lastname} ({teacher.specialty}){branchProfObj ? ` • ${branchProfObj.name}` : ''}{!esMismaSede ? ' [Branch incompatible]' : ''}
                      </option>
                    );
                  })}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Duración (en minutos) *</Form.Label>
                <Form.Control
                  type="number"
                  min="10"
                  step="5"
                  required
                  value={formData.duration}
                  onChange={(e) => {
                    const dur = parseInt(e.target.value, 10) || 0;
                    setFormData({ ...formData, duration: dur });
                    autoCalcularHoraFin(formData.startTime, dur);
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Capacity Máximo de Personas *</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 0 })}
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Detalles sobre los beneficios y estilo de la clase..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button variant="outline-light" onClick={() => setShowModal(false)} disabled={guardando} className="rounded-pill px-3">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={guardando || hayErrorHorario} className="hero-btn rounded-pill px-4 fw-bold">
            {guardando ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Guardando...
              </>
            ) : activityEditando ? (
              'Guardar Cambios'
            ) : (
              'Crear Activity'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ActivityModal;
