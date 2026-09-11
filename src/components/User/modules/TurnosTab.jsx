import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Form, Spinner, Alert } from 'react-bootstrap';

const TurnosTab = ({ user }) => {
  const [turnos, setTurnos] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [cargando, setCargando] = useState(false);

  const [filtroActividad, setFiltroActividad] = useState('todas');
  const [filtroSede, setFiltroSede] = useState('');
  const [misReservas, setMisReservas] = useState([
    { id: 1, actividad: 'Musculación & Sala de Pesas', horario: '18:00 - 20:00 hs', dia: 'Hoy', sede: 'FitApp Sede Centro' }
  ]);
  const [alerta, setAlerta] = useState(null);

  const mostrarMensaje = (texto, tipo = 'success') => {
    setAlerta({ texto, tipo });
    setTimeout(() => setAlerta(null), 3500);
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const [resTurnos, resAct, resSedes] = await Promise.all([
          fetch('http://localhost:3000/api/turnos?soloActivos=true'),
          fetch('http://localhost:3000/api/actividades?soloActivas=true'),
          fetch('http://localhost:3000/api/sedes')
        ]);

        const dataTurnos = await resTurnos.json();
        const dataAct = await resAct.json();
        const dataSedes = await resSedes.json();

        if (dataTurnos.exito) setTurnos(dataTurnos.turnos || []);
        if (dataAct.exito) setActividades(dataAct.actividades || []);
        if (dataSedes.exito) setSedes(dataSedes.sedes || []);
      } catch (err) {
        console.error('Error al cargar turnos disponibles:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const handleReservar = (turno) => {
    const yaReservado = misReservas.some((r) => r.turnoId === turno.id);
    if (yaReservado) {
      mostrarMensaje('Ya cuentas con una reserva activa para este turno.', 'warning');
      return;
    }

    const nuevaReserva = {
      id: Date.now(),
      turnoId: turno.id,
      actividad: turno.actividad?.nombre || 'Clase',
      horario: `${turno.horarioInicio} - ${turno.horaFin} hs`,
      dia: turno.dia_semana,
      sede: turno.sede?.nombre || 'Sede Central'
    };

    setMisReservas((prev) => [nuevaReserva, ...prev]);
    mostrarMensaje(`¡Reserva confirmada para ${nuevaReserva.actividad} (${nuevaReserva.horario})!`);
  };

  const handleCancelarReserva = (reservaId) => {
    setMisReservas((prev) => prev.filter((r) => r.id !== reservaId));
    mostrarMensaje('Reserva cancelada correctamente.', 'info');
  };

  const turnosFiltrados = turnos.filter((t) => {
    const coincideActividad =
      filtroActividad === 'todas' ||
      !filtroActividad ||
      (t.actividad_id && t.actividad_id.toString() === filtroActividad.toString());

    const coincideSede =
      !filtroSede ||
      (t.sede_id && t.sede_id.toString() === filtroSede.toString());

    return coincideActividad && coincideSede;
  });

  return (
    <div className="d-flex flex-column gap-4">
      {/* Alerta de Feedback */}
      {alerta && (
        <Alert variant={alerta.tipo} dismissible onClose={() => setAlerta(null)} className="text-center">
          {alerta.texto}
        </Alert>
      )}

      {/* Mis Reservas Activas */}
      <Card className="glass-card border-0 p-4 text-white">
        <h4 className="fw-bold mb-1 text-white d-flex align-items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          Mis Reservas Activas ({misReservas.length})
        </h4>
        <p className="text-light opacity-75 small mb-3">
          Presenta tu DNI en el ingreso de la sede para acceder a tus clases agendadas.
        </p>

        {misReservas.length === 0 ? (
          <div className="p-3 rounded-3 bg-dark border border-secondary text-center text-light opacity-75">
            No tienes turnos agendados actualmente. Puedes explorar y reservar turnos abajo.
          </div>
        ) : (
          <Row className="g-3">
            {misReservas.map((reserva) => (
              <Col md={6} key={reserva.id}>
                <div className="p-3 rounded-3 bg-dark border border-secondary d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold text-white mb-1">{reserva.actividad}</h6>
                    <div className="small text-primary fw-medium mb-1">
                      {reserva.horario} • {reserva.dia}
                    </div>
                    <small className="text-light opacity-75 d-block">{reserva.sede}</small>
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="rounded-pill px-3 py-1"
                    onClick={() => handleCancelarReserva(reserva.id)}
                  >
                    Cancelar
                  </Button>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Explorar y Reservar Nuevos Turnos */}
      <Card className="glass-card border-0 p-4 text-white">
        <div className="mb-4">
          <h4 className="fw-bold mb-1 text-white">Turnos y Clases Disponibles</h4>
          <p className="text-light opacity-75 small mb-0">
            Filtra por tu disciplina preferida o sede para reservar tu lugar.
          </p>
        </div>

        <Row className="g-3 mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small text-light">Filtrar por Actividad</Form.Label>
              <Form.Select
                value={filtroActividad}
                onChange={(e) => setFiltroActividad(e.target.value)}
                className="bg-transparent text-white border-secondary"
              >
                <option value="todas" className="bg-dark text-white">Todas las Actividades</option>
                {actividades.map((a) => (
                  <option key={a.id} value={a.id} className="bg-dark text-white">
                    {a.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="small text-light">Filtrar por Sede</Form.Label>
              <Form.Select
                value={filtroSede}
                onChange={(e) => setFiltroSede(e.target.value)}
                className="bg-transparent text-white border-secondary"
              >
                <option value="" className="bg-dark text-white">Todas las Sedes</option>
                {sedes.map((s) => (
                  <option key={s.id} value={s.id} className="bg-dark text-white">
                    {s.nombre} ({s.ciudad})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {cargando ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-light opacity-75">Cargando turnos disponibles...</p>
          </div>
        ) : turnosFiltrados.length === 0 ? (
          <div className="text-center py-4 text-light opacity-75">
            No se encontraron horarios para los filtros seleccionados.
          </div>
        ) : (
          <Row className="g-3">
            {turnosFiltrados.map((turno) => (
              <Col md={6} lg={4} key={turno.id}>
                <div className="p-3 rounded-3 bg-dark border border-secondary h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold text-white mb-0">
                        {turno.actividad?.nombre}
                      </h6>
                      <Badge bg="primary">
                        {turno.horarioInicio} - {turno.horaFin} hs
                      </Badge>
                    </div>

                    <p className="small text-light opacity-75 mb-2">
                      📅 {turno.dia_semana}
                    </p>

                    <div className="small text-light opacity-75 mb-1">
                      📍 {turno.sede?.nombre || 'Sede General'}
                    </div>

                    {turno.profesor && (
                      <div className="small text-info">
                        👤 Prof. {turno.profesor.nombre} {turno.profesor.apellido}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-2 border-top border-secondary text-end">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="rounded-pill px-4 fw-bold hero-btn text-white"
                      onClick={() => handleReservar(turno)}
                    >
                      Reservar Lugar
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Card>
    </div>
  );
};

export default TurnosTab;
