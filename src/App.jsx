import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Auth from './components/Auth/Auth';
import User from './components/User/User';
import Admin from './components/Admin/Admin';
import Navigation from './components/Navigation/Navigation';
import Home from './components/Home/Home';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton';

// Si el usuario retorna de Mercado Pago a /dashboard/cuotas con parámetros de pago,
// preservamos los parámetros al redirigir hacia /user?tab=cuotas
if (typeof window !== 'undefined' && window.location.pathname === '/dashboard/cuotas' && window.location.search) {
  const search = window.location.search;
  const target = `/user${search}${search.includes('tab=') ? '' : '&tab=cuotas'}`;
  window.history.replaceState(null, '', target);
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          {/* User Dashboard route */}
          <Route path="/user" element={<User />} />
          <Route path="/dashboard/cuotas" element={<Navigate to="/user?tab=cuotas" replace />} />
          {/* Admin Dashboard route */}
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <Footer />
        <WhatsAppButton />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
