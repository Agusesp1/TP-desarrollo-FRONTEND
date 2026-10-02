export const generarComprobanteFallback = (prefijo) =>
  `${prefijo}-${Math.floor(100000 + Math.random() * 900000)}`;

export const generarPaymentIdMP = () =>
  `MP-${Math.floor(10000000 + Math.random() * 90000000)}`;

export const formatMonto = (monto) =>
  Number(monto || 0).toLocaleString('es-AR');

export const formatearFechaSegura = (fecha) => {
  if (!fecha) return '-';
  if (typeof fecha === 'string') return fecha.substring(0, 10);
  try {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return '-';
    return d.toISOString().substring(0, 10);
  } catch (e) {
    return '-';
  }
};

