import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Icon from './Icon.jsx';
import { logout } from '../store/slices/authSlice.js';
import useBalance from '../lib/useBalance.js';

function fmtUsdt(n) {
  if (n == null) return '—';
  return `${Number(n).toLocaleString('de-DE', { maximumFractionDigits: 2 })}`;
}

export default function TopBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authed = useSelector((s) => !!s.auth.token);
  const user = useSelector((s) => s.auth.user);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { byAsset } = useBalance(20000);

  const usdt = byAsset('USDT');

  useEffect(() => {
    function onDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', onDown);
      document.addEventListener('touchstart', onDown);
    }
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [open]);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const doLogout = () => {
    setOpen(false);
    dispatch(logout());
    navigate('/');
  };

  const initials = (user?.full_name || user?.email || '')
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-row">
        <Link to="/" className="topbar-brand">
          <Icon name="currency_exchange" />
          <span className="topbar-title">CambioYA</span>
        </Link>

        <div className="topbar-right">
          {authed && (
            <div className="topbar-pill" title={`Saldo USDT disponible: ${fmtUsdt(usdt?.available)}`}>
              <Icon name="account_balance_wallet" size={15} />
              <span className="mono">{fmtUsdt(usdt?.available)}</span>
              <span className="topbar-pill-asset">USDT</span>
            </div>
          )}

          {authed ? (
            <div className="topbar-menu-wrap" ref={menuRef}>
              <button className="topbar-avatar" onClick={() => setOpen((o) => !o)} aria-label="Menú de usuario">
                {initials || <Icon name="person" />}
              </button>
              {open && (
                <nav className="topbar-menu">
                  <div className="topbar-menu-item" role="button" tabIndex={0} onClick={() => go('/billetera')}>
                    <Icon name="account_circle" />
                    <span>Mi Perfil</span>
                  </div>
                  <div className="topbar-menu-item" role="button" tabIndex={0} onClick={() => go('/billetera?tab=depositar')}>
                    <Icon name="qr_code" />
                    <span>Ingresar Fondos</span>
                  </div>
                  <div className="topbar-menu-item" role="button" tabIndex={0} onClick={() => go('/billetera?tab=retirar')}>
                    <Icon name="upload" />
                    <span>Retirar Fondos</span>
                  </div>
                  {user?.role === 'admin' && (
                    <div className="topbar-menu-item" role="button" tabIndex={0} onClick={() => go('/admin')}>
                      <Icon name="admin_panel_settings" />
                      <span>Panel Admin</span>
                    </div>
                  )}
                  <div className="topbar-menu-sep" />
                  <button className="topbar-menu-item danger" onClick={doLogout}>
                    <Icon name="logout" />
                    <span>Cerrar Sesión</span>
                  </button>
                </nav>
              )}
            </div>
          ) : (
            <Link to="/login" className="topbar-avatar" aria-label="Entrar">
              <Icon name="person" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}