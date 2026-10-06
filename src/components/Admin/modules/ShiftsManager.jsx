import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Table, Form, Modal, Spinner, Pagination } from 'react-bootstrap';

const ShiftsManager = ({
  shifts = [],
  activities = [],
  teachers = [],
  branches = [],
  cargando,
  onRecargar,
  onMostrarAlerta,
  onPedirEliminar,
  apiBase
}) => {
  const [filterActividad, setFiltroActividad] = useState('todas');
  const [filterDia, setFiltroDia] = useState('todos');
  const [filterSede, setFiltroSede] = useState('');

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 8;

  useEffect(() => {
    setPaginaActual(1);
  }, [filterActividad, filterDia, filterSede]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [shiftEditando, setTurnoEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    activity_id: '',
    startTime: '07:00',
    endTime: '09:00',
    dayOfWeek: 'Lunes a Sábado',
    teacher_id: '',
    branch_id: ''
  });

  const esHoraValida = (hora) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(hora?.trim() || '');

  const convertirHoraAMin = (hora) => {
    if (!esHoraValida(hora)) return null;
    const [h, m] = hora.trim().split(':').map(Number);
    return h * 60 + m;
  };

  const handleAbrirModal = (shift = null) => {
    if (shift) {
      setTurnoEditando(shift);
      setFormData({
        activity_id: shift.activity_id || '',
        startTime: shift.startTime || '07:00',
        endTime: shift.endTime || '09:00',
        dayOfWeek: shift.dayOfWeek || 'Lunes a Sábado',
        teacher_id: shift.teacher_id || '',
        branch_id: shift.branch_id || ''
      });
    } else {
      setTurnoEditando(null);
      const primeraAct = activities.length > 0 ? activities[0] : null;
      setFormData({
        activity_id: primeraAct ? primeraAct.id : '',
        startTime: '07:00',
        endTime: '09:00',
        dayOfWeek: 'Lunes a Sábado',
        teacher_id: primeraAct?.teacher_id ? primeraAct.teacher_id.toString() : (teachers.length > 0 ? teachers[0].id : ''),
        branch_id: primeraAct?.branch_id ? primeraAct.branch_id.toString() : (branches.length > 0 ? branches[0].id : '')
      });
    }
    setShowModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();

    // Validate formato y coherencia de schedules reales
    if (!esHoraValida(formData.startTime)) {
      onMostrarAlerta('Debe ingresar un schedule de home válido entre 00:00 y 23:59.', 'danger');
      return;
    }
    if (!esHoraValida(formData.endTime)) {
      onMostrarAlerta('Debe ingresar un schedule de fin válido entre 00:00 y 23:59.', 'danger');
      return;
    }
    const minInicio = convertirHoraAMin(formData.startTime);
    const minFin = convertirHoraAMin(formData.endTime);
    if (minFin <= minInicio) {
      onMostrarAlerta(`El schedule de fin (${formData.endTime}) debe ser posterior al schedule de home (${formData.startTime}).`, 'danger');
      return;
    }

    // Validate coincidencia de branch entre el Teacher y la Branch de la activity/shift
    if (formData.teacher_id) {
      const teacher = teachers.find((p) => p.id?.toString() === formData.teacher_id.toString());
      
      // Determinar la branch efectiva del shift
      let effectiveSedeId = formData.branch_id;
      if (!effectiveSedeId && formData.activity_id) {
        const act = activities.find((a) => a.id?.toString() === formData.activity_id.toString());
        if (act && act.branch_id) effectiveSedeId = act.branch_id.toString();
      }

      if (teacher && teacher.branch_id && effectiveSedeId && teacher.branch_id.toString() !== effectiveSedeId.toString()) {
        const branchProfObj = branches.find((s) => s.id?.toString() === teacher.branch_id.toString());
        const branchTurnoObj = branches.find((s) => s.id?.toString() === effectiveSedeId.toString());

        const nomSedeProf = branchProfObj ? branchProfObj.name : `Branch #${teacher.branch_id}`;
        const nomSedeTurno = branchTurnoObj ? branchTurnoObj.name : `Branch #${effectiveSedeId}`;

        onMostrarAlerta(
          `El teacher ${teacher.name} ${teacher.lastname} está asignado a ${nomSedeProf} y no puede dictar clases en ${nomSedeTurno}.`,
          'danger'
        );
        return;
      }
    }

    setGuardando(true);

    try {
      const endpoint = shiftEditando
        ? `${apiBase}/shifts/${shiftEditando.id}`
        : `${apiBase}/shifts`;
      const method = shiftEditando ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onMostrarAlerta(data.message);
        setShowModal(false);
        onRecargar();
      } else {
        onMostrarAlerta(data.message || 'Error al guardar shift', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al guardar shift', 'danger');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      const res = await fetch(`${apiBase}/shifts/${id}/toggle-status`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok && data.success) {
        onMostrarAlerta(data.message);
        onRecargar();
      } else {
        onMostrarAlerta(data.message || 'Error al cambiar status del shift', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al actualizar status', 'danger');
    }
  };

  const shiftsFiltrados = shifts.filter((t) => {
    const coincideActividad =
      filterActividad === 'todas' ||
      !filterActividad ||
      (t.activity_id && t.activity_id.toString() === filterActividad.toString());

    const coincideDia =
      filterDia === 'todos' ||
      !filterDia ||
      t.dayOfWeek === filterDia;

    const coincideSede =
      !filterSede ||
      (t.branch_id && t.branch_id.toString() === filterSede.toString());

    return coincideActividad && coincideDia && coincideSede;
  });

  // Cálculo de paginación
  const totalPaginas = Math.ceil(shiftsFiltrados.length / elementosPorPagina) || 1;
  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const shiftsPaginados = shiftsFiltrados.slice(indiceInicio, indiceInicio + elementosPorPagina);

  // Branch efectiva seleccionada en el formulario
  const selectedActividad = activities.find((a) => a.id?.toString() === formData.activity_id.toString());
  const effectiveSedeForm = formData.branch_id || (selectedActividad?.branch_id ? selectedActividad.branch_id.toString() : '');

  return (
    <Card className="glass-card border-0 p-4 text-white">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-white">Gestión y Programación de Shifts</h4>
          <p className="text-secondary small mb-0">
            Organiza los bloques schedules por días (Lunes a Sábado), branches y teachers asignados.
          </p>
        </div>

        <Button
          variant="primary"
          className="hero-btn fw-bold px-4 py-2 d-inline-flex align-items-center gap-2 rounded-pill shadow"
          onClick={() => handleAbrirModal()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Nuevo Shift
        </Button>
      </div>

      {/* Filters */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label className="small text-secondary">Filtrar por Activity</Form.Label>
            <Form.Select
              value={filterActividad}
              onChange={(e) => setFiltroActividad(e.target.value)}
            >
              <option value="todas">Todas las Activities</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="small text-secondary">Filtrar por Días</Form.Label>
            <Form.Select
              value={filterDia}
              onChange={(e) => setFiltroDia(e.target.value)}
            >
              <option value="todos">Todos los Días</option>
              <option value="Lunes a Sábado">Lunes a Sábado</option>
              <option value="Lunes a Viernes">Lunes a Viernes</option>
              <option value="Lunes, Miércoles y Viernes">Lunes, Miércoles y Viernes</option>
              <option value="Martes y Jueves">Martes y Jueves</option>
              <option value="Sábados">Sábados</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="small text-secondary">Filtrar por Branch</Form.Label>
            <Form.Select
              value={filterSede}
              onChange={(e) => setFiltroSede(e.target.value)}
            >
              <option value="">Todas las Branches</option>
              {branches.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-secondary">Cargando shifts...</p>
        </div>
      ) : shiftsFiltrados.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <p className="mb-0">No se encontraron shifts con los filters seleccionados.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <Table className="admin-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Schedule</th>
                  <th>Días</th>
                  <th>Teacher a Cargo</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {shiftsPaginados.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="fw-bold text-white">
                        {t.activity?.name || 'Activity sin asignar'}
                      </div>
                    </td>
                    <td>
                      <span className="badge-token-accent">
                        {t.startTime} - {t.endTime} hs
                      </span>
                    </td>
                    <td>
                      <span className="text-white small">{t.dayOfWeek}</span>
                    </td>
                    <td>
                      {t.teacher ? (
                        <span className="fw-medium text-white small">
                          {t.teacher.name} {t.teacher.lastname}
                        </span>
                      ) : (
                        <span className="text-secondary small">Sin teacher</span>
                      )}
                    </td>
                    <td>
                      {t.branch ? (
                        <span className="small text-white">{t.branch.name}</span>
                      ) : (
                        <span className="text-secondary small">General</span>
                      )}
                    </td>
                    <td>
                      <span className={t.status ? 'badge-status-active' : 'badge-status-inactive'}>
                        {t.status ? 'Disponible' : 'Pausado'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <Button
                          size="sm"
                          className="btn-token-outline-warning rounded-pill px-3 py-1"
                          onClick={() => handleToggleEstado(t.id)}
                          title={t.status ? 'Pausar shift' : 'Habilitar shift'}
                        >
                          {t.status ? 'Pausar' : 'Habilitar'}
                        </Button>
                        <Button
                          size="sm"
                          className="btn-token-outline-primary rounded-pill px-3 py-1"
                          onClick={() => handleAbrirModal(t)}
                          title="Editar shift"
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          className="btn-token-outline-danger rounded-pill px-3 py-1"
                          onClick={() => onPedirEliminar({
                            type: 'shift',
                            id: t.id,
                            name: `${t.activity?.name || 'Shift'} (${t.startTime} - ${t.endTime})`
                          })}
                          title="Eliminar permanentemente"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Controls de Paginación */}
          {totalPaginas > 1 && (
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-4 pt-3 border-top border-secondary">
              <span className="small text-secondary">
                Mostrando shifts {indiceInicio + 1} a {Math.min(indiceInicio + elementosPorPagina, shiftsFiltrados.length)} de {shiftsFiltrados.length}
              </span>

              <Pagination className="mb-0 admin-pagination">
                <Pagination.Prev
                  disabled={paginaActual === 1}
                  onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                />
                {[...Array(totalPaginas)].map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={paginaActual === i + 1}
                    onClick={() => setPaginaActual(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Modal Crear / Editar Shift */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="glass-card text-white">
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title className="fw-bold">
            {shiftEditando ? 'Editar Shift Schedule' : 'Crear Nuevo Shift'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGuardar}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Activity *</Form.Label>
                  <Form.Select
                    required
                    value={formData.activity_id}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const act = activities.find((a) => a.id?.toString() === selectedId);
                      setFormData((prev) => {
                        let nuevaHoraFin = prev.endTime;
                        if (act?.duration && esHoraValida(prev.startTime)) {
                          const [h, m] = prev.startTime.split(':').map(Number);
                          const total = Math.min(23 * 60 + 59, h * 60 + m + act.duration);
                          nuevaHoraFin = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
                        }
                        return {
                          ...prev,
                          activity_id: selectedId,
                          teacher_id: act?.teacher_id ? act.teacher_id.toString() : (act?.teacher?.id ? act.teacher.id.toString() : prev.teacher_id),
                          branch_id: act?.branch_id ? act.branch_id.toString() : (act?.branch?.id ? act.branch.id.toString() : prev.branch_id),
                          endTime: nuevaHoraFin
                        };
                      });
                    }}
                  >
                    <option value="">-- Seleccionar Activity --</option>
                    {activities.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} {a.teacher ? `(Teacher. ${a.teacher.name} ${a.teacher.lastname})` : ''}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center gap-1 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Schedule de Home *
                  </Form.Label>
                  <Form.Control
                    type="time"
                    required
                    step="60"
                    className="custom-time-input"
                    value={formData.startTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => {
                        const act = activities.find((a) => a.id?.toString() === prev.activity_id?.toString());
                        const dur = act?.duration || 60;
                        let nuevaHoraFin = prev.endTime;
                        if (esHoraValida(val)) {
                          const [h, m] = val.split(':').map(Number);
                          const total = Math.min(23 * 60 + 59, h * 60 + m + dur);
                          nuevaHoraFin = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
                        }
                        return { ...prev, startTime: val, endTime: nuevaHoraFin };
                      });
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center gap-1 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Schedule de Fin *
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
              {esHoraValida(formData.startTime) && esHoraValida(formData.endTime) && convertirHoraAMin(formData.endTime) <= convertirHoraAMin(formData.startTime) && (
                <Col md={12}>
                  <div className="alert alert-danger py-1 px-2 small mb-0 d-flex align-items-center gap-1">
                    <span>⚠️ El schedule de fin ({formData.endTime}) debe ser posterior al home ({formData.startTime}).</span>
                  </div>
                </Col>
              )}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Días de la Semana *</Form.Label>
                  <Form.Select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  >
                    <option value="Lunes a Sábado">Lunes a Sábado (Todos los días)</option>
                    <option value="Lunes a Viernes">Lunes a Viernes</option>
                    <option value="Lunes, Miércoles y Viernes">Lunes, Miércoles y Viernes</option>
                    <option value="Martes y Jueves">Martes y Jueves</option>
                    <option value="Sábados">Sábados</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Branch</Form.Label>
                  <Form.Select
                    value={formData.branch_id}
                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  >
                    <option value="">-- Todas las Branches --</option>
                    {branches.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.city})
                      </option>
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
                    {teachers.map((p) => {
                      const branchProfObj = branches.find((s) => s.id?.toString() === p.branch_id?.toString());
                      const esMismaSede = !effectiveSedeForm || !p.branch_id || p.branch_id.toString() === effectiveSedeForm.toString();

                      return (
                        <option key={p.id} value={p.id} disabled={!esMismaSede}>
                          {p.name} {p.lastname} ({p.specialty}){branchProfObj ? ` • ${branchProfObj.name}` : ''}{!esMismaSede ? ' [Branch incompatible]' : ''}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-secondary">
            <Button variant="outline-light" onClick={() => setShowModal(false)} disabled={guardando} className="rounded-pill px-3">
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={guardando} className="hero-btn rounded-pill px-4 fw-bold">
              {guardando ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Guardando...
                </>
              ) : shiftEditando ? (
                'Guardar Cambios'
              ) : (
                'Crear Shift'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
};

export default ShiftsManager;
