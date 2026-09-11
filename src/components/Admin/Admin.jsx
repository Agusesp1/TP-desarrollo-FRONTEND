import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Row, Col, Button, Badge, Nav, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

import AdminStats from './AdminStats';
import AdminDeleteModal from './AdminDeleteModal';
import ProfesoresManager from './modules/ProfesoresManager';
import SedesManager from './modules/SedesManager';
import ActividadesManager from './modules/ActividadesManager';
import TurnosManager from './modules/TurnosManager';
import ClientesManager from './modules/ClientesManager';

const API_BASE = 'http://localhost:3000/api';

const Admin = () => {
  const { user } = useAuth();

  // Active Tab: profesores | sedes | actividades | turnos | clientes
  const [activeTab, setActiveTab] = useState('profesores');

  // Stats State
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

  // Entities Data
  const [profesores, setProfesores] = useState([]);
  const [cargandoProfesores, setCargandoProfesores] = useState(false);

  const [sedes, setSedes] = useState([]);
  const [cargandoSedes, setCargandoSedes] = useState(false);

  const [actividades, setActividades] = useState([]);
  const [cargandoActividades, setCargandoActividades] = useState(false);

  const [turnos, setTurnos] = useState([]);
  const [cargandoTurnos, setCargandoTurnos] = useState(false);

  // Modal Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState(null); // { type: 'profesor' | 'sede' | 'actividad' | 'turno', id, nombre }
  const [eliminando, setEliminando] = useState(false);

  // Alerta Feedback
  const [alerta, setAlerta] = useState(null);

  const esAdmin = user && (user.rol === 'admin' || user.email === 'administraciongymfit@gmail.com');

  const mostrarAlerta = (mensaje, type = 'success') => {
    setAlerta({ mensaje, type });
    setTimeout(() => setAlerta(null), 4500);
  };

  // Cargas de datos
  const cargarEstadisticas = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/estadisticas`);
      const data = await res.json();
      if (res.ok && data.exito) {
        setStats(data.estadisticas);
      }
    } catch (err) {
      console.warn('Error al cargar estadísticas:', err);
    }
  }, []);

  const cargarSedes = useCallback(async () => {
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
  }, []);

  const cargarProfesores = useCallback(async () => {
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
  }, []);

  const cargarActividades = useCallback(async () => {
    setCargandoActividades(true);
    try {
      const res = await fetch(`${API_BASE}/actividades`);
      const data = await res.json();
      if (res.ok && data.exito) {
        setActividades(data.actividades || []);
      }
    } catch (err) {
      console.error('Error al cargar actividades:', err);
    } finally {
      setCargandoActividades(false);
    }
  }, []);

  const cargarTurnos = useCallback(async () => {
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
  }, []);

  const recargarTodo = useCallback(() => {
    cargarEstadisticas();
    cargarSedes();
    cargarProfesores();
    cargarActividades();
    cargarTurnos();
  }, [cargarEstadisticas, cargarSedes, cargarProfesores, cargarActividades, cargarTurnos]);

  useEffect(() => {
    if (esAdmin) {
      recargarTodo();
    }
  }, [esAdmin, recargarTodo]);

  // Manejo de Eliminaciones
  const handlePedirEliminar = (item) => {
    setItemAEliminar(item);
    setShowDeleteModal(true);
  };

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
        mostrarAlerta(data.mensaje || 'Registro eliminado correctamente');
        setShowDeleteModal(false);
        recargarTodo();
      } else {
        mostrarAlerta(data.mensaje || 'Error al eliminar registro', 'danger');
      }
    } catch (error) {
      mostrarAlerta('Error de conexión con el servidor', 'danger');
    } finally {
      setEliminando(false);
    }
  };

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
        <AdminStats stats={stats} />

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

          <Nav.Item>
            <Nav.Link
              className={activeTab === 'clientes' ? 'active' : ''}
              onClick={() => setActiveTab('clientes')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Socios / Clientes
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Submódulos según la pestaña seleccionada */}
        {activeTab === 'profesores' && (
          <ProfesoresManager
            profesores={profesores}
            sedes={sedes}
            cargando={cargandoProfesores}
            onRecargar={cargarProfesores}
            onMostrarAlerta={mostrarAlerta}
            onPedirEliminar={handlePedirEliminar}
            apiBase={API_BASE}
          />
        )}

        {activeTab === 'sedes' && (
          <SedesManager
            sedes={sedes}
            cargando={cargandoSedes}
            onRecargar={cargarSedes}
            onMostrarAlerta={mostrarAlerta}
            onPedirEliminar={handlePedirEliminar}
            apiBase={API_BASE}
          />
        )}

        {activeTab === 'actividades' && (
          <ActividadesManager
            actividades={actividades}
            cargando={cargandoActividades}
            onRecargar={cargarActividades}
            onMostrarAlerta={mostrarAlerta}
            onPedirEliminar={handlePedirEliminar}
            apiBase={API_BASE}
          />
        )}

        {activeTab === 'turnos' && (
          <TurnosManager
            turnos={turnos}
            actividades={actividades}
            profesores={profesores}
            sedes={sedes}
            cargando={cargandoTurnos}
            onRecargar={cargarTurnos}
            onMostrarAlerta={mostrarAlerta}
            onPedirEliminar={handlePedirEliminar}
            apiBase={API_BASE}
          />
        )}

        {activeTab === 'clientes' && (
          <ClientesManager
            onMostrarAlerta={mostrarAlerta}
            apiBase={API_BASE}
          />
        )}

        {/* Modal de Eliminación Reutilizable */}
        <AdminDeleteModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          item={itemAEliminar}
          onConfirm={handleConfirmarEliminar}
          eliminando={eliminando}
        />
      </Container>
    </div>
  );
};

export default Admin;
