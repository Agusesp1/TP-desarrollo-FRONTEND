import React, { useState } from 'react';
import './Usuario.css';
import { useNavigate } from 'react-router-dom';

function Usuario() {
  const navigate = useNavigate();
  const [usuario] = useState({
    nombre: 'Juan Pérez',
    email: 'juan.perez@example.com',
    rol: 'Usuario',
    fechaRegistro: '15/01/2024',
    estado: 'Activo'
  });

  const handleLogout = () => {
    navigate('/');
  };

  const handleEditProfile = () => {
    alert('Función de editar perfil en desarrollo');
  };

  const handleChangePassword = () => {
    alert('Función de cambiar contraseña en desarrollo');
  };

  return (
    <div className="usuario-container">
      <div className="usuario-header">
        <h1>Panel de Usuario</h1>
        <button className="btn-logout" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      <div className="usuario-content">
        {/* Card de Información del Usuario */}
        <div className="usuario-card">
          <div className="card-header">
            <h2>Mi Información</h2>
          </div>
          <div className="card-body">
            <div className="avatar">
              <span>{usuario.nombre.charAt(0)}</span>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <label>Nombre</label>
                <p>{usuario.nombre}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{usuario.email}</p>
              </div>
              <div className="info-item">
                <label>Rol</label>
                <p>{usuario.rol}</p>
              </div>
              <div className="info-item">
                <label>Estado</label>
                <p className="status-active">{usuario.estado}</p>
              </div>
              <div className="info-item">
                <label>Fecha de Registro</label>
                <p>{usuario.fechaRegistro}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Acciones */}
        <div className="usuario-card">
          <div className="card-header">
            <h2>Acciones</h2>
          </div>
          <div className="card-body actions">
            <button className="btn-primary" onClick={handleEditProfile}>
              ✎ Editar Perfil
            </button>
            <button className="btn-secondary" onClick={handleChangePassword}>
              🔐 Cambiar Contraseña
            </button>
            <button className="btn-secondary" onClick={() => alert('Ver historial')}>
              📋 Ver Historial
            </button>
          </div>
        </div>

        {/* Card de Estadísticas */}
        <div className="usuario-card">
          <div className="card-header">
            <h2>Estadísticas</h2>
          </div>
          <div className="card-body stats">
            <div className="stat-item">
              <span className="stat-number">24</span>
              <span className="stat-label">Actividades</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">12</span>
              <span className="stat-label">Documentos</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">8</span>
              <span className="stat-label">Amigos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Usuario;
