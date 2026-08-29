import { Link } from 'react-router-dom';
import { formatUSDT, formatRate } from '../lib/format.js';

export default function AdCard({ ad }) {
  const buy = ad.side === 'BUY';
  return (
    <Link to={`/anuncio/${ad.id}`} className={`adcard ${buy ? 'is-buy' : ''}`}>
      <div className="adcard-top">
        <span className={`pill ${buy ? 'pill-buy' : 'pill-sell'}`}>{buy ? 'COMPRO' : 'VENDO'}</span>
        <div className="adcard-seller">
          <span className="seller-name">
            {ad.seller.name}
            {ad.seller.verified && <span className="vcheck" title="Verificado">✓</span>}
          </span>
          <span className="seller-meta">
            {ad.seller.city} · {ad.seller.trades} ops · ★ {ad.seller.rating}
          </span>
        </div>
      </div>

      <div className="adcard-rate">
        <strong>{formatRate(ad.rate)}</strong>
        <span>por USDT</span>
      </div>

      <div className="adcard-amount">
        <span>
          {formatUSDT(ad.amount)} <small className="muted">disponible</small>
        </span>
        <span className="muted small">mín {formatUSDT(ad.min)}</span>
      </div>

      <div className="adcard-foot">
        <span className="chip">{ad.method}</span>
        {ad.note && <span className="muted small adcard-note">{ad.note}</span>}
        <span className="adcard-go">→</span>
      </div>
    </Link>
  );
}