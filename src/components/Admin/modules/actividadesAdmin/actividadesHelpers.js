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
 * Obtiene el resumen de horarios y días para mostrar en la tabla de actividades
 * (agrupa turnos continuos como en Musculación)
 * @param {object} act - Objeto de actividad con su array de turnos
 * @returns {object} { horariosTexto, diasTexto, esGrupal, cantidadTurnos }
 */
export const obtenerResumenHorarios = (act) => {
  if (!act.turnos || act.turnos.length === 0) {
    return {
      horariosTexto: 'Sin horario',
      diasTexto: 'Sin días asignados',
      esGrupal: false,
      cantidadTurnos: 0
    };
  }

  if (act.turnos.length === 1) {
    const t = act.turnos[0];
    return {
      horariosTexto: `${t.horarioInicio} - ${t.horaFin} hs`,
      diasTexto: t.dia_semana,
      esGrupal: false,
      cantidadTurnos: 1
    };
  }

  const horasInicio = act.turnos.map((t) => t.horarioInicio).sort();
  const horasFin = act.turnos.map((t) => t.horaFin).sort();
  const primerHorario = horasInicio[0];
  const ultimoHorario = horasFin[horasFin.length - 1];
  const diasUnicos = Array.from(new Set(act.turnos.map((t) => t.dia_semana))).join(', ');
  const esMusculacion = act.nombre.toLowerCase().includes('musculac');

  return {
    horariosTexto: `${primerHorario} a ${ultimoHorario} hs`,
    diasTexto: esMusculacion ? `${diasUnicos} (Turnos continuos)` : diasUnicos,
    esGrupal: true,
    cantidadTurnos: act.turnos.length
  };
};
