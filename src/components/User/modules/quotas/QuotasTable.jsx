import React from 'react';
import { Table, Button } from 'react-bootstrap';
import QuotasBadge from './QuotasBadge';
import { formatMonto } from './helpers';

const QuotasTable = ({ quotas = [], onAbrirPago }) => {
  return (
    <div className="table-responsive">
      <Table hover variant="dark" className="align-middle admin-table mb-0">
        <thead>
          <tr>
            <th>Concepto / Período</th>
            <th>Amount</th>
            <th>Vencimiento</th>
            <th>Límite de Gracia</th>
            <th>Status</th>
            <th className="text-end">Acción</th>
          </tr>
        </thead>
        <tbody>
          {quotas.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-5">
                <div className="d-inline-flex flex-column align-items-center">
                  <div className="p-3 rounded-circle bg-success bg-opacity-25 text-success mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h5 className="fw-bold text-success mb-1">¡Felicitaciones! Te encuentras al día</h5>
                  <p className="text-light opacity-75 small mb-0">
                    No posees quotas pendientes de payment en este momento.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            quotas.map((quota) => (
              <tr key={quota.id}>
                <td>
                  <div className="fw-bold text-white">
                    {quota.concepto || `Quota #${quota.numero_quota} - ${quota.periodo}`}
                  </div>
                  <small className="text-light opacity-75">
                    Membresía Activa FitApp • Emisión: {quota.date_emision || 'Home de ciclo'}
                  </small>
                </td>
                <td>
                  <span className="fw-bold text-white fs-6">
                    ${formatMonto(quota.amount)}
                  </span>
                </td>
                <td>
                  <span className="badge bg-secondary">
                    {quota.dateVenc || quota.date_vencimiento}
                  </span>
                </td>
                <td>
                  <span className="badge bg-dark border border-secondary text-light">
                    {quota.dateLimite || quota.date_limite_payment}
                  </span>
                </td>
                <td>
                  <QuotasBadge quota={quota} />
                </td>
                <td className="text-end">
                  <Button
                    variant="primary"
                    size="sm"
                    className="hero-btn rounded-pill px-3 py-1 fw-bold d-inline-flex align-items-center gap-2"
                    onClick={() => onAbrirPago(quota)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" y1="10" />
                    </svg>
                    Pagar Quota
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default QuotasTable;
