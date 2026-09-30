import { useState, useEffect, useCallback } from 'react';
import { Card } from 'react-bootstrap';

// Submódulos de Cuotas Admin
import { generarComprobanteCobro } from './cuotasAdmin/helpers';
import CuotasAdminHeader from './cuotasAdmin/CuotasAdminHeader';
import PreciosVigentesCard from './cuotasAdmin/PreciosVigentesCard';
import FormProgramarPrecio from './cuotasAdmin/FormProgramarPrecio';
import PreciosTable from './cuotasAdmin/PreciosTable';
import SociosCuotasResumen from './cuotasAdmin/SociosCuotasResumen';
import SociosCuotasFiltros from './cuotasAdmin/SociosCuotasFiltros';
import SociosCuotasTable from './cuotasAdmin/SociosCuotasTable';
import ModalCobroManual from './cuotasAdmin/ModalCobroManual';
import ModalComprobanteAdmin from './cuotasAdmin/ModalComprobanteAdmin';

const CuotasAdminManager = ({ onMostrarAlerta, apiBase = 'http://localhost:3000/api' }) => {
  // Pestaña activa dentro del módulo: 'socios' o 'precios'
  const [subTab, setSubTab] = useState('socios');

  // ==========================================
  // ESTADOS DE PRECIOS PROGRAMADOS
  // ==========================================
  const [precios, setPrecios] = useState([]);
  const [precioVigente, setPrecioVigente] = useState(null);
  const [fechaConsulta, setFechaConsulta] = useState('');
  const [cargandoPrecios, setCargandoPrecios] = useState(false);
  const [guardandoPrecio, setGuardandoPrecio] = useState(false);

  // Formulario nuevo precio programado
  const [formPrecio, setFormPrecio] = useState({
    monto: '',
    fecha_desde: '',
    descripcion: ''
  });

  // ==========================================
  // ESTADOS DE CUOTAS DE SOCIOS
  // ==========================================
  const [cuotas, setCuotas] = useState([]);
  const [cargandoCuotas, setCargandoCuotas] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('vencidas');

  // Modales
  const [showModalCobro, setShowModalCobro] = useState(false);
  const [cuotaParaCobrar, setCuotaParaCobrar] = useState(null);
  const [metodoCobro, setMetodoCobro] = useState('Efectivo en Caja');
  const [comprobanteCobro, setComprobanteCobro] = useState('');
  const [procesandoCobro, setProcesandoCobro] = useState(false);

  const [showModalComprobante, setShowModalComprobante] = useState(false);
  const [cuotaComprobante, setCuotaComprobante] = useState(null);

  // ==========================================
  // CARGAS DE DATOS DESDE LA API
  // ==========================================
  const cargarPrecios = useCallback(async () => {
    setCargandoPrecios(true);
    try {
      const res = await fetch(`${apiBase}/cuotas/precios`);
      const data = await res.json();
      if (res.ok && data.exito) {
        setPrecios(data.precios || []);
        setPrecioVigente(data.precioVigente || null);
        setFechaConsulta(data.fechaConsulta || new Date().toISOString().substring(0, 10));
      } else {
        onMostrarAlerta?.(data.mensaje || 'Error al obtener tarifas de precios', 'danger');
      }
    } catch (err) {
      console.error('Error al cargar precios:', err);
      onMostrarAlerta?.('Error de red al consultar el historial de precios', 'danger');
    } finally {
      setCargandoPrecios(false);
    }
  }, [apiBase, onMostrarAlerta]);

  const cargarCuotas = useCallback(async () => {
    setCargandoCuotas(true);
    try {
      const res = await fetch(`${apiBase}/cuotas?todas=true`);
      const data = await res.json();
      if (res.ok && data.exito) {
        setCuotas(data.cuotas || []);
      } else {
        onMostrarAlerta?.(data.mensaje || 'Error al obtener cuotas de socios', 'danger');
      }
    } catch (err) {
      console.error('Error al cargar cuotas:', err);
      onMostrarAlerta?.('Error de red al consultar cuotas de socios', 'danger');
    } finally {
      setCargandoCuotas(false);
    }
  }, [apiBase, onMostrarAlerta]);

  useEffect(() => {
    let cancelado = false;

    const inicializarDatos = async () => {
      try {
        const [resPrecios, resCuotas] = await Promise.all([
          fetch(`${apiBase}/cuotas/precios`),
          fetch(`${apiBase}/cuotas?todas=true`)
        ]);

        const [dataPrecios, dataCuotas] = await Promise.all([
          resPrecios.json(),
          resCuotas.json()
        ]);

        if (cancelado) return;

        if (resPrecios.ok && dataPrecios.exito) {
          setPrecios(dataPrecios.precios || []);
          setPrecioVigente(dataPrecios.precioVigente || null);
          setFechaConsulta(dataPrecios.fechaConsulta || new Date().toISOString().substring(0, 10));
        }

        if (resCuotas.ok && dataCuotas.exito) {
          setCuotas(dataCuotas.cuotas || []);
        }
      } catch (err) {
        if (!cancelado) {
          console.error('Error en inicialización de cuotas/precios:', err);
        }
      }
    };

    inicializarDatos();

    return () => {
      cancelado = true;
    };
  }, [apiBase]);

  // ==========================================
  // GUARDAR / PROGRAMAR NUEVA TARIFA
  // ==========================================
  const handleSubmitPrecio = async (e) => {
    e.preventDefault();

    if (!formPrecio.monto || Number(formPrecio.monto) <= 0) {
      onMostrarAlerta?.('Por favor ingrese un monto numérico válido mayor a 0', 'danger');
      return;
    }

    if (!formPrecio.fecha_desde) {
      onMostrarAlerta?.('Debe seleccionar la fecha a partir de la cual entrará en vigencia', 'danger');
      return;
    }

    setGuardandoPrecio(true);

    try {
      const res = await fetch(`${apiBase}/cuotas/precios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monto: Number(formPrecio.monto),
          fecha_desde: formPrecio.fecha_desde,
          descripcion: formPrecio.descripcion.trim() || `Actualización tarifaria programada`
        })
      });

      const data = await res.json();

      if (res.ok && data.exito) {
        onMostrarAlerta?.(data.mensaje || 'Nueva tarifa programada guardada con éxito', 'success');
        setFormPrecio({ monto: '', fecha_desde: '', descripcion: '' });
        cargarPrecios();
      } else {
        onMostrarAlerta?.(data.mensaje || 'No se pudo programar el precio', 'danger');
      }
    } catch (err) {
      console.error('Error al programar precio:', err);
      onMostrarAlerta?.('Error de red al guardar la nueva tarifa', 'danger');
    } finally {
      setGuardandoPrecio(false);
    }
  };

  // ==========================================
  // REGISTRAR COBRO MANUAL EN VENTANILLA
  // ==========================================
  const handleAbrirCobroManual = (cuota) => {
    setCuotaParaCobrar(cuota);
    setMetodoCobro('Efectivo en Caja');
    setComprobanteCobro(generarComprobanteCobro());
    setShowModalCobro(true);
  };

  const handleConfirmarCobroManual = async (e) => {
    e.preventDefault();
    if (!cuotaParaCobrar) return;

    setProcesandoCobro(true);

    try {
      const numComprobante = comprobanteCobro.trim() || generarComprobanteCobro();
      const res = await fetch(`${apiBase}/cuotas/${cuotaParaCobrar.id}/pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metodo_pago: metodoCobro,
          comprobante: numComprobante,
          fecha_pago: new Date().toISOString()
        })
      });

      const data = await res.json();

      if (res.ok && data.exito) {
        onMostrarAlerta?.(
          `¡Cobro de la cuota ${cuotaParaCobrar.periodo} para ${cuotaParaCobrar.usuario?.nombre || 'socio'} registrado con éxito!`,
          'success'
        );
        setShowModalCobro(false);
        cargarCuotas();
      } else {
        onMostrarAlerta?.(data.mensaje || 'Error al registrar cobro manual', 'danger');
      }
    } catch (err) {
      console.error('Error al registrar cobro manual:', err);
      onMostrarAlerta?.('Error de conexión al registrar cobro', 'danger');
    } finally {
      setProcesandoCobro(false);
    }
  };

  // ==========================================
  // FILTRADO Y MÉTRICAS DE CUOTAS
  // ==========================================
  const cuotasFiltradas = cuotas.filter((c) => {
    const usuarioNombre = `${c.usuario?.nombre || ''} ${c.usuario?.apellido || ''} ${c.usuario?.email || ''} ${c.usuario?.dni || ''}`.toLowerCase();
    const coincideTexto = usuarioNombre.includes(filtroTexto.toLowerCase()) || (c.periodo || '').toLowerCase().includes(filtroTexto.toLowerCase());

    const estadoCuota = (c.estado || '').toLowerCase();
    let coincideEstado = true;
    if (filtroEstado === 'vencidas') {
      coincideEstado = estadoCuota === 'en demora' || estadoCuota === 'no pagado';
    } else if (filtroEstado !== 'todos') {
      coincideEstado = estadoCuota === filtroEstado.toLowerCase();
    }

    return coincideTexto && coincideEstado;
  });

  // Métricas calculadas
  const totalAlDia = cuotas.filter((c) => (c.estado || '').toLowerCase() === 'pendiente').length;
  const totalEnDemora = cuotas.filter((c) => (c.estado || '').toLowerCase() === 'en demora').length;
  const totalNoPagadas = cuotas.filter((c) => (c.estado || '').toLowerCase() === 'no pagado').length;
  const cuotasPagadas = cuotas.filter((c) => (c.estado || '').toLowerCase() === 'pagado');
  const totalRecaudado = cuotasPagadas.reduce((acc, c) => acc + Number(c.monto || 0), 0);

  return (
    <Card className="glass-card border-0 p-4 text-white">
      {/* Header del Módulo con Subtabs */}
      <CuotasAdminHeader
        subTab={subTab}
        setSubTab={setSubTab}
        totalCuotas={cuotas.length}
        totalPrecios={precios.length}
      />

      {/* SECCIÓN 1: ACTUALIZACIÓN Y PROGRAMACIÓN DE PRECIOS */}
      {subTab === 'precios' && (
        <div className="fade-in">
          <PreciosVigentesCard
            precioVigente={precioVigente}
            fechaConsulta={fechaConsulta}
            cargandoPrecios={cargandoPrecios}
            onRecargar={cargarPrecios}
          />

          <FormProgramarPrecio
            formPrecio={formPrecio}
            setFormPrecio={setFormPrecio}
            onSubmit={handleSubmitPrecio}
            guardandoPrecio={guardandoPrecio}
          />

          <PreciosTable
            precios={precios}
            precioVigente={precioVigente}
            fechaConsulta={fechaConsulta}
            cargandoPrecios={cargandoPrecios}
          />
        </div>
      )}

      {/* SECCIÓN 2: GESTIÓN Y CONTROL GLOBAL DE CUOTAS DE SOCIOS */}
      {subTab === 'socios' && (
        <div className="fade-in">
          <SociosCuotasResumen
            totalAlDia={totalAlDia}
            totalEnDemora={totalEnDemora}
            totalNoPagadas={totalNoPagadas}
            totalRecaudado={totalRecaudado}
            cantidadPagadas={cuotasPagadas.length}
          />

          <SociosCuotasFiltros
            filtroTexto={filtroTexto}
            setFiltroTexto={setFiltroTexto}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
          />

          <SociosCuotasTable
            cargandoCuotas={cargandoCuotas}
            cuotasFiltradas={cuotasFiltradas}
            filtroEstado={filtroEstado}
            onVerTodas={() => setFiltroEstado('todos')}
            onAbrirCobroManual={handleAbrirCobroManual}
            onVerComprobante={(c) => {
              setCuotaComprobante(c);
              setShowModalComprobante(true);
            }}
          />
        </div>
      )}

      {/* Modal Registrar Cobro Manual */}
      <ModalCobroManual
        show={showModalCobro}
        onHide={() => setShowModalCobro(false)}
        cuota={cuotaParaCobrar}
        metodoCobro={metodoCobro}
        setMetodoCobro={setMetodoCobro}
        comprobanteCobro={comprobanteCobro}
        setComprobanteCobro={setComprobanteCobro}
        procesandoCobro={procesandoCobro}
        onConfirmar={handleConfirmarCobroManual}
      />

      {/* Modal Ver Comprobante */}
      <ModalComprobanteAdmin
        show={showModalComprobante}
        onHide={() => setShowModalComprobante(false)}
        cuota={cuotaComprobante}
      />
    </Card>
  );
};

export default CuotasAdminManager;
