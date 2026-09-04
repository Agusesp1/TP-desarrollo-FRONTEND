import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, Modal, Alert, Spinner, Nav, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const API_BASE = 'http://localhost:3000/api';

const Admin = () => {
  const { user } = useAuth();

  // Active Tab: profesores | sedes | actividades | turnos
  const [activeTab, setActiveTab] = useState('profesores');

  // Stats
  const [stats, setStats] = useState({
    totalSocios: 0,
    totalProfesores: 0,
    profesoresActivos: 0,
    totalSedes: 0,
    sedesActivas: 0,
    totalActividades: 0,
    actividadesActivas: 0,
    totalTurnos: 0,
    turnosActivos: 0
  });

  // Profesores State
  const [profesores, setProfesores] = useState([]);
  const [filtroProfesor, setFiltroProfesor] = useState('');
  const [filtroSedeProf, setFiltroSedeProf] = useState('');
  const [cargandoProfesores, setCargandoProfesores] = useState(false);

  // Sedes State
  const [sedes, setSedes] = useState([]);
  const [cargandoSedes, setCargandoSedes] = useState(false);

  // Actividades State
  const [actividades, setActividades] = useState([]);
  const [filtroActividad, setFiltroActividad] = useState('');
  const [cargandoActividades, setCargandoActividades] = useState(false);

  // Turnos State
  const [turnos, setTurnos] = useState([]);
  const [filtroTurnoActividad, setFiltroTurnoActividad] = useState('');
  const [filtroTurnoDia, setFiltroTurnoDia] = useState('todos');
  const [filtroTurnoSede, setFiltroTurnoSede] = useState('');
  const [cargandoTurnos, setCargandoTurnos] = useState(false);

  // Modal Profesor State
  const [showModalProfesor, setShowModalProfesor] = useState(false);
  const [profesorEditando, setProfesorEditando] = useState(null);
  const [profesorForm, setProfesorForm] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    especialidad: 'Musculación',
    turno: 'Mañana',
    sede_id: ''
  });
  const [guardandoProfesor, setGuardandoProfesor] = useState(false);

  // Modal Sede State
  const [showModalSede, setShowModalSede] = useState(false);
  const [sedeEditando, setSedeEditando] = useState(null);
  const [sedeForm, setSedeForm] = useState({
    nombre: '',
    direccion: '',
    ciudad: 'Córdoba Capital',
    telefono: '',
    email: '',
    horario_apertura: '07:00 a 23:00 hs',
    capacidad: 150
  });
  const [guardandoSede, setGuardandoSede] = useState(false);

  // Modal Actividad State
  const [showModalActividad, setShowModalActividad] = useState(false);
  const [actividadEditando, setActividadEditando] = useState(null);
  const [actividadForm, setActividadForm] = useState({
    nombre: '',
    duracion: 60,
    cupo: 20,
    descripcion: ''
  });
  const [guardandoActividad, setGuardandoActividad] = useState(false);

  // Modal Turno State
  const [showModalTurno, setShowModalTurno] = useState(false);
  const [turnoEditando, setTurnoEditando] = useState(null);
  const [turnoForm, setTurnoForm] = useState({
    actividad_id: '',
    horarioInicio: '07:00',
    horaFin: '09:00',
    dia_semana: 'Lunes a Sábado',
    profesor_id: '',
    sede_id: ''
  });
  const [guardandoTurno, setGuardandoTurno] = useState(false);

  // Modal Delete / Confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState(null); // { type: 'profesor' | 'sede' | 'actividad' | 'turno', id, nombre }
  const [eliminando, setEliminando] = useState(false);

  // Alerts
  const [alerta, setAlerta] = useState(null);

  const esAdmin = user && (user.rol === 'admin' || user.email === 'administraciongymfit@gmail.com');

  const mostrarAlerta = (mensaje, type = 'success') => {
    setAlerta({ mensaje, type });
    setTimeout(() => setAlerta(null), 4500);
  };

  // Cargar datos al montar
  useEffect(() => {
    if (esAdmin) {
      cargarEstadisticas();
      cargarSedes();
      cargarProfesores();
      cargarActividades();
      cargarTurnos();
    }
  }, [esAdmin]);

  const cargarEstadisticas = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/estadisticas`);
      const data = await res.json();
      if (res.ok && data.exito) {
        setStats(data.estadisticas);
      }
    } catch (err) {
      console.warn('Error al cargar estadísticas:', err);
    }
  };

  const cargarSedes = async () => {
    setCargandoSedes(true);
    try {
      const res = await fetch(`${API_BASE}/sedes`);
      const data = await res.json();
      if (res.ok && data.exito) {
        setSedes(data.sedes || []);
      }
    } catch (err) {
      console.error('Error al cargar sedes:', err);
    } finally {
      setCargandoSedes(false);
    }
  };

  const cargarProfesores = async () => {
    setCargandoProfesores(true);
    try {
      const res = await fetch(`${API_BASE}/profesores`);
      const data = await res.json();
      if (res.ok && data.exito) {
        setProfesores(data.profesores || []);
      }
    } catch (err) {
      console.error('Error al cargar profesores:', err);
    } finally {
      setCargandoProfesores(false);
    }
  };

  const cargarActividades = async () => {
    setCargandoActividades(true);
    try {
      const res = await fetch(`${API_BASE}/actividades`);
      const data = await res.json();
      if (res.ok && data.exito) {
        const list = data.actividades || [];
        setActividades(list);
        setFiltroTurnoActividad((prev) => {
          if (prev) return prev;
          const musc = list.find((a) => a.nombre.toLowerCase().includes('musculación'));
          return musc ? musc.id.toString() : (list[0] ? list[0].id.toString() : '');
        });
      }
    } catch (err) {
      console.error('Error al cargar actividades:', err);
    } finally {
      setCargandoActividades(false);
    }
  };

  const cargarTurnos = async () => {
    setCargandoTurnos(true);
    try {
      const res = await fetch(`${API_BASE}/turnos`);
      const data = await res.json();
      if (res.ok && data.exito) {
        setTurnos(data.turnos || []);
      }
    } catch (err) {
      console.error('Error al cargar turnos:', err);
    } finally {
      setCargandoTurnos(false);
    }
  };

  // --- Handlers Profesor ---
  const handleAbrirModalProfesor = (profesor = null) => {
    if (profesor) {
      setProfesorEditando(profesor);
      setProfesorForm({
        nombre: profesor.nombre || '',
        apellido: profesor.apellido || '',
        dni: profesor.dni || '',
        email: profesor.email || '',
        telefono: profesor.telefono || '',
        especialidad: profesor.especialidad || 'Musculación',
        turno: profesor.turno || 'Mañana',
        sede_id: profesor.sede_id || ''
      });
    } else {
      setProfesorEditando(null);
      setProfesorForm({
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
        especialidad: 'Musculación',
        turno: 'Mañana',
        sede_id: sedes.length > 0 ? sedes[0].id : ''
      });
    }
    setShowModalProfesor(true);
  };

  const handleGuardarProfesor = async (e) => {
    e.preventDefault();
    setGuardandoProfesor(true);

    try {
      const endpoint = profesorEditando
        ? `${API_BASE}/profesores/${profesorEditando.id}`
        : `${API_BASE}/profesores`;
      const method = profesorEditando ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profesorForm)
      });

      const data = await res.json();

      if (!res.ok || !data.exito) {
        mostrarAlerta(data.mensaje || 'Error al guardar profesor', 'danger');
      } else {
        mostrarAlerta(data.mensaje || '¡Profesor guardado con éxito!');
        setShowModalProfesor(false);
        cargarProfesores();
        cargarEstadisticas();
      }
    } catch (error) {
      mostrarAlerta('No se pudo conectar con el servidor', 'danger');
    } finally {
      setGuardandoProfesor(false);
    }
  };

  const handleToggleEstadoProfesor = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/profesores/${id}/toggle-estado`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok && data.exito) {
        mostrarAlerta(data.mensaje);
        cargarProfesores();
        cargarEstadisticas();
      } else {
        mostrarAlerta(data.mensaje || 'Error al cambiar estado', 'danger');
      }
    } catch (error) {
      mostrarAlerta('Error de red al actualizar estado', 'danger');
    }
  };

  // --- Handlers Sede ---
  const handleAbrirModalSede = (sede = null) => {
    if (sede) {
      setSedeEditando(sede);
      setSedeForm({
        nombre: sede.nombre || '',
        direccion: sede.direccion || '',
        ciudad: sede.ciudad || 'Córdoba Capital',
        telefono: sede.telefono || '',
        email: sede.email || '',
        horario_apertura: sede.horario_apertura || '07:00 a 23:00 hs',
        capacidad: sede.capacidad || 150
      });
    } else {
      setSedeEditando(null);
      setSedeForm({
        nombre: '',
        direccion: '',
        ciudad: 'Córdoba Capital',
        telefono: '',
        email: '',
        horario_apertura: '07:00 a 23:00 hs',
        capacidad: 150
      });
    }
    setShowModalSede(true);
  };

  const handleGuardarSede = async (e) => {
    e.preventDefault();
    setGuardandoSede(true);

    try {
      const endpoint = sedeEditando
        ? `${API_BASE}/sedes/${sedeEditando.id}`
        : `${API_BASE}/sedes`;
      const method = sedeEditando ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sedeForm)
      });

      const data = await res.json();

      if (!res.ok || !data.exito) {
        mostrarAlerta(data.mensaje || 'Error al guardar sede', 'danger');
      } else {
        mostrarAlerta(data.mensaje || '¡Sede guardada con éxito!');
        setShowModalSede(false);
        cargarSedes();
        cargarEstadisticas();
      }
    } catch (error) {
      mostrarAlerta('No se pudo conectar con el servidor', 'danger');
    } finally {
      setGuardandoSede(false);
    }
  };

  const handleToggleEstadoSede = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/sedes/${id}/toggle-estado`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok && data.exito) {
        mostrarAlerta(data.mensaje);
        cargarSedes();
        cargarEstadisticas();
      } else {
        mostrarAlerta(data.mensaje || 'Error al cambiar estado de sede', 'danger');
      }
    } catch (error) {
      mostrarAlerta('Error de red al actualizar sede', 'danger');
    }
  };

  // --- Handlers Actividad ---
  const handleAbrirModalActividad = (actividad = null) => {
    if (actividad) {
      setActividadEditando(actividad);
      setActividadForm({
        nombre: actividad.nombre || '',
        duracion: actividad.duracion || 60,
        cupo: actividad.cupo || 20,
        descripcion: actividad.descripcion || ''
      });
    } else {
      setActividadEditando(null);
      setActividadForm({
        nombre: '',
        duracion: 60,
        cupo: 20,
        descripcion: ''
      });
    }
    setShowModalActividad(true);
  };

  const handleGuardarActividad = async (e) => {
    e.preventDefault();
    setGuardandoActividad(true);

    try {
      const endpoint = actividadEditando
        ? `${API_BASE}/actividades/${actividadEditando.id}`
        : `${API_BASE}/actividades`;
      const method = actividadEditando ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actividadForm)
      });

      const data = await res.json();

      if (!res.ok || !data.exito) {
        mostrarAlerta(data.mensaje || 'Error al guardar actividad', 'danger');
      } else {
        mostrarAlerta(data.mensaje || '¡Actividad guardada con éxito!');
        setShowModalActividad(false);
        cargarActividades();
        cargarEstadisticas();
      }
    } catch (error) {
      mostrarAlerta('No se pudo conectar con el servidor', 'danger');
    } finally {
      setGuardandoActividad(false);
    }
  };

  const handleToggleEstadoActividad = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/actividades/${id}/toggle-estado`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok && data.exito) {
        mostrarAlerta(data.mensaje);
        cargarActividades();
        cargarEstadisticas();
      } else {
        mostrarAlerta(data.mensaje || 'Error al cambiar estado de actividad', 'danger');
      }
    } catch (error) {
      mostrarAlerta('Error de red al actualizar actividad', 'danger');
    }
  };

  // --- Handlers Turno ---
  const handleAbrirModalTurno = (turno = null) => {
    if (turno) {
      setTurnoEditando(turno);
      setTurnoForm({
        actividad_id: turno.actividad_id || '',
        horarioInicio: turno.horarioInicio || '07:00',
        horaFin: turno.horaFin || '09:00',
        dia_semana: turno.dia_semana || 'Lunes a Sábado',
        profesor_id: turno.profesor_id || '',
        sede_id: turno.sede_id || ''
      });
    } else {
      setTurnoEditando(null);
      const preAct = (filtroTurnoActividad && filtroTurnoActividad !== 'todas')
        ? filtroTurnoActividad
        : (actividades.length > 0 ? actividades[0].id : '');
      const preDia = (filtroTurnoDia && filtroTurnoDia !== 'todos')
        ? filtroTurnoDia
        : 'Lunes a Sábado';

      setTurnoForm({
        actividad_id: preAct,
        horarioInicio: '07:00',
        horaFin: '09:00',
        dia_semana: preDia,
        profesor_id: profesores.length > 0 ? profesores[0].id : '',
        sede_id: filtroTurnoSede ? filtroTurnoSede : (sedes.length > 0 ? sedes[0].id : '')
      });
    }
    setShowModalTurno(true);
  };

  const handleGuardarTurno = async (e) => {
    e.preventDefault();
    setGuardandoTurno(true);

    try {
      const endpoint = turnoEditando
        ? `${API_BASE}/turnos/${turnoEditando.id}`
        : `${API_BASE}/turnos`;
      const method = turnoEditando ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(turnoForm)
      });

      const data = await res.json();

      if (!res.ok || !data.exito) {
        mostrarAlerta(data.mensaje || 'Error al guardar turno', 'danger');
      } else {
        mostrarAlerta(data.mensaje || '¡Turno guardado con éxito!');
        setShowModalTurno(false);
        cargarTurnos();
        cargarActividades();
        cargarEstadisticas();
      }
    } catch (error) {
      mostrarAlerta('No se pudo conectar con el servidor', 'danger');
    } finally {
      setGuardandoTurno(false);
    }
  };

  const handleToggleEstadoTurno = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/turnos/${id}/toggle-estado`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok && data.exito) {
        mostrarAlerta(data.mensaje);
        cargarTurnos();
        cargarEstadisticas();
      } else {
        mostrarAlerta(data.mensaje || 'Error al cambiar estado de turno', 'danger');
      }
    } catch (error) {
      mostrarAlerta('Error de red al actualizar turno', 'danger');
    }
  };

  // --- Confirmar Eliminación ---
  const handleConfirmarEliminar = async () => {
    if (!itemAEliminar) return;
    setEliminando(true);

    try {
      let endpoint = '';
      if (itemAEliminar.type === 'profesor') endpoint = `${API_BASE}/profesores/${itemAEliminar.id}`;
      if (itemAEliminar.type === 'sede') endpoint = `${API_BASE}/sedes/${itemAEliminar.id}`;
      if (itemAEliminar.type === 'actividad') endpoint = `${API_BASE}/actividades/${itemAEliminar.id}`;
      if (itemAEliminar.type === 'turno') endpoint = `${API_BASE}/turnos/${itemAEliminar.id}`;

      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok && data.exito) {
        mostrarAlerta(data.mensaje || 'Eliminado correctamente');
        setShowDeleteModal(false);
        if (itemAEliminar.type === 'profesor') cargarProfesores();
        if (itemAEliminar.type === 'sede') {
          cargarSedes();
          cargarProfesores();
        }
        if (itemAEliminar.type === 'actividad') {
          cargarActividades();
          cargarTurnos();
        }
        if (itemAEliminar.type === 'turno') {
          cargarTurnos();
          cargarActividades();
        }
        cargarEstadisticas();
      } else {
        mostrarAlerta(data.mensaje || 'Error al eliminar', 'danger');
      }
    } catch (error) {
      mostrarAlerta('Error de conexión con el servidor', 'danger');
    } finally {
      setEliminando(false);
    }
  };

  // Filtros
  const profesoresFiltrados = profesores.filter((p) => {
    const coincideTexto = `${p.nombre} ${p.apellido} ${p.especialidad} ${p.dni}`.toLowerCase().includes(filtroProfesor.toLowerCase());
    const coincideSede = !filtroSedeProf || (p.sede_id && p.sede_id.toString() === filtroSedeProf.toString());
    return coincideTexto && coincideSede;
  });

  const actividadesFiltradas = actividades.filter((a) => {
    return a.nombre.toLowerCase().includes(filtroActividad.toLowerCase()) ||
           (a.descripcion && a.descripcion.toLowerCase().includes(filtroActividad.toLowerCase()));
  });

  const actividadSeleccionadaObj = actividades.find(
    (a) => a.id.toString() === filtroTurnoActividad.toString()
  );

  const turnosFiltrados = turnos.filter((t) => {
    const coincideActividad =
      !filtroTurnoActividad ||
      filtroTurnoActividad === 'todas' ||
      (t.actividad_id && t.actividad_id.toString() === filtroTurnoActividad.toString());
    const coincideDia =
      !filtroTurnoDia ||
      filtroTurnoDia === 'todos' ||
      t.dia_semana === filtroTurnoDia;
    const coincideSede =
      !filtroTurnoSede ||
      (t.sede_id && t.sede_id.toString() === filtroTurnoSede.toString());
    return coincideActividad && coincideDia && coincideSede;
  });

  if (!esAdmin) {
    return (
      <Container className="py-5 text-center text-white">
        <Card className="glass-card p-5 mx-auto" style={{ maxWidth: '600px' }}>
          <Card.Body>
            <div className="mb-3 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
            </div>
            <h3 className="fw-bold mb-3">Acceso Restringido</h3>
            <p className="opacity-75 mb-4">
              Esta sección está reservada exclusivamente para el Administrador del sistema (<strong>administraciongymfit@gmail.com</strong>).
            </p>
            <Button as={Link} to="/login" variant="primary" className="fw-bold px-4 py-2 hero-btn">
              Iniciar Sesión como Admin
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <div className="admin-page py-4">
      <Container fluid className="admin-container">
        {/* Header de Admin */}
        <Card className="admin-header-card mb-4 border-0 text-white p-4">
          <Row className="align-items-center gy-3">
            <Col md={7} lg={8} className="d-flex align-items-center gap-3">
              <div className="admin-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h3 className="fw-bold mb-0">Panel de Administración FitApp</h3>
                  <Badge bg="primary" className="px-3 py-1 rounded-pill">
                    Administrador Oficial
                  </Badge>
                </div>
                <p className="text-light opacity-75 mb-0 small">
                  Sesión activa: <strong>{user?.email}</strong>
                </p>
              </div>
            </Col>

            <Col md={5} lg={4} className="text-md-end d-flex gap-2 justify-content-md-end">
              <Button as={Link} to="/user" variant="outline-light" size="sm" className="rounded-pill px-3">
                Ver Mi Perfil de Usuario
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Tarjetas de Estadísticas Rápidas */}
        <Row className="g-3 mb-4">
          <Col xs={6} sm={6} lg={3}>
            <Card className="stat-card border-0 p-3 text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-light opacity-75 small fw-medium">Profesores</span>
                  <h2 className="fw-bold mb-0 mt-1 text-white">{stats.totalProfesores}</h2>
                  <small className="text-success fw-bold">{stats.profesoresActivos} activos</small>
                </div>
                <div className="stat-icon-wrapper stat-icon-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={6} sm={6} lg={3}>
            <Card className="stat-card border-0 p-3 text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-light opacity-75 small fw-medium">Sedes</span>
                  <h2 className="fw-bold mb-0 mt-1 text-white">{stats.totalSedes}</h2>
                  <small className="text-light opacity-90 fw-bold">{stats.sedesActivas} operativas</small>
                </div>
                <div className="stat-icon-wrapper stat-icon-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={6} sm={6} lg={3}>
            <Card className="stat-card border-0 p-3 text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-light opacity-75 small fw-medium">Actividades</span>
                  <h2 className="fw-bold mb-0 mt-1 text-white">{stats.totalActividades}</h2>
                  <small className="text-success fw-bold">{stats.actividadesActivas} activas</small>
                </div>
                <div className="stat-icon-wrapper stat-icon-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m4.93 4.93 4.24 4.24" />
                    <path d="m14.83 9.17 4.24-4.24" />
                    <path d="m14.83 14.83 4.24 4.24" />
                    <path d="m9.17 14.83-4.24 4.24" />
                  </svg>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={6} sm={6} lg={3}>
            <Card className="stat-card border-0 p-3 text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-light opacity-75 small fw-medium">Turnos Horarios</span>
                  <h2 className="fw-bold mb-0 mt-1 text-white">{stats.totalTurnos}</h2>
                  <small className="text-success fw-bold">{stats.turnosActivos} disponibles</small>
                </div>
                <div className="stat-icon-wrapper stat-icon-success">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Alerta general */}
        {alerta && (
          <Alert variant={alerta.type} dismissible onClose={() => setAlerta(null)} className="mb-4 text-center">
            {alerta.mensaje}
          </Alert>
        )}

        {/* Navegación por Pestañas */}
        <Nav className="admin-nav-tabs mb-4 gap-2 border-0 flex-wrap">
          <Nav.Item>
            <Nav.Link
              className={activeTab === 'profesores' ? 'active' : ''}
              onClick={() => setActiveTab('profesores')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              Profesores ({profesores.length})
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              className={activeTab === 'sedes' ? 'active' : ''}
              onClick={() => setActiveTab('sedes')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Sedes ({sedes.length})
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              className={activeTab === 'actividades' ? 'active' : ''}
              onClick={() => setActiveTab('actividades')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m4.93 4.93 4.24 4.24" />
                <path d="m14.83 9.17 4.24-4.24" />
              </svg>
              Actividades ({actividades.length})
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              className={activeTab === 'turnos' ? 'active' : ''}
              onClick={() => setActiveTab('turnos')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Turnos ({turnos.length})
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Pestaña: Profesores */}
        {activeTab === 'profesores' && (
          <Card className="glass-card border-0 p-4 text-white">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
              <div>
                <h4 className="fw-bold mb-1 text-white">Listado y Carga de Profesores</h4>
                <p className="text-light opacity-75 small mb-0">
                  Agrega, asigna sedes, edita datos y gestiona el cuerpo docente de FitApp.
                </p>
              </div>

              <Button
                variant="primary"
                className="hero-btn fw-bold px-4 py-2 d-inline-flex align-items-center gap-2 rounded-pill shadow"
                onClick={() => handleAbrirModalProfesor()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                Cargar Profesor
              </Button>
            </div>

            <Row className="g-3 mb-4">
              <Col md={7} lg={8}>
                <InputGroup>
                  <InputGroup.Text className="bg-transparent border-secondary text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nombre, apellido, especialidad o DNI..."
                    value={filtroProfesor}
                    onChange={(e) => setFiltroProfesor(e.target.value)}
                    className="custom-input"
                  />
                </InputGroup>
              </Col>
              <Col md={5} lg={4}>
                <Form.Select
                  value={filtroSedeProf}
                  onChange={(e) => setFiltroSedeProf(e.target.value)}
                  className="custom-input"
                >
                  <option value="">Todas las Sedes</option>
                  {sedes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} ({s.ciudad})
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            {cargandoProfesores ? (
              <div className="text-center py-5">
                <Spinner animation="border" className="custom-spinner-primary" />
                <p className="mt-2 text-light opacity-75">Cargando profesores...</p>
              </div>
            ) : profesoresFiltrados.length === 0 ? (
              <div className="text-center py-5 opacity-75">
                <p className="fs-5 mb-3">No se encontraron profesores registrados con los filtros aplicados.</p>
                <Button variant="outline-light" size="sm" onClick={() => handleAbrirModalProfesor()}>
                  + Cargar el primer profesor
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table responsive borderless className="custom-table align-middle text-white mb-0">
                  <thead>
                    <tr>
                      <th>Profesor</th>
                      <th>DNI / Contacto</th>
                      <th>Especialidad</th>
                      <th>Turno</th>
                      <th>Sede Asignada</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profesoresFiltrados.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                              style={{
                                width: '38px',
                                height: '38px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                fontSize: '0.85rem'
                              }}
                            >
                              {(p.nombre || 'P').charAt(0)}{(p.apellido || '').charAt(0)}
                            </div>
                            <div>
                              <div className="fw-bold text-white">{p.nombre} {p.apellido}</div>
                              <small className="text-light opacity-75">{p.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="small text-white"><strong>DNI:</strong> {p.dni}</div>
                          {p.telefono && <small className="text-light opacity-75">{p.telefono}</small>}
                        </td>
                        <td>
                          <Badge className="badge-especialidad px-2 py-1 rounded-pill">
                            {p.especialidad}
                          </Badge>
                        </td>
                        <td>
                          <Badge className="badge-turno px-2 py-1 rounded-pill">
                            {p.turno}
                          </Badge>
                        </td>
                        <td>
                          {p.sede ? (
                            <Badge className="badge-sede px-2 py-1 rounded-pill">
                              {p.sede.nombre}
                            </Badge>
                          ) : (
                            <small className="text-muted">Sin sede asignada</small>
                          )}
                        </td>
                        <td>
                          <Badge bg={p.estado ? 'success' : 'secondary'} className="px-2 py-1">
                            {p.estado ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <div className="d-flex gap-2 justify-content-end">
                            <Button
                              size="sm"
                              title="Editar datos del profesor"
                              onClick={() => handleAbrirModalProfesor(p)}
                              className="btn-action-edit p-1 px-2 rounded-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                <path d="m15 5 4 4" />
                              </svg>
                            </Button>

                            <Button
                              size="sm"
                              title={p.estado ? 'Desactivar profesor' : 'Activar profesor'}
                              onClick={() => handleToggleEstadoProfesor(p.id)}
                              className={p.estado ? 'btn-action-deactivate p-1 px-2 rounded-2' : 'btn btn-outline-success p-1 px-2 rounded-2'}
                            >
                              {p.estado ? 'Desactivar' : 'Activar'}
                            </Button>

                            <Button
                              variant="outline-danger"
                              size="sm"
                              title="Eliminar permanentemente"
                              onClick={() => {
                                setItemAEliminar({ type: 'profesor', id: p.id, nombre: `${p.nombre} ${p.apellido}` });
                                setShowDeleteModal(true);
                              }}
                              className="p-1 px-2 rounded-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              </svg>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card>
        )}

        {/* Pestaña: Sedes */}
        {activeTab === 'sedes' && (
          <div>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
              <div>
                <h4 className="fw-bold mb-1 text-white">Administración de Sedes y Sucursales</h4>
                <p className="text-light opacity-75 small mb-0">
                  Crea nuevas sedes, actualiza direcciones, horarios y capacidad disponible.
                </p>
              </div>

              <Button
                variant="primary"
                className="hero-btn fw-bold px-4 py-2 d-inline-flex align-items-center gap-2 rounded-pill shadow"
                onClick={() => handleAbrirModalSede()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                Nueva Sede
              </Button>
            </div>

            {cargandoSedes ? (
              <div className="text-center py-5">
                <Spinner animation="border" className="custom-spinner-primary" />
                <p className="mt-2 text-light opacity-75">Cargando sedes...</p>
              </div>
            ) : sedes.length === 0 ? (
              <Card className="glass-card border-0 p-5 text-center text-white">
                <p className="fs-5 mb-3 opacity-75">No hay sedes registradas aún.</p>
                <Button variant="primary" className="hero-btn fw-bold mx-auto" onClick={() => handleAbrirModalSede()}>
                  + Crear la primera sede
                </Button>
              </Card>
            ) : (
              <Row className="g-4">
                {sedes.map((sede) => (
                  <Col key={sede.id} md={6} lg={4}>
                    <Card className="sede-card h-100 p-4 text-white d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <Badge bg={sede.estado ? 'success' : 'secondary'} className="mb-2 px-2 py-1">
                              {sede.estado ? 'Operativa' : 'Cerrada / Inactiva'}
                            </Badge>
                            <h5 className="fw-bold text-white mb-1">{sede.nombre}</h5>
                            <span className="text-light opacity-90 small fw-semibold">{sede.ciudad}</span>
                          </div>
                          <div className="stat-icon-wrapper stat-icon-primary" style={{ width: '40px', height: '40px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </div>
                        </div>

                        <div className="mb-3 text-light opacity-90 small">
                          <p className="mb-1 d-flex align-items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span><strong>Dirección:</strong> {sede.direccion}</span>
                          </p>
                          {sede.telefono && (
                            <p className="mb-1 d-flex align-items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                              </svg>
                              <span><strong>Tel:</strong> {sede.telefono}</span>
                            </p>
                          )}
                          {sede.email && (
                            <p className="mb-1 d-flex align-items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
                                <rect width="20" height="16" x="2" y="4" rx="2" />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                              </svg>
                              <span><strong>Email:</strong> {sede.email}</span>
                            </p>
                          )}
                          <p className="mb-1 d-flex align-items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span><strong>Horario:</strong> {sede.horario_apertura}</span>
                          </p>
                          <p className="mb-0 d-flex align-items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <span><strong>Capacidad:</strong> {sede.capacidad} personas</span>
                          </p>
                        </div>

                        {sede.profesores && sede.profesores.length > 0 && (
                          <div className="mt-3 pt-3 border-top border-secondary border-opacity-25">
                            <small className="text-light opacity-75 d-flex align-items-center gap-1 mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                              Profesores en esta sede ({sede.profesores.length}):
                            </small>
                            <div className="d-flex flex-wrap gap-1">
                              {sede.profesores.slice(0, 3).map((prof) => (
                                <Badge key={prof.id} className="badge-turno small">
                                  {prof.nombre} ({prof.especialidad})
                                </Badge>
                              ))}
                              {sede.profesores.length > 3 && (
                                <Badge bg="primary" className="text-white small">
                                  +{sede.profesores.length - 3} más
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="d-flex gap-2 justify-content-end mt-4 pt-3 border-top border-secondary border-opacity-25">
                        <Button
                          size="sm"
                          onClick={() => handleAbrirModalSede(sede)}
                          className="btn-action-edit fw-medium px-3 rounded-2"
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleToggleEstadoSede(sede.id)}
                          className={sede.estado ? 'btn-action-deactivate fw-medium px-3 rounded-2' : 'btn btn-outline-success fw-medium px-3 rounded-2'}
                        >
                          {sede.estado ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setItemAEliminar({ type: 'sede', id: sede.id, nombre: sede.nombre });
                            setShowDeleteModal(true);
                          }}
                          className="px-2 rounded-2"
                          title="Eliminar sede"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          </svg>
                        </Button>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        )}

        {/* Pestaña: Actividades */}
        {activeTab === 'actividades' && (
          <Card className="glass-card border-0 p-4 text-white">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
              <div>
                <h4 className="fw-bold mb-1 text-white">Catálogo de Actividades y Clases</h4>
                <p className="text-light opacity-75 small mb-0">
                  Crea disciplinas (Pilates, Zumba, Spinning, etc.), define la duración en minutos y el cupo máximo por clase.
                </p>
              </div>

              <Button
                variant="primary"
                className="hero-btn fw-bold px-4 py-2 d-inline-flex align-items-center gap-2 rounded-pill shadow"
                onClick={() => handleAbrirModalActividad()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                Nueva Actividad
              </Button>
            </div>

            <Row className="g-3 mb-4">
              <Col md={12}>
                <InputGroup>
                  <InputGroup.Text className="bg-transparent border-secondary text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar actividad por nombre o descripción..."
                    value={filtroActividad}
                    onChange={(e) => setFiltroActividad(e.target.value)}
                    className="custom-input"
                  />
                </InputGroup>
              </Col>
            </Row>

            {cargandoActividades ? (
              <div className="text-center py-5">
                <Spinner animation="border" className="custom-spinner-primary" />
                <p className="mt-2 text-light opacity-75">Cargando actividades...</p>
              </div>
            ) : actividadesFiltradas.length === 0 ? (
              <div className="text-center py-5 opacity-75">
                <p className="fs-5 mb-3">No hay actividades registradas con ese criterio.</p>
                <Button variant="outline-light" size="sm" onClick={() => handleAbrirModalActividad()}>
                  + Crear la primera actividad
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table responsive borderless className="custom-table align-middle text-white mb-0">
                  <thead>
                    <tr>
                      <th>Actividad</th>
                      <th>Duración</th>
                      <th>Cupo Máximo</th>
                      <th>Turnos Asignados</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actividadesFiltradas.map((act) => (
                      <tr key={act.id}>
                        <td>
                          <div>
                            <div className="fw-bold text-white fs-6">{act.nombre}</div>
                            {act.descripcion && (
                              <small className="text-light opacity-75 d-block text-truncate" style={{ maxWidth: '300px' }}>
                                {act.descripcion}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <Badge className="badge-duracion px-3 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {act.duracion} min
                          </Badge>
                        </td>
                        <td>
                          <Badge className="badge-cupo px-3 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            {act.cupo} personas
                          </Badge>
                        </td>
                        <td>
                          <Badge className="badge-sede px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                              <line x1="16" x2="16" y1="2" y2="6" />
                              <line x1="8" x2="8" y1="2" y2="6" />
                              <line x1="3" x2="21" y1="10" y2="10" />
                            </svg>
                            {act.turnos ? act.turnos.length : 0} turnos
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={act.estado ? 'success' : 'secondary'} className="px-2 py-1">
                            {act.estado ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <div className="d-flex gap-2 justify-content-end">
                            <Button
                              size="sm"
                              title="Editar actividad"
                              onClick={() => handleAbrirModalActividad(act)}
                              className="btn-action-edit p-1 px-2 rounded-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                <path d="m15 5 4 4" />
                              </svg>
                            </Button>

                            <Button
                              size="sm"
                              title={act.estado ? 'Desactivar actividad' : 'Activar actividad'}
                              onClick={() => handleToggleEstadoActividad(act.id)}
                              className={act.estado ? 'btn-action-deactivate p-1 px-2 rounded-2' : 'btn btn-outline-success p-1 px-2 rounded-2'}
                            >
                              {act.estado ? 'Desactivar' : 'Activar'}
                            </Button>

                            <Button
                              variant="outline-danger"
                              size="sm"
                              title="Eliminar permanentemente"
                              onClick={() => {
                                setItemAEliminar({ type: 'actividad', id: act.id, nombre: act.nombre });
                                setShowDeleteModal(true);
                              }}
                              className="p-1 px-2 rounded-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              </svg>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card>
        )}

        {/* Pestaña: Turnos (Organizados por Actividad y Día) */}
        {activeTab === 'turnos' && (
          <div className="text-white">
            {/* Header y Acciones */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
              <div>
                <h4 className="fw-bold mb-1 text-white">Gestión y Programación de Turnos</h4>
                <p className="text-light opacity-75 small mb-0">
                  Selecciona una actividad y un día para visualizar y gestionar sus horarios de forma rápida y ordenada.
                </p>
              </div>

              <Button
                variant="primary"
                className="hero-btn fw-bold px-4 py-2 d-inline-flex align-items-center gap-2 rounded-pill shadow"
                onClick={() => handleAbrirModalTurno()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                Nuevo Turno
              </Button>
            </div>

            {/* Selector de Actividad (Pills) */}
            <div className="mb-4">
              <label className="small text-light opacity-75 fw-semibold mb-2 d-block">
                1. Selecciona la Actividad:
              </label>
              <div className="d-flex flex-wrap gap-2 p-2 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                {actividades.map((act) => {
                  const count = turnos.filter((t) => t.actividad_id === act.id).length;
                  const isSelected = filtroTurnoActividad.toString() === act.id.toString();

                  return (
                    <button
                      key={act.id}
                      type="button"
                      className={`filter-pill-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setFiltroTurnoActividad(act.id.toString())}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m4.93 4.93 4.24 4.24" />
                        <path d="m14.83 9.17 4.24-4.24" />
                      </svg>
                      <span>{act.nombre}</span>
                      <span
                        className="badge rounded-pill ms-1"
                        style={{
                          background: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(99,102,241,0.3)',
                          color: '#ffffff',
                          fontSize: '0.75rem'
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  className={`filter-pill-btn ${filtroTurnoActividad === 'todas' ? 'active' : ''}`}
                  onClick={() => setFiltroTurnoActividad('todas')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" x2="21" y1="6" y2="6"/>
                    <line x1="8" x2="21" y1="12" y2="12"/>
                    <line x1="8" x2="21" y1="18" y2="18"/>
                    <line x1="3" x2="3.01" y1="6" y2="6"/>
                    <line x1="3" x2="3.01" y1="12" y2="12"/>
                    <line x1="3" x2="3.01" y1="18" y2="18"/>
                  </svg>
                  <span>Ver Resumen General</span>
                  <span
                    className="badge rounded-pill ms-1"
                    style={{
                      background: filtroTurnoActividad === 'todas' ? 'rgba(255,255,255,0.25)' : 'rgba(99,102,241,0.3)',
                      color: '#ffffff',
                      fontSize: '0.75rem'
                    }}
                  >
                    {turnos.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Vista de Actividad Individual (Musculación o Clases) */}
            {filtroTurnoActividad !== 'todas' && actividadSeleccionadaObj && (
              <div>
                {/* Banner de Información de la Actividad */}
                <div className="activity-summary-banner mb-4 text-white d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <div className="stat-icon-wrapper stat-icon-primary" style={{ width: '32px', height: '32px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="m4.93 4.93 4.24 4.24" />
                          <path d="m14.83 9.17 4.24-4.24" />
                        </svg>
                      </div>
                      <h5 className="fw-bold mb-0 text-white">{actividadSeleccionadaObj.nombre}</h5>
                      <Badge bg={actividadSeleccionadaObj.estado ? 'success' : 'secondary'} className="ms-2">
                        {actividadSeleccionadaObj.estado ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                    <div className="d-flex flex-wrap gap-2 align-items-center small text-light opacity-90 mt-2">
                      <span className="d-inline-flex align-items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Duración: <strong>{actividadSeleccionadaObj.duracion} min</strong>
                      </span>
                      <span>•</span>
                      <span className="d-inline-flex align-items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        </svg>
                        Cupo máx: <strong>{actividadSeleccionadaObj.cupo} personas</strong>
                      </span>
                      {actividadSeleccionadaObj.descripcion && (
                        <>
                          <span>•</span>
                          <span className="opacity-75">{actividadSeleccionadaObj.descripcion}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-light"
                      size="sm"
                      className="fw-semibold px-3 rounded-pill d-inline-flex align-items-center gap-1"
                      onClick={() => handleAbrirModalActividad(actividadSeleccionadaObj)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                      Editar Actividad
                    </Button>
                  </div>
                </div>

                {/* Filtros de Día / Frecuencia y Sede */}
                <Card className="glass-card border-0 p-3 mb-4 text-white">
                  <Row className="align-items-center gy-3">
                    <Col lg={8}>
                      <label className="small text-light opacity-75 fw-semibold mb-2 d-block">
                        2. Filtrar por Día / Combinación:
                      </label>
                      <div className="d-flex flex-wrap gap-1">
                        {(() => {
                          const diasUnicos = [
                            'todos',
                            ...new Set(
                              turnos
                                .filter((t) => t.actividad_id === actividadSeleccionadaObj.id)
                                .map((t) => t.dia_semana)
                            )
                          ];

                          return diasUnicos.map((dia) => {
                            const isDiaActivo = filtroTurnoDia === dia;
                            const turnosDiaCount = dia === 'todos'
                              ? turnos.filter((t) => t.actividad_id === actividadSeleccionadaObj.id).length
                              : turnos.filter((t) => t.actividad_id === actividadSeleccionadaObj.id && t.dia_semana === dia).length;

                            return (
                              <button
                                key={dia}
                                type="button"
                                className={`day-pill-btn ${isDiaActivo ? 'active' : ''}`}
                                onClick={() => setFiltroTurnoDia(dia)}
                              >
                                <span>{dia === 'todos' ? 'Todos los días y turnos' : dia}</span>
                                <span className="badge rounded-pill ms-1 bg-dark bg-opacity-50 text-white small">
                                  {turnosDiaCount}
                                </span>
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </Col>

                    <Col lg={4}>
                      <label className="small text-light opacity-75 fw-semibold mb-2 d-block">
                        3. Filtrar por Sede:
                      </label>
                      <Form.Select
                        value={filtroTurnoSede}
                        onChange={(e) => setFiltroTurnoSede(e.target.value)}
                        className="custom-input py-1"
                        size="sm"
                      >
                        <option value="">Todas las Sedes</option>
                        {sedes.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nombre} ({s.ciudad})
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>
                </Card>

                {/* Listado de Turnos (Grid organizado de slots de 2hs) */}
                {cargandoTurnos ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" className="custom-spinner-primary" />
                    <p className="mt-2 text-light opacity-75">Cargando turnos...</p>
                  </div>
                ) : turnosFiltrados.length === 0 ? (
                  <Card className="glass-card border-0 p-5 text-center text-white mb-4">
                    <p className="fs-5 mb-2 opacity-75">
                      No hay turnos configurados para <strong>{actividadSeleccionadaObj.nombre}</strong> con el filtro{' '}
                      <strong>{filtroTurnoDia === 'todos' ? 'seleccionado' : filtroTurnoDia}</strong>.
                    </p>
                    <p className="small text-light opacity-60 mb-4">
                      Puedes programar turnos con rangos de 2hs haciendo clic en el botón siguiente.
                    </p>
                    <Button
                      variant="primary"
                      className="hero-btn fw-bold mx-auto px-4 py-2 rounded-pill d-inline-flex align-items-center gap-2"
                      onClick={() => handleAbrirModalTurno()}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"/>
                        <path d="M12 5v14"/>
                      </svg>
                      Programar turno para {filtroTurnoDia === 'todos' ? 'esta actividad' : filtroTurnoDia}
                    </Button>
                  </Card>
                ) : (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="small text-light opacity-75 fw-semibold">
                        Mostrando <strong>{turnosFiltrados.length}</strong> {turnosFiltrados.length === 1 ? 'rango horario' : 'rangos horarios'} ({filtroTurnoDia === 'todos' ? 'Todos los días' : filtroTurnoDia}):
                      </span>
                    </div>

                    <Row className="g-3">
                      {turnosFiltrados.map((t) => (
                        <Col key={t.id} xs={12} sm={6} md={4} lg={3}>
                          <div className={`time-slot-card h-100 d-flex flex-column justify-content-between ${!t.estado ? 'slot-inactive' : ''}`}>
                            <div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="badge-horario px-2 py-1 rounded-pill small fw-bold d-inline-flex align-items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  {t.horarioInicio} - {t.horaFin} hs
                                </span>
                                <Badge bg={t.estado ? 'success' : 'secondary'} className="px-2 py-1" style={{ color: '#ffffff' }}>
                                  {t.estado ? 'Activo' : 'Pausado'}
                                </Badge>
                              </div>

                              <div className="d-flex flex-column gap-1 mb-3">
                                <small className="text-light opacity-90 d-flex align-items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
                                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                    <line x1="16" x2="16" y1="2" y2="6" />
                                    <line x1="8" x2="8" y1="2" y2="6" />
                                    <line x1="3" x2="21" y1="10" y2="10" />
                                  </svg>
                                  <strong>Días:</strong> <Badge className="badge-dia py-1 px-2 small ms-1">{t.dia_semana}</Badge>
                                </small>
                                <small className="text-light opacity-90 d-flex align-items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                    <circle cx="12" cy="10" r="3" />
                                  </svg>
                                  <strong>Sede:</strong> {t.sede ? t.sede.nombre : 'Todas las sedes'}
                                </small>
                                {t.profesor && (
                                  <small className="text-light opacity-75 d-flex align-items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
                                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                      <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    {t.profesor.nombre} {t.profesor.apellido}
                                  </small>
                                )}
                              </div>
                            </div>

                            <div className="d-flex gap-2 justify-content-end pt-2 border-top border-secondary border-opacity-25">
                              <Button
                                size="sm"
                                title="Editar horario"
                                onClick={() => handleAbrirModalTurno(t)}
                                className="btn-action-edit p-1 px-2 rounded-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                  <path d="m15 5 4 4" />
                                </svg>
                              </Button>

                              <Button
                                size="sm"
                                title={t.estado ? 'Pausar turno' : 'Activar turno'}
                                onClick={() => handleToggleEstadoTurno(t.id)}
                                className={t.estado ? 'btn-action-deactivate p-1 px-2 rounded-2' : 'btn btn-outline-success p-1 px-2 rounded-2'}
                              >
                                {t.estado ? 'Pausar' : 'Activar'}
                              </Button>

                              <Button
                                variant="outline-danger"
                                size="sm"
                                title="Eliminar turno"
                                onClick={() => {
                                  setItemAEliminar({
                                    type: 'turno',
                                    id: t.id,
                                    nombre: `${t.actividad?.nombre || 'Turno'} (${t.dia_semana} ${t.horarioInicio}-${t.horaFin})`
                                  });
                                  setShowDeleteModal(true);
                                }}
                                className="p-1 px-2 rounded-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </div>
            )}

            {/* Vista Resumen General de Todas las Actividades */}
            {filtroTurnoActividad === 'todas' && (
              <Row className="g-4">
                {actividades.map((act) => {
                  const turnosDeActividad = turnos.filter((t) => t.actividad_id === act.id);
                  const turnosActivos = turnosDeActividad.filter((t) => t.estado).length;
                  const diasConfigurados = [...new Set(turnosDeActividad.map((t) => t.dia_semana))];

                  return (
                    <Col key={act.id} md={6} lg={4}>
                      <Card className="actividad-card h-100 p-4 text-white d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <Badge bg={act.estado ? 'success' : 'secondary'} className="mb-2 px-2 py-1">
                                {act.estado ? 'Activa' : 'Inactiva'}
                              </Badge>
                              <h5 className="fw-bold text-white mb-1">{act.nombre}</h5>
                              <div className="d-flex gap-2 align-items-center small text-light opacity-90">
                                <span className="d-inline-flex align-items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  {act.duracion} min
                                </span>
                                <span>•</span>
                                <span className="d-inline-flex align-items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                  </svg>
                                  Cupo: {act.cupo}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mb-3 text-light opacity-90 small">
                            <p className="mb-1 d-flex align-items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                <line x1="16" x2="16" y1="2" y2="6" />
                                <line x1="8" x2="8" y1="2" y2="6" />
                                <line x1="3" x2="21" y1="10" y2="10" />
                              </svg>
                              <span><strong>Total de turnos:</strong> {turnosDeActividad.length} ({turnosActivos} activos)</span>
                            </p>
                            <p className="mb-2 d-flex align-items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              <span>
                                <strong>Días con clases:</strong>{' '}
                                {diasConfigurados.length > 0 ? (
                                  diasConfigurados.join(', ')
                                ) : (
                                  <span className="opacity-50">Sin turnos asignados</span>
                                )}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                          <Button
                            variant="primary"
                            size="sm"
                            className="hero-btn fw-semibold px-3 rounded-pill"
                            onClick={() => {
                              setFiltroTurnoActividad(act.id.toString());
                              setFiltroTurnoDia('todos');
                            }}
                          >
                            Ver Turnos ({turnosDeActividad.length}) →
                          </Button>
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </div>
        )}

        {/* Modal Cargar / Editar Profesor */}
        <Modal show={showModalProfesor} onHide={() => setShowModalProfesor(false)} centered size="lg" className="dark-modal">
          <Modal.Header closeButton className="border-secondary text-white">
            <Modal.Title className="fw-bold d-flex align-items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                {profesorEditando ? (
                  <>
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </>
                ) : (
                  <>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7.5" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </>
                )}
              </svg>
              <span>{profesorEditando ? 'Editar Profesor' : 'Cargar Nuevo Profesor'}</span>
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleGuardarProfesor}>
            <Modal.Body className="text-white">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="pNombre">
                    <Form.Label className="fw-medium">Nombre *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ej: Rodrigo"
                      value={profesorForm.nombre}
                      onChange={(e) => setProfesorForm({ ...profesorForm, nombre: e.target.value })}
                      required
                      className="custom-input"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="pApellido">
                    <Form.Label className="fw-medium">Apellido *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ej: González"
                      value={profesorForm.apellido}
                      onChange={(e) => setProfesorForm({ ...profesorForm, apellido: e.target.value })}
                      required
                      className="custom-input"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="pDni">
                    <Form.Label className="fw-medium">DNI *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ej: 38123456"
                      value={profesorForm.dni}
                      onChange={(e) => setProfesorForm({ ...profesorForm, dni: e.target.value })}
                      required
                      className="custom-input"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="pEmail">
                    <Form.Label className="fw-medium">Correo Electrónico *</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="profesor@gymfit.com"
                      value={profesorForm.email}
                      onChange={(e) => setProfesorForm({ ...profesorForm, email: e.target.value })}
                      required
                      className="custom-input"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="pTelefono">
                    <Form.Label className="fw-medium">Teléfono / WhatsApp</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="+54 9 351 123-4567"
                      value={profesorForm.telefono}
                      onChange={(e) => setProfesorForm({ ...profesorForm, telefono: e.target.value })}
                      className="custom-input"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="pEspecialidad">
                    <Form.Label className="fw-medium">Especialidad</Form.Label>
                    <Form.Select
                      value={profesorForm.especialidad}
                      onChange={(e) => setProfesorForm({ ...profesorForm, especialidad: e.target.value })}
                      className="custom-input"
                    >
                      <option value="Musculación">Musculación & Hipertrofia</option>
                      <option value="Crossfit & Funcional">Crossfit & Funcional</option>
                      <option value="Spinning & Cardio">Spinning & Cardio</option>
                      <option value="Yoga & Pilates">Yoga & Pilates</option>
                      <option value="Boxeo & Artes Marciales">Boxeo & Artes Marciales</option>
                      <option value="Natación">Natación</option>
                      <option value="Entrenamiento Personalizado">Entrenamiento Personalizado</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="pTurno">
                    <Form.Label className="fw-medium">Turno</Form.Label>
                    <Form.Select
                      value={profesorForm.turno}
                      onChange={(e) => setProfesorForm({ ...profesorForm, turno: e.target.value })}
                      className="custom-input"
                    >
                      <option value="Mañana">Mañana (07:00 a 14:00)</option>
                      <option value="Tarde">Tarde (14:00 a 20:00)</option>
                      <option value="Noche">Noche (20:00 a 23:00)</option>
                      <option value="Rotativo">Rotativo</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="pSede">
                    <Form.Label className="fw-medium">Sede Asignada</Form.Label>
                    <Form.Select
                      value={profesorForm.sede_id}
                      onChange={(e) => setProfesorForm({ ...profesorForm, sede_id: e.target.value })}
                      className="custom-input"
                    >
                      <option value="">Sin Asignar</option>
                      {sedes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} - {s.ciudad}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="border-secondary">
              <Button variant="secondary" onClick={() => setShowModalProfesor(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={guardandoProfesor} className="hero-btn fw-bold px-4">
                {guardandoProfesor ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Guardando...
                  </>
                ) : (
                  profesorEditando ? 'Guardar Cambios' : 'Registrar Profesor'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Modal Cargar / Editar Sede */}
        <Modal show={showModalSede} onHide={() => setShowModalSede(false)} centered size="lg" className="dark-modal">
          <Modal.Header closeButton className="border-secondary text-white">
            <Modal.Title className="fw-bold d-flex align-items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                {sedeEditando ? (
                  <>
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </>
                ) : (
                  <>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </>
                )}
              </svg>
              <span>{sedeEditando ? 'Editar Sede' : 'Crear Nueva Sede'}</span>
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleGuardarSede}>
            <Modal.Body className="text-white">
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3" controlId="sNombre">
                    <Form.Label className="fw-medium">Nombre de la Sede *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ej: FitApp Sede Centro"
                      value={sedeForm.nombre}
                      onChange={(e) => setSedeForm({ ...sedeForm, nombre: e.target.value })}
                      required
                      className="custom-input"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="sCiudad">
                    <Form.Label className="fw-medium">Ciudad *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ej: Córdoba Capital"
                      value={sedeForm.ciudad}
                      onChange={(e) => setSedeForm({ ...sedeForm, ciudad: e.target.value })}
                      required
                      className="custom-input"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="sDireccion">
                <Form.Label className="fw-medium">Dirección Completa *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: Av. Colón 850"
                  value={sedeForm.direccion}
                  onChange={(e) => setSedeForm({ ...sedeForm, direccion: e.target.value })}
                  required
                  className="custom-input"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="sTelefono">
                    <Form.Label className="fw-medium">Teléfono</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="+54 9 351 445-1234"
                      value={sedeForm.telefono}
                      onChange={(e) => setSedeForm({ ...sedeForm, telefono: e.target.value })}
                      className="custom-input"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="sEmail">
                    <Form.Label className="fw-medium">Email de Contacto</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="sede@gymfit.com"
                      value={sedeForm.email}
                      onChange={(e) => setSedeForm({ ...sedeForm, email: e.target.value })}
                      className="custom-input"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3" controlId="sHorario">
                    <Form.Label className="fw-medium">Horario de Apertura</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="07:00 a 23:00 hs"
                      value={sedeForm.horario_apertura}
                      onChange={(e) => setSedeForm({ ...sedeForm, horario_apertura: e.target.value })}
                      className="custom-input"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="sCapacidad">
                    <Form.Label className="fw-medium">Capacidad Máxima</Form.Label>
                    <Form.Control
                      type="number"
                      min={10}
                      max={2000}
                      value={sedeForm.capacidad}
                      onChange={(e) => setSedeForm({ ...sedeForm, capacidad: e.target.value })}
                      className="custom-input"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="border-secondary">
              <Button variant="secondary" onClick={() => setShowModalSede(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={guardandoSede} className="hero-btn fw-bold px-4">
                {guardandoSede ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Guardando...
                  </>
                ) : (
                  sedeEditando ? 'Guardar Cambios' : 'Crear Sede'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Modal Cargar / Editar Actividad */}
        <Modal show={showModalActividad} onHide={() => setShowModalActividad(false)} centered size="lg" className="dark-modal">
          <Modal.Header closeButton className="border-secondary text-white">
            <Modal.Title className="fw-bold d-flex align-items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                {actividadEditando ? (
                  <>
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </>
                ) : (
                  <>
                    <path d="M6 5v14" />
                    <path d="M18 5v14" />
                    <path d="M2 9h4" />
                    <path d="M2 15h4" />
                    <path d="M18 9h4" />
                    <path d="M18 15h4" />
                    <path d="M6 12h12" />
                  </>
                )}
              </svg>
              <span>{actividadEditando ? 'Editar Actividad' : 'Nueva Actividad Deportiva'}</span>
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleGuardarActividad}>
            <Modal.Body className="text-white">
              <Form.Group className="mb-3" controlId="actNombre">
                <Form.Label className="fw-medium">Nombre de la Actividad (nombre) *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: Pilates Reformer, Zumba Fitness, Spinning..."
                  value={actividadForm.nombre}
                  onChange={(e) => setActividadForm({ ...actividadForm, nombre: e.target.value })}
                  required
                  className="custom-input"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="actDuracion">
                    <Form.Label className="fw-medium">Duración en minutos (duracion) *</Form.Label>
                    <Form.Control
                      type="number"
                      min={15}
                      max={240}
                      step={5}
                      placeholder="60"
                      value={actividadForm.duracion}
                      onChange={(e) => setActividadForm({ ...actividadForm, duracion: e.target.value })}
                      required
                      className="custom-input"
                    />
                    <Form.Text className="text-light opacity-75">Tiempo en minutos por clase</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="actCupo">
                    <Form.Label className="fw-medium">Cupo Máximo (cupo) *</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      max={200}
                      placeholder="20"
                      value={actividadForm.cupo}
                      onChange={(e) => setActividadForm({ ...actividadForm, cupo: e.target.value })}
                      required
                      className="custom-input"
                    />
                    <Form.Text className="text-light opacity-75">Cantidad de alumnos permitidos</Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="actDescripcion">
                <Form.Label className="fw-medium">Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Breve detalle de la actividad, objetivos o requerimientos..."
                  value={actividadForm.descripcion}
                  onChange={(e) => setActividadForm({ ...actividadForm, descripcion: e.target.value })}
                  className="custom-input"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="border-secondary">
              <Button variant="secondary" onClick={() => setShowModalActividad(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={guardandoActividad} className="hero-btn fw-bold px-4">
                {guardandoActividad ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Guardando...
                  </>
                ) : (
                  actividadEditando ? 'Guardar Cambios' : 'Crear Actividad'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Modal Cargar / Editar Turno (Dependiente de Actividad) */}
        <Modal show={showModalTurno} onHide={() => setShowModalTurno(false)} centered size="lg" className="dark-modal">
          <Modal.Header closeButton className="border-secondary text-white">
            <Modal.Title className="fw-bold d-flex align-items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                {turnoEditando ? (
                  <>
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </>
                ) : (
                  <>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </>
                )}
              </svg>
              <span>{turnoEditando ? 'Editar Turno Horario' : 'Programar Nuevo Turno'}</span>
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleGuardarTurno}>
            <Modal.Body className="text-white">
              <Form.Group className="mb-3" controlId="tActividad">
                <Form.Label className="fw-medium">Actividad Correspondiente *</Form.Label>
                <Form.Select
                  value={turnoForm.actividad_id}
                  onChange={(e) => setTurnoForm({ ...turnoForm, actividad_id: e.target.value })}
                  required
                  className="custom-input"
                >
                  <option value="">Selecciona una actividad...</option>
                  {actividades.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} (Duración: {a.duracion} min | Cupo: {a.cupo})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Botones rápidos de rangos de 2hs */}
              <div className="mb-3">
                <label className="small text-light opacity-75 fw-semibold mb-2 d-flex align-items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <span>Rangos habituales de 2 horas (clic para autocompletar):</span>
                </label>
                <div className="d-flex flex-wrap gap-1">
                  {[
                    ['07:00', '09:00'],
                    ['09:00', '11:00'],
                    ['11:00', '13:00'],
                    ['14:00', '16:00'],
                    ['16:00', '18:00'],
                    ['18:00', '20:00'],
                    ['20:00', '22:00'],
                    ['21:00', '23:00']
                  ].map(([inicio, fin]) => (
                    <Button
                      key={`${inicio}-${fin}`}
                      variant="outline-light"
                      size="sm"
                      className="py-1 px-2 small"
                      style={{ fontSize: '0.78rem' }}
                      onClick={() => setTurnoForm({ ...turnoForm, horarioInicio: inicio, horaFin: fin })}
                    >
                      {inicio} - {fin}
                    </Button>
                  ))}
                </div>
              </div>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="tHorarioInicio">
                    <Form.Label className="fw-medium">Horario de Inicio *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="07:00"
                      value={turnoForm.horarioInicio}
                      onChange={(e) => setTurnoForm({ ...turnoForm, horarioInicio: e.target.value })}
                      required
                      className="custom-input"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="tHoraFin">
                    <Form.Label className="fw-medium">Horario de Fin *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="09:00"
                      value={turnoForm.horaFin}
                      onChange={(e) => setTurnoForm({ ...turnoForm, horaFin: e.target.value })}
                      required
                      className="custom-input"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="tDia">
                    <Form.Label className="fw-medium">Días / Frecuencia *</Form.Label>
                    <Form.Select
                      value={turnoForm.dia_semana}
                      onChange={(e) => setTurnoForm({ ...turnoForm, dia_semana: e.target.value })}
                      className="custom-input"
                      required
                    >
                      <optgroup label="Combinaciones Frecuentes">
                        <option value="Lunes a Sábado">Lunes a Sábado</option>
                        <option value="Lunes a Viernes">Lunes a Viernes</option>
                        <option value="Lunes, Miércoles y Viernes">Lunes, Miércoles y Viernes</option>
                        <option value="Martes y Jueves">Martes y Jueves</option>
                        <option value="Sábados">Sábados</option>
                      </optgroup>
                      <optgroup label="Días Individuales">
                        <option value="Lunes">Lunes</option>
                        <option value="Martes">Martes</option>
                        <option value="Miércoles">Miércoles</option>
                        <option value="Jueves">Jueves</option>
                        <option value="Viernes">Viernes</option>
                        <option value="Sábado">Sábado</option>
                        <option value="Domingo">Domingo</option>
                      </optgroup>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="tProfesor">
                    <Form.Label className="fw-medium">Profesor Asignado</Form.Label>
                    <Form.Select
                      value={turnoForm.profesor_id}
                      onChange={(e) => setTurnoForm({ ...turnoForm, profesor_id: e.target.value })}
                      className="custom-input"
                    >
                      <option value="">Sin Profesor</option>
                      {profesores.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} {p.apellido} ({p.especialidad})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="tSede">
                    <Form.Label className="fw-medium">Sede</Form.Label>
                    <Form.Select
                      value={turnoForm.sede_id}
                      onChange={(e) => setTurnoForm({ ...turnoForm, sede_id: e.target.value })}
                      className="custom-input"
                    >
                      <option value="">Sin Sede</option>
                      {sedes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} - {s.ciudad}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="border-secondary">
              <Button variant="secondary" onClick={() => setShowModalTurno(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={guardandoTurno} className="hero-btn fw-bold px-4">
                {guardandoTurno ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Guardando...
                  </>
                ) : (
                  turnoEditando ? 'Guardar Cambios' : 'Programar Turno'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Modal Confirmación de Eliminación */}
        <Modal show={showDeleteModal} onHide={() => !eliminando && setShowDeleteModal(false)} centered className="dark-modal">
          <Modal.Header closeButton={!eliminando} className="border-secondary text-white">
            <Modal.Title className="fw-bold text-danger">
              Confirmar Eliminación
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-white">
            <p>
              ¿Estás seguro de que deseas eliminar permanentemente{' '}
              {itemAEliminar?.type === 'profesor' && 'al profesor'}
              {itemAEliminar?.type === 'sede' && 'la sede'}
              {itemAEliminar?.type === 'actividad' && 'la actividad'}
              {itemAEliminar?.type === 'turno' && 'el turno'}{' '}
              <strong>{itemAEliminar?.nombre}</strong>?
            </p>
            <p className="small text-danger opacity-75 mb-0">
              Esta acción no se puede deshacer.
            </p>
          </Modal.Body>
          <Modal.Footer className="border-secondary">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={eliminando}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmarEliminar} disabled={eliminando} className="fw-bold">
              {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Admin;
