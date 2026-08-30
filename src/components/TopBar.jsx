import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Icon from './Icon.jsx';

export default function TopBar() {
  const authed = useSelector((s) => !!s.auth.token);
  return (
    <header className="topbar">
      <div className="topbar-row">
        <Link to="/" className="topbar-brand">
          <Icon name="currency_exchange" />
          <span className="topbar-title">CambioYA</span>
        </Link>
        <Link to={authed ? '/billetera' : '/login'} className="topbar-avatar" aria-label="Perfil">
          <Icon name="person" />
        </Link>
      </div>
    </header>
  );
}