import React from 'react';
import { Table, Spinner } from 'react-bootstrap';
import { formatMonto } from './helpers';
import { RenderEstadoPrecioAdmin } from './QuotasAdminBadges';

const PricesTable = ({
  prices = [],
  priceVigente,
  dateConsulta,
  cargandoPrecios
}) => {
  return (
    <>
      <h6 className="fw-bold mb-3 text-white">Cronograma e Historial de Tarifas</h6>
      {cargandoPrecios ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-secondary">Cargando cronograma tarifario...</p>
        </div>
      ) : prices.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <p className="mb-0">No se encontraron prices registrados en el sistema.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>Amount Programado</th>
                <th>Date de Vigencia (Desde)</th>
                <th>Descripción / Motivo</th>
                <th>Status de Aplicación</th>
                <th>Date Creación</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="fw-bold text-white fs-6">
                      ${formatMonto(p.amount)}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-dark border border-secondary text-primary font-monospace">
                      {p.start_date}
                    </span>
                  </td>
                  <td>
                    <div className="text-white small">
                      {p.description || 'Tarifa de membresía'}
                    </div>
                  </td>
                  <td>
                    <RenderEstadoPrecioAdmin
                      priceItem={p}
                      priceVigente={priceVigente}
                      dateConsulta={dateConsulta}
                    />
                  </td>
                  <td>
                    <small className="text-secondary">
                      {p.date_creacion ? p.date_creacion.substring(0, 10) : '-'}
                    </small>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </>
  );
};

export default PricesTable;
