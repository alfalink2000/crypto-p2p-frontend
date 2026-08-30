import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { api } from '../api/client.js';
import { formatCUP, formatRate, timeAgo } from '../lib/format.js';

import Icon from '../components/Icon.jsx';

const STATUS = {
  FROZEN: { label: 'Esperando pago', cls: 'frozen', icon: 'lock' },
  PENDING_CONFIRMATION: { label: 'Confirmando pago', cls: 'pending', icon: 'schedule' },
  COMPLETED: { label: 'Completada', cls: 'done', icon: 'task_alt' },
  DISPUTED: { label: 'En disputa', cls: 'disputed', icon: 'warning' },
  CANCELLED: { label: 'Cancelada', cls: 'cancelled', icon: 'close' },
};

export default function SalaLista() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = () => {
      api
        .get('/deals')
        .then((res) => alive && setDeals(res.deals || []))
        .catch(() => {})
        .finally(() => alive && setLoading(false));
    };
    load();
    const t = setInterval(load, 6000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <>
      <TopBar />
      <main className="app-shell page">
        <h1 className="section-title" style={{ paddingTop: '1.5rem' }}>
          Mis Operaciones
        </h1>

        {loading && <p className="empty">Cargando operaciones…</p>}

        {!loading && deals.length === 0 && (
          <div className="sala-empty">
            <div className="sala-empty-ic">
              <Icon name="receipt_long" />
            </div>
            <h2>No tienes operaciones todavía</h2>
            <p>Inicia una operación desde el mercado y ella aparecerá aquí en vivo.</p>
            <Link to="/mercado" className="btn btn-primary">
              <Icon name="storefront" />
              Ir al Mercado
            </Link>
          </div>
        )}

        <div className="deals-list">
          {deals.map((d) => {
            const st = STATUS[d.status] || { label: d.status, cls: 'cancelled', icon: 'info' };
            const amount = Number(d.amount);
            return (
              <Link key={d.id} to={`/sala/${d.id}`} className="deal-card">
                <div className="deal-top">
                  <div className="deal-partner">
                    <div className="deal-avatar">{d.partner_name ? d.partner_name[0].toUpperCase() : 'C'}</div>
                    <div>
                      <div className="deal-name">
                        {d.partner_name || 'Usuario'}
                        <span className={`deal-side ${d.my_side === 'SELL' ? 'sell' : 'buy'}`}>
                          {d.my_side === 'SELL' ? 'Vendes' : 'Compras'}
                        </span>
                      </div>
                      <div className="deal-sub">{d.code} · {timeAgo(d.created_at)}</div>
                    </div>
                  </div>
                  <Icon name="chevron_right" className="deal-chev" />
                </div>
                <div className="deal-bottom">
                  <div>
                    <div className="deal-amount mono">{amount.toLocaleString('de-DE', { maximumFractionDigits: 6 })} USDT</div>
                    <div className="deal-fiat">≈ {formatCUP(d.fiat_total)} · {formatRate(d.rate)}</div>
                  </div>
                  <span className={`d-status ${st.cls}`}>
                    <Icon name={st.icon} />
                    {st.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <BottomNav />
    </>
  );
}