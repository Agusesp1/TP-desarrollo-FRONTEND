export const generarComprobanteCobro = () =>
  `REC-CAJA-${Math.floor(100000 + Math.random() * 900000)}`;

export const formatMonto = (amount) =>
  Number(amount || 0).toLocaleString('es-AR');
