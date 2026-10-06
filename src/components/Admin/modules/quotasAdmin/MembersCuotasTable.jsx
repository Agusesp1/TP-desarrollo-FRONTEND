import { Table, Button, Spinner } from 'react-bootstrap';
import { formatMonto } from './helpers';
import { RenderBadgeEstadoAdmin } from './QuotasAdminBadges';

const MembersCuotasTable = ({
  cargandoCuotas,
  quotasFiltradas = [],
  filterEstado = 'todos',
  onVerTodas,
  onAbrirCobroManual,
  onVerComprobante
}) => {
  if (cargandoCuotas) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-secondary">Cargando nómina de quotas...</p>
      </div>
    );
  }

  if (quotasFiltradas.length === 0) {
    if (filterEstado === 'vencidas') {
      return (
        <div className="text-center py-5 text-secondary">
          <div className="p-3 rounded-circle bg-success bg-opacity-25 text-success d-inline-flex mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h5 className="text-success fw-bold">¡Sin quotas vencidas!</h5>
          <p className="mb-3 text-light opacity-75 small">No se registran members con mora o quotas impagas en este momento.</p>
          {onVerTodas && (
            <Button variant="outline-primary" size="sm" className="rounded-pill px-3" onClick={onVerTodas}>
              Ver todas las quotas
            </Button>
          )}
        </div>
      );
    }
    return (
      <div className="text-center py-5 text-secondary">
        <p className="mb-0">No se encontraron quotas que coincidan con la búsqueda o filter.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table className="admin-table align-middle mb-0">
        <thead>
          <tr>
            <th>Member / Membresía</th>
            <th>Período / Quota</th>
            <th>Amount</th>
            <th>Vencimiento (1 month)</th>
            <th>Límite Payment (+5d)</th>
            <th>Status</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {quotasFiltradas.map((c) => (
            <tr key={c.id}>
              <td>
                <div className="fw-bold text-white">
                  {c.user ? `${c.user.name} ${c.user.lastname}` : 'Member Desconocido'}
                </div>
                <div className="small text-secondary d-flex align-items-center gap-2">
                  <span>DNI: {c.user?.dni || 'Sin DNI'}</span>
                  <span>•</span>
                  <span className={c.user?.category === 'Premium' ? 'badge-token-brand' : 'badge-token-subdued'}>
                    {c.user?.category || 'Estándar'}
                  </span>
                </div>
              </td>
              <td>
                <div className="fw-medium text-white">
                  {c.concepto || `Quota #${c.numero_quota} - ${c.periodo}`}
                </div>
                <small className="text-secondary">Emisión: {c.date_emision || 'Ciclo mensual'}</small>
              </td>
              <td>
                <span className="fw-bold text-white fs-6">
                  ${formatMonto(c.amount)}
                </span>
              </td>
              <td>
                <span className="badge bg-secondary">
                  {c.dateVenc || c.date_vencimiento}
                </span>
              </td>
              <td>
                <span className="badge bg-dark border border-secondary text-light">
                  {c.dateLimite || c.date_limite_payment}
                </span>
              </td>
              <td>
                <RenderBadgeEstadoAdmin
                  status={c.status}
                  dateLimite={c.dateLimite || c.date_limite_payment}
                />
              </td>
              <td className="text-end">
                {c.status !== 'pagado' ? (
                  <Button
                    size="sm"
                    className="btn-token-outline-primary rounded-pill px-3 py-1 fw-medium d-inline-flex align-items-center gap-1"
                    onClick={() => onAbrirCobroManual(c)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    Registrar Cobro
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="btn-token-outline-warning rounded-pill px-3 py-1 fw-medium d-inline-flex align-items-center gap-1"
                    onClick={() => onVerComprobante(c)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Ver Receipt
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default MembersCuotasTable;
