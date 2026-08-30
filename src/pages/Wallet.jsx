import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { api, getToken } from '../api/client.js';
import { walletDemo } from '../data/mock.js';
import { formatCUP } from '../lib/format.js';

import Icon from '../components/Icon.jsx';

export default function Wallet() {
  const navigate = useNavigate();
  const [bal, setBal] = useState(walletDemo.balance);
  const [eq, setEq] = useState(walletDemo.equivalent);
  const [monto, setMonto] = useState('');
  const [busy, setBusy] = useState('');
  const [done, setDone] = useState('');

  useEffect(() => {
    if (!getToken()) return;
    api
      .get('/balances/me')
      .then((res) => {
        if (res.available != null) {
          const b = Number(res.available);
          setBal(b);
          setEq(b * walletDemo.avgRate);
        }
      })
      .catch(() => {});
  }, []);

  const max = () => {
    setMonto(bal.toFixed(2));
    setEq(bal * walletDemo.avgRate);
  };

  const confirm = () => {
    if (!monto || Number(monto) <= 0) return;
    setBusy('ret');
    if (!getToken()) {
      setBusy('');
      alert('Inicia sesión para retirar USDT.');
      navigate('/login');
      return;
    }
    api
      .post('/withdrawals', { amount: Number(monto), network: 'TRC20' })
      .then((res) => {
        setDone(res.withdrawal?.id ? `Retiro #${res.withdrawal.id} registrado.` : 'Retiro registrado.');
      })
      .catch((err) => alert(err.message))
      .finally(() => setBusy(''));
  };

  return (
    <>
      <TopBar />
      <main className="app-shell page">
        {done && <p className="auth-error" style={{ color: 'var(--primary)' }}>{done}</p>}

        {/* saldo */}
        <div className="w-card">
          <div className="w-glow" />
          <div className="w-head">
            <span className="w-label">Saldo Disponible</span>
            <span className="verified-chip">
              <Icon name="verified" filled />
              <span>Verificado</span>
            </span>
          </div>
          <div className="w-balance">
            {Number(bal).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            <span className="unit">USDT</span>
          </div>
          <div className="w-equiv">
            <Icon name="swap_horiz" />
            <span>≈ {formatCUP(eq)}</span>
          </div>
        </div>

        {/* acciones */}
        <div className="w-actions">
          <button className="w-btn sell" onClick={() => navigate('/mercado?side=SELL')}>
            <Icon name="sell" />
            Vender USDT
          </button>
          <button className="w-btn ghost">
            <Icon name="account_balance_wallet" />
            Retirar
          </button>
        </div>

        {/* retirar */}
        <div className="retire-card">
          <div className="retire-title">
            <Icon name="logout" />
            <span>Retirar a Wallet</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="field">
              <span className="field-label">Monto (USDT)</span>
              <div className="input-wrap">
                <input type="number" placeholder="0.00" value={monto} onChange={(e) => setMonto(e.target.value)} />
                <button className="max-btn" onClick={max}>
                  MÁX
                </button>
              </div>
            </div>
            <div className="field">
              <span className="field-label">Red</span>
              <div className="field-row">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="trx-dot">
                    <span>TRX</span>
                  </span>
                  <span>Tron (TRC20)</span>
                </div>
                <Icon name="keyboard_arrow_down" style={{ color: 'var(--on-surface-variant)' }} />
              </div>
            </div>
            <div className="fee-row">
              <span>Comisión de red</span>
              <span className="mono">1.00 USDT</span>
            </div>
            <button className="btn btn-primary btn-block confirm-btn" onClick={confirm} disabled={!!busy}>
              {busy === 'ret' ? 'Procesando…' : 'Confirmar Retiro'}
            </button>
          </div>
        </div>

        {/* actividad */}
        <div className="activity">
          <div className="act-head">
            <h3 className="act-title">Actividad Reciente</h3>
            <button className="act-more">Ver todo</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {walletDemo.activity.map((a) => (
              <div key={a.id} className="act-item">
                <div className="act-left">
                  <div className={`act-icon ${a.kind}`}>
                    <Icon name={a.icon} />
                  </div>
                  <div>
                    <div className="act-id">ID: #{a.id}</div>
                    <div className="act-date">{a.date}</div>
                  </div>
                </div>
                <div className="act-right">
                  <span className="act-amount">
                    {a.sign}
                    {Number(a.amount).toLocaleString('de-DE')} USDT
                  </span>
                  <span className={`act-status ${a.kind === 'pend' ? 'pend' : 'ok'}`}>
                    <Icon name={a.kind === 'pend' ? 'pending' : 'check_circle'} filled />
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}