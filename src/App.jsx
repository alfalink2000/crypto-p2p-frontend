import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from './pages/Home.jsx';
import Market from './pages/Market.jsx';
import AdDetail from './pages/AdDetail.jsx';
import Sala from './pages/Sala.jsx';
import SalaLista from './pages/SalaLista.jsx';
import Login from './pages/Login.jsx';
import Wallet from './pages/Wallet.jsx';
import Admin from './pages/Admin.jsx';

function PrivateRoute({ children }) {
  const token = useSelector((s) => s.auth.token);
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/mercado" element={<Market />} />
      <Route path="/anuncio/:id" element={<AdDetail />} />
      <Route path="/sala" element={<PrivateRoute><SalaLista /></PrivateRoute>} />
      <Route path="/sala/:dealId" element={<Sala />} />
      <Route path="/billetera" element={<PrivateRoute><Wallet /></PrivateRoute>} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}