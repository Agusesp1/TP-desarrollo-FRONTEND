import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

const AdminStats = ({ stats }) => {
  return (
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
  );
};

export default AdminStats;
