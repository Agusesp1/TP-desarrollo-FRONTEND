import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Spinner, Alert } from 'react-bootstrap';

const TeacherAgendaTab = ({ user }) => {
  const [datosAgenda, setDatosAgenda] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarAgenda = async () => {
      if (!user?.email) return;
      setCargando(true);
      setError(null);

      try {
        const res = await fetch(`http://localhost:3000/api/teachers/agenda/${encodeURIComponent(user.email)}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setDatosAgenda(data);
        } else {
          setError(data.message || 'No se pudo cargar la agenda del teacher.');
        }
      } catch (err) {
        console.error('Error al cargar agenda del teacher:', err);
        setError('Error de conexión al obtener la agenda de clases.');
      } finally {
        setCargando(false);
      }
    };

    cargarAgenda();
  }, [user?.email]);

  if (cargando) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="text-secondary small mt-3">Cargando tus clases, branches y schedules asignados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="warning" className="text-center py-4 border-0 rounded-4">
        <h5>{error}</h5>
        <p className="small mb-0">Comunícate con la administración si tu profile de docente no se encuentra vinculado.</p>
      </Alert>
    );
  }

  const { teacher, shifts = [], branches = [], activities = [] } = datosAgenda || {};

  return (
    <div className="teacher-agenda-tab">
      {/* Tarjetas de Estadísticas Rápidas del Teacher */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <Card className="glass-card border-0 p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon-wrapper stat-icon-primary rounded-3 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div>
                <span className="text-secondary small text-uppercase fw-semibold">Clases Semanales</span>
                <h3 className="fw-bold text-white mb-0">{shifts.length}</h3>
              </div>
            </div>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="glass-card border-0 p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon-wrapper stat-icon-success rounded-3 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div>
                <span className="text-secondary small text-uppercase fw-semibold">Branches Asignadas</span>
                <h3 className="fw-bold text-white mb-0">{branches.length}</h3>
              </div>
            </div>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="glass-card border-0 p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon-wrapper stat-icon-primary rounded-3 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6.5 6.5 11 11"></path>
                  <path d="m21 21-1-1a5 5 0 0 0-7.07 0l-.93.93a5 5 0 0 1-7.07 0l-1-1"></path>
                  <path d="m3 3 1 1a5 5 0 0 0 7.07 0l.93-.93a5 5 0 0 1 7.07 0l1 1"></path>
                </svg>
              </div>
              <div>
                <span className="text-secondary small text-uppercase fw-semibold">Activities a Cargo</span>
                <h3 className="fw-bold text-white mb-0">{activities.length}</h3>
              </div>
            </div>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="glass-card border-0 p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon-wrapper stat-icon-success rounded-3 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <span className="text-secondary small text-uppercase fw-semibold">Shift Habitual</span>
                <h4 className="fw-bold text-white mb-0">{teacher?.shift || 'Mañana'}</h4>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Sección 1: Cronograma de Schedules y Clases */}
      <Card className="glass-card border-0 p-4 mb-4 text-white">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <h5 className="fw-bold mb-1 text-white">Schedules y Clases Asignadas</h5>
            <p className="text-secondary small mb-0">
              Consulta en qué días, schedules y branches dictas tus clases.
            </p>
          </div>
          <Badge bg="primary" className="px-3 py-2 rounded-pill">
            {shifts.length} Clases Activas
          </Badge>
        </div>

        {shifts.length === 0 ? (
          <div className="text-center py-4 text-secondary">
            No tienes shifts o clases asignadas actualmente en el sistema.
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover variant="dark" className="align-middle mb-0 bg-transparent">
              <thead>
                <tr className="border-bottom border-secondary text-secondary small">
                  <th>SCHEDULE</th>
                  <th>DÍAS DE SEMANA</th>
                  <th>ACTIVITY</th>
                  <th>DURACIÓN</th>
                  <th>BRANCH</th>
                  <th>CAPACITY MÁX.</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((t) => (
                  <tr key={t.id} className="border-bottom border-secondary border-opacity-25">
                    <td>
                      <span className="badge bg-primary px-2 py-1 fw-bold fs-6">
                        {t.startTime} - {t.endTime} hs
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold text-white">{t.dayOfWeek}</span>
                    </td>
                    <td>
                      <span className="fw-bold text-info">{t.activity?.name || 'Clase'}</span>
                    </td>
                    <td>
                      <span className="text-secondary">{t.activity?.duration || 60} min</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1 text-secondary-accent">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>{t.branch?.name || 'Branch General'}</span>
                      </div>
                    </td>
                    <td>
                      <Badge bg="secondary" className="px-2 py-1">
                        {t.activity?.capacity || 20} personas
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={t.status ? 'success' : 'danger'} className="rounded-pill px-2 py-1">
                        {t.status ? 'Active' : 'Inactivo'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {/* Sección 2 y 3: Branches y Activities */}
      <Row className="g-4">
        {/* Branches Asignadas */}
        <Col lg={6}>
          <Card className="glass-card border-0 p-4 h-100 text-white">
            <h5 className="fw-bold mb-1 text-white">Branches de Trabajo</h5>
            <p className="text-secondary small mb-3">Branches de FitApp donde desarrollas tus activities.</p>

            {branches.length === 0 ? (
              <p className="text-secondary small">No hay branches asignadas.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {branches.map((s) => (
                  <div key={s.id} className="p-3 rounded-3 border border-secondary border-opacity-25" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold text-white mb-0">{s.name}</h6>
                      <Badge bg="brand" className="text-dark fw-bold px-2 py-1 rounded-pill">
                        Branch Habilitada
                      </Badge>
                    </div>
                    <p className="text-secondary small mb-1">
                      📍 {s.address}, {s.city}
                    </p>
                    <p className="text-secondary small mb-1">
                      🕒 Schedule: {s.opening_hours || '07:00 a 23:00 hs'}
                    </p>
                    {s.phone && (
                      <p className="text-secondary small mb-0">
                        📞 Teléfono: {s.phone}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* Activities a Cargo */}
        <Col lg={6}>
          <Card className="glass-card border-0 p-4 h-100 text-white">
            <h5 className="fw-bold mb-1 text-white">Activities a tu Cargo</h5>
            <p className="text-secondary small mb-3">Disciplinas y trainings que tienes asignados.</p>

            {activities.length === 0 ? (
              <p className="text-secondary small">No hay activities asignadas.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {activities.map((a) => (
                  <div key={a.id} className="p-3 rounded-3 border border-secondary border-opacity-25" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold text-white mb-0">{a.name}</h6>
                      <Badge bg="primary" className="px-2 py-1 rounded-pill">
                        {a.duration} min
                      </Badge>
                    </div>
                    <p className="text-secondary small mb-2">
                      {a.description || 'Training especializado FitApp.'}
                    </p>
                    <span className="badge bg-dark border border-secondary border-opacity-50 text-secondary small">
                      Capacity máxima: {a.capacity} alumnos por shift
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TeacherAgendaTab;
