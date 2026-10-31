/**
 * Configuración centralizada de la API
 * Obtiene la URL base desde la variable de entorno de Vite `VITE_API_URL`
 * Si no está definida, recurre a 'http://localhost:3000' para entorno de desarrollo local.
 */
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
export const API_BASE = `${API_URL}/api`;

export default API_URL;
