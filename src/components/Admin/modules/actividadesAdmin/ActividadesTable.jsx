import React from 'react';
import { Table, Button, Pagination } from 'react-bootstrap';
import { obtenerResumenHorarios } from './actividadesHelpers';

const ActividadesTable = ({
  actividadesPaginadas,
  actividadesFiltradas,
  sedes = [],
  profesores = [],
  handleToggleEstado,
  handleAbrirModal,
  onPedirEliminar,
  totalPaginas,
  paginaActual,
  setPaginaActual,
  inicioIndex,
  elementosPorPagina
}) => {
  return (
    <>
      <div className="table-responsive">
        <Table className="admin-table align-middle mb-0">
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Días y Horarios</th>
              <th>Sede Asignada</th>
              <th>Profesor a Cargo</th>
              <th>Duración</th>
              <th>Cupo Máximo</th>
              <th>Turnos Creados</th>
              <th>Estado</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {actividadesPaginadas.map((act) => {
              const sedeObj = act.sede || (sedes && sedes.find(s => s.id?.toString() === act.sede_id?.toString()));
              const profObj = act.profesor || (profesores && profesores.find(p => p.id?.toString() === act.profesor_id?.toString()));
              const resumen = obtenerResumenHorarios(act);

              return (
                <tr key={act.id}>
                  <td>
                    <div className="fw-bold text-white fs-6">{act.nombre}</div>
                  </td>
                  <td>
                    {resumen.cantidadTurnos > 0 ? (
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
                      <span className="badge bg-secondary text-white-50 px-2 py-1">Sin horario</span>
                    )}
                  </td>
                  <td>
                    {sedeObj ? (
                      <span className="badge bg-dark border border-secondary text-info px-2 py-1 d-inline-flex align-items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {sedeObj.nombre}
                      </span>
                    ) : (
                      <span className="badge bg-secondary text-white-50 px-2 py-1">Sin sede</span>
                    )}
                  </td>
                  <td>
                    {profObj ? (
                      <span className="badge bg-dark border border-secondary text-light px-2 py-1 d-inline-flex align-items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        {profObj.nombre} {profObj.apellido}
                      </span>
                    ) : (
                      <span className="badge bg-secondary text-white-50 px-2 py-1">Sin profesor</span>
                    )}
                  </td>
                  <td>
                    <span className="badge-token-subdued">{act.duracion} min</span>
                  </td>
                  <td>
                    <span className="fw-bold text-white">{act.cupo} alumnos</span>
                  </td>
                  <td>
                    <span className="badge-token-accent">
                      {act.turnos?.length || 0} turnos
                    </span>
                  </td>
                  <td>
                    <span className={act.estado ? 'badge-status-active' : 'badge-status-inactive'}>
                      {act.estado ? 'Activa' : 'Pausada'}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <Button
                        size="sm"
                        className="btn-token-outline-warning rounded-pill px-3 py-1"
                        onClick={() => handleToggleEstado(act.id)}
                        title={act.estado ? 'Pausar actividad' : 'Activar actividad'}
                      >
                        {act.estado ? 'Pausar' : 'Activar'}
                      </Button>
                      <Button
                        size="sm"
                        className="btn-token-outline-primary rounded-pill px-3 py-1"
                        onClick={() => handleAbrirModal(act)}
                        title="Editar actividad"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        className="btn-token-outline-danger rounded-pill px-3 py-1"
                        onClick={() => onPedirEliminar({
                          type: 'actividad',
                          id: act.id,
                          nombre: act.nombre
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
            Mostrando <span className="text-white fw-bold">{inicioIndex + 1}</span> a{' '}
            <span className="text-white fw-bold">
              {Math.min(inicioIndex + elementosPorPagina, actividadesFiltradas.length)}
            </span>{' '}
            de <span className="text-white fw-bold">{actividadesFiltradas.length}</span> actividades
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

export default ActividadesTable;
