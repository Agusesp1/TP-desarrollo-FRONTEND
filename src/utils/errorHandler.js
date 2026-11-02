/**
 * Utilidad para el manejo centralizado de errores en el Frontend.
 * 
 * Cumple con dos objetivos clave:
 * 1. Imprimir en console.error un registro técnico detallado para desarrolladores (endpoint, status, código de error, detalles técnicos).
 * 2. Retornar un mensaje amigable y claro en español para ser mostrado al usuario final en la interfaz.
 */

export const procesarErrorApi = (error, data = null, contexto = 'Operación') => {
  // 1. Registro detallado en la consola del navegador
  console.error(`🔴 [FitApp API Error - ${contexto}]`, {
    timestamp: new Date().toISOString(),
    errorObject: error,
    responseData: data,
    errorMessage: error?.message,
    detallesTecnicos: data?.detalles || data?.errorCode || null
  });

  // 2. Si el servidor respondió con un mensaje amigable explícito
  if (data?.message) {
    return data.message;
  }

  // 3. Fallo de red (servidor apagado, timeout, error de CORS)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'No pudimos comunicarnos con el servidor en este momento. Verificá tu conexión o intentá nuevamente en unos instantes.';
  }

  // 4. Mensaje por defecto
  return 'Ocurrió un inconveniente al procesar la solicitud. Por favor, intentá nuevamente.';
};

export default procesarErrorApi;
