import React from 'react';
import { Modal, Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import { esHoraValida, convertirHoraAMin } from './actividadesHelpers';

const ModalActividad = ({
  showModal,
  setShowModal,
  actividadEditando,
  formData,
  setFormData,
  guardando,
  handleGuardar,
  autoCalcularHoraFin,
  sedes = [],
  profesores = []
}) => {
  const hayErrorHorario =
    esHoraValida(formData.horarioInicio) &&
    esHoraValida(formData.horaFin) &&
    convertirHoraAMin(formData.horaFin) <= convertirHoraAMin(formData.horarioInicio);

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered contentClassName="glass-card text-white">
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title className="fw-bold">
          {actividadEditando ? 'Editar Actividad' : 'Nueva Actividad'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleGuardar}>
        <Modal.Body>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Nombre de la Actividad *</Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="Ej: Funcional & Cross Training"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </Form.Group>
            </Col>

            {/* Sección Días y Horarios */}
            <Col md={12}>
              <div className="p-3 border border-secondary border-opacity-50 rounded-3 bg-dark bg-opacity-50">
                <h6 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Días y Horarios de Dictado *
                </h6>
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-white">Días de la Semana *</Form.Label>
                      <Form.Select
                        required
                        value={formData.dia_semana}
                        onChange={(e) => setFormData({ ...formData, dia_semana: e.target.value })}
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
                        Hora Inicio *
                      </Form.Label>
                      <Form.Control
                        type="time"
                        required
                        step="60"
                        className="custom-time-input"
                        value={formData.horarioInicio}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, horarioInicio: val });
                          autoCalcularHoraFin(val, formData.duracion);
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
                        value={formData.horaFin}
                        onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  {hayErrorHorario && (
                    <Col md={12}>
                      <div className="alert alert-danger py-1 px-2 small mb-0 d-flex align-items-center gap-1">
                        <span>⚠️ El horario de fin ({formData.horaFin}) debe ser posterior al inicio ({formData.horarioInicio}).</span>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Sede</Form.Label>
                <Form.Select
                  value={formData.sede_id}
                  onChange={(e) => setFormData({ ...formData, sede_id: e.target.value })}
                >
                  <option value="">Seleccione una sede...</option>
                  {sedes && sedes.map((sede) => (
                    <option key={sede.id} value={sede.id}>{sede.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Profesor a Cargo</Form.Label>
                <Form.Select
                  value={formData.profesor_id}
                  onChange={(e) => setFormData({ ...formData, profesor_id: e.target.value })}
                >
                  <option value="">-- Sin profesor asignado --</option>
                  {profesores && profesores.map((prof) => {
                    const sedeProfObj = sedes && sedes.find((s) => s.id?.toString() === prof.sede_id?.toString());
                    const esMismaSede = !formData.sede_id || !prof.sede_id || prof.sede_id.toString() === formData.sede_id.toString();

                    return (
                      <option key={prof.id} value={prof.id} disabled={!esMismaSede}>
                        {prof.nombre} {prof.apellido} ({prof.especialidad}){sedeProfObj ? ` • ${sedeProfObj.nombre}` : ''}{!esMismaSede ? ' [Sede incompatible]' : ''}
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
                  value={formData.duracion}
                  onChange={(e) => {
                    const dur = parseInt(e.target.value, 10) || 0;
                    setFormData({ ...formData, duracion: dur });
                    autoCalcularHoraFin(formData.horarioInicio, dur);
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Cupo Máximo de Personas *</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  required
                  value={formData.cupo}
                  onChange={(e) => setFormData({ ...formData, cupo: parseInt(e.target.value, 10) || 0 })}
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
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
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
            ) : actividadEditando ? (
              'Guardar Cambios'
            ) : (
              'Crear Actividad'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalActividad;
