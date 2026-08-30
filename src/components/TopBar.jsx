import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function TopBar() {
  const authed = useSelector((s) => !!s.auth.token);
  return (
    <header className="topbar">
      <div className="topbar-row">
        <Link to="/" className="topbar-brand">
          <span className="mi">currency_exchange</span>
          <span className="topbar-title">CambioYA</span>
        </Link>
        <Link to={authed ? '/billetera' : '/login'} className="topbar-avatar" aria-label="Perfil">
          <span className="mi">person</span>
        </Link>
      </div>
    </header>
  );
}