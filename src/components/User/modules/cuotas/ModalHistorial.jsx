import React from 'react';
import { Modal, Table, Button } from 'react-bootstrap';
import { formatMonto } from './helpers';

const ModalHistorial = ({ show, onHide, historial = [], onVerComprobante }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      contentClassName="glass-card text-white border-secondary"
    >
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title className="fw-bold d-flex align-items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Historial de Pagos y Comprobantes Oficiales
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {historial.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            <p className="mb-0">Aún no registras pagos o recibos emitidos en el sistema.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover variant="dark" className="align-middle mb-0">
              <thead>
                <tr>
                  <th>N° Comprobante</th>
                  <th>Concepto</th>
                  <th>Fecha de Pago</th>
                  <th>Medio de Pago</th>
                  <th>Monto</th>
                  <th className="text-end">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((item) => (
                  <tr key={item.id || item.comprobante}>
                    <td>
                      <span className="badge bg-dark border border-secondary text-primary font-monospace">
                        {item.comprobante || `REC-${item.id}`}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold text-white">
                        {item.concepto || `Cuota #${item.numero_cuota} - ${item.periodo}`}
                      </div>
                    </td>
                    <td>
                      <span className="small text-light">
                        {item.fechaPago || item.fecha_pago?.substring(0, 10) || '-'}
                      </span>
                    </td>
                    <td>
                      {item.metodo === 'Mercado Pago' || item.metodo_pago === 'Mercado Pago' ? (
                        <span className="badge" style={{ backgroundColor: '#009EE3', color: '#fff' }}>
                          Mercado Pago
                        </span>
                      ) : (
                        <small className="text-light opacity-75">
                          {item.metodo || item.metodo_pago || 'Pago Registrado'}
                        </small>
                      )}
                    </td>
                    <td className="fw-bold text-success">
                      ${formatMonto(item.monto)}
                    </td>
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="rounded-pill px-3 py-1"
                        onClick={() => onVerComprobante(item)}
                      >
                        Ver Recibo
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-secondary">
        <Button
          variant="outline-light"
          onClick={onHide}
          className="rounded-pill px-4"
        >
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalHistorial;
