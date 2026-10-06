import React, { useState, useMemo } from 'react';
import { Card, Table, Form, Row, Col, Badge } from 'react-bootstrap';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Schedules de 07:00 a 21:00
const horas = [];
for (let h = 7; h <= 21; h++) {
  const horaStr = h.toString().padStart(2, '0') + ':00';
  horas.push(horaStr);
}

const parseHoraStr = (horaStr) => {
  if (!horaStr) return 0;
  const [h, m] = horaStr.split(':').map(Number);
  return h + m / 60;
};

const CalendarAdmin = ({ shifts, branches }) => {
  const [filterSede, setFiltroSede] = useState('');

  const shiftsFiltrados = useMemo(() => {
    if (!filterSede) return shifts;
    return shifts.filter(t => t.branch_id && t.branch_id.toString() === filterSede.toString());
  }, [shifts, filterSede]);

  // Helper para agrupar shifts por día
  const shiftsPorDia = useMemo(() => {
    const map = {};
    diasSemana.forEach(d => map[d] = []);
    
    shiftsFiltrados.forEach(shift => {
      // Manejar 'Lunes a Viernes' o días específicos.
      // Si el shift tiene 'dayOfWeek' como "Lunes, Miércoles", lo separamos.
      // Por simplicidad si tiene "Lunes a Viernes", lo ponemos en todos esos.
      let diasAsignados = [];
      const ds = shift.dayOfWeek.toLowerCase();
      
      if (ds.includes('lunes a viernes')) {
        diasAsignados = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
      } else if (ds.includes('lunes a sábado') || ds.includes('lunes a sabado')) {
        diasAsignados = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      } else {
        diasSemana.forEach(d => {
          if (ds.includes(d.toLowerCase())) {
            diasAsignados.push(d);
          }
        });
        if (diasAsignados.length === 0) {
          // Fallback a Lunes
          diasAsignados.push('Lunes');
        }
      }

      diasAsignados.forEach(d => {
        map[d].push(shift);
      });
    });
    return map;
  }, [shiftsFiltrados]);

  // Renderizar celda
  const renderCell = (day, horaInicio, horaFinNumerica) => {
    const shiftsEnCelda = shiftsPorDia[day].filter(t => {
      const homeT = parseHoraStr(t.startTime);
      return homeT >= horaInicio && homeT < horaFinNumerica;
    });

    if (shiftsEnCelda.length === 0) return null;

    return (
      <div className="d-flex flex-column gap-1">
        {shiftsEnCelda.map(t => (
          <div key={t.id} className="p-1 mb-1 rounded text-white small shadow-sm" style={{ backgroundColor: 'var(--primary-color)', fontSize: '0.75rem', lineHeight: '1.2' }}>
            <strong>{t.activity?.name || 'Clase'}</strong><br/>
            {t.startTime} - {t.endTime}<br/>
            <span className="opacity-75">{t.branch?.name}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="glass-card border-0 p-4 text-white">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-white">Calendar de Activities</h4>
          <p className="text-secondary small mb-0">
            Vista semanal de todas las clases y schedules. (7:00 a 21:00)
          </p>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label className="small">Filtrar por Branch</Form.Label>
            <Form.Select 
              value={filterSede} 
              onChange={e => setFiltroSede(e.target.value)}
              className="bg-dark text-white border-secondary"
            >
              <option value="">Todas las Branches</option>
              {branches && branches.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table bordered variant="dark" className="text-center align-middle" style={{ minWidth: '900px', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '80px', backgroundColor: '#1a1d24' }}>Hora</th>
              {diasSemana.map(d => (
                <th key={d} style={{ backgroundColor: '#1a1d24' }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {horas.map((horaStr, idx) => {
              const horaInicioNum = parseHoraStr(horaStr);
              // Si es la última hora (21:00), el rango es 21:00 a 22:00
              const horaFinNum = horaInicioNum + 1; 
              
              return (
                <tr key={horaStr}>
                  <td className="fw-bold text-secondary" style={{ backgroundColor: '#1a1d24' }}>
                    {horaStr}
                  </td>
                  {diasSemana.map(day => (
                    <td key={`${day}-${horaStr}`} style={{ verticalAlign: 'top', padding: '0.25rem', backgroundColor: '#212529' }}>
                      {renderCell(day, horaInicioNum, horaFinNum)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </Card>
  );
};

export default CalendarAdmin;
