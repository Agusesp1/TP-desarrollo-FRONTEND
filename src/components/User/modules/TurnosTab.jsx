import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-bootstrap';
import './TurnosTab.css';

// Componentes modulares
import { getFechaLocalISO, turnoAplicaEnDia, generarDias } from './turnos/helpers';
import TurnosHeader from './turnos/TurnosHeader';
import SedesSelector from './turnos/SedesSelector';
import DateSelector from './turnos/DateSelector';
import FiltroActividadBar from './turnos/FiltroActividadBar';
import ClasesList from './turnos/ClasesList';
import MisReservasView from './turnos/MisReservasView';
import { ModalConfirmarReserva, ModalCancelarReserva } from './turnos/ModalesReserva';

const TurnosTab = ({ user }) => {
  const fechaHoyISO = getFechaLocalISO();
  const diasSemana = generarDias();

  // Estados de datos
  const [turnos, setTurnos] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [misReservas, setMisReservas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null);

  // Estados de vista y filtros
  const [vistaActiva, setVistaActiva] = useState('turnos'); // 'turnos' | 'mis-reservas'
  const [diaSeleccionado, setDiaSeleccionado] = useState(fechaHoyISO);
  const [sedeSeleccionada, setSedeSeleccionada] = useState('todas');
  const [filtroActividad, setFiltroActividad] = useState('todas');

  // Estados de modales
  const [modalReserva, setModalReserva] = useState({ open: false, turno: null });
  const [modalCancelar, setModalCancelar] = useState({ open: false, reservaId: null, nombreClase: '' });
  const [guardando, setGuardando] = useState(false);

  const esMismoDia = diaSeleccionado === fechaHoyISO;

  const mostrarMensaje = (texto, tipo = 'success') => {
    setAlerta({ texto, tipo });
    setTimeout(() => setAlerta(null), 4000);
  };

  // Cargar sedes y actividades iniciales
  useEffect(() => {
    const cargarMaestros = async () => {
      try {
        const [resAct, resSedes] = await Promise.all([
          fetch('http://localhost:3000/api/actividades?soloActivas=true'),
          fetch('http://localhost:3000/api/sedes')
        ]);
        const dataAct = await resAct.json();
        const dataSedes = await resSedes.json();

        if (dataAct.exito) setActividades(dataAct.actividades || []);
        if (dataSedes.exito) setSedes(dataSedes.sedes || []);
      } catch (err) {
        console.error('Error al cargar actividades y sedes:', err);
      }
    };
    cargarMaestros();
  }, []);

  // Cargar turnos y reservas en tiempo real
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const userParam = user?.id ? `&usuario_id=${user.id}` : '';
      const [resTurnos, resReservas] = await Promise.all([
        fetch(`http://localhost:3000/api/turnos?soloActivos=true&fecha=${diaSeleccionado}${userParam}`),
        user?.id ? fetch(`http://localhost:3000/api/reservas/usuario/${user.id}`) : Promise.resolve(null)
      ]);

      const dataTurnos = await resTurnos.json();
      if (dataTurnos.exito) {
        setTurnos(dataTurnos.turnos || []);
      }

      if (resReservas) {
        const dataReservas = await resReservas.json();
        if (dataReservas.exito) {
          setMisReservas(dataReservas.reservas || []);
        }
      }
    } catch (err) {
      console.error('Error al cargar turnos:', err);
      mostrarMensaje('No se pudieron sincronizar los turnos con el servidor.', 'danger');
    } finally {
      setCargando(false);
    }
  }, [diaSeleccionado, user?.id]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Manejadores de Reserva
  const handlePedirReserva = (turno) => {
    if (!user) {
      mostrarMensaje('Debes tener una sesión iniciada para reservar turnos.', 'danger');
      return;
    }
    if (!esMismoDia) {
      mostrarMensaje('Solo se permite reservar turnos para el día de hoy.', 'warning');
      return;
    }
    if (turno.esta_lleno) {
      mostrarMensaje('Esta clase ya no cuenta con cupos disponibles.', 'warning');
      return;
    }
    if (turno.reservado_por_mi) {
      mostrarMensaje('Ya te encuentras inscripto en este turno para hoy.', 'info');
      return;
    }
    setModalReserva({ open: true, turno });
  };

  const handleConfirmarReserva = async () => {
    if (!modalReserva.turno || !user) return;
    setGuardando(true);

    try {
      const res = await fetch('http://localhost:3000/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          turno_id: modalReserva.turno.id,
          fecha: diaSeleccionado
        })
      });

      const data = await res.json();
      if (res.ok && data.exito) {
        mostrarMensaje(data.mensaje || '¡Reserva confirmada con éxito!', 'success');
        setModalReserva({ open: false, turno: null });
        await cargarDatos();
      } else {
        mostrarMensaje(data.mensaje || 'No se pudo confirmar la reserva', 'danger');
      }
    } catch (err) {
      console.error('Error al reservar turno:', err);
      mostrarMensaje('Error de conexión al procesar la reserva.', 'danger');
    } finally {
      setGuardando(false);
    }
  };

  // Manejadores de Cancelación
  const handlePedirCancelar = (reservaId, nombreClase) => {
    setModalCancelar({ open: true, reservaId, nombreClase });
  };

  const handleConfirmarCancelacion = async () => {
    if (!modalCancelar.reservaId) return;
    setGuardando(true);

    try {
      const res = await fetch(`http://localhost:3000/api/reservas/${modalCancelar.reservaId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user?.id })
      });

      const data = await res.json();
      if (res.ok && data.exito) {
        mostrarMensaje(data.mensaje || 'Reserva cancelada exitosamente.', 'success');
        setModalCancelar({ open: false, reservaId: null, nombreClase: '' });
        await cargarDatos();
      } else {
        mostrarMensaje(data.mensaje || 'Error al cancelar la reserva.', 'danger');
      }
    } catch (err) {
      console.error('Error al cancelar reserva:', err);
      mostrarMensaje('Error de red al cancelar la reserva.', 'danger');
    } finally {
      setGuardando(false);
    }
  };

  // Filtros aplicados
  const turnosFiltrados = turnos.filter((t) => {
    if (sedeSeleccionada !== 'todas' && t.sede_id?.toString() !== sedeSeleccionada.toString()) return false;
    if (filtroActividad !== 'todas' && t.actividad_id?.toString() !== filtroActividad.toString()) return false;
    if (!turnoAplicaEnDia(t.dia_semana, diaSeleccionado)) return false;
    return true;
  });

  const getMesYAnio = () => {
    const d = diasSemana.find((dia) => dia.id === diaSeleccionado) || diasSemana[0];
    return `${d.mesNombre} ${d.anio}`;
  };

  const diaActualInfo = diasSemana.find((d) => d.id === diaSeleccionado) || diasSemana[0];
  const misReservasHoy = misReservas.filter((r) => r.fecha === fechaHoyISO);

  return (
    <div className="mobile-reservas-container p-3 p-md-4">
      {/* Header y toggle de vistas */}
      <TurnosHeader
        esMismoDia={esMismoDia}
        diaActualInfo={diaActualInfo}
        onVolverAHoy={() => setDiaSeleccionado(fechaHoyISO)}
        vistaActiva={vistaActiva}
        setVistaActiva={setVistaActiva}
        reservasHoyCount={misReservasHoy.length}
      />

      {alerta && (
        <Alert variant={alerta.tipo} dismissible onClose={() => setAlerta(null)} className="py-2 text-center small rounded-3 border-0">
          {alerta.texto}
        </Alert>
      )}

      {vistaActiva === 'mis-reservas' ? (
        <MisReservasView
          cargando={cargando}
          misReservas={misReservas}
          fechaHoyISO={fechaHoyISO}
          onPedirCancelar={handlePedirCancelar}
          onVolverAClases={() => setVistaActiva('turnos')}
        />
      ) : (
        <>
          <SedesSelector
            sedes={sedes}
            sedeSeleccionada={sedeSeleccionada}
            setSedeSeleccionada={setSedeSeleccionada}
          />

          <DateSelector
            diasSemana={diasSemana}
            diaSeleccionado={diaSeleccionado}
            setDiaSeleccionado={setDiaSeleccionado}
            fechaHoyISO={fechaHoyISO}
            esMismoDia={esMismoDia}
            diaActualInfo={diaActualInfo}
            getMesYAnio={getMesYAnio}
          />

          <FiltroActividadBar
            actividades={actividades}
            sedeSeleccionada={sedeSeleccionada}
            filtroActividad={filtroActividad}
            setFiltroActividad={setFiltroActividad}
            cantidadClases={turnosFiltrados.length}
          />

          <ClasesList
            cargando={cargando}
            turnosFiltrados={turnosFiltrados}
            esMismoDia={esMismoDia}
            onPedirReserva={handlePedirReserva}
            onPedirCancelar={handlePedirCancelar}
          />
        </>
      )}

      {/* Modales de Confirmación y Cancelación */}
      <ModalConfirmarReserva
        modalReserva={modalReserva}
        setModalReserva={setModalReserva}
        guardando={guardando}
        fechaHoyISO={fechaHoyISO}
        onConfirmar={handleConfirmarReserva}
      />

      <ModalCancelarReserva
        modalCancelar={modalCancelar}
        setModalCancelar={setModalCancelar}
        guardando={guardando}
        onConfirmar={handleConfirmarCancelacion}
      />
    </div>
  );
};

export default TurnosTab;
