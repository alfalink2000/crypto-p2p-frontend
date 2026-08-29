import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TopNav from '../components/TopNav.jsx';
import AdCard from '../components/AdCard.jsx';
import { api, mapAd } from '../api/client.js';
import { ads as mockAds, marketStats, provinces, methods } from '../data/mock.js';
import { formatRate } from '../lib/format.js';

export default function Market() {
  const [params] = useSearchParams();
  const [side, setSide] = useState(params.get('side') === 'SELL' ? 'SELL' : 'BUY');
  const [province, setProvince] = useState('Todas');
  const [method, setMethod] = useState('Todos');
  const [q, setQ] = useState('');
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .get(`/ads?side=${side}&province=${encodeURIComponent(province)}&method=${encodeURIComponent(method)}&q=${encodeURIComponent(q)}`)
      .then((res) => {
        if (!alive) return;
        setAds(res.ads.map(mapAd));
        setOffline(false);
      })
      .catch(() => {
        if (!alive) return;
        setAds(
          mockAds.filter((a) => {
            if (a.side !== side) return false;
            if (province !== 'Todas' && a.seller.city !== province) return false;
            if (method !== 'Todos' && a.method !== method) return false;
            if (q && !a.seller.name.toLowerCase().includes(q.toLowerCase())) return false;
            return true;
          })
        );
        setOffline(true);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [side, province, method, q]);

  return (
    <div className="page">
      <TopNav />

      <div className="market-head">
        <h1 className="market-title">
          {side === 'BUY' ? 'Comprar USDT' : 'Vender USDT'}
        </h1>
        {offline ? (
          <p className="muted small">
            Sin conexión con el servidor · mostrando datos de demostración
            <br />
            Tasa promedio del feed: <b className="ok">{formatRate(marketStats.avgRate)}</b>
          </p>
        ) : (
          <p className="muted small">
            Tasa fijada por cada vendedor · mercado informal
          </p>
        )}
      </div>

      <div className="tabs">
        <button className={`tab ${side === 'BUY' ? 'tab-on' : ''}`} onClick={() => setSide('BUY')}>
          Comprar
        </button>
        <button className={`tab ${side === 'SELL' ? 'tab-on' : ''}`} onClick={() => setSide('SELL')}>
          Vender
        </button>
      </div>

      <div className="filters">
        <input
          className="f-search"
          placeholder="Buscar por vendedor o provincia…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={province} onChange={(e) => setProvince(e.target.value)}>
          {provinces.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          {methods.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="ad-list">
        {loading && <p className="muted empty">Cargando anuncios…</p>}
        {!loading && ads.length === 0 && (
          <p className="muted empty">No hay anuncios con esos filtros.</p>
        )}
        {ads.map((a) => (
          <AdCard key={a.id} ad={a} />
        ))}
      </div>
    </div>
  );
}