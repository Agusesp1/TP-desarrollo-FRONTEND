import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

// Módulos y submódulos de cuotas
import { generarComprobanteFallback, generarPaymentIdMP } from './cuotas/helpers';
import CuotasHeader from './cuotas/CuotasHeader';
import ResumenCards from './cuotas/ResumenCards';
import CuotasTable from './cuotas/CuotasTable';
import ModalPago from './cuotas/ModalPago';
import ModalHistorial from './cuotas/ModalHistorial';
import ModalRecibo from './cuotas/ModalRecibo';
import ModalComprobanteMP from './cuotas/ModalComprobanteMP';

const API_BASE = 'http://localhost:3000/api';

const CuotasTab = ({ user }) => {
  const { user: authUser } = useAuth();
  const currentUser = user || authUser;
  const esRolExcluido = currentUser?.rol === 'admin' || currentUser?.rol === 'profesor';
  const usuarioId = currentUser?.id || currentUser?.usuario_id || 1;

  // Estados de datos
  const [cuotas, setCuotas] = useState([]);
  const [mostrarTodasCuotas, setMostrarTodasCuotas] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [resumen, setResumen] = useState({
    totalPendientes: 0,
    totalEnDemora: 0,
    totalNoPagadas: 0,
    totalPagadas: 0,
    proximaVencimiento: '-'
  });
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [alertaFeedback, setAlertaFeedback] = useState(null);

  // Estados de modales
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedCuota, setSelectedCuota] = useState(null);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [pagoExitosoMsg, setPagoExitosoMsg] = useState(null);

  // Estado para la preferencia de Mercado Pago
  const [cargandoMP, setCargandoMP] = useState(false);
  const [mpPreference, setMpPreference] = useState(null);

  // Estado para ver detalle de comprobante individual
  const [reciboSeleccionado, setReciboSeleccionado] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Estado para el cartel / modal destacado de Pago Acreditado con Mini Comprobante
  const [comprobanteMP, setComprobanteMP] = useState(null);
  const [showModalComprobanteMP, setShowModalComprobanteMP] = useState(false);
  const mpConfirmadoRef = useRef(false);
  const [searchParams] = useSearchParams();

  // Mostrar alertas temporales
  const mostrarFeedback = (texto, tipo = 'success') => {
    setAlertaFeedback({ texto, tipo });
    setTimeout(() => setAlertaFeedback(null), 5000);
  };

  // Cargar cuotas desde la API a demanda
  const obtenerCuotas = useCallback(async () => {
    if (!usuarioId || esRolExcluido) return;
    setCargando(true);
    setErrorCarga(null);

    try {
      const res = await fetch(`${API_BASE}/cuotas/mis-cuotas?usuario_id=${usuarioId}`);
      const data = await res.json();

      if (res.ok && data.exito) {
        const todasCuotas = data.cuotas || [];
        const pagadas = data.historial || todasCuotas.filter((c) => c.estado === 'pagado');
        const impagas = data.pendientes || todasCuotas.filter((c) => c.estado !== 'pagado');

        setCuotas(impagas);
        setHistorial(pagadas);

        const pendientes = impagas.filter((c) => c.estado === 'pendiente').length;
        const enDemora = impagas.filter((c) => c.estado === 'en demora').length;
        const noPagadas = impagas.filter((c) => c.estado === 'no pagado').length;
        const primerVenc = impagas.length > 0 ? (impagas[0].fechaVenc || impagas[0].fecha_vencimiento) : 'Al día';

        setResumen(
          data.resumen || {
            totalPendientes: pendientes,
            totalEnDemora: enDemora,
            totalNoPagadas: noPagadas,
            totalPagadas: pagadas.length,
            proximaVencimiento: primerVenc
          }
        );
      } else {
        setErrorCarga(data.mensaje || 'No se pudieron obtener las cuotas del usuario.');
      }
    } catch (err) {
      console.error('Error al consultar cuotas:', err);
      setErrorCarga('Error de conexión con el servidor. Verifique su red.');
    } finally {
      setCargando(false);
    }
  }, [usuarioId, esRolExcluido]);

  useEffect(() => {
    if (!usuarioId || esRolExcluido) {
      return;
    }

    let ignore = false;
    fetch(`${API_BASE}/cuotas/mis-cuotas?usuario_id=${usuarioId}`)
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;
        if (data.exito) {
          const todasCuotas = data.cuotas || [];
          const pagadas = data.historial || todasCuotas.filter((c) => c.estado === 'pagado');
          const impagas = data.pendientes || todasCuotas.filter((c) => c.estado !== 'pagado');

          setCuotas(impagas);
          setHistorial(pagadas);

          const pendientes = impagas.filter((c) => c.estado === 'pendiente').length;
          const enDemora = impagas.filter((c) => c.estado === 'en demora').length;
          const noPagadas = impagas.filter((c) => c.estado === 'no pagado').length;
          const primerVenc = impagas.length > 0 ? (impagas[0].fechaVenc || impagas[0].fecha_vencimiento) : 'Al día';

          setResumen(
            data.resumen || {
              totalPendientes: pendientes,
              totalEnDemora: enDemora,
              totalNoPagadas: noPagadas,
              totalPagadas: pagadas.length,
              proximaVencimiento: primerVenc
            }
          );
        } else {
          setErrorCarga(data.mensaje || 'No se pudieron obtener las cuotas del usuario.');
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Error al inicializar cuotas:', err);
          setErrorCarga('Error de conexión con el servidor. Verifique su red.');
        }
      })
      .finally(() => {
        if (!ignore) setCargando(false);
      });

    return () => {
      ignore = true;
    };
  }, [usuarioId, esRolExcluido]);

  // Detección del retorno de Mercado Pago, confirmación con el backend y apertura de mini comprobante
  useEffect(() => {
    const status = searchParams.get('status');
    const collection_status = searchParams.get('collection_status');
    const pago = searchParams.get('pago');
    const payment_id = searchParams.get('payment_id');
    const collection_id = searchParams.get('collection_id');
    const external_reference = searchParams.get('external_reference');
    const preference_id = searchParams.get('preference_id');

    const esPagoAprobado = status === 'approved' || collection_status === 'approved' || pago === 'success';

    if (esPagoAprobado && !mpConfirmadoRef.current) {
      mpConfirmadoRef.current = true;

      const confirmarPagoRetornoMP = async () => {
        try {
          const res = await fetch(`${API_BASE}/cuotas/mercadopago/confirmar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cuota_id: external_reference,
              payment_id: payment_id || collection_id,
              status: 'approved',
              preference_id
            })
          });

          const data = await res.json();

          if (res.ok && data.exito && data.cuota) {
            // 1. Eliminar de inmediato dicha cuota de cuotas pendientes
            setCuotas((prev) => prev.filter((c) => c.id !== data.cuota.id));

            // 2. Agregar al historial
            setHistorial((prev) => [data.cuota, ...prev.filter((c) => c.id !== data.cuota.id)]);

            // 3. Actualizar las tarjetas de resumen
            setResumen((prev) => ({
              ...prev,
              totalPagadas: prev.totalPagadas + 1,
              totalPendientes: Math.max(0, prev.totalPendientes - 1),
              totalEnDemora: Math.max(0, prev.totalEnDemora - (data.cuota.estado_anterior === 'en demora' ? 1 : 0))
            }));

            // 4. Abrir un cartel / modal destacado de Pago Acreditado con Mini Comprobante
            setComprobanteMP(data.cuota);
            setShowModalComprobanteMP(true);

            mostrarFeedback(`¡Pago acreditado con éxito! Comprobante: ${data.cuota.comprobante || payment_id || collection_id}`, 'success');
          } else {
            console.warn('La confirmación de Mercado Pago no devolvió cuota exitosa:', data);
            obtenerCuotas();
          }
        } catch (err) {
          console.error('Error al confirmar retorno de Mercado Pago:', err);
          mostrarFeedback('Error al confirmar la acreditación del pago con el servidor.', 'danger');
        } finally {
          // Limpiar la URL usando replaceState para que al recargar la página no vuelva a saltar el procesamiento
          window.history.replaceState({}, document.title, window.location.pathname + '?tab=cuotas');
        }
      };

      confirmarPagoRetornoMP();
    } else if (pago === 'failure' || status === 'rejected') {
      mostrarFeedback('El pago a través de Mercado Pago no fue completado o fue rechazado.', 'warning');
      window.history.replaceState({}, document.title, window.location.pathname + '?tab=cuotas');
    }
  }, [searchParams, obtenerCuotas]);

  // Solicitar preferencia de Mercado Pago al backend
  const inicializarMercadoPago = async (cuotaId) => {
    setCargandoMP(true);
    try {
      const res = await fetch(`${API_BASE}/pagos/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuota_id: cuotaId })
      });
      const data = await res.json();
      if (res.ok && data.exito) {
        setMpPreference(data);
        if (data.cuota) {
          setSelectedCuota(data.cuota);
          setCuotas(prev => prev.map(c => c.id === data.cuota.id ? { ...c, monto: data.cuota.monto } : c));
        }
      } else {
        console.warn('No se pudo generar preferencia de Mercado Pago:', data.mensaje);
      }
    } catch (err) {
      console.error('Error al generar preferencia MP:', err);
    } finally {
      setCargandoMP(false);
    }
  };

  // Manejo de apertura del modal de pago
  const handleAbrirPago = async (cuota) => {
    setSelectedCuota(cuota);
    setPagoExitosoMsg(null);
    setMpPreference(null);
    setShowPaymentModal(true);

    // Generar preferencia de Mercado Pago de antemano
    await inicializarMercadoPago(cuota.id);
  };

  // Redirigir a Mercado Pago (Checkout Pro)
  const handleCompletarPagoMP = async () => {
    if (!mpPreference || (!mpPreference.init_point && !mpPreference.sandbox_init_point)) {
      setPagoExitosoMsg('Error: No se pudo generar la preferencia de pago de Mercado Pago.');
      return;
    }
    
    // Desmontar el modal de Bootstrap y limpiar el scroll de body antes de redirigir
    setShowPaymentModal(false);
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach((b) => b.remove());

    // Redirigir al usuario al flujo de Checkout Pro de Mercado Pago
    // Como es un entorno de desarrollo/pruebas, priorizamos sandbox_init_point
    window.location.href = mpPreference.sandbox_init_point || mpPreference.init_point;
  };


  // Procesar pago alternativo (Tarjeta o Transferencia)
  const handleProcesarPagoAlternativo = async (tipo, comprobanteManual) => {
    if (!selectedCuota) return;
    setProcesandoPago(true);

    try {
      const nombreMetodo =
        tipo === 'tarjeta' ? 'Tarjeta de Crédito / Débito' : 'Transferencia Bancaria';

      const numComprobante =
        tipo === 'tarjeta'
          ? generarComprobanteFallback('COMP-TC')
          : (comprobanteManual && comprobanteManual.trim()) || generarComprobanteFallback('TRF');

      const res = await fetch(`${API_BASE}/cuotas/${selectedCuota.id}/pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metodo_pago: nombreMetodo,
          comprobante: numComprobante,
          fecha_pago: new Date().toISOString()
        })
      });

      const data = await res.json();

      if (res.ok && data.exito) {
        const cuotaPagada = data.cuota || {
          ...selectedCuota,
          estado: 'pagado',
          metodo_pago: nombreMetodo,
          metodo: nombreMetodo,
          comprobante: numComprobante,
          fecha_pago: new Date().toISOString(),
          fechaPago: new Date().toLocaleDateString('es-AR')
        };

        // Actualizar cuotas localmente sin recargar página
        setCuotas((prev) => prev.filter((c) => c.id !== selectedCuota.id));
        setHistorial((prev) => [cuotaPagada, ...prev]);

        // Actualizar resumen
        setResumen((prev) => ({
          ...prev,
          totalPagadas: prev.totalPagadas + 1,
          totalPendientes: selectedCuota.estado === 'pendiente' ? Math.max(0, prev.totalPendientes - 1) : prev.totalPendientes,
          totalEnDemora: selectedCuota.estado === 'en demora' ? Math.max(0, prev.totalEnDemora - 1) : prev.totalEnDemora,
          totalNoPagadas: selectedCuota.estado === 'no pagado' ? Math.max(0, prev.totalNoPagadas - 1) : prev.totalNoPagadas
        }));

        setPagoExitosoMsg(`¡Pago registrado con éxito! Comprobante: ${numComprobante}`);
        mostrarFeedback(`¡Pago registrado con éxito! Cuota ${selectedCuota.concepto || selectedCuota.periodo} acreditada.`, 'success');

        setTimeout(() => {
          setShowPaymentModal(false);
          setPagoExitosoMsg(null);
        }, 1800);
      } else {
        setPagoExitosoMsg(`Error al registrar pago: ${data.mensaje || 'Intente nuevamente'}`);
      }
    } catch (err) {
      console.error('Error al registrar pago:', err);
      setPagoExitosoMsg('Error de conexión al procesar el pago.');
    } finally {
      setProcesandoPago(false);
    }
  };

  // Abrir vista detallada de comprobante
  const handleVerComprobante = (item) => {
    setReciboSeleccionado(item);
    setShowReceiptModal(true);
  };

  // Guard de rol: administradores y profesores no poseen cuotas
  if (esRolExcluido) {
    return (
      <Card className="glass-card border-0 p-5 text-white text-center">
        <div className="d-inline-flex p-3 rounded-circle bg-info bg-opacity-10 text-info mx-auto mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <h4 className="fw-bold mb-2">Apartado no disponible</h4>
        <p className="text-secondary max-w-md mx-auto mb-0" style={{ maxWidth: '520px' }}>
          Este apartado no está disponible para administradores ni profesores. Solo los socios activos poseen gestión de cuotas.
        </p>
      </Card>
    );
  }

  const cuotasVisibles = mostrarTodasCuotas ? cuotas : cuotas.slice(0, 5);

  return (
    <Card className="glass-card border-0 p-4 text-white">
      {/* Alerta de feedback general */}
      {alertaFeedback && (
        <Alert
          variant={alertaFeedback.tipo}
          dismissible
          onClose={() => setAlertaFeedback(null)}
          className="mb-4 text-center fw-medium border-0 shadow"
        >
          {alertaFeedback.texto}
        </Alert>
      )}

      {/* Header del Tab */}
      <CuotasHeader
        cargando={cargando}
        onRecargar={obtenerCuotas}
        onVerHistorial={() => setShowHistoryModal(true)}
        totalHistorial={historial.length}
      />

      {/* Tarjetas de Resumen Rápido */}
      <ResumenCards resumen={resumen} />

      {/* Contenido Principal: Spinner, Error o Tabla */}
      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-light opacity-75">Cargando estado de tus cuotas...</p>
        </div>
      ) : errorCarga ? (
        <Alert variant="danger" className="py-4 text-center border-0 shadow">
          <p className="mb-2 fw-semibold">{errorCarga}</p>
          <Button variant="outline-danger" size="sm" onClick={obtenerCuotas} className="rounded-pill px-3">
            Reintentar Conexión
          </Button>
        </Alert>
      ) : (
        <>
          <CuotasTable cuotas={cuotasVisibles} onAbrirPago={handleAbrirPago} />
          {cuotas.length > 5 && (
            <div className="text-center mt-3 pt-2">
              <Button
                variant="outline-primary"
                className="btn-token-outline-primary rounded-pill px-4 py-2 fw-medium d-inline-flex align-items-center gap-2"
                onClick={() => setMostrarTodasCuotas(!mostrarTodasCuotas)}
              >
                {mostrarTodasCuotas ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    {`Mostrar más cuotas (${cuotas.length - 5} adicionales)`}
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal Pasarela de Pago */}
      <ModalPago
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        selectedCuota={selectedCuota}
        currentUser={currentUser}
        cargandoMP={cargandoMP}
        mpPreference={mpPreference}
        procesandoPago={procesandoPago}
        pagoExitosoMsg={pagoExitosoMsg}
        onPagarMP={handleCompletarPagoMP}
        onPagarAlternativo={handleProcesarPagoAlternativo}
      />

      {/* Modal Historial de Pagos y Comprobantes */}
      <ModalHistorial
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        historial={historial}
        onVerComprobante={handleVerComprobante}
      />

      {/* Modal Detalle de Comprobante / Recibo Imprimible */}
      <ModalRecibo
        show={showReceiptModal}
        onHide={() => setShowReceiptModal(false)}
        recibo={reciboSeleccionado}
        currentUser={currentUser}
      />

      {/* Modal / Cartel Destacado de Pago Acreditado con Mini Comprobante (Mercado Pago) */}
      <ModalComprobanteMP
        show={showModalComprobanteMP}
        onHide={() => setShowModalComprobanteMP(false)}
        cuota={comprobanteMP}
        currentUser={currentUser}
      />
    </Card>
  );
};

export default CuotasTab;
