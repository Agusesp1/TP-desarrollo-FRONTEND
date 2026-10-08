import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Auth from './components/Auth/Auth';
import ResetPassword from './components/Auth/ResetPassword';
import User from './components/User/User';
import Admin from './components/Admin/Admin';
import Navigation from './components/Navigation/Navigation';
import Home from './components/Home/Home';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton';

// Si el user retorna de Mercado Payment a /dashboard/quotas con parámetros de payment,
// preservamos los parámetros al redirigir hacia /user?tab=quotas
if (typeof window !== 'undefined' && window.location.pathname === '/dashboard/quotas' && window.location.search) {
  const search = window.location.search;
  const target = `/user${search}${search.includes('tab=') ? '' : '&tab=quotas'}`;
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
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* User Dashboard route */}
          <Route path="/user" element={<User />} />
          <Route path="/dashboard/quotas" element={<Navigate to="/user?tab=quotas" replace />} />
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
