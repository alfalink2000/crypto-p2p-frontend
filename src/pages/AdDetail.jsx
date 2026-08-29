import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.jsx';
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
        const found = mockAds.find((a) => a.id === Number(id));
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
      <div className="page">
        <TopNav />
        <p className="muted empty">Cargando anuncio…</p>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="page">
        <TopNav />
        <p className="muted">{error}</p>
        <Link to="/mercado" className="btn btn-ghost">
          Volver al mercado
        </Link>
      </div>
    );
  }

  const buy = ad.side === 'BUY';

  return (
    <div className="page">
      <TopNav />
      <div className="detail-head">
        <Link to="/mercado" className="back">
          ← Volver al mercado
        </Link>
      </div>

      <div className="detail-card card">
        <div className="adcard-top">
          <span className={`pill ${buy ? 'pill-buy' : 'pill-sell'}`}>{buy ? 'COMPRO' : 'VENDO'}</span>
          <div className="adcard-seller">
            <span className="seller-name">
              {ad.seller.name}
              {ad.seller.verified && <span className="vcheck">✓</span>}
            </span>
            <span className="seller-meta">
              {ad.seller.city} · {ad.seller.trades} operaciones · ★ {ad.seller.rating}
            </span>
          </div>
        </div>

        <div className="detail-rate">
          <span className="muted small">Tasa ofrecida</span>
          <strong>{formatRate(ad.rate)}</strong>
          <span className="muted small">por {ad.asset}</span>
        </div>

        <div className="detail-grid">
          <div>
            <span className="muted small">Disponible</span>
            <b>{formatUSDT(ad.amount)}</b>
          </div>
          <div>
            <span className="muted small">Mínimo</span>
            <b>{formatUSDT(ad.min)}</b>
          </div>
          <div>
            <span className="muted small">Método</span>
            <b>{ad.method}</b>
          </div>
          <div>
            <span className="muted small">Tiempo para pagar</span>
            <b>2 horas</b>
          </div>
        </div>

        {ad.note && <p className="detail-note">{ad.note}</p>}
        {error && <p className="error">{error}</p>}

        <button className="btn btn-primary btn-block" onClick={start} disabled={starting}>
          {starting
            ? 'Creando operación…'
            : buy
              ? 'Vender USDT a este precio'
              : 'Comprar USDT a este precio'}
        </button>

        <p className="muted small center">
          Al iniciar cambias a una sala privada con escrow: el USDT queda congelado hasta que
          confirmas el pago en tu app del banco.
        </p>
      </div>
    </div>
  );
}