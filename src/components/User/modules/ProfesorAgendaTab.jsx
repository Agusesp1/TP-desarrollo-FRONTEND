import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Spinner, Alert } from 'react-bootstrap';

const ProfesorAgendaTab = ({ user }) => {
  const [datosAgenda, setDatosAgenda] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarAgenda = async () => {
      if (!user?.email) return;
      setCargando(true);
      setError(null);

      try {
        const res = await fetch(`http://localhost:3000/api/profesores/agenda/${encodeURIComponent(user.email)}`);
        const data = await res.json();

        if (res.ok && data.exito) {
          setDatosAgenda(data);
        } else {
          setError(data.mensaje || 'No se pudo cargar la agenda del profesor.');
        }
      } catch (err) {
        console.error('Error al cargar agenda del profesor:', err);
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
        <p className="text-secondary small mt-3">Cargando tus clases, sedes y horarios asignados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="warning" className="text-center py-4 border-0 rounded-4">
        <h5>{error}</h5>
        <p className="small mb-0">Comunícate con la administración si tu perfil de docente no se encuentra vinculado.</p>
      </Alert>
    );
  }

  const { profesor, turnos = [], sedes = [], actividades = [] } = datosAgenda || {};

  return (
    <div className="profesor-agenda-tab">
      {/* Tarjetas de Estadísticas Rápidas del Profesor */}
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
                <h3 className="fw-bold text-white mb-0">{turnos.length}</h3>
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
                <span className="text-secondary small text-uppercase fw-semibold">Sedes Asignadas</span>
                <h3 className="fw-bold text-white mb-0">{sedes.length}</h3>
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
                <span className="text-secondary small text-uppercase fw-semibold">Actividades a Cargo</span>
                <h3 className="fw-bold text-white mb-0">{actividades.length}</h3>
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
                <span className="text-secondary small text-uppercase fw-semibold">Turno Habitual</span>
                <h4 className="fw-bold text-white mb-0">{profesor?.turno || 'Mañana'}</h4>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Sección 1: Cronograma de Horarios y Clases */}
      <Card className="glass-card border-0 p-4 mb-4 text-white">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <h5 className="fw-bold mb-1 text-white">Horarios y Clases Asignadas</h5>
            <p className="text-secondary small mb-0">
              Consulta en qué días, horarios y sedes dictas tus clases.
            </p>
          </div>
          <Badge bg="primary" className="px-3 py-2 rounded-pill">
            {turnos.length} Clases Activas
          </Badge>
        </div>

        {turnos.length === 0 ? (
          <div className="text-center py-4 text-secondary">
            No tienes turnos o clases asignadas actualmente en el sistema.
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover variant="dark" className="align-middle mb-0 bg-transparent">
              <thead>
                <tr className="border-bottom border-secondary text-secondary small">
                  <th>HORARIO</th>
                  <th>DÍAS DE SEMANA</th>
                  <th>ACTIVIDAD</th>
                  <th>DURACIÓN</th>
                  <th>SEDE</th>
                  <th>CUPO MÁX.</th>
                  <th>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {turnos.map((t) => (
                  <tr key={t.id} className="border-bottom border-secondary border-opacity-25">
                    <td>
                      <span className="badge bg-primary px-2 py-1 fw-bold fs-6">
                        {t.horarioInicio} - {t.horaFin} hs
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold text-white">{t.dia_semana}</span>
                    </td>
                    <td>
                      <span className="fw-bold text-info">{t.actividad?.nombre || 'Clase'}</span>
                    </td>
                    <td>
                      <span className="text-secondary">{t.actividad?.duracion || 60} min</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1 text-secondary-accent">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>{t.sede?.nombre || 'Sede General'}</span>
                      </div>
                    </td>
                    <td>
                      <Badge bg="secondary" className="px-2 py-1">
                        {t.actividad?.cupo || 20} personas
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={t.estado ? 'success' : 'danger'} className="rounded-pill px-2 py-1">
                        {t.estado ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {/* Sección 2 y 3: Sedes y Actividades */}
      <Row className="g-4">
        {/* Sedes Asignadas */}
        <Col lg={6}>
          <Card className="glass-card border-0 p-4 h-100 text-white">
            <h5 className="fw-bold mb-1 text-white">Sedes de Trabajo</h5>
            <p className="text-secondary small mb-3">Sedes de FitApp donde desarrollas tus actividades.</p>

            {sedes.length === 0 ? (
              <p className="text-secondary small">No hay sedes asignadas.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {sedes.map((s) => (
                  <div key={s.id} className="p-3 rounded-3 border border-secondary border-opacity-25" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold text-white mb-0">{s.nombre}</h6>
                      <Badge bg="brand" className="text-dark fw-bold px-2 py-1 rounded-pill">
                        Sede Habilitada
                      </Badge>
                    </div>
                    <p className="text-secondary small mb-1">
                      📍 {s.direccion}, {s.ciudad}
                    </p>
                    <p className="text-secondary small mb-1">
                      🕒 Horario: {s.horario_apertura || '07:00 a 23:00 hs'}
                    </p>
                    {s.telefono && (
                      <p className="text-secondary small mb-0">
                        📞 Teléfono: {s.telefono}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* Actividades a Cargo */}
        <Col lg={6}>
          <Card className="glass-card border-0 p-4 h-100 text-white">
            <h5 className="fw-bold mb-1 text-white">Actividades a tu Cargo</h5>
            <p className="text-secondary small mb-3">Disciplinas y entrenamientos que tienes asignados.</p>

            {actividades.length === 0 ? (
              <p className="text-secondary small">No hay actividades asignadas.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {actividades.map((a) => (
                  <div key={a.id} className="p-3 rounded-3 border border-secondary border-opacity-25" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold text-white mb-0">{a.nombre}</h6>
                      <Badge bg="primary" className="px-2 py-1 rounded-pill">
                        {a.duracion} min
                      </Badge>
                    </div>
                    <p className="text-secondary small mb-2">
                      {a.descripcion || 'Entrenamiento especializado FitApp.'}
                    </p>
                    <span className="badge bg-dark border border-secondary border-opacity-50 text-secondary small">
                      Capacidad máxima: {a.cupo} alumnos por turno
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

export default ProfesorAgendaTab;
