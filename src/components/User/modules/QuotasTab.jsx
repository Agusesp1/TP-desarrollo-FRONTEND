import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

// Módulos y submódulos de quotas
import { generarComprobanteFallback, generarPaymentIdMP } from './quotas/helpers';
import QuotasHeader from './quotas/QuotasHeader';
import ResumenCards from './quotas/ResumenCards';
import QuotasTable from './quotas/QuotasTable';
import PaymentModal from './quotas/PaymentModal';
import ModalHistorial from './quotas/ModalHistorial';
import ModalRecibo from './quotas/ModalRecibo';
import ModalComprobanteMP from './quotas/ModalComprobanteMP';

const API_BASE = 'http://localhost:3000/api';

const QuotasTab = ({ user }) => {
  const { user: authUser } = useAuth();
  const currentUser = user || authUser;
  const esRolExcluido = currentUser?.role === 'admin' || currentUser?.role === 'teacher';
  const userId = currentUser?.id || currentUser?.user_id || 1;

  // Estados de datos
  const [quotas, setCuotas] = useState([]);
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
  const [paymentExitosoMsg, setPagoExitosoMsg] = useState(null);

  // Status para la preferencia de Mercado Payment
  const [cargandoMP, setCargandoMP] = useState(false);
  const [mpPreference, setMpPreference] = useState(null);

  // Status para ver detalle de receipt individual
  const [reciboSeleccionado, setReciboSeleccionado] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Status para el cartel / modal destacado de Payment Acreditado con Mini Receipt
  const [receiptMP, setComprobanteMP] = useState(null);
  const [showModalComprobanteMP, setShowModalComprobanteMP] = useState(false);
  const mpConfirmadoRef = useRef(false);
  const [searchParams] = useSearchParams();

  // Mostrar alertas temporales
  const mostrarFeedback = (texto, tipo = 'success') => {
    setAlertaFeedback({ texto, tipo });
    setTimeout(() => setAlertaFeedback(null), 5000);
  };

  // Cargar quotas desde la API a demanda
  const obtenerCuotas = useCallback(async () => {
    if (!userId || esRolExcluido) return;
    setCargando(true);
    setErrorCarga(null);

    try {
      const res = await fetch(`${API_BASE}/quotas/mis-quotas?user_id=${userId}`);
      const data = await res.json();

      if (res.ok && data.success) {
        const todasCuotas = data.quotas || [];
        const pagadas = data.historial || todasCuotas.filter((c) => c.status === 'pagado');
        const impagas = data.pendientes || todasCuotas.filter((c) => c.status !== 'pagado');

        setCuotas(impagas);
        setHistorial(pagadas);

        const pendientes = impagas.filter((c) => c.status === 'pendiente').length;
        const enDemora = impagas.filter((c) => c.status === 'en demora').length;
        const noPagadas = impagas.filter((c) => c.status === 'no pagado').length;
        const primerVenc = impagas.length > 0 ? (impagas[0].dateVenc || impagas[0].date_vencimiento) : 'Al día';

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
        setErrorCarga(data.message || 'No se pudieron obtener las quotas del user.');
      }
    } catch (err) {
      console.error('Error al consultar quotas:', err);
      setErrorCarga('Error de conexión con el servidor. Verifique su red.');
    } finally {
      setCargando(false);
    }
  }, [userId, esRolExcluido]);

  useEffect(() => {
    if (!userId || esRolExcluido) {
      return;
    }

    let ignore = false;
    fetch(`${API_BASE}/quotas/mis-quotas?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;
        if (data.success) {
          const todasCuotas = data.quotas || [];
          const pagadas = data.historial || todasCuotas.filter((c) => c.status === 'pagado');
          const impagas = data.pendientes || todasCuotas.filter((c) => c.status !== 'pagado');

          setCuotas(impagas);
          setHistorial(pagadas);

          const pendientes = impagas.filter((c) => c.status === 'pendiente').length;
          const enDemora = impagas.filter((c) => c.status === 'en demora').length;
          const noPagadas = impagas.filter((c) => c.status === 'no pagado').length;
          const primerVenc = impagas.length > 0 ? (impagas[0].dateVenc || impagas[0].date_vencimiento) : 'Al día';

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
          setErrorCarga(data.message || 'No se pudieron obtener las quotas del user.');
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Error al inicializar quotas:', err);
          setErrorCarga('Error de conexión con el servidor. Verifique su red.');
        }
      })
      .finally(() => {
        if (!ignore) setCargando(false);
      });

    return () => {
      ignore = true;
    };
  }, [userId, esRolExcluido]);

  // Detección del retorno de Mercado Payment, confirmación con el backend y apertura de mini receipt
  useEffect(() => {
    const status = searchParams.get('status');
    const collection_status = searchParams.get('collection_status');
    const payment = searchParams.get('payment');
    const payment_id = searchParams.get('payment_id');
    const collection_id = searchParams.get('collection_id');
    const external_reference = searchParams.get('external_reference');
    const preference_id = searchParams.get('preference_id');

    const esPagoAprobado = status === 'approved' || collection_status === 'approved' || payment === 'success';

    if (esPagoAprobado && !mpConfirmadoRef.current) {
      mpConfirmadoRef.current = true;

      const confirmarPagoRetornoMP = async () => {
        try {
          const res = await fetch(`${API_BASE}/quotas/mercadopago/confirmar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quota_id: external_reference,
              payment_id: payment_id || collection_id,
              status: 'approved',
              preference_id
            })
          });

          const data = await res.json();

          if (res.ok && data.success && data.quota) {
            // 1. Eliminar de inmediato dicha quota de quotas pendientes
            setCuotas((prev) => prev.filter((c) => c.id !== data.quota.id));

            // 2. Agregar al historial
            setHistorial((prev) => [data.quota, ...prev.filter((c) => c.id !== data.quota.id)]);

            // 3. Actualizar las tarjetas de resumen
            setResumen((prev) => ({
              ...prev,
              totalPagadas: prev.totalPagadas + 1,
              totalPendientes: Math.max(0, prev.totalPendientes - 1),
              totalEnDemora: Math.max(0, prev.totalEnDemora - (data.quota.status_anterior === 'en demora' ? 1 : 0))
            }));

            // 4. Abrir un cartel / modal destacado de Payment Acreditado con Mini Receipt
            setComprobanteMP(data.quota);
            setShowModalComprobanteMP(true);

            mostrarFeedback(`¡Payment acreditado con éxito! Receipt: ${data.quota.receipt || payment_id || collection_id}`, 'success');
          } else {
            console.warn('La confirmación de Mercado Payment no devolvió quota exitosa:', data);
            obtenerCuotas();
          }
        } catch (err) {
          console.error('Error al confirmar retorno de Mercado Payment:', err);
          mostrarFeedback('Error al confirmar la acreditación del payment con el servidor.', 'danger');
        } finally {
          // Limpiar la URL usando replaceState para que al recargar la página no vuelva a saltar el procesamiento
          window.history.replaceState({}, document.title, window.location.pathname + '?tab=quotas');
        }
      };

      confirmarPagoRetornoMP();
    } else if (payment === 'failure' || status === 'rejected') {
      mostrarFeedback('El payment a través de Mercado Payment no fue completado o fue rechazado.', 'warning');
      window.history.replaceState({}, document.title, window.location.pathname + '?tab=quotas');
    }
  }, [searchParams, obtenerCuotas]);

  // Solicitar preferencia de Mercado Payment al backend
  const inicializarMercadoPago = async (quotaId) => {
    setCargandoMP(true);
    try {
      const res = await fetch(`${API_BASE}/payments/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quota_id: quotaId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMpPreference(data);
        if (data.quota) {
          setSelectedCuota(data.quota);
          setCuotas(prev => prev.map(c => c.id === data.quota.id ? { ...c, amount: data.quota.amount } : c));
        }
      } else {
        console.warn('No se pudo generar preferencia de Mercado Payment:', data.message);
      }
    } catch (err) {
      console.error('Error al generar preferencia MP:', err);
    } finally {
      setCargandoMP(false);
    }
  };

  // Manejo de apertura del modal de payment
  const handleAbrirPago = async (quota) => {
    setSelectedCuota(quota);
    setPagoExitosoMsg(null);
    setMpPreference(null);
    setShowPaymentModal(true);

    // Generar preferencia de Mercado Payment de antemano
    await inicializarMercadoPago(quota.id);
  };

  // Redirigir a Mercado Payment (Checkout Pro)
  const handleCompletarPagoMP = async () => {
    if (!mpPreference || (!mpPreference.init_point && !mpPreference.sandbox_init_point)) {
      setPagoExitosoMsg('Error: No se pudo generar la preferencia de payment de Mercado Payment.');
      return;
    }
    
    // Desmontar el modal de Bootstrap y limpiar el scroll de body antes de redirigir
    setShowPaymentModal(false);
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach((b) => b.remove());

    // Redirigir al user al flujo de Checkout Pro de Mercado Payment
    // Como es un entorno de desarrollo/pruebas, priorizamos sandbox_init_point
    window.location.href = mpPreference.sandbox_init_point || mpPreference.init_point;
  };


  // Procesar payment alternativo (Tarjeta o Transferencia)
  const handleProcesarPagoAlternativo = async (tipo, receiptManual) => {
    if (!selectedCuota) return;
    setProcesandoPago(true);

    try {
      const nameMetodo =
        tipo === 'tarjeta' ? 'Tarjeta de Crédito / Débito' : 'Transferencia Bancaria';

      const numComprobante =
        tipo === 'tarjeta'
          ? generarComprobanteFallback('COMP-TC')
          : (receiptManual && receiptManual.trim()) || generarComprobanteFallback('TRF');

      const res = await fetch(`${API_BASE}/quotas/${selectedCuota.id}/pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metodo_payment: nameMetodo,
          receipt: numComprobante,
          date_payment: new Date().toISOString()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const quotaPagada = data.quota || {
          ...selectedCuota,
          status: 'pagado',
          metodo_payment: nameMetodo,
          metodo: nameMetodo,
          receipt: numComprobante,
          date_payment: new Date().toISOString(),
          datePago: new Date().toLocaleDateString('es-AR')
        };

        // Actualizar quotas localmente sin recargar página
        setCuotas((prev) => prev.filter((c) => c.id !== selectedCuota.id));
        setHistorial((prev) => [quotaPagada, ...prev]);

        // Actualizar resumen
        setResumen((prev) => ({
          ...prev,
          totalPagadas: prev.totalPagadas + 1,
          totalPendientes: selectedCuota.status === 'pendiente' ? Math.max(0, prev.totalPendientes - 1) : prev.totalPendientes,
          totalEnDemora: selectedCuota.status === 'en demora' ? Math.max(0, prev.totalEnDemora - 1) : prev.totalEnDemora,
          totalNoPagadas: selectedCuota.status === 'no pagado' ? Math.max(0, prev.totalNoPagadas - 1) : prev.totalNoPagadas
        }));

        setPagoExitosoMsg(`¡Payment registrado con éxito! Receipt: ${numComprobante}`);
        mostrarFeedback(`¡Payment registrado con éxito! Quota ${selectedCuota.concepto || selectedCuota.periodo} acreditada.`, 'success');

        setTimeout(() => {
          setShowPaymentModal(false);
          setPagoExitosoMsg(null);
        }, 1800);
      } else {
        setPagoExitosoMsg(`Error al registrar payment: ${data.message || 'Intente nuevamente'}`);
      }
    } catch (err) {
      console.error('Error al registrar payment:', err);
      setPagoExitosoMsg('Error de conexión al procesar el payment.');
    } finally {
      setProcesandoPago(false);
    }
  };

  // Abrir vista detallada de receipt
  const handleVerComprobante = (item) => {
    setReciboSeleccionado(item);
    setShowReceiptModal(true);
  };

  // Guard de role: administradores y teachers no poseen quotas
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
          Este apartado no está disponible para administradores ni teachers. Solo los members activos poseen gestión de quotas.
        </p>
      </Card>
    );
  }

  const quotasVisibles = mostrarTodasCuotas ? quotas : quotas.slice(0, 5);

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
      <QuotasHeader
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
          <p className="mt-3 text-light opacity-75">Cargando status de tus quotas...</p>
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
          <QuotasTable quotas={quotasVisibles} onAbrirPago={handleAbrirPago} />
          {quotas.length > 5 && (
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
                    {`Mostrar más quotas (${quotas.length - 5} adicionales)`}
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal Pasarela de Payment */}
      <PaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        selectedCuota={selectedCuota}
        currentUser={currentUser}
        cargandoMP={cargandoMP}
        mpPreference={mpPreference}
        procesandoPago={procesandoPago}
        paymentExitosoMsg={paymentExitosoMsg}
        onPagarMP={handleCompletarPagoMP}
        onPagarAlternativo={handleProcesarPagoAlternativo}
      />

      {/* Modal Historial de Payments y Comprobantes */}
      <ModalHistorial
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        historial={historial}
        onVerComprobante={handleVerComprobante}
      />

      {/* Modal Detalle de Receipt / Recibo Imprimible */}
      <ModalRecibo
        show={showReceiptModal}
        onHide={() => setShowReceiptModal(false)}
        recibo={reciboSeleccionado}
        currentUser={currentUser}
      />

      {/* Modal / Cartel Destacado de Payment Acreditado con Mini Receipt (Mercado Payment) */}
      <ModalComprobanteMP
        show={showModalComprobanteMP}
        onHide={() => setShowModalComprobanteMP(false)}
        quota={receiptMP}
        currentUser={currentUser}
      />
    </Card>
  );
};

export default QuotasTab;
