import { useState, useEffect, useCallback } from 'react';
import { Card } from 'react-bootstrap';

// Submódulos de Quotas Admin
import { generarComprobanteCobro } from './quotasAdmin/helpers';
import QuotasAdminHeader from './quotasAdmin/QuotasAdminHeader';
import PricesVigentesCard from './quotasAdmin/PricesVigentesCard';
import SchedulePriceForm from './quotasAdmin/SchedulePriceForm';
import PricesTable from './quotasAdmin/PricesTable';
import MembersCuotasResumen from './quotasAdmin/MembersCuotasResumen';
import MembersQuotasFilters from './quotasAdmin/MembersQuotasFilters';
import MembersCuotasTable from './quotasAdmin/MembersCuotasTable';
import ManualChargeModal from './quotasAdmin/ManualChargeModal';
import ModalComprobanteAdmin from './quotasAdmin/ModalComprobanteAdmin';

const QuotasAdminManager = ({ onMostrarAlerta, apiBase = 'http://localhost:3000/api' }) => {
  // Pestaña activa dentro del módulo: 'members' o 'prices'
  const [subTab, setSubTab] = useState('members');

  // ==========================================
  // ESTADOS DE PRICES PROGRAMADOS
  // ==========================================
  const [prices, setPrecios] = useState([]);
  const [priceVigente, setPrecioVigente] = useState(null);
  const [dateConsulta, setFechaConsulta] = useState('');
  const [cargandoPrecios, setCargandoPrecios] = useState(false);
  const [guardandoPrecio, setGuardandoPrecio] = useState(false);

  // Formulario nuevo price programado
  const [formPrecio, setFormPrecio] = useState({
    amount: '',
    start_date: '',
    description: ''
  });

  // ==========================================
  // ESTADOS DE QUOTAS DE MEMBERS
  // ==========================================
  const [quotas, setCuotas] = useState([]);
  const [cargandoCuotas, setCargandoCuotas] = useState(false);
  const [filterTexto, setFiltroTexto] = useState('');
  const [filterEstado, setFiltroEstado] = useState('vencidas');

  // Modales
  const [showModalCobro, setShowModalCobro] = useState(false);
  const [quotaParaCobrar, setCuotaParaCobrar] = useState(null);
  const [metodoCobro, setMetodoCobro] = useState('Efectivo en Caja');
  const [receiptCobro, setComprobanteCobro] = useState('');
  const [procesandoCobro, setProcesandoCobro] = useState(false);

  const [showModalComprobante, setShowModalComprobante] = useState(false);
  const [quotaComprobante, setCuotaComprobante] = useState(null);

  // ==========================================
  // CARGAS DE DATOS DESDE LA API
  // ==========================================
  const cargarPrecios = useCallback(async () => {
    setCargandoPrecios(true);
    try {
      const res = await fetch(`${apiBase}/quotas/prices`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPrecios(data.prices || []);
        setPrecioVigente(data.priceVigente || null);
        setFechaConsulta(data.dateConsulta || new Date().toISOString().substring(0, 10));
      } else {
        onMostrarAlerta?.(data.message || 'Error al obtener tarifas de prices', 'danger');
      }
    } catch (err) {
      console.error('Error al cargar prices:', err);
      onMostrarAlerta?.('Error de red al consultar el historial de prices', 'danger');
    } finally {
      setCargandoPrecios(false);
    }
  }, [apiBase, onMostrarAlerta]);

  const cargarCuotas = useCallback(async () => {
    setCargandoCuotas(true);
    try {
      const res = await fetch(`${apiBase}/quotas?todas=true`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCuotas(data.quotas || []);
      } else {
        onMostrarAlerta?.(data.message || 'Error al obtener quotas de members', 'danger');
      }
    } catch (err) {
      console.error('Error al cargar quotas:', err);
      onMostrarAlerta?.('Error de red al consultar quotas de members', 'danger');
    } finally {
      setCargandoCuotas(false);
    }
  }, [apiBase, onMostrarAlerta]);

  useEffect(() => {
    let cancelado = false;

    const initializeData = async () => {
      try {
        const [resPrecios, resCuotas] = await Promise.all([
          fetch(`${apiBase}/quotas/prices`),
          fetch(`${apiBase}/quotas?todas=true`)
        ]);

        const [dataPrecios, dataCuotas] = await Promise.all([
          resPrecios.json(),
          resCuotas.json()
        ]);

        if (cancelado) return;

        if (resPrecios.ok && dataPrecios.success) {
          setPrecios(dataPrecios.prices || []);
          setPrecioVigente(dataPrecios.priceVigente || null);
          setFechaConsulta(dataPrecios.dateConsulta || new Date().toISOString().substring(0, 10));
        }

        if (resCuotas.ok && dataCuotas.success) {
          setCuotas(dataCuotas.quotas || []);
        }
      } catch (err) {
        if (!cancelado) {
          console.error('Error en inicialización de quotas/prices:', err);
        }
      }
    };

    initializeData();

    return () => {
      cancelado = true;
    };
  }, [apiBase]);

  // ==========================================
  // GUARDAR / PROGRAMAR NUEVA TARIFA
  // ==========================================
  const handleSubmitPrecio = async (e) => {
    e.preventDefault();

    if (!formPrecio.amount || Number(formPrecio.amount) <= 0) {
      onMostrarAlerta?.('Por favor ingrese un amount numérico válido mayor a 0', 'danger');
      return;
    }

    if (!formPrecio.start_date) {
      onMostrarAlerta?.('Debe seleccionar la date a partir de la cual entrará en vigencia', 'danger');
      return;
    }

    setGuardandoPrecio(true);

    try {
      const res = await fetch(`${apiBase}/quotas/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(formPrecio.amount),
          start_date: formPrecio.start_date,
          description: formPrecio.description.trim() || `Actualización tarifaria programada`
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onMostrarAlerta?.(data.message || 'Nueva tarifa programada guardada con éxito', 'success');
        setFormPrecio({ amount: '', start_date: '', description: '' });
        cargarPrecios();
      } else {
        onMostrarAlerta?.(data.message || 'No se pudo programar el price', 'danger');
      }
    } catch (err) {
      console.error('Error al programar price:', err);
      onMostrarAlerta?.('Error de red al guardar la nueva tarifa', 'danger');
    } finally {
      setGuardandoPrecio(false);
    }
  };

  // ==========================================
  // REGISTRAR COBRO MANUAL EN VENTANILLA
  // ==========================================
  const handleAbrirCobroManual = (quota) => {
    setCuotaParaCobrar(quota);
    setMetodoCobro('Efectivo en Caja');
    setComprobanteCobro(generarComprobanteCobro());
    setShowModalCobro(true);
  };

  const handleConfirmarCobroManual = async (e) => {
    e.preventDefault();
    if (!quotaParaCobrar) return;

    setProcesandoCobro(true);

    try {
      const numComprobante = receiptCobro.trim() || generarComprobanteCobro();
      const res = await fetch(`${apiBase}/quotas/${quotaParaCobrar.id}/pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metodo_payment: metodoCobro,
          receipt: numComprobante,
          date_payment: new Date().toISOString()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onMostrarAlerta?.(
          `¡Cobro de la quota ${quotaParaCobrar.periodo} para ${quotaParaCobrar.user?.name || 'member'} registrado con éxito!`,
          'success'
        );
        setShowModalCobro(false);
        cargarCuotas();
      } else {
        onMostrarAlerta?.(data.message || 'Error al registrar cobro manual', 'danger');
      }
    } catch (err) {
      console.error('Error al registrar cobro manual:', err);
      onMostrarAlerta?.('Error de conexión al registrar cobro', 'danger');
    } finally {
      setProcesandoCobro(false);
    }
  };

  // ==========================================
  // FILTRADO Y MÉTRICAS DE QUOTAS
  // ==========================================
  const quotasFiltradas = quotas.filter((c) => {
    const userNombre = `${c.user?.name || ''} ${c.user?.lastname || ''} ${c.user?.email || ''} ${c.user?.dni || ''}`.toLowerCase();
    const coincideTexto = userNombre.includes(filterTexto.toLowerCase()) || (c.periodo || '').toLowerCase().includes(filterTexto.toLowerCase());

    const statusCuota = (c.status || '').toLowerCase();
    let coincideEstado = true;
    if (filterEstado === 'vencidas') {
      coincideEstado = statusCuota === 'en demora' || statusCuota === 'no pagado';
    } else if (filterEstado !== 'todos') {
      coincideEstado = statusCuota === filterEstado.toLowerCase();
    }

    return coincideTexto && coincideEstado;
  });

  // Métricas calculadas
  const totalAlDia = quotas.filter((c) => (c.status || '').toLowerCase() === 'pendiente').length;
  const totalEnDemora = quotas.filter((c) => (c.status || '').toLowerCase() === 'en demora').length;
  const totalNoPagadas = quotas.filter((c) => (c.status || '').toLowerCase() === 'no pagado').length;
  const quotasPagadas = quotas.filter((c) => (c.status || '').toLowerCase() === 'pagado');
  const totalRecaudado = quotasPagadas.reduce((acc, c) => acc + Number(c.amount || 0), 0);

  return (
    <Card className="glass-card border-0 p-4 text-white">
      {/* Header del Módulo con Subtabs */}
      <QuotasAdminHeader
        subTab={subTab}
        setSubTab={setSubTab}
        totalCuotas={quotas.length}
        totalPrecios={prices.length}
      />

      {/* SECCIÓN 1: ACTUALIZACIÓN Y PROGRAMACIÓN DE PRICES */}
      {subTab === 'prices' && (
        <div className="fade-in">
          <PricesVigentesCard
            priceVigente={priceVigente}
            dateConsulta={dateConsulta}
            cargandoPrecios={cargandoPrecios}
            onRecargar={cargarPrecios}
          />

          <SchedulePriceForm
            formPrecio={formPrecio}
            setFormPrecio={setFormPrecio}
            onSubmit={handleSubmitPrecio}
            guardandoPrecio={guardandoPrecio}
          />

          <PricesTable
            prices={prices}
            priceVigente={priceVigente}
            dateConsulta={dateConsulta}
            cargandoPrecios={cargandoPrecios}
          />
        </div>
      )}

      {/* SECCIÓN 2: GESTIÓN Y CONTROL GLOBAL DE QUOTAS DE MEMBERS */}
      {subTab === 'members' && (
        <div className="fade-in">
          <MembersCuotasResumen
            totalAlDia={totalAlDia}
            totalEnDemora={totalEnDemora}
            totalNoPagadas={totalNoPagadas}
            totalRecaudado={totalRecaudado}
            cantidadPagadas={quotasPagadas.length}
          />

          <MembersQuotasFilters
            filterTexto={filterTexto}
            setFiltroTexto={setFiltroTexto}
            filterEstado={filterEstado}
            setFiltroEstado={setFiltroEstado}
          />

          <MembersCuotasTable
            cargandoCuotas={cargandoCuotas}
            quotasFiltradas={quotasFiltradas}
            filterEstado={filterEstado}
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
      <ManualChargeModal
        show={showModalCobro}
        onHide={() => setShowModalCobro(false)}
        quota={quotaParaCobrar}
        metodoCobro={metodoCobro}
        setMetodoCobro={setMetodoCobro}
        receiptCobro={receiptCobro}
        setComprobanteCobro={setComprobanteCobro}
        procesandoCobro={procesandoCobro}
        onConfirmar={handleConfirmarCobroManual}
      />

      {/* Modal Ver Receipt */}
      <ModalComprobanteAdmin
        show={showModalComprobante}
        onHide={() => setShowModalComprobante(false)}
        quota={quotaComprobante}
      />
    </Card>
  );
};

export default QuotasAdminManager;
