export const DIAS_SEMANA_DEFAULT = [
  { day: 'Lunes', abierto: true, hora_home: '07:00', hora_fin: '23:00' },
  { day: 'Martes', abierto: true, hora_home: '07:00', hora_fin: '23:00' },
  { day: 'Miércoles', abierto: true, hora_home: '07:00', hora_fin: '23:00' },
  { day: 'Jueves', abierto: true, hora_home: '07:00', hora_fin: '23:00' },
  { day: 'Viernes', abierto: true, hora_home: '07:00', hora_fin: '23:00' },
  { day: 'Sábado', abierto: true, hora_home: '08:00', hora_fin: '20:00' },
  { day: 'Domingo', abierto: false, hora_home: '09:00', hora_fin: '14:00' }
];

export const MAP_ABREV = {
  'Lunes': 'Lun',
  'Martes': 'Mar',
  'Miércoles': 'Mié',
  'Jueves': 'Jue',
  'Viernes': 'Vie',
  'Sábado': 'Sáb',
  'Domingo': 'Dom'
};

export const ORDEN_DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const abreviarDia = (day) => MAP_ABREV[day] || day;

export const sonConsecutivos = (days) => {
  if (days.length <= 1) return true;
  const indices = days.map(d => ORDEN_DIAS.indexOf(d));
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i - 1] + 1) return false;
  }
  return true;
};

export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const calcularSlots = (horaInicio, endTime, intervaloMinutos) => {
  const slots = [];
  const startMin = timeToMinutes(horaInicio);
  const endMin = timeToMinutes(endTime);
  const interval = parseInt(intervaloMinutos, 10) || 60;

  if (startMin >= endMin || interval <= 0) return slots;

  let current = startMin;
  while (current + interval <= endMin) {
    slots.push({
      home: minutesToTime(current),
      fin: minutesToTime(current + interval)
    });
    current += interval;
  }
  return slots;
};

export const generarResumenHorarios = (days) => {
  if (!Array.isArray(days) || days.length === 0) return 'Sin schedules configurados';

  const diasAbiertos = days.filter(d => d.abierto && d.hora_home && d.hora_fin);
  if (diasAbiertos.length === 0) return 'Cerrado temporalmente';

  const grupos = [];
  days.forEach(d => {
    if (!d.abierto) return;
    const horarioKey = `${d.hora_home} a ${d.hora_fin} hs`;
    const ultimoGrupo = grupos[grupos.length - 1];
    if (ultimoGrupo && ultimoGrupo.horarioKey === horarioKey) {
      ultimoGrupo.days.push(d.day);
    } else {
      grupos.push({ horarioKey, days: [d.day] });
    }
  });

  const partes = grupos.map(g => {
    const diasStr = g.days.length === 1
      ? g.days[0]
      : (g.days.length > 2 && sonConsecutivos(g.days)
        ? `${abreviarDia(g.days[0])} a ${abreviarDia(g.days[g.days.length - 1])}`
        : g.days.map(abreviarDia).join(', '));
    return `${diasStr}: ${g.horarioKey}`;
  });

  return partes.join(' | ') || 'Lunes a Sábado';
};
