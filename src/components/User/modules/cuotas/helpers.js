export const generarComprobanteFallback = (prefijo) =>
  `${prefijo}-${Math.floor(100000 + Math.random() * 900000)}`;

export const generarPaymentIdMP = () =>
  `MP-${Math.floor(10000000 + Math.random() * 90000000)}`;

export const formatMonto = (monto) =>
  Number(monto || 0).toLocaleString('es-AR');
