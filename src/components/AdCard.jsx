import { useNavigate } from 'react-router-dom';

function initials(name = '') {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function AdCard({ ad, side }) {
  const navigate = useNavigate();
  const buy = ad.side === 'BUY';
  const go = () => navigate(`/anuncio/${ad.id}`);
  const ctaLabel = buy ? 'Comprar USDT' : 'Vender USDT';

  return (
    <article className="offer-card" onClick={go}>
      <div className="offer-grad" />
      <div className="offer-top">
        <div className="offer-seller">
          <div className="avatar">
            {ad.handle ? (
              <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{initials(ad.handle.replace('@', ''))}</span>
            ) : (
              <span className="mi">person</span>
            )}
            {ad.seller.verified && (
              <span className="avatar-badge">
                <span className="mi filled" style={{ fontSize: 14, color: 'var(--primary)' }}>
                  verified
                </span>
              </span>
            )}
          </div>
          <div>
            <div className="offer-handle">@{ad.handle || ad.seller.name || 'usuario'}</div>
            <div className="offer-rating">
              <span className="mi">star</span>
              <span>
                {ad.seller.rating} ({ad.seller.trades})
              </span>
            </div>
          </div>
        </div>
        <div className="offer-price">
          <div className="offer-rate">{Number(ad.rate).toFixed(2)}</div>
          <div className="offer-unit">CUP/USDT</div>
        </div>
      </div>

      <div className="offer-rule" />

      <div className="offer-avail">
        <div className="offer-avail-left">
          <span className="offer-avail-label">Disponible</span>
          <span className="offer-avail-val">
            {ad.min} - {ad.amount} USDT
          </span>
        </div>
        <span className="offer-prov">{ad.seller.city}</span>
      </div>

      <div className="offer-methods">
        {(ad.methods || [ad.method]).map((m, i) => (
          <span key={m} className={`mchip ${i === 0 ? 'primary' : 'plain'}`}>
            {m}
          </span>
        ))}
      </div>

      <button
        className={`btn btn-primary offer-cta ${buy ? '' : 'btn-danger'}`}
        onClick={(e) => {
          e.stopPropagation();
          go();
        }}
      >
        {ctaLabel}
      </button>
    </article>
  );
}