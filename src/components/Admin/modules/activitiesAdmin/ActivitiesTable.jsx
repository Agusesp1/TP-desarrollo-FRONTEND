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
  const renderPagination = () => {
    if (totalPaginas <= 1) return null;

    const items = [];
    const maxButtons = 5;
    const hayPrev = paginaActual > 1;
    const hayNext = paginaActual < totalPaginas;

    let startPage = Math.max(1, paginaActual - 2);
    let endPage = Math.min(totalPaginas, paginaActual + 2);

    if (paginaActual <= 3) {
      endPage = Math.min(totalPaginas, maxButtons);
    } else if (paginaActual >= totalPaginas - 2) {
      startPage = Math.max(1, totalPaginas - maxButtons + 1);
    }

    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} active={paginaActual === 1} onClick={() => setPaginaActual(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
      }
    }

    for (let p = startPage; p <= endPage; p++) {
      items.push(
        <Pagination.Item
          key={p}
          active={p === paginaActual}
          onClick={() => setPaginaActual(p)}
        >
          {p}
        </Pagination.Item>
      );
    }

    if (endPage < totalPaginas) {
      if (endPage < totalPaginas - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
      }
      items.push(
        <Pagination.Item
          key={totalPaginas}
          active={paginaActual === totalPaginas}
          onClick={() => setPaginaActual(totalPaginas)}
        >
          {totalPaginas}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="mb-0 custom-admin-pagination">
        <Pagination.First
          disabled={!hayPrev}
          onClick={() => setPaginaActual(1)}
          title="Primera página"
        />
        <Pagination.Prev
          disabled={!hayPrev}
          onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
          title="Página anterior"
        />
        {items}
        <Pagination.Next
          disabled={!hayNext}
          onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
          title="Página siguiente"
        />
        <Pagination.Last
          disabled={!hayNext}
          onClick={() => setPaginaActual(totalPaginas)}
          title="Última página"
        />
      </Pagination>
    );
  };

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
            {activitiesPaginadas.map((act) => {
              const branchObj = act.branch || (branches && branches.find(s => s.id?.toString() === act.branch_id?.toString()));
              const profObj = act.teacher || (teachers && teachers.find(p => p.id?.toString() === act.teacher_id?.toString()));
              const resumen = obtenerResumenHorarios(act);

              return (
                <tr key={act.id}>
                  <td>
                    <div className="fw-bold text-white">{act.name}</div>
                    {act.description && (
                      <small className="text-secondary d-block text-truncate" style={{ maxWidth: '200px' }}>
                        {act.description}
                      </small>
                    )}
                  </td>
                  <td>
                    {resumen && resumen.amountShifts > 0 ? (
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
                    {branchObj ? (
                      <span className="small text-white">{branchObj.name}</span>
                    ) : (
                      <span className="text-secondary small">General (Todas)</span>
                    )}
                  </td>
                  <td>
                    {profObj ? (
                      <span className="fw-medium text-white small">
                        {profObj.name} {profObj.lastname}
                      </span>
                    ) : (
                      <span className="text-secondary small">Sin profesor</span>
                    )}
                  </td>
                  <td>
                    <span className="small text-white">{act.duration} min</span>
                  </td>
                  <td>
                    <span className="small text-white">{act.capacity} pers.</span>
                  </td>
                  <td>
                    <span className="badge-token-brand">
                      {act.shifts ? act.shifts.length : 0} turnos
                    </span>
                  </td>
                  <td>
                    <span className={act.status ? 'badge-status-active' : 'badge-status-inactive'}>
                      {act.status ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <Button
                        size="sm"
                        className="btn-token-outline-warning rounded-pill px-3 py-1"
                        onClick={() => handleToggleEstado(act.id)}
                        title={act.status ? 'Desactivar actividad' : 'Activar actividad'}
                      >
                        {act.status ? 'Desactivar' : 'Activar'}
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
                          type: 'activity',
                          id: act.id,
                          name: act.name
                        })}
                        title="Eliminar actividad"
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
            de <span className="text-white fw-bold">{activitiesFiltradas.length}</span> actividades
          </div>
          {renderPagination()}
        </div>
      )}
    </>
  );
};

export default ActivitiesTable;
