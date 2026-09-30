export const generarComprobanteCobro = () =>
  `REC-CAJA-${Math.floor(100000 + Math.random() * 900000)}`;

export const formatMonto = (monto) =>
  Number(monto || 0).toLocaleString('es-AR');
