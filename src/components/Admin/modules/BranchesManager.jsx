import React, { useState, useMemo } from 'react';
import { Card, Button, Row, Col, Table, Form, InputGroup, Modal, Spinner, Badge, Collapse } from 'react-bootstrap';

const DIAS_SEMANA_DEFAULT = [
  { day: 'Lunes', abierto: true, hora_home: '07:00', hora_fin: '23:00' },
  { day: 'Martes', abierto: true, hora_home: '07:00', hora_fin: '23:00' },
  { day: 'Miércoles', abierto: true, hora_home: '07:00', hora_fin: '23:00' },
  { day: 'Jueves', abierto: true, hora_home: '07:00', hora_fin: '23:00' },
  { day: 'Viernes', abierto: true, hora_home: '07:00', hora_fin: '23:00' },
  { day: 'Sábado', abierto: true, hora_home: '08:00', hora_fin: '20:00' },
  { day: 'Domingo', abierto: false, hora_home: '09:00', hora_fin: '14:00' }
];

const MAP_ABREV = {
  'Lunes': 'Lun',
  'Martes': 'Mar',
  'Miércoles': 'Mié',
  'Jueves': 'Jue',
  'Viernes': 'Vie',
  'Sábado': 'Sáb',
  'Domingo': 'Dom'
};

const ORDEN_DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const abreviarDia = (day) => MAP_ABREV[day] || day;

const sonConsecutivos = (days) => {
  if (days.length <= 1) return true;
  const indices = days.map(d => ORDEN_DIAS.indexOf(d));
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i - 1] + 1) return false;
  }
  return true;
};

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const calcularSlots = (horaInicio, endTime, intervaloMinutos) => {
  const slots = [];
  const startMin = timeToMinutes(horaInicio);
  const endMin = timeToMinutes(endTime);
  const interval = parseInt(intervaloMinutos, 10) || 60;

  if (startMin >= endMin || interval <= 0) return slots;

  let current = startMin;
  while (current + interval <= endMin) {
    slots.push({
      home: minutesToTime(current),
      fin: minutesToTime(current + interval)
    });
    current += interval;
  }
  return slots;
};

const generarResumenHorarios = (days) => {
  if (!Array.isArray(days) || days.length === 0) return 'Sin schedules configurados';

  const diasAbiertos = days.filter(d => d.abierto && d.hora_home && d.hora_fin);
  if (diasAbiertos.length === 0) return 'Cerrado temporalmente';

  const grupos = [];
  days.forEach(d => {
    if (!d.abierto) return;
    const horarioKey = `${d.hora_home} a ${d.hora_fin} hs`;
    const ultimoGrupo = grupos[grupos.length - 1];
    if (ultimoGrupo && ultimoGrupo.horarioKey === horarioKey) {
      ultimoGrupo.days.push(d.day);
    } else {
      grupos.push({ horarioKey, days: [d.day] });
    }
  });

  const partes = grupos.map(g => {
    const diasStr = g.days.length === 1
      ? g.days[0]
      : (g.days.length > 2 && sonConsecutivos(g.days)
        ? `${abreviarDia(g.days[0])} a ${abreviarDia(g.days[g.days.length - 1])}`
        : g.days.map(abreviarDia).join(', '));
    return `${diasStr}: ${g.horarioKey}`;
  });

  return partes.join(' | ') || 'Lunes a Sábado';
};

const BranchesManager = ({
  branches = [],
  teachers = [],
  cargando,
  onRecargar,
  onMostrarAlerta,
  onPedirEliminar,
  apiBase
}) => {
  const [filterTexto, setFiltroTexto] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [branchEditando, setSedeEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mostrarPreviewSlots, setMostrarPreviewSlots] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'Córdoba Capital',
    phone: '',
    email: '',
    capacity: 150
  });

  // Configuración de Días y Schedules
  const [diasHorarios, setDiasHorarios] = useState(DIAS_SEMANA_DEFAULT);

  // Configuración de Shifts Automáticos de Musculación
  const [generarMusculacion, setGenerarMusculacion] = useState(true);
  const [durationMusculacion, setDuracionMusculacion] = useState(60);
  const [capacityMusculacion, setCupoMusculacion] = useState(30);
  const [teacherMusculacion, setProfesorMusculacion] = useState('');

  const handleAbrirModal = (branch = null) => {
    if (branch) {
      setSedeEditando(branch);
      setFormData({
        name: branch.name || '',
        address: branch.address || '',
        city: branch.city || 'Córdoba Capital',
        phone: branch.phone || '',
        email: branch.email || '',
        capacity: branch.capacity || 150
      });
      // Mantener schedules existentes o predeterminado
      if (branch.schedule_days && Array.isArray(branch.schedule_days)) {
        setDiasHorarios(branch.schedule_days);
      } else {
        setDiasHorarios(DIAS_SEMANA_DEFAULT.map(d => ({ ...d })));
      }
      setGenerarMusculacion(false); // Por defecto al editar no genera duplicados
    } else {
      setSedeEditando(null);
      setFormData({
        name: '',
        address: '',
        city: 'Córdoba Capital',
        phone: '',
        email: '',
        capacity: 150
      });
      setDiasHorarios(DIAS_SEMANA_DEFAULT.map(d => ({ ...d })));
      setGenerarMusculacion(true);
      setDuracionMusculacion(60);
      setCupoMusculacion(30);
      setProfesorMusculacion('');
    }
    setMostrarPreviewSlots(false);
    setShowModal(true);
  };

  // Modificar status o schedule de un día
  const handleDiaChange = (index, field, value) => {
    setDiasHorarios(prev => {
      const nuevo = [...prev];
      nuevo[index] = { ...nuevo[index], [field]: value };
      return nuevo;
    });
  };

  // Acciones rápidas de configuración de días
  const handleCopiarLunesAViernes = () => {
    const lun = diasHorarios.find(d => d.day === 'Lunes') || diasHorarios[0];
    setDiasHorarios(prev =>
      prev.map(d => {
        if (['Martes', 'Miércoles', 'Jueves', 'Viernes'].includes(d.day)) {
          return {
            ...d,
            abierto: lun.abierto,
            hora_home: lun.hora_home,
            hora_fin: lun.hora_fin
          };
        }
        return d;
      })
    );
  };

  const handleMarcarLunSab = () => {
    setDiasHorarios(prev =>
      prev.map(d => ({
        ...d,
        abierto: d.day !== 'Domingo'
      }))
    );
  };

  const handleMarcarTodos = () => {
    setDiasHorarios(prev => prev.map(d => ({ ...d, abierto: true })));
  };

  // Cálculo en tiempo real de shifts generados
  const shiftsPorDiaCalculados = useMemo(() => {
    return diasHorarios.map(d => {
      if (!d.abierto || !d.hora_home || !d.hora_fin) {
        return { day: d.day, abierto: false, slots: [] };
      }
      const slots = calcularSlots(d.hora_home, d.hora_fin, durationMusculacion);
      return { day: d.day, abierto: true, slots };
    });
  }, [diasHorarios, durationMusculacion]);

  const totalTurnosSemanales = useMemo(() => {
    return shiftsPorDiaCalculados.reduce((acc, curr) => acc + (curr.abierto ? curr.slots.length : 0), 0);
  }, [shiftsPorDiaCalculados]);

  const horarioResumenStr = useMemo(() => {
    return generarResumenHorarios(diasHorarios);
  }, [diasHorarios]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const endpoint = branchEditando
        ? `${apiBase}/branches/${branchEditando.id}`
        : `${apiBase}/branches`;
      const method = branchEditando ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        schedule_days: diasHorarios,
        opening_hours: horarioResumenStr,
        generar_shifts_musculacion: !branchEditando && generarMusculacion,
        duration_shift_musculacion: durationMusculacion,
        capacity_musculacion: capacityMusculacion,
        teacher_id: teacherMusculacion ? parseInt(teacherMusculacion, 10) : null
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onMostrarAlerta(data.message);
        setShowModal(false);
        onRecargar();
      } else {
        onMostrarAlerta(data.message || 'Error al guardar branch', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al guardar branch', 'danger');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      const res = await fetch(`${apiBase}/branches/${id}/toggle-status`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok && data.success) {
        onMostrarAlerta(data.message);
        onRecargar();
      } else {
        onMostrarAlerta(data.message || 'Error al cambiar status de la branch', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al actualizar status', 'danger');
    }
  };

  const branchesFiltradas = branches.filter((s) => {
    const texto = `${s.name} ${s.address} ${s.city} ${s.email}`.toLowerCase();
    return texto.includes(filterTexto.toLowerCase());
  });

  return (
    <Card className="glass-card border-0 p-4 text-white">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-white">Gestión de Branches y Sucursales</h4>
          <p className="text-secondary small mb-0">
            Administra los establecimientos físicos, días de apertura, schedules y generación automática de shifts.
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
          Nueva Branch
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
              placeholder="Buscar branch por name, dirección o city..."
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

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-secondary">Cargando branches...</p>
        </div>
      ) : branchesFiltradas.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <p className="mb-0">No se encontraron branches.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>Name / City</th>
                <th>Ubicación</th>
                <th>Contacto</th>
                <th>Schedules de Atención</th>
                <th>Capacity</th>
                <th>Status</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {branchesFiltradas.map((branch) => (
                <tr key={branch.id}>
                  <td>
                    <div className="fw-bold text-white">{branch.name}</div>
                    <small className="text-secondary fw-medium">{branch.city}</small>
                  </td>
                  <td>
                    <div className="small text-white">{branch.address}</div>
                  </td>
                  <td>
                    <div className="small text-white">{branch.email || '-'}</div>
                    <small className="text-secondary">{branch.phone || '-'}</small>
                  </td>
                  <td>
                    <span className="badge-token-subdued" style={{ whiteSpace: 'normal', maxWidth: '320px', display: 'inline-block' }}>
                      {branch.opening_hours}
                    </span>
                  </td>
                  <td>
                    <span className="fw-bold text-white">{branch.capacity} personas</span>
                  </td>
                  <td>
                    <span className={branch.status ? 'badge-status-active' : 'badge-status-inactive'}>
                      {branch.status ? 'Operativa' : 'Pausada'}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <Button
                        size="sm"
                        className="btn-token-outline-warning rounded-pill px-3 py-1"
                        onClick={() => handleToggleEstado(branch.id)}
                        title={branch.status ? 'Pausar branch' : 'Habilitar branch'}
                      >
                        {branch.status ? 'Pausar' : 'Habilitar'}
                      </Button>
                      <Button
                        size="sm"
                        className="btn-token-outline-primary rounded-pill px-3 py-1"
                        onClick={() => handleAbrirModal(branch)}
                        title="Editar branch"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        className="btn-token-outline-danger rounded-pill px-3 py-1"
                        onClick={() => onPedirEliminar({
                          type: 'branch',
                          id: branch.id,
                          name: branch.name
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
      )}

      {/* Modal Crear / Editar Branch (Ampliación XL & Responsive para PC y Mobile) */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
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
          <Form id="branch-form" onSubmit={handleGuardar}>
            
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
                      placeholder="Ej: Córdoba Capital"
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
                    onClick={handleCopiarLunesAViernes}
                    title="Copia el schedule de Lunes a Martes, Miércoles, Jueves y Viernes"
                  >
                    ⚡ Copiar Lun a Mar-Vie
                  </button>
                  <button
                    type="button"
                    className="btn branch-quick-btn"
                    onClick={handleMarcarLunSab}
                  >
                    Lun a Sáb
                  </button>
                  <button
                    type="button"
                    className="btn branch-quick-btn"
                    onClick={handleMarcarTodos}
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
                            onChange={(e) => handleDiaChange(index, 'abierto', e.target.checked)}
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
                                  onChange={(e) => handleDiaChange(index, 'hora_home', e.target.value)}
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
                                  onChange={(e) => handleDiaChange(index, 'hora_fin', e.target.value)}
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

            {/* SECCIÓN 3: Generación Automática de Shifts de Musculación */}
            {!branchEditando && (
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
                            Teacher a Cargo (Opcional)
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
            )}

          </Form>
        </Modal.Body>

        <Modal.Footer className="border-secondary px-4 py-3">
          <Button
            variant="outline-light"
            onClick={() => setShowModal(false)}
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
    </Card>
  );
};

export default BranchesManager;
