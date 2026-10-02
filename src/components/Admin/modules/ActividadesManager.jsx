import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import ActividadesFiltros from './actividadesAdmin/ActividadesFiltros';
import ActividadesTable from './actividadesAdmin/ActividadesTable';
import ModalActividad from './actividadesAdmin/ModalActividad';
import { esHoraValida, convertirHoraAMin } from './actividadesAdmin/actividadesHelpers';

const ActividadesManager = ({
  actividades = [],
  sedes = [],
  profesores = [],
  cargando,
  onRecargar,
  onMostrarAlerta,
  onPedirEliminar,
  apiBase
}) => {
  // Filtros
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroSede, setFiltroSede] = useState('todas');
  const [filtroProfesor, setFiltroProfesor] = useState('todos');

  // Modal y formulario
  const [showModal, setShowModal] = useState(false);
  const [actividadEditando, setActividadEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    duracion: 60,
    cupo: 20,
    descripcion: '',
    sede_id: '',
    profesor_id: '',
    dia_semana: 'Lunes a Viernes',
    horarioInicio: '08:00',
    horaFin: '09:00'
  });

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 5;

  useEffect(() => {
    setPaginaActual(1);
  }, [filtroTexto, filtroSede, filtroProfesor]);

  const autoCalcularHoraFin = (inicio, duracionMin) => {
    if (!esHoraValida(inicio)) return;
    const [hh, mm] = inicio.trim().split(':').map(Number);
    const dur = Math.max(1, parseInt(duracionMin || 60, 10));
    const totalMinutos = hh * 60 + mm + dur;
    const finTotal = Math.min(23 * 60 + 59, totalMinutos);
    const finH = Math.floor(finTotal / 60);
    const finM = finTotal % 60;
    const horaFinCalc = `${String(finH).padStart(2, '0')}:${String(finM).padStart(2, '0')}`;
    setFormData((prev) => ({ ...prev, horaFin: horaFinCalc }));
  };

  const handleAbrirModal = (actividad = null) => {
    if (actividad) {
      setActividadEditando(actividad);
      const primerTurno = actividad.turnos && actividad.turnos.length > 0 ? actividad.turnos[0] : null;
      setFormData({
        nombre: actividad.nombre || '',
        duracion: actividad.duracion || 60,
        cupo: actividad.cupo || 20,
        descripcion: actividad.descripcion || '',
        sede_id: (actividad.sede_id ?? actividad.sede?.id ?? '').toString(),
        profesor_id: (actividad.profesor_id ?? actividad.profesor?.id ?? '').toString(),
        dia_semana: primerTurno?.dia_semana || 'Lunes a Viernes',
        horarioInicio: primerTurno?.horarioInicio || '08:00',
        horaFin: primerTurno?.horaFin || '09:00'
      });
    } else {
      setActividadEditando(null);
      setFormData({
        nombre: '',
        duracion: 60,
        cupo: 20,
        descripcion: '',
        sede_id: '',
        profesor_id: '',
        dia_semana: 'Lunes a Viernes',
        horarioInicio: '08:00',
        horaFin: '09:00'
      });
    }
    setShowModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();

    // Validar formato y coherencia de horarios reales
    if (!esHoraValida(formData.horarioInicio)) {
      onMostrarAlerta('Debe ingresar un horario de inicio válido entre 00:00 y 23:59.', 'danger');
      return;
    }
    if (!esHoraValida(formData.horaFin)) {
      onMostrarAlerta('Debe ingresar un horario de fin válido entre 00:00 y 23:59.', 'danger');
      return;
    }
    const minInicio = convertirHoraAMin(formData.horarioInicio);
    const minFin = convertirHoraAMin(formData.horaFin);
    if (minFin <= minInicio) {
      onMostrarAlerta(`El horario de fin (${formData.horaFin}) debe ser posterior al horario de inicio (${formData.horarioInicio}).`, 'danger');
      return;
    }

    // Validar coincidencia de sede entre el profesor y la actividad
    if (formData.profesor_id && formData.sede_id) {
      const prof = profesores.find((p) => p.id?.toString() === formData.profesor_id.toString());
      if (prof && prof.sede_id && prof.sede_id.toString() !== formData.sede_id.toString()) {
        const sedeProfObj = sedes.find((s) => s.id?.toString() === prof.sede_id.toString());
        const sedeActObj = sedes.find((s) => s.id?.toString() === formData.sede_id.toString());

        const nomSedeProf = sedeProfObj ? sedeProfObj.nombre : `Sede #${prof.sede_id}`;
        const nomSedeAct = sedeActObj ? sedeActObj.nombre : `Sede #${formData.sede_id}`;

        onMostrarAlerta(
          `El profesor ${prof.nombre} ${prof.apellido} está asignado a ${nomSedeProf} y no puede dictar actividades en ${nomSedeAct}.`,
          'danger'
        );
        return;
      }
    }

    setGuardando(true);

    try {
      const endpoint = actividadEditando
        ? `${apiBase}/actividades/${actividadEditando.id}`
        : `${apiBase}/actividades`;
      const method = actividadEditando ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.exito) {
        onMostrarAlerta(data.mensaje);
        setShowModal(false);
        onRecargar();
      } else {
        onMostrarAlerta(data.mensaje || 'Error al guardar actividad', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al guardar actividad', 'danger');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      const res = await fetch(`${apiBase}/actividades/${id}/toggle-estado`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok && data.exito) {
        onMostrarAlerta(data.mensaje);
        onRecargar();
      } else {
        onMostrarAlerta(data.mensaje || 'Error al cambiar estado de la actividad', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al actualizar estado', 'danger');
    }
  };

  // Agrupar actividades por nombre (ej: agrupar los múltiples turnos de Musculación)
  const actividadesAgrupadas = useMemo(() => {
    const map = new Map();
    actividades.forEach((act) => {
      const clave = act.nombre.trim().toLowerCase();
      if (map.has(clave)) {
        const existente = map.get(clave);
        const turnosCombinados = [...(existente.turnos || []), ...(act.turnos || [])];
        const turnosUnicos = Array.from(new Map(turnosCombinados.map((t) => [t.id, t])).values());
        map.set(clave, {
          ...existente,
          turnos: turnosUnicos
        });
      } else {
        map.set(clave, { ...act, turnos: act.turnos ? [...act.turnos] : [] });
      }
    });
    return Array.from(map.values());
  }, [actividades]);

  // Filtrado de actividades
  const actividadesFiltradas = useMemo(() => {
    return actividadesAgrupadas.filter((a) => {
      const profObj = a.profesor || (profesores && profesores.find((p) => p.id?.toString() === a.profesor_id?.toString()));
      const texto = `${a.nombre} ${a.descripcion || ''} ${profObj ? `${profObj.nombre} ${profObj.apellido}` : ''}`.toLowerCase();
      const coincideTexto = texto.includes(filtroTexto.toLowerCase());

      let coincideSede = true;
      if (filtroSede === 'sin_sede') {
        coincideSede = !a.sede_id && !a.sede;
      } else if (filtroSede !== 'todas') {
        const actSedeId = a.sede_id?.toString() || a.sede?.id?.toString();
        coincideSede = actSedeId === filtroSede.toString();
      }

      let coincideProfesor = true;
      if (filtroProfesor === 'sin_profesor') {
        coincideProfesor = !a.profesor_id && !a.profesor;
      } else if (filtroProfesor !== 'todos') {
        const actProfId = a.profesor_id?.toString() || a.profesor?.id?.toString();
        coincideProfesor = actProfId === filtroProfesor.toString();
      }

      return coincideTexto && coincideSede && coincideProfesor;
    });
  }, [actividadesAgrupadas, filtroTexto, filtroSede, filtroProfesor, profesores]);

  const totalPaginas = Math.ceil(actividadesFiltradas.length / elementosPorPagina);
  const inicioIndex = (paginaActual - 1) * elementosPorPagina;
  const actividadesPaginadas = actividadesFiltradas.slice(inicioIndex, inicioIndex + elementosPorPagina);

  return (
    <Card className="glass-card border-0 p-4 text-white">
      {/* Encabezado y Botón Nueva Actividad */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-white">Gestión de Actividades y Clases</h4>
          <p className="text-secondary small mb-0">
            Administra disciplinas deportivas, profesores a cargo, sedes y cupos máximos por clase.
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
          Nueva Actividad
        </Button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <ActividadesFiltros
        filtroTexto={filtroTexto}
        setFiltroTexto={setFiltroTexto}
        filtroSede={filtroSede}
        setFiltroSede={setFiltroSede}
        filtroProfesor={filtroProfesor}
        setFiltroProfesor={setFiltroProfesor}
        sedes={sedes}
        profesores={profesores}
      />

      {/* Contenido Principal: Spinner, Estado Vacío o Tabla */}
      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-secondary">Cargando actividades...</p>
        </div>
      ) : actividadesFiltradas.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <p className="mb-0">
            No se encontraron actividades {filtroSede !== 'todas' || filtroProfesor !== 'todos' || filtroTexto ? 'con los filtros seleccionados.' : 'registradas.'}
          </p>
        </div>
      ) : (
        <ActividadesTable
          actividadesPaginadas={actividadesPaginadas}
          actividadesFiltradas={actividadesFiltradas}
          sedes={sedes}
          profesores={profesores}
          handleToggleEstado={handleToggleEstado}
          handleAbrirModal={handleAbrirModal}
          onPedirEliminar={onPedirEliminar}
          totalPaginas={totalPaginas}
          paginaActual={paginaActual}
          setPaginaActual={setPaginaActual}
          inicioIndex={inicioIndex}
          elementosPorPagina={elementosPorPagina}
        />
      )}

      {/* Modal Crear / Editar Actividad */}
      <ModalActividad
        showModal={showModal}
        setShowModal={setShowModal}
        actividadEditando={actividadEditando}
        formData={formData}
        setFormData={setFormData}
        guardando={guardando}
        handleGuardar={handleGuardar}
        autoCalcularHoraFin={autoCalcularHoraFin}
        sedes={sedes}
        profesores={profesores}
      />
    </Card>
  );
};

export default ActividadesManager;
