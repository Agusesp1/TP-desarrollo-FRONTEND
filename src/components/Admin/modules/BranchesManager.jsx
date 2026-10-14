import React, { useState, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import {
  DIAS_SEMANA_DEFAULT,
  calcularSlots,
  generarResumenHorarios
} from './branchesAdmin/branchesHelpers';
import BranchesHeader from './branchesAdmin/BranchesHeader';
import BranchesTable from './branchesAdmin/BranchesTable';
import BranchModal from './branchesAdmin/BranchModal';

const BranchesManager = ({
  branches = [],
  teachers = [],
  cargando,
  onRecargar,
  onMostrarAlerta,
  onPedirEliminar,
  apiBase
}) => {
  const [filterTexto, setFiltroTexto] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [branchEditando, setSedeEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mostrarPreviewSlots, setMostrarPreviewSlots] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'Rosario',
    phone: '',
    email: '',
    capacity: 150
  });

  // Configuración de Días y Schedules
  const [diasHorarios, setDiasHorarios] = useState(DIAS_SEMANA_DEFAULT);

  // Configuración de Shifts Automáticos de Musculación
  const [generarMusculacion, setGenerarMusculacion] = useState(true);
  const [durationMusculacion, setDuracionMusculacion] = useState(60);
  const [capacityMusculacion, setCupoMusculacion] = useState(30);
  const [teacherMusculacion, setProfesorMusculacion] = useState('');

  const handleAbrirModal = (branch = null) => {
    if (branch) {
      setSedeEditando(branch);
      setFormData({
        name: branch.name || '',
        address: branch.address || '',
        city: branch.city || 'Rosario',
        phone: branch.phone || '',
        email: branch.email || '',
        capacity: branch.capacity || 150
      });
      // Mantener schedules existentes o predeterminado
      if (branch.schedule_days && Array.isArray(branch.schedule_days)) {
        setDiasHorarios(branch.schedule_days);
      } else {
        setDiasHorarios(DIAS_SEMANA_DEFAULT.map(d => ({ ...d })));
      }
      setGenerarMusculacion(false); // Por defecto al editar no genera duplicados
    } else {
      setSedeEditando(null);
      setFormData({
        name: '',
        address: '',
        city: 'Rosario',
        phone: '',
        email: '',
        capacity: 150
      });
      setDiasHorarios(DIAS_SEMANA_DEFAULT.map(d => ({ ...d })));
      setGenerarMusculacion(true);
      setDuracionMusculacion(60);
      setCupoMusculacion(30);
      setProfesorMusculacion('');
    }
    setMostrarPreviewSlots(false);
    setShowModal(true);
  };

  // Modificar status o schedule de un día
  const handleDiaChange = (index, field, value) => {
    setDiasHorarios(prev => {
      const nuevo = [...prev];
      nuevo[index] = { ...nuevo[index], [field]: value };
      return nuevo;
    });
  };

  // Acciones rápidas de configuración de días
  const handleCopiarLunesAViernes = () => {
    const lun = diasHorarios.find(d => d.day === 'Lunes') || diasHorarios[0];
    setDiasHorarios(prev =>
      prev.map(d => {
        if (['Martes', 'Miércoles', 'Jueves', 'Viernes'].includes(d.day)) {
          return {
            ...d,
            abierto: lun.abierto,
            hora_home: lun.hora_home,
            hora_fin: lun.hora_fin
          };
        }
        return d;
      })
    );
  };

  const handleMarcarLunSab = () => {
    setDiasHorarios(prev =>
      prev.map(d => ({
        ...d,
        abierto: d.day !== 'Domingo'
      }))
    );
  };

  const handleMarcarTodos = () => {
    setDiasHorarios(prev => prev.map(d => ({ ...d, abierto: true })));
  };

  // Cálculo en tiempo real de shifts generados
  const shiftsPorDiaCalculados = useMemo(() => {
    return diasHorarios.map(d => {
      if (!d.abierto || !d.hora_home || !d.hora_fin) {
        return { day: d.day, abierto: false, slots: [] };
      }
      const slots = calcularSlots(d.hora_home, d.hora_fin, durationMusculacion);
      return { day: d.day, abierto: true, slots };
    });
  }, [diasHorarios, durationMusculacion]);

  const totalTurnosSemanales = useMemo(() => {
    return shiftsPorDiaCalculados.reduce((acc, curr) => acc + (curr.abierto ? curr.slots.length : 0), 0);
  }, [shiftsPorDiaCalculados]);

  const horarioResumenStr = useMemo(() => {
    return generarResumenHorarios(diasHorarios);
  }, [diasHorarios]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const endpoint = branchEditando
        ? `${apiBase}/branches/${branchEditando.id}`
        : `${apiBase}/branches`;
      const method = branchEditando ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        schedule_days: diasHorarios,
        opening_hours: horarioResumenStr,
        generar_shifts_musculacion: !branchEditando && generarMusculacion,
        duration_shift_musculacion: durationMusculacion,
        capacity_musculacion: capacityMusculacion,
        teacher_id: teacherMusculacion ? parseInt(teacherMusculacion, 10) : null
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onMostrarAlerta(data.message);
        setShowModal(false);
        onRecargar();
      } else {
        onMostrarAlerta(data.message || 'Error al guardar branch', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al guardar branch', 'danger');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      const res = await fetch(`${apiBase}/branches/${id}/toggle-status`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok && data.success) {
        onMostrarAlerta(data.message);
        onRecargar();
      } else {
        onMostrarAlerta(data.message || 'Error al cambiar status de la branch', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al actualizar status', 'danger');
    }
  };

  const branchesFiltradas = useMemo(() => {
    return branches.filter((s) => {
      const texto = `${s.name} ${s.address} ${s.city} ${s.email}`.toLowerCase();
      return texto.includes(filterTexto.toLowerCase());
    });
  }, [branches, filterTexto]);

  return (
    <Card className="glass-card border-0 p-4 text-white">
      <BranchesHeader
        filterTexto={filterTexto}
        setFiltroTexto={setFiltroTexto}
        onNuevaBranch={() => handleAbrirModal()}
      />

      <BranchesTable
        cargando={cargando}
        branches={branchesFiltradas}
        onToggleEstado={handleToggleEstado}
        onEditar={(branch) => handleAbrirModal(branch)}
        onEliminar={onPedirEliminar}
      />

      <BranchModal
        show={showModal}
        onHide={() => setShowModal(false)}
        branchEditando={branchEditando}
        guardando={guardando}
        formData={formData}
        setFormData={setFormData}
        diasHorarios={diasHorarios}
        onDiaChange={handleDiaChange}
        onCopiarLunesAViernes={handleCopiarLunesAViernes}
        onMarcarLunSab={handleMarcarLunSab}
        onMarcarTodos={handleMarcarTodos}
        horarioResumenStr={horarioResumenStr}
        generarMusculacion={generarMusculacion}
        setGenerarMusculacion={setGenerarMusculacion}
        durationMusculacion={durationMusculacion}
        setDuracionMusculacion={setDuracionMusculacion}
        capacityMusculacion={capacityMusculacion}
        setCupoMusculacion={setCupoMusculacion}
        teacherMusculacion={teacherMusculacion}
        setProfesorMusculacion={setProfesorMusculacion}
        teachers={teachers}
        totalTurnosSemanales={totalTurnosSemanales}
        shiftsPorDiaCalculados={shiftsPorDiaCalculados}
        mostrarPreviewSlots={mostrarPreviewSlots}
        setMostrarPreviewSlots={setMostrarPreviewSlots}
        onSubmit={handleGuardar}
      />
    </Card>
  );
};

export default BranchesManager;
