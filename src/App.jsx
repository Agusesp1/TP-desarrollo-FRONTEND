import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Auth from './components/Auth/Auth';
import User from './components/User/User';
import Admin from './components/Admin/Admin';
import Navigation from './components/Navigation/Navigation';
import Home from './components/Home/Home';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton';

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
