import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice.js';

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="app">
      <header className="topbar">
        <span className="logo">Crypto P2P</span>
        <nav>
          <Link to="/">Cuenta</Link>
          <Link to="/retirar">Retirar</Link>
          <button className="link" onClick={handleLogout}>
            Salir
          </button>
        </nav>
      </header>
      <main className="content">
        {user && (
          <p className="hello">
            Hola, {user.full_name || user.email}
            {user.kyc_level === 0 && <span className="badge">KYC pendiente</span>}
          </p>
        )}
        <Outlet />
      </main>
    </div>
  );
}
