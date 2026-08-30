import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { marketStats } from '../data/mock.js';

export default function Home() {
  return (
    <>
      <TopBar />
      <main className="app-shell page">
        <div className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section className="hero">
            <div className="hero-logo">
              <span className="mi filled">currency_exchange</span>
            </div>
            <h1 className="hero-title">
              Cambia <span className="txt-primary">USDT</span> por <span className="txt-secondary">CUP</span>
            </h1>
            <p className="hero-sub">Seguro, rápido y sin vueltas. El mercado P2P hecho para nuestra gente.</p>
            <Link to="/mercado" className="btn btn-primary hero-cta">
              <span>Ver Mercado</span>
              <span className="mi">arrow_forward</span>
            </Link>
          </section>

          <section className="ticker">
            <div className="ticker-glow" />
            <div className="ticker-col">
              <span className="ticker-label">Tasa Promedio</span>
              <div className="ticker-value">
                <span>{marketStats.avgRate.toFixed(2)}</span>
                <span className="ticker-trend">
                  <span className="mi">trending_up</span> 1.2%
                </span>
              </div>
            </div>
            <div className="ticker-col right">
              <span className="ticker-label">Vol 24h</span>
              <span className="ticker-value" style={{ fontSize: 20 }}>
                {marketStats.volume24h.toLocaleString('de-DE')} USDT
              </span>
            </div>
          </section>

          <section>
            <h2 className="section-title">¿Cómo funciona?</h2>
            <div className="bento">
              <div className="bento-item">
                <div className="bento-num">01</div>
                <div className="bento-body">
                  <h3 className="bento-title">Elige un anuncio</h3>
                  <p className="bento-text">Busca la mejor tasa. Fíjate en la reputación del vendedor y los bancos que acepta.</p>
                </div>
                <span className="mi bento-ico">search</span>
              </div>
              <div className="bento-item">
                <div className="bento-num">02</div>
                <div className="bento-body">
                  <h3 className="bento-title">Paga en tu banco</h3>
                  <p className="bento-text">Transfiere los CUP directamente a la cuenta del vendedor. Los USDT están bloqueados y seguros.</p>
                </div>
                <span className="mi bento-ico">account_balance</span>
              </div>
              <div className="bento-item">
                <div className="bento-num">03</div>
                <div className="bento-body">
                  <h3 className="bento-title">Confirma y recibe</h3>
                  <p className="bento-text">Marca como pagado. Una vez el vendedor confirme, los USDT caen directo a tu billetera.</p>
                </div>
                <span className="mi bento-ico">done_all</span>
              </div>
            </div>
          </section>

          <section className="trust-grid">
            <div className="trust-card">
              <span className="mi filled" style={{ color: 'var(--primary)' }}>lock</span>
              <span>
                Escrow
                <br />
                Seguro
              </span>
            </div>
            <div className="trust-card">
              <span className="mi filled" style={{ color: 'var(--secondary)' }}>verified_user</span>
              <span>
                Verificado por
                <br />
                la comunidad
              </span>
            </div>
          </section>
        </div>
      </main>
      <BottomNav />
    </>
  );
}