import { Link } from 'react-router-dom';

export default function TopNav() {
  return (
    <header className="twnav">
      <div className="twnav-inner">
        <Link to="/" className="logo">
          CambioYA
        </Link>
        <nav className="twnav-links">
          <Link to="/mercado">Mercado</Link>
          <Link to="/anuncio/nuevo" className="twnav-cta">
            Publicar
          </Link>
        </nav>
      </div>
    </header>
  );
}