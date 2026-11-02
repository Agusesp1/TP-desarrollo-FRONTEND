export const DIAS_SEMANA_ORDEN = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];

export const timeToMinutes = (str) => {
  if (!str) return 0;
  const [h, m] = str.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const minutesToTime = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const normalizarTexto = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export const esTurnoMusculacion = (shift, activities = []) => {
  let actName = shift.activity?.name;
  if (!actName && shift.activity_id && activities.length > 0) {
    const act = activities.find((a) => a.id?.toString() === shift.activity_id?.toString());
    if (act) actName = act.name;
  }
  const norm = normalizarTexto(actName);
  return norm.includes('musculaci') || norm.includes('pesas');
};

export const expandirDiasDeTurno = (dayOfWeekStr) => {
  if (!dayOfWeekStr) return [];
  const s = normalizarTexto(dayOfWeekStr);

  if (s.includes('todos') || s.includes('lunes a domingo')) {
    return ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  }
  if (s.includes('lunes a sabado')) {
    return ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  }
  if (s.includes('lunes a viernes')) {
    return ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  }
  if (s.includes('lunes') && s.includes('miercoles') && s.includes('viernes')) {
    return ['Lunes', 'Miércoles', 'Viernes'];
  }
  if (s.includes('martes') && s.includes('jueves')) {
    return ['Martes', 'Jueves'];
  }

  const matches = [];
  const mapDias = [
    { name: 'Lunes', token: 'lunes' },
    { name: 'Martes', token: 'martes' },
    { name: 'Miércoles', token: 'miercoles' },
    { name: 'Jueves', token: 'jueves' },
    { name: 'Viernes', token: 'viernes' },
    { name: 'Sábado', token: 'sabado' },
    { name: 'Domingo', token: 'domingo' }
  ];

  mapDias.forEach((item) => {
    if (s.includes(item.token)) {
      matches.push(item.name);
    }
  });

  return matches.length > 0 ? matches : [dayOfWeekStr];
};

export const formatearGrupoDias = (dias) => {
  if (!Array.isArray(dias) || dias.length === 0) return '';
  if (dias.length === 1) {
    return dias[0] === 'Sábado' ? 'Sábados' : dias[0] === 'Domingo' ? 'Domingos' : dias[0];
  }
  if (dias.length === 7) return 'Lunes a Domingo (Todos los días)';
  if (dias.length === 6 && dias[0] === 'Lunes' && dias[5] === 'Sábado') return 'Lunes a Sábado';
  if (dias.length === 5 && dias[0] === 'Lunes' && dias[4] === 'Viernes') return 'Lunes a Viernes';
  if (dias.length === 3 && dias[0] === 'Lunes' && dias[1] === 'Miércoles' && dias[2] === 'Viernes') {
    return 'Lunes, Miércoles y Viernes';
  }
  if (dias.length === 2 && dias[0] === 'Martes' && dias[1] === 'Jueves') {
    return 'Martes y Jueves';
  }

  // Verificar si son días consecutivos según orden
  const indices = dias.map((d) => DIAS_SEMANA_ORDEN.indexOf(d));
  const sonConsecutivos = indices.every((val, i) => i === 0 || val === indices[i - 1] + 1);
  if (sonConsecutivos && dias.length >= 3) {
    return `${dias[0]} a ${dias[dias.length - 1]}`;
  }

  if (dias.length === 2) {
    return `${dias[0]} y ${dias[1]}`;
  }

  return `${dias.slice(0, -1).join(', ')} y ${dias[dias.length - 1]}`;
};

export const coincideFiltroDia = (shift, filterDia) => {
  if (!filterDia || filterDia === 'todos') return true;

  const diasTurno = expandirDiasDeTurno(shift.dayOfWeek);
  const diasFiltro = expandirDiasDeTurno(filterDia);

  return diasTurno.some((d) => diasFiltro.includes(d));
};

export const agruparTurnosMusculacion = (shifts = [], activities = []) => {
  const turnosMusculacion = [];
  const otrosTurnos = [];

  shifts.forEach((t) => {
    if (esTurnoMusculacion(t, activities)) {
      turnosMusculacion.push(t);
    } else {
      otrosTurnos.push({ ...t, isGroup: false });
    }
  });

  if (turnosMusculacion.length === 0) {
    return otrosTurnos;
  }

  // Agrupar turnos de musculación por actividad, sede y profesor
  const gruposPorClave = new Map();

  turnosMusculacion.forEach((t) => {
    const actId = t.activity_id || t.activity?.id || 'sin_act';
    const sedeId = t.branch_id || t.branch?.id || 'sin_sede';
    const profId = t.teacher_id || t.teacher?.id || 'sin_prof';
    const clave = `${actId}__${sedeId}__${profId}`;

    if (!gruposPorClave.has(clave)) {
      gruposPorClave.set(clave, []);
    }
    gruposPorClave.get(clave).push(t);
  });

  const gruposFinales = [];

  gruposPorClave.forEach((listaShifts, clave) => {
    // Para este conjunto de turnos, desglosamos por día de la semana
    const turnosPorDia = {};
    DIAS_SEMANA_ORDEN.forEach((dia) => {
      turnosPorDia[dia] = [];
    });

    listaShifts.forEach((s) => {
      const dias = expandirDiasDeTurno(s.dayOfWeek);
      dias.forEach((d) => {
        if (turnosPorDia[d]) {
          turnosPorDia[d].push(s);
        }
      });
    });

    // Para cada día con turnos, calculamos hora inicio mínima y hora fin máxima
    const infoPorDia = [];
    DIAS_SEMANA_ORDEN.forEach((dia) => {
      const turnosDelDia = turnosPorDia[dia];
      if (turnosDelDia.length > 0) {
        // Ordenar por hora inicio
        turnosDelDia.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
        const horaInicio = turnosDelDia[0].startTime;

        let maxEndMin = 0;
        let horaFin = turnosDelDia[0].endTime;
        turnosDelDia.forEach((s) => {
          const endMin = timeToMinutes(s.endTime);
          if (endMin > maxEndMin) {
            maxEndMin = endMin;
            horaFin = s.endTime;
          }
        });

        infoPorDia.push({
          dia,
          horaInicio,
          horaFin,
          scheduleKey: `${horaInicio} - ${horaFin}`,
          shifts: turnosDelDia
        });
      }
    });

    if (infoPorDia.length === 0) {
      listaShifts.forEach((s) => otrosTurnos.push({ ...s, isGroup: false }));
      return;
    }

    // Verificar si todos los días tienen el mismo horario
    const primerHorario = infoPorDia[0].scheduleKey;
    const todosHorariosIguales = infoPorDia.every((item) => item.scheduleKey === primerHorario);

    if (todosHorariosIguales) {
      // Agrupar todos los días en un único resumen
      const diasTodos = infoPorDia.map((item) => item.dia);
      const todosShiftsUnicos = Array.from(
        new Map(infoPorDia.flatMap((i) => i.shifts).map((s) => [s.id, s])).values()
      );
      const primer = todosShiftsUnicos[0];
      const todosPausados = todosShiftsUnicos.every((s) => !s.status);
      const todosActivos = todosShiftsUnicos.every((s) => s.status);
      const activosCount = todosShiftsUnicos.filter((s) => s.status).length;

      gruposFinales.push({
        id: `group_${clave}_all`,
        isGroup: true,
        activity_id: primer.activity_id,
        activity: primer.activity,
        startTime: infoPorDia[0].horaInicio,
        endTime: infoPorDia[0].horaFin,
        dayOfWeek: formatearGrupoDias(diasTodos),
        dias: diasTodos,
        teacher_id: primer.teacher_id,
        teacher: primer.teacher,
        branch_id: primer.branch_id,
        branch: primer.branch,
        status: !todosPausados,
        isPartialStatus: !todosActivos && !todosPausados,
        activosCount,
        totalTurnos: todosShiftsUnicos.length,
        subShifts: todosShiftsUnicos
      });
    } else {
      // Agrupar días que comparten el mismo horario
      const horarioMap = new Map();
      infoPorDia.forEach((item) => {
        if (!horarioMap.has(item.scheduleKey)) {
          horarioMap.set(item.scheduleKey, {
            horaInicio: item.horaInicio,
            horaFin: item.horaFin,
            dias: [],
            shifts: []
          });
        }
        const grp = horarioMap.get(item.scheduleKey);
        grp.dias.push(item.dia);
        item.shifts.forEach((s) => {
          if (!grp.shifts.some((x) => x.id === s.id)) {
            grp.shifts.push(s);
          }
        });
      });

      let subIdx = 0;
      horarioMap.forEach((grp) => {
        subIdx++;
        const primer = grp.shifts[0];
        const todosPausados = grp.shifts.every((s) => !s.status);
        const todosActivos = grp.shifts.every((s) => s.status);
        const activosCount = grp.shifts.filter((s) => s.status).length;

        gruposFinales.push({
          id: `group_${clave}_${subIdx}`,
          isGroup: true,
          activity_id: primer.activity_id,
          activity: primer.activity,
          startTime: grp.horaInicio,
          endTime: grp.horaFin,
          dayOfWeek: formatearGrupoDias(grp.dias),
          dias: grp.dias,
          teacher_id: primer.teacher_id,
          teacher: primer.teacher,
          branch_id: primer.branch_id,
          branch: primer.branch,
          status: !todosPausados,
          isPartialStatus: !todosActivos && !todosPausados,
          activosCount,
          totalTurnos: grp.shifts.length,
          subShifts: grp.shifts
        });
      });
    }
  });

  return [...gruposFinales, ...otrosTurnos];
};
