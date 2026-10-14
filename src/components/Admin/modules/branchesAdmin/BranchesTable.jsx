import React from 'react';
import { Table, Button, Spinner } from 'react-bootstrap';

const BranchesTable = ({
  cargando,
  branches = [],
  onToggleEstado,
  onEditar,
  onEliminar
}) => {
  if (cargando) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-secondary">Cargando sedes...</p>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="text-center py-5 text-secondary">
        <p className="mb-0">No se encontraron sedes.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table className="admin-table align-middle mb-0">
        <thead>
          <tr>
            <th>Nombre / Ciudad</th>
            <th>Ubicación</th>
            <th>Contacto</th>
            <th>Horarios de Atención</th>
            <th>Capacidad</th>
            <th>Estado</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr key={branch.id}>
              <td>
                <div className="fw-bold text-white">{branch.name}</div>
                <small className="text-secondary fw-medium">{branch.city}</small>
              </td>
              <td>
                <div className="small text-white">{branch.address}</div>
              </td>
              <td>
                <div className="small text-white">{branch.email || '-'}</div>
                <small className="text-secondary">{branch.phone || '-'}</small>
              </td>
              <td>
                <span
                  className="badge-token-subdued"
                  style={{ whiteSpace: 'normal', maxWidth: '320px', display: 'inline-block' }}
                >
                  {branch.opening_hours}
                </span>
              </td>
              <td>
                <span className="fw-bold text-white">{branch.capacity} personas</span>
              </td>
              <td>
                <span className={branch.status ? 'badge-status-active' : 'badge-status-inactive'}>
                  {branch.status ? 'Operativa' : 'Pausada'}
                </span>
              </td>
              <td className="text-end">
                <div className="d-inline-flex gap-2">
                  <Button
                    size="sm"
                    className="btn-token-outline-warning rounded-pill px-3 py-1"
                    onClick={() => onToggleEstado(branch.id)}
                    title={branch.status ? 'Pausar branch' : 'Habilitar branch'}
                  >
                    {branch.status ? 'Pausar' : 'Habilitar'}
                  </Button>
                  <Button
                    size="sm"
                    className="btn-token-outline-primary rounded-pill px-3 py-1"
                    onClick={() => onEditar(branch)}
                    title="Editar branch"
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    className="btn-token-outline-danger rounded-pill px-3 py-1"
                    onClick={() => onEliminar({
                      type: 'branch',
                      id: branch.id,
                      name: branch.name
                    })}
                    title="Eliminar permanentemente"
                  >
                    Eliminar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default BranchesTable;
