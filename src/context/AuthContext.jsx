import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('usuario');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error al leer el usuario de localStorage:', error);
      return null;
    }
  });

  const login = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('usuario', JSON.stringify(userData));
    } catch (error) {
      console.error('Error al guardar el usuario en localStorage:', error);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('usuario');
    } catch (error) {
      console.error('Error al eliminar el usuario de localStorage:', error);
    }
  };

  const updateUser = (newData) => {
    setUser((prevUser) => {
      const updated = { ...prevUser, ...newData };
      try {
        localStorage.setItem('usuario', JSON.stringify(updated));
      } catch (error) {
        console.error('Error al actualizar el usuario en localStorage:', error);
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
