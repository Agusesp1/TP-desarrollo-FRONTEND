import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-bootstrap';
import './ShiftsTab.css';

// Componentes modulares
import { getFechaLocalISO, shiftAplicaEnDia, generarDias } from './shifts/helpers';
import ShiftsHeader from './shifts/ShiftsHeader';
import BranchesSelector from './shifts/BranchesSelector';
import DateSelector from './shifts/DateSelector';
import FilterActividadBar from './shifts/FilterActividadBar';
import ClasesList from './shifts/ClasesList';
import MisReservasView from './shifts/MisReservasView';
import { ModalConfirmarReserva, ModalCancelarReserva } from './shifts/ModalesReserva';

const ShiftsTab = ({ user }) => {
  const dateHoyISO = getFechaLocalISO();
  const diasSemana = generarDias();

  // Estados de datos
  const [shifts, setTurnos] = useState([]);
  const [activities, setActividades] = useState([]);
  const [branches, setSedes] = useState([]);
  const [misReservas, setMisReservas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null);

  // Estados de vista y filters
  const [vistaActiva, setVistaActiva] = useState('shifts'); // 'shifts' | 'mis-reservations'
  const [daySeleccionado, setDiaSeleccionado] = useState(dateHoyISO);
  const [branchSeleccionada, setSedeSeleccionada] = useState('todas');
  const [filterActividad, setFiltroActividad] = useState('todas');

  // Estados de modales
  const [modalReserva, setModalReserva] = useState({ open: false, shift: null });
  const [modalCancelar, setModalCancelar] = useState({ open: false, reservationId: null, nameClase: '' });
  const [guardando, setGuardando] = useState(false);

  const esMismoDia = daySeleccionado === dateHoyISO;

  const mostrarMensaje = (texto, tipo = 'success') => {
    setAlerta({ texto, tipo });
    setTimeout(() => setAlerta(null), 4000);
  };

  // Cargar branches y activities iniciales
  useEffect(() => {
    const cargarMaestros = async () => {
      try {
        const [resAct, resSedes] = await Promise.all([
          fetch('http://localhost:3000/api/activities?soloActivas=true'),
          fetch('http://localhost:3000/api/branches')
        ]);
        const dataAct = await resAct.json();
        const dataSedes = await resSedes.json();

        if (dataAct.success) setActividades(dataAct.activities || []);
        if (dataSedes.success) setSedes(dataSedes.branches || []);
      } catch (err) {
        console.error('Error al cargar activities y branches:', err);
      }
    };
    cargarMaestros();
  }, []);

  // Cargar shifts y reservations en tiempo real
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const userParam = user?.id ? `&user_id=${user.id}` : '';
      const [resTurnos, resReservas] = await Promise.all([
        fetch(`http://localhost:3000/api/shifts?soloActivos=true&date=${daySeleccionado}${userParam}`),
        user?.id ? fetch(`http://localhost:3000/api/reservations/user/${user.id}`) : Promise.resolve(null)
      ]);

      const dataTurnos = await resTurnos.json();
      if (dataTurnos.success) {
        setTurnos(dataTurnos.shifts || []);
      }

      if (resReservas) {
        const dataReservas = await resReservas.json();
        if (dataReservas.success) {
          setMisReservas(dataReservas.reservations || []);
        }
      }
    } catch (err) {
      console.error('Error al cargar shifts:', err);
      mostrarMensaje('No se pudieron sincronizar los shifts con el servidor.', 'danger');
    } finally {
      setCargando(false);
    }
  }, [daySeleccionado, user?.id]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Manejadores de Reservation
  const handlePedirReserva = (shift) => {
    if (!user) {
      mostrarMensaje('Debes tener una sesión iniciada para reservar shifts.', 'danger');
      return;
    }
    if (!esMismoDia) {
      mostrarMensaje('Solo se permite reservar shifts para el día de hoy.', 'warning');
      return;
    }
    if (shift.esta_lleno) {
      mostrarMensaje('Esta clase ya no cuenta con cupos disponibles.', 'warning');
      return;
    }
    if (shift.reservado_por_mi) {
      mostrarMensaje('Ya te encuentras inscripto en este shift para hoy.', 'info');
      return;
    }
    setModalReserva({ open: true, shift });
  };

  const handleConfirmarReserva = async () => {
    if (!modalReserva.shift || !user) return;
    setGuardando(true);

    try {
      const res = await fetch('http://localhost:3000/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          shift_id: modalReserva.shift.id,
          date: daySeleccionado
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        mostrarMensaje(data.message || '¡Reservation confirmada con éxito!', 'success');
        setModalReserva({ open: false, shift: null });
        await cargarDatos();
      } else {
        mostrarMensaje(data.message || 'No se pudo confirmar la reservation', 'danger');
      }
    } catch (err) {
      console.error('Error al reservar shift:', err);
      mostrarMensaje('Error de conexión al procesar la reservation.', 'danger');
    } finally {
      setGuardando(false);
    }
  };

  // Manejadores de Cancelación
  const handlePedirCancelar = (reservationId, nameClase) => {
    setModalCancelar({ open: true, reservationId, nameClase });
  };

  const handleConfirmarCancelacion = async () => {
    if (!modalCancelar.reservationId) return;
    setGuardando(true);

    try {
      const res = await fetch(`http://localhost:3000/api/reservations/${modalCancelar.reservationId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        mostrarMensaje(data.message || 'Reservation cancelada exitosamente.', 'success');
        setModalCancelar({ open: false, reservationId: null, nameClase: '' });
        await cargarDatos();
      } else {
        mostrarMensaje(data.message || 'Error al cancelar la reservation.', 'danger');
      }
    } catch (err) {
      console.error('Error al cancelar reservation:', err);
      mostrarMensaje('Error de red al cancelar la reservation.', 'danger');
    } finally {
      setGuardando(false);
    }
  };

  // Filters aplicados
  const shiftsFiltrados = shifts.filter((t) => {
    if (branchSeleccionada !== 'todas' && t.branch_id?.toString() !== branchSeleccionada.toString()) return false;
    if (filterActividad !== 'todas' && t.activity_id?.toString() !== filterActividad.toString()) return false;
    if (!shiftAplicaEnDia(t.dayOfWeek, daySeleccionado)) return false;
    return true;
  });

  const getMesYAnio = () => {
    const d = diasSemana.find((day) => day.id === daySeleccionado) || diasSemana[0];
    return `${d.monthNombre} ${d.year}`;
  };

  const dayActualInfo = diasSemana.find((d) => d.id === daySeleccionado) || diasSemana[0];
  const misReservasHoy = misReservas.filter((r) => r.date === dateHoyISO);

  return (
    <div className="mobile-reservations-container p-3 p-md-4">
      {/* Header y toggle de vistas */}
      <ShiftsHeader
        esMismoDia={esMismoDia}
        dayActualInfo={dayActualInfo}
        onVolverAHoy={() => setDiaSeleccionado(dateHoyISO)}
        vistaActiva={vistaActiva}
        setVistaActiva={setVistaActiva}
        reservationsHoyCount={misReservasHoy.length}
      />

      {alerta && (
        <Alert variant={alerta.tipo} dismissible onClose={() => setAlerta(null)} className="py-2 text-center small rounded-3 border-0">
          {alerta.texto}
        </Alert>
      )}

      {vistaActiva === 'mis-reservations' ? (
        <MisReservasView
          cargando={cargando}
          misReservas={misReservas}
          dateHoyISO={dateHoyISO}
          onPedirCancelar={handlePedirCancelar}
          onVolverAClases={() => setVistaActiva('shifts')}
        />
      ) : (
        <>
          <BranchesSelector
            branches={branches}
            branchSeleccionada={branchSeleccionada}
            setSedeSeleccionada={setSedeSeleccionada}
          />

          <DateSelector
            diasSemana={diasSemana}
            daySeleccionado={daySeleccionado}
            setDiaSeleccionado={setDiaSeleccionado}
            dateHoyISO={dateHoyISO}
            esMismoDia={esMismoDia}
            dayActualInfo={dayActualInfo}
            getMesYAnio={getMesYAnio}
          />

          <FilterActividadBar
            activities={activities}
            branchSeleccionada={branchSeleccionada}
            filterActividad={filterActividad}
            setFiltroActividad={setFiltroActividad}
            cantidadClases={shiftsFiltrados.length}
          />

          <ClasesList
            cargando={cargando}
            shiftsFiltrados={shiftsFiltrados}
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
        dateHoyISO={dateHoyISO}
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

export default ShiftsTab;
