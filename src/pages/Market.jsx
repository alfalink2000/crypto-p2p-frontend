import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TopBar from '../components/TopBar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import AdCard from '../components/AdCard.jsx';
import { api, mapAd } from '../api/client.js';
import { ads as mockAds, methodChips } from '../data/mock.js';

import Icon from '../components/Icon.jsx';

export default function Market() {
  const [params] = useSearchParams();
  const [side, setSide] = useState(params.get('side') === 'SELL' ? 'SELL' : 'BUY');
  const [province, setProvince] = useState('Todas');
  const [method, setMethod] = useState('Transfermóvil');
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [mstats, setMstats] = useState(null);

  useEffect(() => {
    let alive = true;
    api
      .get('/market/stats')
      .then((res) => alive && setMstats(res))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const qs = `side=${side}&province=${encodeURIComponent(province)}&method=${encodeURIComponent(method)}`;
    api
      .get(`/ads?${qs}`)
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
            if (method && !(a.methods || [a.method]).includes(method)) return false;
            return true;
          })
        );
        setOffline(true);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [side, province, method]);

  return (
    <>
      <div className="offline-banner" hidden={!offline}>
        SIN CONEXIÓN A INTERNET
      </div>
      <TopBar />
      <main className="app-shell page">
        <div className="market-head">
          <h1 className="market-title">{side === 'BUY' ? 'Comprar USDT' : 'Vender USDT'}</h1>
          <p className="market-sub">
            Tasa fijada por cada vendedor · mercado informal{offline ? ' · datos de demostración' : ''}
          </p>
        </div>

        <div className="seg">
          <button className={`seg-btn ${side === 'BUY' ? 'on' : 'off'}`} onClick={() => setSide('BUY')}>
            Comprar
          </button>
          <button className={`seg-btn ${side === 'SELL' ? 'on' : 'off'}`} onClick={() => setSide('SELL')}>
            Vender
          </button>
        </div>

        <div className="chip-row">
          <button className={`chip ${province !== 'Todas' ? 'on' : ''}`} onClick={() => setProvince(province === 'Todas' ? 'La Habana' : 'Todas')}>
            <Icon name={province === 'Todas' ? 'location_on' : 'close'} />
            {province === 'Todas' ? 'Todas las provincias' : province}
          </button>
          {methodChips.map((m) => (
            <button key={m} className={`chip ${method === m ? 'on' : ''}`} onClick={() => setMethod(method === m ? '' : m)}>
              {m}
              {method === m && <Icon name="close" />}
            </button>
          ))}
        </div>

        <div className="stats-bar">
          <div className="stats-avg">
            <span className="stats-label">Tasa de referencia</span>
            <span className="stats-val">
              {mstats && Number(mstats.referenceRate) > 0 ? Number(mstats.referenceRate).toFixed(2) : '—'}{' '}
              <small>CUP</small>
            </span>
          </div>
          <span className="stats-trend">
            <Icon name="trending_up" /> {mstats?.rateSource === 'admin' ? 'oficial' : 'mercado'}
          </span>
        </div>

        <div className="offer-list">
          {loading &&
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="offer-card animate-pulse" style={{ gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div className="skel-bg" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div className="skel-bg" style={{ width: 96, height: 16 }} />
                      <div className="skel-bg" style={{ width: 64, height: 12 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div className="skel-bg" style={{ width: 80, height: 24 }} />
                    <div className="skel-bg" style={{ width: 48, height: 12 }} />
                  </div>
                </div>
                <div className="skel-bg" style={{ height: 1 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div className="skel-bg" style={{ width: 64, height: 12 }} />
                    <div className="skel-bg" style={{ width: 96, height: 16 }} />
                  </div>
                  <div className="skel-bg" style={{ width: 64, height: 20 }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div className="skel-bg" style={{ width: 96, height: 24 }} />
                  <div className="skel-bg" style={{ width: 80, height: 24 }} />
                </div>
                <div className="skel-bg" style={{ height: 48, borderRadius: '0.75rem' }} />
              </div>
            ))}
          {!loading && ads.length === 0 && <p className="empty">No hay anuncios con esos filtros.</p>}
          {!loading && ads.map((a) => <AdCard key={a.id} ad={a} />)}
        </div>
      </main>
      <BottomNav />
    </>
  );
}