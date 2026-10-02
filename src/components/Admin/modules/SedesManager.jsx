import React, { useState, useMemo } from 'react';
import { Card, Button, Row, Col, Table, Form, InputGroup, Modal, Spinner, Badge, Collapse } from 'react-bootstrap';

const DIAS_SEMANA_DEFAULT = [
  { dia: 'Lunes', abierto: true, hora_inicio: '07:00', hora_fin: '23:00' },
  { dia: 'Martes', abierto: true, hora_inicio: '07:00', hora_fin: '23:00' },
  { dia: 'Miércoles', abierto: true, hora_inicio: '07:00', hora_fin: '23:00' },
  { dia: 'Jueves', abierto: true, hora_inicio: '07:00', hora_fin: '23:00' },
  { dia: 'Viernes', abierto: true, hora_inicio: '07:00', hora_fin: '23:00' },
  { dia: 'Sábado', abierto: true, hora_inicio: '08:00', hora_fin: '20:00' },
  { dia: 'Domingo', abierto: false, hora_inicio: '09:00', hora_fin: '14:00' }
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

const abreviarDia = (dia) => MAP_ABREV[dia] || dia;

const sonConsecutivos = (dias) => {
  if (dias.length <= 1) return true;
  const indices = dias.map(d => ORDEN_DIAS.indexOf(d));
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

const calcularSlots = (horaInicio, horaFin, intervaloMinutos) => {
  const slots = [];
  const startMin = timeToMinutes(horaInicio);
  const endMin = timeToMinutes(horaFin);
  const interval = parseInt(intervaloMinutos, 10) || 60;

  if (startMin >= endMin || interval <= 0) return slots;

  let current = startMin;
  while (current + interval <= endMin) {
    slots.push({
      inicio: minutesToTime(current),
      fin: minutesToTime(current + interval)
    });
    current += interval;
  }
  return slots;
};

const generarResumenHorarios = (dias) => {
  if (!Array.isArray(dias) || dias.length === 0) return 'Sin horarios configurados';

  const diasAbiertos = dias.filter(d => d.abierto && d.hora_inicio && d.hora_fin);
  if (diasAbiertos.length === 0) return 'Cerrado temporalmente';

  const grupos = [];
  dias.forEach(d => {
    if (!d.abierto) return;
    const horarioKey = `${d.hora_inicio} a ${d.hora_fin} hs`;
    const ultimoGrupo = grupos[grupos.length - 1];
    if (ultimoGrupo && ultimoGrupo.horarioKey === horarioKey) {
      ultimoGrupo.dias.push(d.dia);
    } else {
      grupos.push({ horarioKey, dias: [d.dia] });
    }
  });

  const partes = grupos.map(g => {
    const diasStr = g.dias.length === 1
      ? g.dias[0]
      : (g.dias.length > 2 && sonConsecutivos(g.dias)
        ? `${abreviarDia(g.dias[0])} a ${abreviarDia(g.dias[g.dias.length - 1])}`
        : g.dias.map(abreviarDia).join(', '));
    return `${diasStr}: ${g.horarioKey}`;
  });

  return partes.join(' | ') || 'Lunes a Sábado';
};

const SedesManager = ({
  sedes = [],
  profesores = [],
  cargando,
  onRecargar,
  onMostrarAlerta,
  onPedirEliminar,
  apiBase
}) => {
  const [filtroTexto, setFiltroTexto] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [sedeEditando, setSedeEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mostrarPreviewSlots, setMostrarPreviewSlots] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: 'Córdoba Capital',
    telefono: '',
    email: '',
    capacidad: 150
  });

  // Configuración de Días y Horarios
  const [diasHorarios, setDiasHorarios] = useState(DIAS_SEMANA_DEFAULT);

  // Configuración de Turnos Automáticos de Musculación
  const [generarMusculacion, setGenerarMusculacion] = useState(true);
  const [duracionMusculacion, setDuracionMusculacion] = useState(60);
  const [cupoMusculacion, setCupoMusculacion] = useState(30);
  const [profesorMusculacion, setProfesorMusculacion] = useState('');

  const handleAbrirModal = (sede = null) => {
    if (sede) {
      setSedeEditando(sede);
      setFormData({
        nombre: sede.nombre || '',
        direccion: sede.direccion || '',
        ciudad: sede.ciudad || 'Córdoba Capital',
        telefono: sede.telefono || '',
        email: sede.email || '',
        capacidad: sede.capacidad || 150
      });
      // Mantener horarios existentes o predeterminado
      if (sede.horarios_dias && Array.isArray(sede.horarios_dias)) {
        setDiasHorarios(sede.horarios_dias);
      } else {
        setDiasHorarios(DIAS_SEMANA_DEFAULT.map(d => ({ ...d })));
      }
      setGenerarMusculacion(false); // Por defecto al editar no genera duplicados
    } else {
      setSedeEditando(null);
      setFormData({
        nombre: '',
        direccion: '',
        ciudad: 'Córdoba Capital',
        telefono: '',
        email: '',
        capacidad: 150
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

  // Modificar estado o horario de un día
  const handleDiaChange = (index, field, value) => {
    setDiasHorarios(prev => {
      const nuevo = [...prev];
      nuevo[index] = { ...nuevo[index], [field]: value };
      return nuevo;
    });
  };

  // Acciones rápidas de configuración de días
  const handleCopiarLunesAViernes = () => {
    const lun = diasHorarios.find(d => d.dia === 'Lunes') || diasHorarios[0];
    setDiasHorarios(prev =>
      prev.map(d => {
        if (['Martes', 'Miércoles', 'Jueves', 'Viernes'].includes(d.dia)) {
          return {
            ...d,
            abierto: lun.abierto,
            hora_inicio: lun.hora_inicio,
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
        abierto: d.dia !== 'Domingo'
      }))
    );
  };

  const handleMarcarTodos = () => {
    setDiasHorarios(prev => prev.map(d => ({ ...d, abierto: true })));
  };

  // Cálculo en tiempo real de turnos generados
  const turnosPorDiaCalculados = useMemo(() => {
    return diasHorarios.map(d => {
      if (!d.abierto || !d.hora_inicio || !d.hora_fin) {
        return { dia: d.dia, abierto: false, slots: [] };
      }
      const slots = calcularSlots(d.hora_inicio, d.hora_fin, duracionMusculacion);
      return { dia: d.dia, abierto: true, slots };
    });
  }, [diasHorarios, duracionMusculacion]);

  const totalTurnosSemanales = useMemo(() => {
    return turnosPorDiaCalculados.reduce((acc, curr) => acc + (curr.abierto ? curr.slots.length : 0), 0);
  }, [turnosPorDiaCalculados]);

  const horarioResumenStr = useMemo(() => {
    return generarResumenHorarios(diasHorarios);
  }, [diasHorarios]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const endpoint = sedeEditando
        ? `${apiBase}/sedes/${sedeEditando.id}`
        : `${apiBase}/sedes`;
      const method = sedeEditando ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        horarios_dias: diasHorarios,
        horario_apertura: horarioResumenStr,
        generar_turnos_musculacion: !sedeEditando && generarMusculacion,
        duracion_turno_musculacion: duracionMusculacion,
        cupo_musculacion: cupoMusculacion,
        profesor_id: profesorMusculacion ? parseInt(profesorMusculacion, 10) : null
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.exito) {
        onMostrarAlerta(data.mensaje);
        setShowModal(false);
        onRecargar();
      } else {
        onMostrarAlerta(data.mensaje || 'Error al guardar sede', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al guardar sede', 'danger');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      const res = await fetch(`${apiBase}/sedes/${id}/toggle-estado`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok && data.exito) {
        onMostrarAlerta(data.mensaje);
        onRecargar();
      } else {
        onMostrarAlerta(data.mensaje || 'Error al cambiar estado de la sede', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al actualizar estado', 'danger');
    }
  };

  const sedesFiltradas = sedes.filter((s) => {
    const texto = `${s.nombre} ${s.direccion} ${s.ciudad} ${s.email}`.toLowerCase();
    return texto.includes(filtroTexto.toLowerCase());
  });

  return (
    <Card className="glass-card border-0 p-4 text-white">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-white">Gestión de Sedes y Sucursales</h4>
          <p className="text-secondary small mb-0">
            Administra los establecimientos físicos, días de apertura, horarios y generación automática de turnos.
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
              placeholder="Buscar sede por nombre, dirección o ciudad..."
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
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-secondary">Cargando sedes...</p>
        </div>
      ) : sedesFiltradas.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <p className="mb-0">No se encontraron sedes.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>Nombre / Ciudad</th>
                <th>Ubicación</th>
                <th>Contacto</th>
                <th>Horarios de Atención</th>
                <th>Capacidad</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sedesFiltradas.map((sede) => (
                <tr key={sede.id}>
                  <td>
                    <div className="fw-bold text-white">{sede.nombre}</div>
                    <small className="text-secondary fw-medium">{sede.ciudad}</small>
                  </td>
                  <td>
                    <div className="small text-white">{sede.direccion}</div>
                  </td>
                  <td>
                    <div className="small text-white">{sede.email || '-'}</div>
                    <small className="text-secondary">{sede.telefono || '-'}</small>
                  </td>
                  <td>
                    <span className="badge-token-subdued" style={{ whiteSpace: 'normal', maxWidth: '320px', display: 'inline-block' }}>
                      {sede.horario_apertura}
                    </span>
                  </td>
                  <td>
                    <span className="fw-bold text-white">{sede.capacidad} personas</span>
                  </td>
                  <td>
                    <span className={sede.estado ? 'badge-status-active' : 'badge-status-inactive'}>
                      {sede.estado ? 'Operativa' : 'Pausada'}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <Button
                        size="sm"
                        className="btn-token-outline-warning rounded-pill px-3 py-1"
                        onClick={() => handleToggleEstado(sede.id)}
                        title={sede.estado ? 'Pausar sede' : 'Habilitar sede'}
                      >
                        {sede.estado ? 'Pausar' : 'Habilitar'}
                      </Button>
                      <Button
                        size="sm"
                        className="btn-token-outline-primary rounded-pill px-3 py-1"
                        onClick={() => handleAbrirModal(sede)}
                        title="Editar sede"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        className="btn-token-outline-danger rounded-pill px-3 py-1"
                        onClick={() => onPedirEliminar({
                          type: 'sede',
                          id: sede.id,
                          nombre: sede.nombre
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

      {/* Modal Crear / Editar Sede (Ampliación XL & Responsive para PC y Mobile) */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        scrollable
        size="xl"
        className="sede-modal-xl"
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
            {sedeEditando ? `Editar Sede: ${sedeEditando.nombre}` : 'Registrar Nueva Sede & Configurar Turnos'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-3 p-md-4">
          <Form id="sede-form" onSubmit={handleGuardar}>
            
            {/* SECCIÓN 1: Datos Principales de la Sede */}
            <div className="sede-section-card">
              <h6 className="text-uppercase text-secondary fw-bold small mb-3 d-flex align-items-center gap-2">
                <span className="badge-token-accent">1</span> Información General del Establecimiento
              </h6>
              
              <Row className="g-3">
                <Col md={7}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-white">Nombre de la Sede *</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      placeholder="Ej: FitApp Sede Centro Norte"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-white">Ciudad *</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      placeholder="Ej: Córdoba Capital"
                      value={formData.ciudad}
                      onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
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
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-white">Capacidad Máxima *</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      required
                      placeholder="Ej: 200"
                      value={formData.capacidad}
                      onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value, 10) || 0 })}
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
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, '') })}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-white">Email de la Sede</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Ej: contacto.sede@gymfit.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* SECCIÓN 2: Días Abiertos y Horarios Específicos por Día */}
            <div className="sede-section-card">
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                <div>
                  <h6 className="text-uppercase text-secondary fw-bold small mb-1 d-flex align-items-center gap-2">
                    <span className="badge-token-accent">2</span> Días de Atención & Horarios por Día
                  </h6>
                  <p className="text-secondary small mb-0">
                    Selecciona qué días abre la sede y configura con precisión la hora de apertura y cierre para cada día.
                  </p>
                </div>

                {/* Acciones Rápidas */}
                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn sede-quick-btn"
                    onClick={handleCopiarLunesAViernes}
                    title="Copia el horario de Lunes a Martes, Miércoles, Jueves y Viernes"
                  >
                    ⚡ Copiar Lun a Mar-Vie
                  </button>
                  <button
                    type="button"
                    className="btn sede-quick-btn"
                    onClick={handleMarcarLunSab}
                  >
                    Lun a Sáb
                  </button>
                  <button
                    type="button"
                    className="btn sede-quick-btn"
                    onClick={handleMarcarTodos}
                  >
                    Todos los días
                  </button>
                </div>
              </div>

              {/* Lista de Días de la Semana */}
              <Row className="g-3 mb-4">
                {diasHorarios.map((item, index) => {
                  const horasAbierto = item.abierto && item.hora_inicio && item.hora_fin
                    ? ((timeToMinutes(item.hora_fin) - timeToMinutes(item.hora_inicio)) / 60).toFixed(1).replace('.0', '')
                    : 0;

                  return (
                    <Col xs={12} md={6} lg={4} key={item.dia}>
                      <div className={`sede-dia-card h-100 ${item.abierto ? 'abierto' : 'cerrado'}`}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="fw-bold text-white fs-6">
                            {item.dia}
                          </span>
                          <Form.Check
                            type="switch"
                            id={`switch-dia-${item.dia}`}
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
                                  value={item.hora_inicio}
                                  onChange={(e) => handleDiaChange(index, 'hora_inicio', e.target.value)}
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
                                {timeToMinutes(item.hora_fin) > timeToMinutes(item.hora_inicio)
                                  ? `${horasAbierto} hs de atención`
                                  : '⚠️ Horario inválido'}
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

              {/* Resumen del Horario */}
              <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-50 d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <span className="text-secondary small fw-semibold d-block">Resumen Formateado:</span>
                  <span className="fw-bold text-info small">{horarioResumenStr}</span>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: Generación Automática de Turnos de Musculación */}
            {!sedeEditando && (
              <div className="sede-section-card border-primary border-opacity-50">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6 className="text-uppercase text-white fw-bold small mb-1 d-flex align-items-center gap-2">
                      <span className="badge-token-brand">3</span> Generación Automática de Turnos de Musculación
                    </h6>
                    <p className="text-secondary small mb-0">
                      Crea automáticamente la actividad <strong>"Musculación & Sala de Pesas"</strong> y todos sus turnos adaptados al horario de cada día.
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
                            Intervalo / Duración del Turno *
                          </Form.Label>
                          <Form.Select
                            value={duracionMusculacion}
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
                            Cupo Máximo por Turno *
                          </Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            value={cupoMusculacion}
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
                            value={profesorMusculacion}
                            onChange={(e) => setProfesorMusculacion(e.target.value)}
                          >
                            <option value="">Sin profesor asignado inicialmente</option>
                            {profesores.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.nombre} {p.apellido} ({p.especialidad})
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Caja de Vista Previa de Turnos */}
                    <div className="preview-turnos-box">
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-primary rounded-pill px-3 py-1 fw-bold fs-6">
                            {totalTurnosSemanales} turnos
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
                          {mostrarPreviewSlots ? 'Ocultar Detalle' : 'Ver Detalle de Horarios'}
                        </Button>
                      </div>

                      <Collapse in={mostrarPreviewSlots}>
                        <div className="mt-3 pt-3 border-top border-secondary border-opacity-50">
                          <Row className="g-2">
                            {turnosPorDiaCalculados.map(item => (
                              <Col xs={12} md={6} key={item.dia}>
                                <div className="p-2 rounded bg-dark bg-opacity-75">
                                  <div className="d-flex justify-content-between mb-1">
                                    <span className="fw-bold text-white small">{item.dia}:</span>
                                    <span className="text-secondary small">
                                      {item.abierto ? `${item.slots.length} turnos` : 'Cerrado'}
                                    </span>
                                  </div>
                                  {item.abierto && item.slots.length > 0 ? (
                                    <div className="d-flex flex-wrap gap-1">
                                      {item.slots.map((s, idx) => (
                                        <span key={idx} className="slot-pill-preview">
                                          {s.inicio} - {s.fin}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-secondary small fst-italic">Sin turnos para este día</span>
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
            form="sede-form"
            disabled={guardando}
            className="hero-btn rounded-pill px-5 fw-bold"
          >
            {guardando ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Guardando Sede...
              </>
            ) : sedeEditando ? (
              'Guardar Cambios'
            ) : (
              'Crear Sede & Generar Turnos'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default SedesManager;
