import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import TopBar from '../components/TopBar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { api, getToken } from '../api/client.js';
import { formatCUP, formatUSDT, timeAgo } from '../lib/format.js';
import useBalance from '../lib/useBalance.js';

import usdtIcon from '../assets/tokens/usdt.png';
import tronIcon from '../assets/tokens/tron.png';
import bnbIcon from '../assets/tokens/bnb.png';

import Icon from '../components/Icon.jsx';

const NETWORKS = [
  { id: 'tron', label: 'USDT (TRC20)', short: 'TRX', asset: 'USDT' },
  { id: 'bsc', label: 'USDT (BEP20)', short: 'BSC', asset: 'USDT' },
];

const WALLET_NET = { tron: 'USDT (TRC20)', bsc: 'USDT (BEP20)' };
const NET_ICON = { tron: tronIcon, bsc: bnbIcon };

const DEP_STATUS = { pending: 'Pendiente', confirmed: 'Confirmado', failed: 'Fallido' };
const WDR_STATUS = { pending: 'Pendiente', processing: 'Procesando', completed: 'Completado', failed: 'Fallido', refunded: 'Reembolsado' };

function statusChip(status) {
  if (['confirmed', 'completed'].includes(status)) return { label: DEP_STATUS[status] || WDR_STATUS[status], ok: true };
  if (status === 'pending' || status === 'processing') return { label: WDR_STATUS[status] || DEP_STATUS[status], pend: true };
  return { label: (DEP_STATUS[status] || WDR_STATUS[status] || status).toLowerCase(), fail: true };
}

function CopyBtn({ text, size = 18 }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* sin permiso de portapapeles */
    }
  };
  return (
    <button className="copy-btn" onClick={copy} aria-label="Copiar" title="Copiar">
      <Icon name={copied ? 'check' : 'content_copy'} />
    </button>
  );
}

// ---- pestañas ----

function Resumen({ usdt, usdtLocked, rate }) {
  const navigate = useNavigate();
  const eq = rate > 0 ? (Number(usdt?.available || 0)) * rate : null;
  return (
    <div className="wallet-stack">
      <div className="w-card">
        <div className="w-glow" />
        <div className="w-head">
          <span className="w-label">Saldo Disponible</span>
          <span className="verified-chip">
            <Icon name="verified_user" filled />
            <span>Escrow</span>
          </span>
        </div>
        <div className="w-balance">
          <img className="token-ic lg" src={usdtIcon} alt="USDT" />
          {Number(usdt?.available || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
          <span className="unit">USDT</span>
        </div>
        {eq != null ? (
          <div className="w-equiv">
            <Icon name="swap_horiz" />
            <span>≈ {formatCUP(eq)}</span>
          </div>
        ) : (
          <div className="w-equiv">
            <Icon name="swap_horiz" />
            <span>Sin tasa de referencia</span>
          </div>
        )}
        {Number(usdtLocked) > 0 && (
          <div className="w-locked">
            <Icon name="lock" filled />
            <span>
              {Number(usdtLocked).toLocaleString('de-DE', { maximumFractionDigits: 6 })} USDT en escrow (operaciones en curso)
            </span>
          </div>
        )}
      </div>

      <div className="w-actions actions-3">
        <button className="w-btn join" onClick={() => navigate('/billetera?tab=depositar')}>
          <Icon name="qr_code" />
          Ingresar
        </button>
        <button className="w-btn ghost" onClick={() => navigate('/billetera?tab=retirar')}>
          <Icon name="upload" />
          Retirar
        </button>
        <button className="w-btn sell" onClick={() => navigate('/mercado?side=SELL')}>
          <Icon name="sell" />
          Vender
        </button>
      </div>
    </div>
  );
}

function Depositar({ wallets, deposits }) {
  return (
    <div className="wallet-stack">
      <p className="w-note">
        Puedes depositar{' '}
        <b>
          <img className="token-ic" src={usdtIcon} alt="" /> USDT-TRC20
        </b>{' '}
        (red TRON) o{' '}
        <b>
          <img className="token-ic" src={usdtIcon} alt="" /> USDT-BEP20
        </b>{' '}
        (red BNB Smart Chain). Elige la dirección de la red correspondiente y envía solo ese activo.
      </p>

      {wallets.map((w, i) => (
        <div key={`${w.network}-${i}`} className="dep-card">
          <div className="dep-head">
            <img className="token-ic net" src={NET_ICON[w.network]} alt={w.network} />
            <span className="dep-net">
              <img className="token-ic" src={usdtIcon} alt="" /> {WALLET_NET[w.network] || w.network}
            </span>
            <span className="dep-asset mono">{w.asset || 'USDT'}</span>
          </div>
          <div className="dep-body">
            <div className="dep-qr">
              <QRCodeSVG value={w.address} size={108} bgColor="transparent" fgColor="#e2e2e9" level="M" />
            </div>
            <div className="dep-addr-wrap">
              <div className="field-label">Dirección de depósito</div>
              <div className="dep-addr mono">{w.address}</div>
              <div className="dep-copy">
                <CopyBtn text={w.address} size={16} />
                <span className="copied-hint">Copia la dirección</span>
              </div>
            </div>
          </div>
          <p className="dep-warn">
            <Icon name="warning" /> Envía solo{' '}
            <img className="token-ic" src={usdtIcon} alt="" /> {WALLET_NET[w.network] || w.network} a esta dirección. Enviar
            otra red o activo (BNB, TRX, USDT por otra vía) puede perderse.
          </p>
        </div>
      ))}

      {wallets.length === 0 && <p className="empty">Generando direcciones…</p>}

      {deposits.length > 0 && (
        <div className="activity">
          <div className="act-head">
            <h3 className="act-title">Depósitos recientes</h3>
          </div>
          {deposits.slice(0, 5).map((d) => {
            const chip = statusChip(d.status);
            return (
              <div key={d.id} className="act-item">
                <div className="act-left">
                  <div className="act-icon in">
                    <Icon name="arrow_downward" />
                  </div>
                  <div>
                    <div className="act-id">Depósito</div>
                    <div className="act-date">{timeAgo(d.created_at)}</div>
                  </div>
                </div>
                <div className="act-right">
                  <span className="act-amount">+ {Number(d.amount).toLocaleString('de-DE')} USDT</span>
                  <span className={`act-status ${chip.ok ? 'ok' : chip.pend ? 'pend' : 'fail'}`}>
                    <Icon name={chip.ok ? 'check_circle' : chip.pend ? 'pending' : 'error'} filled={chip.ok} />
                    {chip.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Retirar({ usdt, balanceRefresh }) {
  const navigate = useNavigate();
  const [network, setNetwork] = useState('tron');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState('');
  const available = Number(usdt?.available || 0);

  const submit = async (e) => {
    e.preventDefault();
    setDone('');
    if (!getToken()) {
      navigate('/login');
      return;
    }
    setBusy(true);
    try {
      const res = await api.post('/withdrawals', {
        asset: 'USDT',
        network,
        to_address: toAddress.trim(),
        amount: Number(amount),
      });
      setDone(res.withdrawal ? `Retiro registrado (${res.withdrawal.id})`.replace(/\s+/g, ' ') : 'Retiro registrado.');
      setAmount('');
      setToAddress('');
      balanceRefresh(true);
    } catch (err) {
      setDone('');
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="wallet-stack" onSubmit={submit}>
      <div className="retire-card" style={{ marginTop: 0 }}>
        <div className="retire-title">
          <Icon name="upload" />
          <span>Retirar USDT</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="field">
            <span className="field-label">Red</span>
            <div className="net-select">
              {NETWORKS.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`net-opt ${network === n.id ? 'active' : ''}`}
                  onClick={() => setNetwork(n.id)}
                >
                  <span className="trx-dot">
                    <img className="token-ic net" src={NET_ICON[n.id]} alt={n.id} />
                  </span>
                  <span>{n.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field-label">Dirección de destino ({network === 'tron' ? 'TRC20' : 'BEP20'})</span>
            <div className="input-wrap">
              <input
                type="text"
                placeholder="T… o 0x…"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                autoComplete="off"
                spellCheck="false"
              />
            </div>
          </div>

          <div className="field">
            <span className="field-label">Monto (USDT)</span>
            <div className="input-wrap">
              <input
                type="number"
                placeholder="0.00"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button type="button" className="max-btn" onClick={() => setAmount(String(available))} disabled={available <= 0}>
                MÁX
              </button>
            </div>
          </div>

          <div className="fee-row">
            <span>Disponible</span>
            <span className="mono">{formatUSDT(available)}</span>
          </div>
          <div className="fee-row">
            <span>Comisión</span>
            <span className="mono">0.00 USDT</span>
          </div>
          <div className="fee-row">
            <span>Mínimo</span>
            <span className="mono">1.00 USDT</span>
          </div>

          <button type="submit" className="btn btn-primary btn-block confirm-btn" disabled={busy}>
            {busy ? 'Procesando…' : 'Confirmar Retiro'}
          </button>
        </div>
      </div>

      {done && <p className="w-done">{done}</p>}
    </form>
  );
}

function Actividad({ deposits, withdrawals }) {
  const items = [
    ...deposits.map((d) => ({ id: d.id, kind: 'deposit', status: d.status, amount: Number(d.amount), date: d.created_at, addr: d.address })),
    ...withdrawals.map((w) => ({ id: w.id, kind: 'withdrawal', status: w.status, amount: Number(w.amount), date: w.created_at, addr: w.to_address })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (items.length === 0) {
    return <p className="empty">Todavía no hay movimientos.</p>;
  }

  return (
    <div className="activity">
      {items.map((it) => {
        const chip = statusChip(it.status);
        const isIn = it.kind === 'deposit';
        return (
          <div key={`${it.kind}-${it.id}`} className="act-item">
            <div className="act-left">
              <div className={`act-icon ${isIn ? 'in' : 'out'}`}>
                <Icon name={isIn ? 'arrow_downward' : 'arrow_upward'} />
              </div>
              <div>
                <div className="act-id">{isIn ? 'Depósito' : 'Retiro'}: #{it.id}</div>
                <div className="act-date" style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {timeAgo(it.date)} · {it.addr}
                </div>
              </div>
            </div>
            <div className="act-right">
              <span className={`act-amount ${isIn ? 'pos' : ''}`}>
                {isIn ? '+' : '-'}
                {Number(it.amount).toLocaleString('de-DE')} USDT
              </span>
              <span className={`act-status ${chip.ok ? 'ok' : chip.pend ? 'pend' : 'fail'}`}>
                <Icon name={chip.ok ? 'check_circle' : chip.pend ? 'pending' : 'error'} filled={chip.ok} />
                {chip.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- página ----

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: 'account_balance_wallet' },
  { id: 'depositar', label: 'Ingresar', icon: 'qr_code' },
  { id: 'retirar', label: 'Retirar', icon: 'upload' },
  { id: 'actividad', label: 'Actividad', icon: 'history' },
];

export default function Wallet() {
  const [sp, setSp] = useSearchParams();
  const tab = TABS.some((t) => t.id === sp.get('tab')) ? sp.get('tab') : 'resumen';
  const { byAsset, refresh: balanceRefresh } = useBalance(15000);

  const [wallets, setWallets] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [rate, setRate] = useState(0);

  useEffect(() => {
    if (!getToken()) return;
    api
      .get('/wallets')
      .then((res) => setWallets(res.wallets || []))
      .catch(() => {});
    api
      .get('/deposits')
      .then((res) => setDeposits(res.deposits || []))
      .catch(() => {});
    api
      .get('/withdrawals')
      .then((res) => setWithdrawals(res.withdrawals || []))
      .catch(() => {});
    api
      .get('/market/stats')
      .then((res) => Number(res.referenceRate) > 0 && setRate(Number(res.referenceRate)))
      .catch(() => {});
  }, []);

  const usdt = byAsset('USDT');
  const usdtLocked = Number(usdt?.locked || 0);

  return (
    <>
      <TopBar />
      <main className="app-shell page">
        <h1 className="section-title" style={{ paddingTop: '1.5rem' }}>
          Mi Billetera
        </h1>

        <div className="wallet-tabs">
          {TABS.map((t) => (
            <button key={t.id} className={`wt ${tab === t.id ? 'active' : ''}`} onClick={() => setSp({ tab: t.id }) }>
              <Icon name={t.icon} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {tab === 'resumen' && <Resumen usdt={usdt} usdtLocked={usdtLocked} rate={rate} />}
        {tab === 'depositar' && <Depositar wallets={wallets} deposits={deposits} />}
        {tab === 'retirar' && <Retirar usdt={usdt} balanceRefresh={balanceRefresh} />}
        {tab === 'actividad' && <Actividad deposits={deposits} withdrawals={withdrawals} />}
      </main>
      <BottomNav />
    </>
  );
}