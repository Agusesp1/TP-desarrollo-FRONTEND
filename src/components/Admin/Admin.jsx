import { useState, useEffect, useCallback } from 'react';
import { Container, Card, Row, Col, Button, Badge, Nav, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

import AdminStats from './AdminStats';
import AdminDeleteModal from './AdminDeleteModal';
import TeachersManager from './modules/TeachersManager';
import BranchesManager from './modules/BranchesManager';
import ActivitiesManager from './modules/ActivitiesManager';
import ShiftsManager from './modules/ShiftsManager';
import ClientesManager from './modules/ClientesManager';
import CalendarAdmin from './modules/CalendarAdmin';
import QuotasAdminManager from './modules/QuotasAdminManager';

const API_BASE = 'http://localhost:3000/api';

const Admin = () => {
  const { user } = useAuth();

  // Active Tab: teachers | branches | activities | shifts | clients | quotas | calendar
  const [activeTab, setActiveTab] = useState('teachers');

  // Stats State
  const [stats, setStats] = useState({
    totalSocios: 0,
    totalProfesores: 0,
    teachersActivos: 0,
    totalSedes: 0,
    branchesActivas: 0,
    totalActividades: 0,
    activitiesActivas: 0,
    totalTurnos: 0,
    shiftsActivos: 0
  });

  // Entities Data
  const [teachers, setProfesores] = useState([]);
  const [cargandoProfesores, setCargandoProfesores] = useState(false);

  const [branches, setSedes] = useState([]);
  const [cargandoSedes, setCargandoSedes] = useState(false);

  const [activities, setActividades] = useState([]);
  const [cargandoActividades, setCargandoActividades] = useState(false);

  const [shifts, setTurnos] = useState([]);
  const [cargandoTurnos, setCargandoTurnos] = useState(false);

  // Modal Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState(null); // { type: 'teacher' | 'branch' | 'activity' | 'shift', id, name }
  const [eliminando, setEliminando] = useState(false);

  // Alerta Feedback
  const [alerta, setAlerta] = useState(null);

  const esAdmin = user && (user.role === 'admin' || user.email === 'administraciongymfit@gmail.com');

  const mostrarAlerta = (message, type = 'success') => {
    setAlerta({ message, type });
    setTimeout(() => setAlerta(null), 4500);
  };

  // Cargas de datos
  const cargarEstadisticas = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/estadisticas`);
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.estadisticas);
      }
    } catch (err) {
      console.warn('Error al cargar estadísticas:', err);
    }
  }, []);

  const cargarSedes = useCallback(async () => {
    setCargandoSedes(true);
    try {
      const res = await fetch(`${API_BASE}/branches`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSedes(data.branches || []);
      }
    } catch (err) {
      console.error('Error al cargar branches:', err);
    } finally {
      setCargandoSedes(false);
    }
  }, []);

  const cargarProfesores = useCallback(async () => {
    setCargandoProfesores(true);
    try {
      const res = await fetch(`${API_BASE}/teachers`);
      const data = await res.json();
      if (res.ok && data.success) {
        setProfesores(data.teachers || []);
      }
    } catch (err) {
      console.error('Error al cargar teachers:', err);
    } finally {
      setCargandoProfesores(false);
    }
  }, []);

  const cargarActividades = useCallback(async () => {
    setCargandoActividades(true);
    try {
      const res = await fetch(`${API_BASE}/activities`);
      const data = await res.json();
      if (res.ok && data.success) {
        setActividades(data.activities || []);
      }
    } catch (err) {
      console.error('Error al cargar activities:', err);
    } finally {
      setCargandoActividades(false);
    }
  }, []);

  const cargarTurnos = useCallback(async () => {
    setCargandoTurnos(true);
    try {
      const res = await fetch(`${API_BASE}/shifts`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTurnos(data.shifts || []);
      }
    } catch (err) {
      console.error('Error al cargar shifts:', err);
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
      if (itemAEliminar.type === 'teacher') endpoint = `${API_BASE}/teachers/${itemAEliminar.id}`;
      if (itemAEliminar.type === 'branch') endpoint = `${API_BASE}/branches/${itemAEliminar.id}`;
      if (itemAEliminar.type === 'activity') endpoint = `${API_BASE}/activities/${itemAEliminar.id}`;
      if (itemAEliminar.type === 'shift') endpoint = `${API_BASE}/shifts/${itemAEliminar.id}`;

      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok && data.success) {
        mostrarAlerta(data.message || 'Registro eliminado correctamente');
        setShowDeleteModal(false);
        recargarTodo();
      } else {
        mostrarAlerta(data.message || 'Error al eliminar registro', 'danger');
      }
    } catch {
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
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
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
                Ver Mi Profile de User
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Tarjetas de Estadísticas Rápidas */}
        <AdminStats stats={stats} />

        {/* Alerta general flotante (siempre por encima de modales) */}
        {alerta && (
          <div className="admin-floating-alert-wrapper">
            <Alert
              variant={alerta.type}
              dismissible
              onClose={() => setAlerta(null)}
              className="text-center shadow-lg border-0 mb-0 py-3"
            >
              {alerta.message}
            </Alert>
          </div>
        )}

        {/* Navegación por Pestañas */}
        <Nav className="admin-nav-tabs mb-4 gap-2 border-0 flex-wrap">
          <Nav.Item>
            <Nav.Link
              className={activeTab === 'teachers' ? 'active' : ''}
              onClick={() => setActiveTab('teachers')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              Teachers ({teachers.length})
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              className={activeTab === 'branches' ? 'active' : ''}
              onClick={() => setActiveTab('branches')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Branches ({branches.length})
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              className={activeTab === 'activities' ? 'active' : ''}
              onClick={() => setActiveTab('activities')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m4.93 4.93 4.24 4.24" />
                <path d="m14.83 9.17 4.24-4.24" />
              </svg>
              Activities ({activities.length})
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              className={activeTab === 'shifts' ? 'active' : ''}
              onClick={() => setActiveTab('shifts')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Shifts ({shifts.length})
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              className={activeTab === 'clients' ? 'active' : ''}
              onClick={() => setActiveTab('clients')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Users
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              className={activeTab === 'quotas' ? 'active' : ''}
              onClick={() => setActiveTab('quotas')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" strokeWidth="2" />
                <line x1="6" y1="15" x2="8" y2="15" strokeWidth="2" />
              </svg>
              Quotas & Prices
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              className={activeTab === 'calendar' ? 'active' : ''}
              onClick={() => setActiveTab('calendar')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Calendar Semanal
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Submódulos según la pestaña seleccionada */}
        {activeTab === 'teachers' && (
          <TeachersManager
            teachers={teachers}
            branches={branches}
            cargando={cargandoProfesores}
            onRecargar={cargarProfesores}
            onMostrarAlerta={mostrarAlerta}
            onPedirEliminar={handlePedirEliminar}
            apiBase={API_BASE}
          />
        )}

        {activeTab === 'branches' && (
          <BranchesManager
            branches={branches}
            teachers={teachers}
            cargando={cargandoSedes}
            onRecargar={() => {
              cargarSedes();
              cargarActividades();
              cargarTurnos();
            }}
            onMostrarAlerta={mostrarAlerta}
            onPedirEliminar={handlePedirEliminar}
            apiBase={API_BASE}
          />
        )}

        {activeTab === 'activities' && (
          <ActivitiesManager
            activities={activities}
            branches={branches}
            teachers={teachers}
            cargando={cargandoActividades}
            onRecargar={() => {
              cargarActividades();
              cargarTurnos();
            }}
            onMostrarAlerta={mostrarAlerta}
            onPedirEliminar={handlePedirEliminar}
            apiBase={API_BASE}
          />
        )}

        {activeTab === 'shifts' && (
          <ShiftsManager
            shifts={shifts}
            activities={activities}
            teachers={teachers}
            branches={branches}
            cargando={cargandoTurnos}
            onRecargar={cargarTurnos}
            onMostrarAlerta={mostrarAlerta}
            onPedirEliminar={handlePedirEliminar}
            apiBase={API_BASE}
          />
        )}

        {activeTab === 'clients' && (
          <ClientesManager
            onMostrarAlerta={mostrarAlerta}
            apiBase={API_BASE}
          />
        )}

        {activeTab === 'quotas' && (
          <QuotasAdminManager
            onMostrarAlerta={mostrarAlerta}
            apiBase={API_BASE}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarAdmin
            shifts={shifts}
            branches={branches}
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
