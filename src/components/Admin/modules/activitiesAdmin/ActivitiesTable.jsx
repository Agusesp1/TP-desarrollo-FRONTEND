import React from 'react';
import { Table, Button, Pagination } from 'react-bootstrap';
import { obtenerResumenHorarios } from './activitiesHelpers';

const ActivitiesTable = ({
  activitiesPaginadas,
  activitiesFiltradas,
  branches = [],
  teachers = [],
  handleToggleEstado,
  handleAbrirModal,
  onPedirEliminar,
  totalPaginas,
  paginaActual,
  setPaginaActual,
  homeIndex,
  elementosPorPagina
}) => {
  return (
    <>
      <div className="table-responsive">
        <Table className="admin-table align-middle mb-0">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Días y Schedules</th>
              <th>Branch Asignada</th>
              <th>Teacher a Cargo</th>
              <th>Duración</th>
              <th>Capacity Máximo</th>
              <th>Shifts Creados</th>
              <th>Status</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {activitiesPaginadas.map((act) => {
              const branchObj = act.branch || (branches && branches.find(s => s.id?.toString() === act.branch_id?.toString()));
              const profObj = act.teacher || (teachers && teachers.find(p => p.id?.toString() === act.teacher_id?.toString()));
              const resumen = obtenerResumenHorarios(act);

              return (
                <tr key={act.id}>
                  <td>
                    <div className="fw-bold text-white fs-6">{act.name}</div>
                  </td>
                  <td>
                    {resumen.amountShifts > 0 ? (
                      <div>
                        <span className={`badge-token-accent d-inline-flex align-items-center gap-1 mb-1 ${resumen.esGrupal ? 'bg-primary bg-opacity-25 border-primary text-info' : ''}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {resumen.horariosTexto}
                        </span>
                        <div className="small text-white-50">{resumen.diasTexto}</div>
                      </div>
                    ) : (
                      <span className="badge bg-secondary text-white-50 px-2 py-1">Sin schedule</span>
                    )}
                  </td>
                  <td>
                    {branchObj ? (
                      <span className="badge bg-dark border border-secondary text-info px-2 py-1 d-inline-flex align-items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {branchObj.name}
                      </span>
                    ) : (
                      <span className="badge bg-secondary text-white-50 px-2 py-1">Sin branch</span>
                    )}
                  </td>
                  <td>
                    {profObj ? (
                      <span className="badge bg-dark border border-secondary text-light px-2 py-1 d-inline-flex align-items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        {profObj.name} {profObj.lastname}
                      </span>
                    ) : (
                      <span className="badge bg-secondary text-white-50 px-2 py-1">Sin teacher</span>
                    )}
                  </td>
                  <td>
                    <span className="badge-token-subdued">{act.duration} min</span>
                  </td>
                  <td>
                    <span className="fw-bold text-white">{act.capacity} alumnos</span>
                  </td>
                  <td>
                    <span className="badge-token-accent">
                      {act.shifts?.length || 0} shifts
                    </span>
                  </td>
                  <td>
                    <span className={act.status ? 'badge-status-active' : 'badge-status-inactive'}>
                      {act.status ? 'Activa' : 'Pausada'}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <Button
                        size="sm"
                        className="btn-token-outline-warning rounded-pill px-3 py-1"
                        onClick={() => handleToggleEstado(act.id)}
                        title={act.status ? 'Pausar activity' : 'Activar activity'}
                      >
                        {act.status ? 'Pausar' : 'Activar'}
                      </Button>
                      <Button
                        size="sm"
                        className="btn-token-outline-primary rounded-pill px-3 py-1"
                        onClick={() => handleAbrirModal(act)}
                        title="Editar activity"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        className="btn-token-outline-danger rounded-pill px-3 py-1"
                        onClick={() => onPedirEliminar({
                          type: 'activity',
                          id: act.id,
                          name: act.name
                        })}
                        title="Eliminar permanentemente"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 pt-3 border-top border-secondary border-opacity-25">
          <div className="small text-secondary mb-2 mb-md-0">
            Mostrando <span className="text-white fw-bold">{homeIndex + 1}</span> a{' '}
            <span className="text-white fw-bold">
              {Math.min(homeIndex + elementosPorPagina, activitiesFiltradas.length)}
            </span>{' '}
            de <span className="text-white fw-bold">{activitiesFiltradas.length}</span> activities
          </div>
          <Pagination className="mb-0 custom-admin-pagination">
            <Pagination.Prev
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
            />
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
              <Pagination.Item
                key={num}
                active={num === paginaActual}
                onClick={() => setPaginaActual(num)}
              >
                {num}
              </Pagination.Item>
            ))}
            <Pagination.Next
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
            />
          </Pagination>
        </div>
      )}
    </>
  );
};

export default ActivitiesTable;
