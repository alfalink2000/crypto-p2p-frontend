import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { marketStats } from '../data/mock.js';

import Icon from '../components/Icon.jsx';

export default function Home() {
  return (
    <>
      <TopBar />
      <main className="app-shell page">
        <div className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section className="hero">
            <div className="hero-logo">
              <Icon name="currency_exchange" filled />
            </div>
            <h1 className="hero-title">
              Cambia <span className="txt-primary">USDT</span> por <span className="txt-secondary">CUP</span>
            </h1>
            <p className="hero-sub">Seguro, rápido y sin vueltas. El mercado P2P hecho para nuestra gente.</p>
            <Link to="/mercado" className="btn btn-primary hero-cta">
              <span>Ver Mercado</span>
              <Icon name="arrow_forward" />
            </Link>
          </section>

          <section className="ticker">
            <div className="ticker-glow" />
            <div className="ticker-col">
              <span className="ticker-label">Tasa Promedio</span>
              <div className="ticker-value">
                <span>{marketStats.avgRate.toFixed(2)}</span>
                <span className="ticker-trend">
                  <Icon name="trending_up" /> 1.2%
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
                <Icon name="search" className="bento-ico" />
              </div>
              <div className="bento-item">
                <div className="bento-num">02</div>
                <div className="bento-body">
                  <h3 className="bento-title">Paga en tu banco</h3>
                  <p className="bento-text">Transfiere los CUP directamente a la cuenta del vendedor. Los USDT están bloqueados y seguros.</p>
                </div>
                <Icon name="account_balance" className="bento-ico" />
              </div>
              <div className="bento-item">
                <div className="bento-num">03</div>
                <div className="bento-body">
                  <h3 className="bento-title">Confirma y recibe</h3>
                  <p className="bento-text">Marca como pagado. Una vez el vendedor confirme, los USDT caen directo a tu billetera.</p>
                </div>
                <Icon name="done_all" className="bento-ico" />
              </div>
            </div>
          </section>

          <section className="trust-grid">
            <div className="trust-card">
              <Icon name="lock" filled style={{ color: 'var(--primary)' }} />
              <span>
                Escrow
                <br />
                Seguro
              </span>
            </div>
            <div className="trust-card">
              <Icon name="verified_user" filled style={{ color: 'var(--secondary)' }} />
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