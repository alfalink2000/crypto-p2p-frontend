import { Link, useLocation } from 'react-router-dom';

import Icon from './Icon.jsx';

const items = [
  { path: '/', match: (p) => p === '/', icon: 'home', label: 'Inicio' },
  { path: '/mercado', match: (p) => p.startsWith('/mercado'), icon: 'monitoring', label: 'Mercado' },
  { path: '/sala', match: (p) => p.startsWith('/sala'), icon: 'receipt_long', label: 'Sala' },
  { path: '/billetera', match: (p) => p.startsWith('/billetera'), icon: 'account_circle', label: 'Perfil' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="bottomnav">
      <div className="bottomnav-row">
        {items.map((it) => (
          <Link key={it.path} to={it.path} className={`nav-item ${it.match(pathname) ? 'active' : ''}`}>
            <Icon name={it.icon} />
            <span className="nav-label">{it.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}