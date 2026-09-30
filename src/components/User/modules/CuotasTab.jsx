import { useState, useEffect, useCallback } from 'react';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../../../context/AuthContext';

// Módulos y submódulos de cuotas
import { generarComprobanteFallback, generarPaymentIdMP } from './cuotas/helpers';
import CuotasHeader from './cuotas/CuotasHeader';
import ResumenCards from './cuotas/ResumenCards';
import CuotasTable from './cuotas/CuotasTable';
import ModalPago from './cuotas/ModalPago';
import ModalHistorial from './cuotas/ModalHistorial';
import ModalRecibo from './cuotas/ModalRecibo';

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

  // Solicitar preferencia de Mercado Pago al backend
  const inicializarMercadoPago = async (cuotaId) => {
    setCargandoMP(true);
    try {
      const res = await fetch(`${API_BASE}/cuotas/${cuotaId}/preferencia-mp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok && data.exito) {
        setMpPreference(data);
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

  // Procesar pago con Mercado Pago (Simulación de Checkout Exitoso)
  const handleCompletarPagoMP = async () => {
    if (!selectedCuota) return;
    setProcesandoPago(true);

    try {
      const paymentId = generarPaymentIdMP();
      const res = await fetch(`${API_BASE}/cuotas/mercadopago/exito`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cuota_id: selectedCuota.id,
          payment_id: paymentId,
          preference_id: mpPreference?.preferenceId
        })
      });

      const data = await res.json();

      if (res.ok && data.exito) {
        const cuotaPagada = data.cuota || {
          ...selectedCuota,
          estado: 'pagado',
          metodo_pago: 'Mercado Pago',
          metodo: 'Mercado Pago',
          comprobante: data.comprobante || paymentId,
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

        setPagoExitosoMsg(`¡Pago acreditado por Mercado Pago! Comprobante: ${cuotaPagada.comprobante}`);
        mostrarFeedback(`¡Pago de ${selectedCuota.concepto || selectedCuota.periodo} acreditado exitosamente con Mercado Pago!`, 'success');

        setTimeout(() => {
          setShowPaymentModal(false);
          setPagoExitosoMsg(null);
        }, 1800);
      } else {
        setPagoExitosoMsg(`Error al procesar pago: ${data.mensaje || 'Intente nuevamente'}`);
      }
    } catch (err) {
      console.error('Error al confirmar pago MP:', err);
      setPagoExitosoMsg('Error de conexión al confirmar pago de Mercado Pago.');
    } finally {
      setProcesandoPago(false);
    }
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
    </Card>
  );
};

export default CuotasTab;
