import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Table, Form, InputGroup, Spinner } from 'react-bootstrap';

const ClientesManager = ({ onMostrarAlerta, apiBase }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${apiBase}/admin/usuarios`);
      const data = await res.json();
      if (res.ok && data.exito) {
        setUsuarios(data.usuarios || []);
      }
    } catch (err) {
      console.error('Error al cargar socios:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleToggleEstado = async (id) => {
    try {
      const res = await fetch(`${apiBase}/admin/usuarios/${id}/toggle-estado`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (res.ok && data.exito) {
        onMostrarAlerta(data.mensaje);
        cargarUsuarios();
      } else {
        onMostrarAlerta(data.mensaje || 'Error al cambiar estado', 'danger');
      }
    } catch (err) {
      onMostrarAlerta('Error de red al actualizar estado del usuario', 'danger');
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = `${u.nombre} ${u.apellido} ${u.email} ${u.dni || ''}`.toLowerCase();
    const coincideTexto = texto.includes(filtroTexto.toLowerCase());
    const coincideCat =
      filtroCategoria === 'todas' ||
      !filtroCategoria ||
      u.categoria === filtroCategoria;
    return coincideTexto && coincideCat;
  });

  return (
    <Card className="glass-card border-0 p-4 text-white">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-white">Administración de Socios y Clientes</h4>
          <p className="text-secondary small mb-0">
            Consulta los usuarios registrados, categorías de membresía y estado de sus cuentas.
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
        <Col md={8}>
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
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />
            {filtroTexto && (
              <Button variant="outline-secondary" onClick={() => setFiltroTexto('')}>
                Limpiar
              </Button>
            )}
          </InputGroup>
        </Col>

        <Col md={4}>
          <Form.Select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="todas">Todas las Membresías</option>
            <option value="Premium">Premium</option>
            <option value="Estándar">Estándar</option>
            <option value="Básico">Básico</option>
          </Form.Select>
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-secondary">Cargando socios...</p>
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <p className="mb-0">No se encontraron socios registrados.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>Socio / DNI</th>
                <th>Correo Electrónico</th>
                <th>Membresía</th>
                <th>Rol</th>
                <th>Estado Cuenta</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="fw-bold text-white">{u.nombre} {u.apellido}</div>
                    <small className="text-secondary">DNI: {u.dni || 'Sin DNI'}</small>
                  </td>
                  <td>
                    <div className="small text-white">{u.email}</div>
                  </td>
                  <td>
                    <span className={u.categoria === 'Premium' ? 'badge-token-brand' : 'badge-token-subdued'}>
                      {u.categoria || 'Estándar'}
                    </span>
                  </td>
                  <td>
                    <span className="badge-token-subdued">
                      {u.rol === 'admin' ? 'Administrador' : 'Socio'}
                    </span>
                  </td>
                  <td>
                    <span className={u.estado ? 'badge-status-active' : 'badge-status-inactive'}>
                      {u.estado ? 'Activa' : 'Pausada'}
                    </span>
                  </td>
                  <td className="text-end">
                    {u.rol !== 'admin' && (
                      <Button
                        size="sm"
                        className="btn-token-outline-warning rounded-pill px-3 py-1"
                        onClick={() => handleToggleEstado(u.id)}
                      >
                        {u.estado ? 'Pausar Acceso' : 'Reactivar Acceso'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Card>
  );
};

export default ClientesManager;
