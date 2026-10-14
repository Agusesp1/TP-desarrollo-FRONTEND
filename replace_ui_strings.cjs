const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'src', 'components');

const replacements = [
  { from: /Status Quotas/g, to: 'Estado de Cuotas' },
  { from: /Status Cuenta/g, to: 'Estado de Cuenta' },
  { from: /Quotas Vencidas del Member/g, to: 'Cuotas Vencidas del Socio' },
  { from: /únicamente las quotas vencidas/g, to: 'únicamente las cuotas vencidas' },
  { from: /No existen quotas vencidas pendientes de payment para este user/g, to: 'No existen cuotas vencidas pendientes de pago para este usuario' },
  { from: /No posees quotas pendientes de payment/g, to: 'No posees cuotas pendientes de pago' },
  { from: /Amount de la Quota/g, to: 'Monto de la Cuota' },
  { from: />Amount</g, to: '>Monto<' },
  { from: />Status</g, to: '>Estado<' },
  { from: />Date</g, to: '>Fecha<' },
  { from: /Status Mora/g, to: 'Estado de Mora' },
  { from: /Administración de Members y Clients/g, to: 'Administración de Socios y Clientes' },
  { from: /Buscar member/g, to: 'Buscar socio' },
  { from: /Cargando members/g, to: 'Cargando socios' },
  { from: /No se encontraron members/g, to: 'No se encontraron socios' },
  { from: /Member \/ DNI/g, to: 'Socio / DNI' },
  { from: /Profile del Sistema/g, to: 'Perfil del Sistema' },
  { from: /Teacher del Staff FitApp/g, to: 'Profesor del Staff FitApp' },
  { from: /Member FitApp/g, to: 'Socio FitApp' },
  { from: /Mis Clases, Branches & Schedules/g, to: 'Mis Clases, Sedes y Horarios' },
  { from: /Quotas y Payments/g, to: 'Cuotas y Pagos' },
  { from: /Shifts y Reservations/g, to: 'Turnos y Reservas' },
  { from: /Cargando status de tus quotas/g, to: 'Cargando estado de tus cuotas' },
  { from: /No se pudieron obtener las quotas del user/g, to: 'No se pudieron obtener las cuotas del usuario' },
  { from: /Payment acreditado con éxito/g, to: 'Pago acreditado con éxito' },
  { from: /Receipt:/g, to: 'Comprobante:' },
  { from: /payment a través de Mercado Payment/g, to: 'pago a través de Mercado Pago' },
  { from: /Mercado Payment/g, to: 'Mercado Pago' },
  { from: /registrar payment/g, to: 'registrar pago' },
  { from: /procesar el payment/g, to: 'procesar el pago' },
  { from: /Modal Pasarela de Payment/g, to: 'Modal Pasarela de Pago' },
  { from: /Historial de Payments y Comprobantes/g, to: 'Historial de Pagos y Comprobantes' },
  { from: /Detalle de Receipt/g, to: 'Detalle de Comprobante' },
  { from: /Mostrar más quotas/g, to: 'Mostrar más cuotas' },
  { from: /Mostrar menos quotas/g, to: 'Mostrar menos cuotas' },
  { from: /Status de Quotas y Membresía/g, to: 'Estado de Cuotas y Membresía' },
  { from: /¡Sin quotas vencidas!/g, to: '¡Sin cuotas vencidas!' },
  { from: /members con mora o quotas impagas/g, to: 'socios con mora o cuotas impagas' },
  { from: /No se encontraron quotas/g, to: 'No se encontraron cuotas' },
  { from: /Período \/ Quota/g, to: 'Período / Cuota' },
  { from: /Gestión y Control de Quotas & Tarifas/g, to: 'Gestión y Control de Cuotas & Tarifas' },
  { from: /\/ quota mensual/g, to: '/ cuota mensual' },
  { from: /date de entrada/g, to: 'fecha de entrada' },
  { from: /todas las nuevas quotas emitidas/g, to: 'todas las nuevas cuotas emitidas' },
  { from: /Pagar Quota/g, to: 'Pagar Cuota' },
  { from: /Quotas Pendientes/g, to: 'Cuotas Pendientes' },
  { from: /Quotas Acreditadas/g, to: 'Cuotas Acreditadas' },
  { from: /Este apartado no está disponible para administradores ni teachers\. Solo los members activos poseen gestión de quotas\./g, to: 'Este apartado no está disponible para administradores ni profesores. Solo los socios activos poseen gestión de cuotas.' },
  { from: /Reservar Shift/g, to: 'Reservar Turno' },
  { from: /No se encontraron shifts/g, to: 'No se encontraron turnos' },
  { from: /Solo shifts del mismo/g, to: 'Solo turnos del mismo' },
  { from: /reservar shifts para el/g, to: 'reservar turnos para el' },
  { from: /Aún no tienes shifts reservados/g, to: 'Aún no tienes turnos reservados' },
  { from: /Cancelar Shift/g, to: 'Cancelar Turno' },
  { from: /cancelar tu shift/g, to: 'cancelar tu turno' },
  { from: /Teacher:/g, to: 'Profesor:' },
  { from: /Sin Teacher/g, to: 'Sin Profesor' },
  { from: /Estadísticas Rápidas del Teacher/g, to: 'Estadísticas Rápidas del Profesor' },
  { from: /Shift Habitual/g, to: 'Turno Habitual' },
  { from: /No tienes shifts/g, to: 'No tienes turnos' },
  { from: />STATUS</g, to: '>ESTADO<' },
  { from: /alumnos por shift/g, to: 'alumnos por turno' },
  { from: /`Quota /g, to: '`Cuota ' },
  { from: /Home de ciclo/g, to: 'Inicio de ciclo' },
  { from: /Members y Clients/g, to: 'Socios y Clientes' },
  { from: /member pueda/g, to: 'socio pueda' },
  { from: />Teacher</g, to: '>Profesor<' },
  { from: />Teachers</g, to: '>Profesores<' },
  { from: />User</g, to: '>Usuario<' },
  { from: />Users</g, to: '>Usuarios<' },
  { from: /mis quotas\.\.\./g, to: 'mis cuotas...' },
  { from: /tus quotas\.\.\./g, to: 'tus cuotas...' },
  { from: /las quotas/g, to: 'las cuotas' },
  { from: />Quotas Vencidas</g, to: '>Cuotas Vencidas<' },
  { from: />Quotas</g, to: '>Cuotas<' },
  { from: />Quota</g, to: '>Cuota<' },
  { from: />Payment</g, to: '>Pago<' },
  { from: />Payments</g, to: '>Pagos<' },
  { from: />Receipt</g, to: '>Comprobante<' },
  { from: />Receipts</g, to: '>Comprobantes<' },
  { from: />Members</g, to: '>Socios<' },
  { from: />Clients</g, to: '>Clientes<' },
  { from: />Shift</g, to: '>Turno<' },
  { from: />Shifts</g, to: '>Turnos<' },
  { from: /nómina de quotas/g, to: 'nómina de cuotas' }
];

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
}

const files = walkSync(rootDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  replacements.forEach(repl => {
    newContent = newContent.replace(repl.from, repl.to);
  });
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated', file.replace(rootDir, ''));
  }
});

console.log('Replacements completed.');
