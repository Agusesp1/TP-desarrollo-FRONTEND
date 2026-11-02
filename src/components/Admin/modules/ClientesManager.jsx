import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Row, Col, Table, Form, InputGroup, Spinner, Modal, Badge } from 'react-bootstrap';

const generarComprobanteNumero = (quotaId) => {
  return `REC-${quotaId}-${Math.floor(1000 + Math.random() * 9000)}`;
};

const ClientesManager = ({ onMostrarAlerta, onRecargarEstadisticas, apiBase }) => {
  const [users, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filterTexto, setFiltroTexto] = useState('');
  const [filterCategoria, setFiltroCategoria] = useState('todas');
  const [filterEstado, setFiltroEstado] = useState('todos');

  // Estados para el modal de detalle del socio y cuotas vencidas
  const [memberSeleccionado, setSocioSeleccionado] = useState(null);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [showModalCuotas, setShowModalCuotas] = useState(false);
  const [quotaEnCobro, setCuotaEnCobro] = useState(null);
  const [metodoCobro, setMetodoCobro] = useState('Efectivo en Caja');
  const [receiptCobro, setComprobanteCobro] = useState('');
  const [procesandoCobro, setProcesandoCobro] = useState(false);

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(`${apiBase}/admin/users`);
      const data = await res.json();
      if (res.ok && data.success) {
        setUsuarios(data.users || []);
        if (memberSeleccionado) {
          const memberActualizado = (data.users || []).find((u) => u.id === memberSeleccionado.id);
          if (memberActualizado) {
            setSocioSeleccionado(memberActualizado);
          }
        }
      }
    } catch (e) {
      console.error('Error al cargar socios:', e);
    } finally {
      setCargando(false);
    }
  }, [apiBase, memberSeleccionado]);

  useEffect(() => {
    let ignore = false;
    fetch(`${apiBase}/admin/users`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success) {
          setUsuarios(data.users || []);
        }
      })
      .catch((e) => console.error('Error al inicializar socios:', e))
      .finally(() => {
        if (!ignore) setCargando(false);
      });

    return () => {
      ignore = true;
    };
  }, [apiBase]);

  const handleToggleEstado = async (id) => {
    try {
      const res = await fetch(`${apiBase}/admin/users/${id}/toggle-status`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onMostrarAlerta(data.message);
        cargarUsuarios();
        onRecargarEstadisticas?.();
      } else {
        onMostrarAlerta(data.message || 'Error al cambiar el estado de la cuenta', 'danger');
      }
    } catch {
      onMostrarAlerta('Error de red al actualizar el estado del usuario', 'danger');
    }
  };

  const handleAbrirDetalleSocio = (member) => {
    setSocioSeleccionado(member);
    setShowModalDetalle(true);
  };

  const handleAbrirModalCuotas = (member) => {
    setSocioSeleccionado(member);
    setCuotaEnCobro(null);
    setShowModalCuotas(true);
  };

  const handleIniciarCobro = (quota) => {
    setCuotaEnCobro(quota);
    setMetodoCobro('Efectivo en Caja');
    setComprobanteCobro(generarComprobanteNumero(quota.id));
  };

  const handleConfirmarCobroCuota = async (e) => {
    e.preventDefault();
    if (!quotaEnCobro || !memberSeleccionado) return;

    setProcesandoCobro(true);
    try {
      const numComprobante = receiptCobro.trim() || generarComprobanteNumero(quotaEnCobro.id);
      const res = await fetch(`${apiBase}/quotas/${quotaEnCobro.id}/pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metodo_payment: metodoCobro,
          receipt: numComprobante,
          date_payment: new Date().toISOString()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onMostrarAlerta(
          `¡Cobro de la cuota ${quotaEnCobro.periodo} para ${memberSeleccionado.name} registrado con éxito! (Comprobante: ${numComprobante})`,
          'success'
        );
        setCuotaEnCobro(null);

        await cargarUsuarios();
        onRecargarEstadisticas?.();

        setSocioSeleccionado((prev) => {
          if (!prev) return null;
          const restantes = (prev.quotasVencidas || []).filter((c) => c.id !== quotaEnCobro.id);
          const tieneDemora = restantes.some((c) => c.status === 'en demora');
          const tieneImpago = restantes.some((c) => c.status === 'no pagado');
          return {
            ...prev,
            quotasVencidas: restantes,
            cantCuotasVencidas: restantes.length,
            alDia: restantes.length === 0,
            demorado: tieneDemora,
            statusCuota: restantes.length === 0 ? 'Al Día' : (tieneImpago ? 'Con Deuda' : 'Demorado'),
            status: restantes.length === 0 ? true : prev.status
          };
        });
      } else {
        onMostrarAlerta(data.message || 'Error al registrar cobro de la cuota', 'danger');
      }
    } catch (err) {
      console.error('Error al registrar cobro manual:', err);
      onMostrarAlerta('Error de conexión al registrar cobro', 'danger');
    } finally {
      setProcesandoCobro(false);
    }
  };

  const usersFiltrados = users.filter((u) => {
    if (u.role !== 'user') return false;
    const texto = `${u.name} ${u.lastname} ${u.email} ${u.dni || ''}`.toLowerCase();
    const coincideTexto = texto.includes(filterTexto.toLowerCase());
    const coincideCat =
      filterCategoria === 'todas' ||
      !filterCategoria ||
      u.category === filterCategoria;
    const coincideEstado =
      filterEstado === 'todos' ||
      (filterEstado === 'activos' && u.status === true) ||
      (filterEstado === 'inactivos' && u.status === false);
    return coincideTexto && coincideCat && coincideEstado;
  });

  const formatearFecha = (fecha, textoVacio = 'No registrada') => {
    if (!fecha) return textoVacio;
    if (typeof fecha === 'string') {
      const limpia = fecha.split('T')[0];
      if (limpia.includes('-')) {
        const [y, m, d] = limpia.split('-');
        if (y && m && d) return `${d}/${m}/${y}`;
      }
    }
    return fecha;
  };

  const renderVencimientoCuota = (u) => {
    if (u.role !== 'user') {
      return <span className="badge-token-subdued">- (N/A)</span>;
    }

    const estaAlDia = Boolean(u.alDia);

    return (
      <div className="d-flex flex-column align-items-start gap-1">
        <div className="fw-semibold text-white d-flex align-items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary opacity-75"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
          <span className="small">{formatearFecha(u.fechaVencimiento, 'Sin cuotas')}</span>
        </div>

        {estaAlDia ? (
          <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-0.5 rounded-pill small">
            Al día
          </span>
        ) : (
          <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 px-2 py-0.5 rounded-pill small">
            No está al día
          </span>
        )}

        {u.cantCuotasVencidas > 0 && (
          <Button
            size="sm"
            variant="outline-danger"
            className="rounded-pill px-2 py-0 fw-semibold mt-1 d-inline-flex align-items-center gap-1 text-nowrap"
            style={{ fontSize: '0.74rem' }}
            onClick={() => handleAbrirModalCuotas(u)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Ver Cuotas Vencidas ({u.cantCuotasVencidas})
          </Button>
        )}
      </div>
    );
  };

  const renderBadgeEstadoCuenta = (u) => {
    if (u.status) {
      return (
        <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-1 rounded-pill">
          Activo (Al día)
        </span>
      );
    }

    const textoInactivo = (u.cantCuotasVencidas > 0 || u.statusCuota === 'Con Deuda')
      ? 'Desactivado (Impago)'
      : 'Pausado';

    return (
      <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 px-2 py-1 rounded-pill">
        {textoInactivo}
      </span>
    );
  };

  return (
    <Card className="glass-card border-0 p-4 text-white">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-white">Administración de Socios y Clientes</h4>
          <p className="text-secondary small mb-0">
            Consulta los socios registrados, categorías de membresía, estado de sus cuentas y detalle individual.
          </p>
        </div>

        <Button
          className="btn-token-outline-primary rounded-pill px-3 py-2 fw-medium d-inline-flex align-items-center gap-2"
          onClick={cargarUsuarios}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
          </svg>
          Actualizar Lista
        </Button>
      </div>

      <Row className="g-3 mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar socio por nombre, correo electrónico o DNI..."
              value={filterTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />
            {filterTexto && (
              <Button variant="outline-secondary" onClick={() => setFiltroTexto('')}>
                Limpiar
              </Button>
            )}
          </InputGroup>
        </Col>

        <Col md={3}>
          <Form.Select
            value={filterCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="todas">Todas las Membresías</option>
            <option value="Premium">Premium</option>
            <option value="Medium">Medium</option>
            <option value="Inicial">Inicial</option>
          </Form.Select>
        </Col>

        <Col md={3}>
          <Form.Select
            value={filterEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos los Estados</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </Form.Select>
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-secondary">Cargando clientes...</p>
        </div>
      ) : usersFiltrados.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <p className="mb-0">No se encontraron clientes registrados con los filtros aplicados.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>Nombre / DNI</th>
                <th>Correo Electrónico</th>
                <th>Membresía</th>
                <th>Rol</th>
                <th>Vencimiento Cuota</th>
                <th>Estado Cuenta</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usersFiltrados.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div
                      className="fw-bold text-white"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleAbrirDetalleSocio(u)}
                      title="Ver ficha de detalle del socio"
                    >
                      {u.name} {u.lastname}
                    </div>
                    <small className="text-secondary">DNI: {u.dni || 'Sin DNI'}</small>
                  </td>
                  <td>
                    <div className="small text-white">{u.email}</div>
                  </td>
                  <td>
                    <span className={u.category === 'Premium' ? 'badge-token-brand' : 'badge-token-subdued'}>
                      {u.category || 'Estándar'}
                    </span>
                  </td>
                  <td>
                    <span className="badge-token-subdued">
                      {u.role === 'admin' ? 'Administrador' : (u.role === 'teacher' ? 'Profesor' : 'Socio')}
                    </span>
                  </td>
                  <td>
                    {renderVencimientoCuota(u)}
                  </td>
                  <td>
                    {renderBadgeEstadoCuenta(u)}
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2 justify-content-end align-items-center flex-wrap">
                      <Button
                        size="sm"
                        className="btn-token-outline-primary rounded-pill px-3 py-1 fw-medium"
                        onClick={() => handleAbrirDetalleSocio(u)}
                        title="Ver detalle completo del socio"
                      >
                        Ver Detalle
                      </Button>
                      {u.cantCuotasVencidas > 0 && (
                        <Button
                          size="sm"
                          className="btn-token-outline-danger rounded-pill px-3 py-1 fw-medium"
                          onClick={() => handleAbrirModalCuotas(u)}
                        >
                          Cobrar ({u.cantCuotasVencidas})
                        </Button>
                      )}
                      {u.role !== 'admin' && (
                        <Button
                          size="sm"
                          className="btn-token-outline-warning rounded-pill px-3 py-1"
                          onClick={() => handleToggleEstado(u.id)}
                        >
                          {u.status ? 'Pausar Acceso' : 'Reactivar Acceso'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* MODAL DETALLE COMPLETO DEL SOCIO / CLIENTE */}
      <Modal
        show={showModalDetalle}
        onHide={() => {
          setShowModalDetalle(false);
          setSocioSeleccionado(null);
        }}
        size="lg"
        centered
        contentClassName="glass-card border-0 text-white"
      >
        <Modal.Header closeButton closeVariant="white" className="border-secondary border-opacity-25 pb-2">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <div className="p-2 rounded-circle bg-primary bg-opacity-25 text-primary d-inline-flex">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <span className="fs-5">Detalle del Socio #{memberSeleccionado?.id}</span>
              <div className="small text-secondary fw-normal">
                Ficha integral de cliente y estado de membresía
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-3">
          {memberSeleccionado && (
            <>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25 h-100">
                    <div className="small text-secondary mb-1">Nombre Completo</div>
                    <div className="fw-bold fs-6 text-white">
                      {memberSeleccionado.name} {memberSeleccionado.lastname}
                    </div>
                    <div className="small text-secondary mt-2 mb-1">Documento (DNI)</div>
                    <div className="fw-semibold text-white">{memberSeleccionado.dni || 'No especificado'}</div>
                    <div className="small text-secondary mt-2 mb-1">Fecha de Nacimiento</div>
                    <div className="text-white">{formatearFecha(memberSeleccionado.birth_date)}</div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25 h-100">
                    <div className="small text-secondary mb-1">Correo Electrónico</div>
                    <div className="fw-semibold text-white">{memberSeleccionado.email}</div>
                    <div className="small text-secondary mt-2 mb-1">Categoría de Membresía</div>
                    <div>
                      <span className={memberSeleccionado.category === 'Premium' ? 'badge-token-brand' : 'badge-token-subdued'}>
                        {memberSeleccionado.category || 'Inicial'}
                      </span>
                    </div>
                    <div className="small text-secondary mt-2 mb-1">Fecha de Inscripción</div>
                    <div className="text-white">{formatearFecha(memberSeleccionado.enrollment_date)}</div>
                  </div>
                </Col>
              </Row>

              <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25 mb-3">
                <Row className="align-items-center g-3">
                  <Col sm={4}>
                    <div className="small text-secondary mb-1">Estado de Cuenta</div>
                    {renderBadgeEstadoCuenta(memberSeleccionado)}
                  </Col>
                  <Col sm={4}>
                    <div className="small text-secondary mb-1">Próximo Vencimiento</div>
                    <div className="fw-bold text-white">
                      {formatearFecha(memberSeleccionado.fechaVencimiento, 'Sin cuotas registradas')}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="small text-secondary mb-1">Situación de Cuotas</div>
                    <Badge bg={memberSeleccionado.alDia ? 'success' : 'danger'} className="px-3 py-1 rounded-pill">
                      {memberSeleccionado.alDia
                        ? 'Al Día'
                        : `${memberSeleccionado.cantCuotasVencidas} cuota(s) vencida(s)`}
                    </Badge>
                  </Col>
                </Row>
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="border-secondary border-opacity-25 pt-2 d-flex justify-content-between">
          <div>
            {memberSeleccionado?.cantCuotasVencidas > 0 && (
              <Button
                variant="danger"
                className="rounded-pill px-3 fw-semibold"
                onClick={() => {
                  const socio = memberSeleccionado;
                  setShowModalDetalle(false);
                  handleAbrirModalCuotas(socio);
                }}
              >
                Gestionar Cuotas Vencidas ({memberSeleccionado.cantCuotasVencidas})
              </Button>
            )}
          </div>
          <Button
            variant="outline-secondary"
            className="rounded-pill px-4"
            onClick={() => {
              setShowModalDetalle(false);
              setSocioSeleccionado(null);
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL DETALLE Y COBRO DE CUOTAS VENCIDAS */}
      <Modal
        show={showModalCuotas}
        onHide={() => {
          setShowModalCuotas(false);
          setSocioSeleccionado(null);
          setCuotaEnCobro(null);
        }}
        size="lg"
        centered
        contentClassName="glass-card border-0 text-white"
      >
        <Modal.Header closeButton closeVariant="white" className="border-secondary border-opacity-25 pb-2">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <div className="p-2 rounded-circle bg-danger bg-opacity-25 text-danger d-inline-flex">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <span className="fs-5">Cuotas Vencidas del Socio</span>
              <div className="small text-secondary fw-normal">
                {memberSeleccionado?.name} {memberSeleccionado?.lastname} • DNI: {memberSeleccionado?.dni || 'Sin DNI'} • {memberSeleccionado?.email}
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-3">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <p className="text-secondary small mb-0">
              Se detallan <strong>únicamente las cuotas vencidas</strong> (en demora o impagas) asociadas a este socio.
            </p>
            <Badge bg={memberSeleccionado?.cantCuotasVencidas > 0 ? 'danger' : 'success'} className="px-3 py-2 rounded-pill">
              {memberSeleccionado?.cantCuotasVencidas > 0
                ? `${memberSeleccionado.cantCuotasVencidas} cuota(s) vencida(s)`
                : 'Al Día'}
            </Badge>
          </div>

          {/* Formulario de cobro rápido para la cuota seleccionada */}
          {quotaEnCobro && (
            <Card className="bg-dark border border-primary p-3 mb-3 rounded-3 shadow">
              <h6 className="fw-bold text-primary mb-2 d-flex align-items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Registrar Cobro: {quotaEnCobro.concepto || `Cuota ${quotaEnCobro.periodo}`} - ${Number(quotaEnCobro.amount || 0).toLocaleString('es-AR')}
              </h6>

              <Form onSubmit={handleConfirmarCobroCuota}>
                <Row className="g-2">
                  <Col md={5}>
                    <Form.Group>
                      <Form.Label className="small text-secondary mb-1">Método de Cobro</Form.Label>
                      <Form.Select
                        size="sm"
                        value={metodoCobro}
                        onChange={(e) => setMetodoCobro(e.target.value)}
                      >
                        <option value="Efectivo en Caja">Efectivo en Caja</option>
                        <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                        <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                        <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small text-secondary mb-1">N° Comprobante / Recibo</Form.Label>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={receiptCobro}
                        onChange={(e) => setComprobanteCobro(e.target.value)}
                        placeholder="REC-XXXX"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3} className="d-flex align-items-end gap-1">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={procesandoCobro}
                      className="hero-btn rounded-pill px-3 py-1 fw-bold w-100"
                    >
                      {procesandoCobro ? <Spinner animation="border" size="sm" /> : 'Confirmar'}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setCuotaEnCobro(null)}
                      className="rounded-pill px-2 py-1"
                    >
                      Cancelar
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card>
          )}

          {/* Listado de cuotas vencidas */}
          {!memberSeleccionado?.quotasVencidas || memberSeleccionado.quotasVencidas.length === 0 ? (
            <div className="text-center py-4 text-secondary">
              <div className="p-3 rounded-circle bg-success bg-opacity-25 text-success d-inline-flex mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h6 className="text-success fw-bold">¡El cliente se encuentra completamente al día!</h6>
              <p className="small mb-0 text-light opacity-75">
                No existen cuotas vencidas pendientes de pago para este usuario.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="admin-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Período / Concepto</th>
                    <th>Monto</th>
                    <th>Vencimiento</th>
                    <th>Límite Gracia</th>
                    <th>Estado Mora</th>
                    <th className="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {memberSeleccionado.quotasVencidas.map((quota) => (
                    <tr key={quota.id}>
                      <td>
                        <div className="fw-bold text-white">
                          {quota.concepto || `Cuota #${quota.numero_quota || ''} - ${quota.periodo}`}
                        </div>
                        <small className="text-secondary">Emisión: {quota.date_emision || 'Ciclo mensual'}</small>
                      </td>
                      <td>
                        <span className="fw-bold text-white">
                          ${Number(quota.amount || 0).toLocaleString('es-AR')}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {quota.dateVenc || quota.date_vencimiento}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-dark border border-secondary text-light">
                          {quota.dateLimite || quota.date_limite_payment || '-'}
                        </span>
                      </td>
                      <td>
                        {quota.status === 'en demora' ? (
                          <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50 px-2 py-1 rounded-pill">
                            Demorado (+5d gracia)
                          </span>
                        ) : (
                          <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 px-2 py-1 rounded-pill">
                            No Pagado / Vencido
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        <Button
                          size="sm"
                          className="btn-token-outline-primary rounded-pill px-3 py-1 fw-medium"
                          onClick={() => handleIniciarCobro(quota)}
                        >
                          Cobrar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-secondary border-opacity-25 pt-2">
          <Button
            variant="outline-secondary"
            className="rounded-pill px-4"
            onClick={() => {
              setShowModalCuotas(false);
              setSocioSeleccionado(null);
              setCuotaEnCobro(null);
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default ClientesManager;
