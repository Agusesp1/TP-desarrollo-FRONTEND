import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import ActivitiesFilters from './activitiesAdmin/ActivitiesFilters';
import ActivitiesTable from './activitiesAdmin/ActivitiesTable';
import ActivityModal from './activitiesAdmin/ActivityModal';
import { esHoraValida, convertirHoraAMin } from './activitiesAdmin/activitiesHelpers';

const ActivitiesManager = ({
  activities = [],
  branches = [],
  teachers = [],
  cargando,
  onRecargar,
  onMostrarAlerta,
  onPedirEliminar,
  apiBase
}) => {
  // Filters
  const [filterTexto, setFiltroTexto] = useState('');
  const [filterSede, setFiltroSede] = useState('todas');
  const [filterProfesor, setFiltroProfesor] = useState('todos');

  // Modal y formulario
  const [showModal, setShowModal] = useState(false);
  const [activityEditando, setActividadEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    duration: 60,
    capacity: 20,
    description: '',
    branch_id: '',
    teacher_id: '',
    dayOfWeek: 'Lunes a Viernes',
    startTime: '08:00',
    endTime: '09:00'
  });

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 5;

  useEffect(() => {
    setPaginaActual(1);
  }, [filterTexto, filterSede, filterProfesor]);

  const autoCalcularHoraFin = (home, durationMin) => {
    if (!esHoraValida(home)) return;
    const [hh, mm] = home.trim().split(':').map(Number);
    const dur = Math.max(1, parseInt(durationMin || 60, 10));
    const totalMinutos = hh * 60 + mm + dur;
    const finTotal = Math.min(23 * 60 + 59, totalMinutos);
    const finH = Math.floor(finTotal / 60);
    const finM = finTotal % 60;
    const horaFinCalc = `${String(finH).padStart(2, '0')}:${String(finM).padStart(2, '0')}`;
    setFormData((prev) => ({ ...prev, endTime: horaFinCalc }));
  };

  const handleAbrirModal = (activity = null) => {
    if (activity) {
      setActividadEditando(activity);
      const primerTurno = activity.shifts && activity.shifts.length > 0 ? activity.shifts[0] : null;
      setFormData({
        name: activity.name || '',
        duration: activity.duration || 60,
        capacity: activity.capacity || 20,
        description: activity.description || '',
        branch_id: (activity.branch_id ?? activity.branch?.id ?? '').toString(),
        teacher_id: (activity.teacher_id ?? activity.teacher?.id ?? '').toString(),
        dayOfWeek: primerTurno?.dayOfWeek || 'Lunes a Viernes',
        startTime: primerTurno?.startTime || '08:00',
        endTime: primerTurno?.endTime || '09:00'
      });
    } else {
      setActividadEditando(null);
      setFormData({
        name: '',
        duration: 60,
        capacity: 20,
        description: '',
        branch_id: '',
        teacher_id: '',
        dayOfWeek: 'Lunes a Viernes',
        startTime: '08:00',
        endTime: '09:00'
      });
    }
    setShowModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();

    // Validate formato y coherencia de schedules reales
    if (!esHoraValida(formData.startTime)) {
      onMostrarAlerta('Debe ingresar un schedule de home válido entre 00:00 y 23:59.', 'danger');
      return;
    }
    if (!esHoraValida(formData.endTime)) {
      onMostrarAlerta('Debe ingresar un schedule de fin válido entre 00:00 y 23:59.', 'danger');
      return;
    }
    const minInicio = convertirHoraAMin(formData.startTime);
    const minFin = convertirHoraAMin(formData.endTime);
    if (minFin <= minInicio) {
      onMostrarAlerta(`El schedule de fin (${formData.endTime}) debe ser posterior al schedule de home (${formData.startTime}).`, 'danger');
      return;
    }

    // Validate coincidencia de branch entre el teacher y la activity
    if (formData.teacher_id && formData.branch_id) {
      const teacher = teachers.find((p) => p.id?.toString() === formData.teacher_id.toString());
      if (teacher && teacher.branch_id && teacher.branch_id.toString() !== formData.branch_id.toString()) {
        const branchProfObj = branches.find((s) => s.id?.toString() === teacher.branch_id.toString());
        const branchActObj = branches.find((s) => s.id?.toString() === formData.branch_id.toString());

        const nomSedeProf = branchProfObj ? branchProfObj.name : `Branch #${teacher.branch_id}`;
        const nomSedeAct = branchActObj ? branchActObj.name : `Branch #${formData.branch_id}`;

        onMostrarAlerta(
          `El teacher ${teacher.name} ${teacher.lastname} está asignado a ${nomSedeProf} y no puede dictar activities en ${nomSedeAct}.`,
          'danger'
        );
        return;
      }
    }

    setGuardando(true);

    try {
      const endpoint = activityEditando
        ? `${apiBase}/activities/${activityEditando.id}`
        : `${apiBase}/activities`;
      const method = activityEditando ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onMostrarAlerta(data.message);
        setShowModal(false);
        onRecargar();
      } else {
        onMostrarAlerta(data.message || 'Error al guardar activity', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al guardar activity', 'danger');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      const res = await fetch(`${apiBase}/activities/${id}/toggle-status`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok && data.success) {
        onMostrarAlerta(data.message);
        onRecargar();
      } else {
        onMostrarAlerta(data.message || 'Error al cambiar status de la activity', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al actualizar status', 'danger');
    }
  };

  // Agrupar activities por name (ej: agrupar los múltiples shifts de Musculación)
  const activitiesAgrupadas = useMemo(() => {
    const map = new Map();
    activities.forEach((act) => {
      const clave = act.name.trim().toLowerCase();
      if (map.has(clave)) {
        const existente = map.get(clave);
        const shiftsCombinados = [...(existente.shifts || []), ...(act.shifts || [])];
        const shiftsUnicos = Array.from(new Map(shiftsCombinados.map((t) => [t.id, t])).values());
        map.set(clave, {
          ...existente,
          shifts: shiftsUnicos
        });
      } else {
        map.set(clave, { ...act, shifts: act.shifts ? [...act.shifts] : [] });
      }
    });
    return Array.from(map.values());
  }, [activities]);

  // Filtrado de activities
  const activitiesFiltradas = useMemo(() => {
    return activitiesAgrupadas.filter((a) => {
      const profObj = a.teacher || (teachers && teachers.find((p) => p.id?.toString() === a.teacher_id?.toString()));
      const texto = `${a.name} ${a.description || ''} ${profObj ? `${profObj.name} ${profObj.lastname}` : ''}`.toLowerCase();
      const coincideTexto = texto.includes(filterTexto.toLowerCase());

      let coincideSede = true;
      if (filterSede === 'sin_branch') {
        coincideSede = !a.branch_id && !a.branch;
      } else if (filterSede !== 'todas') {
        const actSedeId = a.branch_id?.toString() || a.branch?.id?.toString();
        coincideSede = actSedeId === filterSede.toString();
      }

      let coincideProfesor = true;
      if (filterProfesor === 'sin_teacher') {
        coincideProfesor = !a.teacher_id && !a.teacher;
      } else if (filterProfesor !== 'todos') {
        const actProfId = a.teacher_id?.toString() || a.teacher?.id?.toString();
        coincideProfesor = actProfId === filterProfesor.toString();
      }

      return coincideTexto && coincideSede && coincideProfesor;
    });
  }, [activitiesAgrupadas, filterTexto, filterSede, filterProfesor, teachers]);

  const totalPaginas = Math.ceil(activitiesFiltradas.length / elementosPorPagina);
  const homeIndex = (paginaActual - 1) * elementosPorPagina;
  const activitiesPaginadas = activitiesFiltradas.slice(homeIndex, homeIndex + elementosPorPagina);

  return (
    <Card className="glass-card border-0 p-4 text-white">
      {/* Encabezado y Botón Nueva Activity */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-white">Gestión de Activities y Clases</h4>
          <p className="text-secondary small mb-0">
            Administra disciplinas deportivas, teachers a cargo, branches y cupos máximos por clase.
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
          Nueva Activity
        </Button>
      </div>

      {/* Barra de Filters y Búsqueda */}
      <ActivitiesFilters
        filterTexto={filterTexto}
        setFiltroTexto={setFiltroTexto}
        filterSede={filterSede}
        setFiltroSede={setFiltroSede}
        filterProfesor={filterProfesor}
        setFiltroProfesor={setFiltroProfesor}
        branches={branches}
        teachers={teachers}
      />

      {/* Contenido Principal: Spinner, Status Vacío o Tabla */}
      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-secondary">Cargando activities...</p>
        </div>
      ) : activitiesFiltradas.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <p className="mb-0">
            No se encontraron activities {filterSede !== 'todas' || filterProfesor !== 'todos' || filterTexto ? 'con los filters seleccionados.' : 'registradas.'}
          </p>
        </div>
      ) : (
        <ActivitiesTable
          activitiesPaginadas={activitiesPaginadas}
          activitiesFiltradas={activitiesFiltradas}
          branches={branches}
          teachers={teachers}
          handleToggleEstado={handleToggleEstado}
          handleAbrirModal={handleAbrirModal}
          onPedirEliminar={onPedirEliminar}
          totalPaginas={totalPaginas}
          paginaActual={paginaActual}
          setPaginaActual={setPaginaActual}
          homeIndex={homeIndex}
          elementosPorPagina={elementosPorPagina}
        />
      )}

      {/* Modal Crear / Editar Activity */}
      <ActivityModal
        showModal={showModal}
        setShowModal={setShowModal}
        activityEditando={activityEditando}
        formData={formData}
        setFormData={setFormData}
        guardando={guardando}
        handleGuardar={handleGuardar}
        autoCalcularHoraFin={autoCalcularHoraFin}
        branches={branches}
        teachers={teachers}
      />
    </Card>
  );
};

export default ActivitiesManager;
