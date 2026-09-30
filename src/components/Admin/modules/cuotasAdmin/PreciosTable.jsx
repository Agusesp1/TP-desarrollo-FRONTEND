import React from 'react';
import { Table, Spinner } from 'react-bootstrap';
import { formatMonto } from './helpers';
import { RenderEstadoPrecioAdmin } from './CuotasAdminBadges';

const PreciosTable = ({
  precios = [],
  precioVigente,
  fechaConsulta,
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
      ) : precios.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <p className="mb-0">No se encontraron precios registrados en el sistema.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>Monto Programado</th>
                <th>Fecha de Vigencia (Desde)</th>
                <th>Descripción / Motivo</th>
                <th>Estado de Aplicación</th>
                <th>Fecha Creación</th>
              </tr>
            </thead>
            <tbody>
              {precios.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="fw-bold text-white fs-6">
                      ${formatMonto(p.monto)}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-dark border border-secondary text-primary font-monospace">
                      {p.fecha_desde}
                    </span>
                  </td>
                  <td>
                    <div className="text-white small">
                      {p.descripcion || 'Tarifa de membresía'}
                    </div>
                  </td>
                  <td>
                    <RenderEstadoPrecioAdmin
                      precioItem={p}
                      precioVigente={precioVigente}
                      fechaConsulta={fechaConsulta}
                    />
                  </td>
                  <td>
                    <small className="text-secondary">
                      {p.fecha_creacion ? p.fecha_creacion.substring(0, 10) : '-'}
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

export default PreciosTable;
