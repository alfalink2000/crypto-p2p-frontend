import { Link } from 'react-router-dom';
import TopNav from '../components/TopNav.jsx';
import AdCard from '../components/AdCard.jsx';
import { ads, marketStats } from '../data/mock.js';
import { formatRate, formatUSDT } from '../lib/format.js';

const STEPS = [
  {
    n: '01',
    title: 'Elige a tu contraparte',
    text: 'Filtra por ciudad, método de pago y reputación. Cada vendedor publica su propia tasa.',
  },
  {
    n: '02',
    title: 'Paga por tu vía habitual',
    text: 'Transfermóvil, EnZona o efectivo. El USDT queda congelado en escrow: nadie corre.',
  },
  {
    n: '03',
    title: 'Confirma y recibes',
    text: 'El vendedor confirma el pago en su app del banco y el USDT se libera a tu saldo.',
  },
];

const SELLERS = ads.filter((a) => a.side === 'SELL').slice(0, 3);

export default function Home() {
  return (
    <div className="page">
      <TopNav />

      <section className="hero">
        <p className="hero-badge">Red de cambio P2P en Cuba · sin intermediarios</p>
        <h1 className="hero-title">
          Cambia USDT <span className="grad">sin sustos.</span>
        </h1>
        <p className="hero-sub">
          Compra o vende dólar digital con gente real de tu ciudad. El dinero va en
          <b> escrow</b> hasta que ambos confirman. Cero conejos.
        </p>
        <div className="hero-cta">
          <Link to="/mercado?side=BUY" className="btn btn-primary">
            Comprar USDT
          </Link>
          <Link to="/mercado?side=SELL" className="btn btn-ghost">
            Vender USDT
          </Link>
        </div>
        <div className="hero-stats">
          <div>
            <strong>{formatRate(marketStats.avgRate)}</strong>
            <span>tasa promedio</span>
          </div>
          <div>
            <strong>{marketStats.sellers}</strong>
            <span>vendedores</span>
          </div>
          <div>
            <strong>{formatUSDT(marketStats.volume24h)}</strong>
            <span>volumen 24h</span>
          </div>
        </div>
      </section>

      <section className="how">
        <h2>Cómo funciona</h2>
        <div className="steps">
          {STEPS.map((s) => (
            <div key={s.n} className="step">
              <span className="step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="feature">
        <div className="feature-card">
          <h3>Escrow real, no compra a ciegas</h3>
          <p>
            Al iniciar una operación, el USDT del vendedor se bloquea en la plataforma. Tú pagas,
            él confirma, y solo entonces se libera. El respaldo corre por cuenta de la operación.
          </p>
          <ul>
            <li>Reputación verificada con operaciones reales</li>
            <li>Tasa fijada por cada vendedor, sin sorpresas</li>
            <li>Disputas resueltas por soporte con evidencias</li>
          </ul>
        </div>
      </section>

      <section className="offers">
        <h2>Ofertas destacadas</h2>
        <div className="offer-list">
          {SELLERS.map((a) => (
            <AdCard key={a.id} ad={a} />
          ))}
        </div>
        <Link to="/mercado" className="btn btn-ghost btn-block">
          Ver todo el mercado
        </Link>
      </section>

      <section className="cta-final">
        <h2>Únete gratis</h2>
        <p>Crea tu cuenta, publica tu tasa y empieza a operar en minutos.</p>
        <Link to="/register" className="btn btn-primary btn-block">
          Crear mi cuenta
        </Link>
      </section>

      <footer className="foot">
        <p className="muted small">
          CambioYA no es un banco ni entidad autorizada. Opere bajo tu responsabilidad y dentro del
          marco legal vigente en Cuba.
        </p>
      </footer>
    </div>
  );
}