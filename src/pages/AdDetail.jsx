import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, mapAd } from '../api/client.js';
import { ads as mockAds } from '../data/mock.js';
import { formatRate, formatUSDT } from '../lib/format.js';

export default function AdDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .get(`/ads/${id}`)
      .then((res) => alive && setAd(mapAd(res.ad)))
      .catch(() => {
        if (!alive) return;
        const found = mockAds.find((a) => String(a.id) === String(id));
        if (found) setAd(found);
        else setError('Anuncio no encontrado');
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  const start = async () => {
    setStarting(true);
    setError('');
    try {
      const res = await api.post('/deals', { ad_id: ad.id });
      navigate(`/sala/${res.deal.id}`);
    } catch (err) {
      if (err.status === 401) {
        navigate('/login');
        return;
      }
      setError(err.message || 'No se pudo iniciar la operación');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <main className="app-shell" style={{ minHeight: '100dvh' }}>
        <p className="empty">Cargando anuncio…</p>
      </main>
    );
  }

  if (!ad) {
    return (
      <main className="app-shell" style={{ minHeight: '100dvh', padding: '1rem' }}>
        <p className="empty">{error}</p>
        <Link to="/mercado" className="back-top">
          ← Volver al mercado
        </Link>
      </main>
    );
  }

  return (
    <main className="app-shell" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header className="pagehead">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Volver">
          <span className="mi">arrow_back</span>
        </button>
        <h1 className="pagehead-title">Detalle del Anuncio</h1>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 8rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* perfil */}
        <div className="seller-card">
          <div className="seller-avatar">
            <span className="mi">person</span>
          </div>
          <div className="seller-info">
            <div className="seller-name">
              {ad.seller.name}
              {ad.seller.verified && <span className="mi filled">verified</span>}
            </div>
            <div className="seller-handle">@{ad.handle || 'usuario'}</div>
            <div className="seller-meta">
              <span className="mi filled">star</span>
              <span>{ad.seller.rating}</span>
              <span className="dot" />
              <span>
                {ad.seller.trades} operaciones{ad.seller.city ? ` · ${ad.seller.city}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* tasa + specs */}
        <div className="detail-card">
          <div className="rate-block">
            <span className="rate-label">Tasa de Cambio</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span className="rate-big">{Number(ad.rate).toFixed(2)}</span>
              <span className="rate-unit">CUP/USDT</span>
            </div>
          </div>
          <div className="divider" />
          <div className="spec-grid">
            <div className="spec">
              <span className="spec-label">
                <span className="mi">arrow_downward</span> Mínimo
              </span>
              <span className="spec-value">
                {ad.min} <small>USDT</small>
              </span>
            </div>
            <div className="spec">
              <span className="spec-label">
                <span className="mi">arrow_upward</span> Máximo
              </span>
              <span className="spec-value">
                {ad.amount} <small>USDT</small>
              </span>
            </div>
            <div className="spec spec-wide">
              <span className="spec-label">
                <span className="mi">account_balance</span> Métodos de Pago
              </span>
              <div className="method-pills">
                <span className="method-pill">{ad.method}</span>
              </div>
            </div>
            <div className="spec spec-wide">
              <span className="spec-label">
                <span className="mi">timer</span> Tiempo de Pago
              </span>
              <span className="spec-value">Máximo 2 horas</span>
            </div>
          </div>
        </div>

        {/* nota del vendedor */}
        {ad.note && (
          <div className="note-card">
            <div className="note-bar" />
            <h3 className="note-title">
              <span className="mi">description</span> Nota del vendedor
            </h3>
            <p className="note-text">"{ad.note}"</p>
          </div>
        )}

        {/* escrow */}
        <div className="escrow-note">
          <div className="escrow-ic">
            <span className="mi filled">lock</span>
          </div>
          <div>
            <h4>Tus fondos están protegidos</h4>
            <p>
              Los USDT quedan resguardados de forma segura por CambioYA en Escrow hasta que ambas partes confirmen el
              pago.
            </p>
          </div>
        </div>
      </div>

      <div className="fab-cta">
        <div className="w-full" style={{ maxWidth: 480 }}>
          <button className="btn btn-primary fab-btn" onClick={start} disabled={starting || !!error}>
            {starting ? (
              <>
                <span className="mi" style={{ animation: 'pulse 1s infinite' }}>
                  sync
                </span>
                Creando operación…
              </>
            ) : (
              <>
                <span>Iniciar Operación</span>
                <span className="mi">arrow_forward</span>
              </>
            )}
          </button>
          {error && <p className="auth-error" style={{ margin: '0.5rem 0 0' }}>{error}</p>}
        </div>
      </div>
    </main>
  );
}