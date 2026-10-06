/**
 * Valida si una cadena de texto representa una hora válida en formato 24hs (HH:MM)
 * @param {string} hora 
 * @returns {boolean}
 */
export const esHoraValida = (hora) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(hora?.trim() || '');

/**
 * Convierte un string de hora HH:MM a minutos totales desde las 00:00
 * @param {string} hora 
 * @returns {number|null}
 */
export const convertirHoraAMin = (hora) => {
  if (!esHoraValida(hora)) return null;
  const [h, m] = hora.trim().split(':').map(Number);
  return h * 60 + m;
};

/**
 * Obtiene el resumen de schedules y días para mostrar en la tabla de activities
 * (agrupa shifts continuos como en Musculación)
 * @param {object} act - Objeto de activity con su array de shifts
 * @returns {object} { horariosTexto, diasTexto, esGrupal, amountShifts }
 */
export const obtenerResumenHorarios = (act) => {
  if (!act.shifts || act.shifts.length === 0) {
    return {
      horariosTexto: 'Sin schedule',
      diasTexto: 'Sin días asignados',
      esGrupal: false,
      amountShifts: 0
    };
  }

  if (act.shifts.length === 1) {
    const t = act.shifts[0];
    return {
      horariosTexto: `${t.startTime} - ${t.endTime} hs`,
      diasTexto: t.dayOfWeek,
      esGrupal: false,
      amountShifts: 1
    };
  }

  const horasInicio = act.shifts.map((t) => t.startTime).sort();
  const horasFin = act.shifts.map((t) => t.endTime).sort();
  const primerHorario = horasInicio[0];
  const ultimoHorario = horasFin[horasFin.length - 1];
  const diasUnicos = Array.from(new Set(act.shifts.map((t) => t.dayOfWeek))).join(', ');
  const esMusculacion = act.name.toLowerCase().includes('musculac');

  return {
    horariosTexto: `${primerHorario} a ${ultimoHorario} hs`,
    diasTexto: esMusculacion ? `${diasUnicos} (Shifts continuos)` : diasUnicos,
    esGrupal: true,
    amountShifts: act.shifts.length
  };
};
