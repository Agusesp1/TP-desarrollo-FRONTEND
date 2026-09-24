// Helper para obtener fecha local en formato YYYY-MM-DD
export const getFechaLocalISO = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper para validar si un turno aplica a un día de la semana específico
export const turnoAplicaEnDia = (diaSemanaStr, dateStr) => {
  if (!diaSemanaStr) return true;
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayIndex = dateObj.getDay(); // 0 = Do, 1 = Lu, 2 = Ma, 3 = Mi, 4 = Ju, 5 = Vi, 6 = Sa

  const str = diaSemanaStr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (str.includes('todos')) return true;
  if (str.includes('lunes a sabado')) return dayIndex >= 1 && dayIndex <= 6;
  if (str.includes('lunes a viernes')) return dayIndex >= 1 && dayIndex <= 5;
  if (str.includes('lunes, miercoles y viernes') || (str.includes('lunes') && str.includes('miercoles') && str.includes('viernes'))) {
    return dayIndex === 1 || dayIndex === 3 || dayIndex === 5;
  }
  if (str.includes('martes y jueves') || (str.includes('martes') && str.includes('jueves'))) {
    return dayIndex === 2 || dayIndex === 4;
  }

  const diasMap = {
    domingo: 0,
    domingos: 0,
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
    sabados: 6
  };

  for (const [nombre, idx] of Object.entries(diasMap)) {
    if (str.includes(nombre) && dayIndex === idx) {
      return true;
    }
  }

  return false;
};

// Generar los próximos 7 días comenzando por hoy
export const generarDias = () => {
  const dias = [];
  const nombresDias = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  const hoy = new Date();
  const fechaHoyISO = getFechaLocalISO(hoy);

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(hoy.getDate() + i);
    const id = getFechaLocalISO(d);

    dias.push({
      fecha: d,
      diaNumero: d.getDate(),
      diaNombre: nombresDias[d.getDay()],
      mesNombre: meses[d.getMonth()],
      anio: d.getFullYear(),
      id,
      esHoy: id === fechaHoyISO
    });
  }
  return dias;
};
