import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import TopBar from '../components/TopBar.jsx';
import { api } from '../api/client.js';
import { logout } from '../store/slices/authSlice.js';
import { formatCUP, timeAgo, formatClock } from '../lib/format.js';
import { formatUSDT } from '../lib/format.js';

import Icon from '../components/Icon.jsx';

const TABS = [
  { id: 'dashboard', label: 'Resumen', icon: 'monitoring' },
  { id: 'users', label: 'Usuarios', icon: 'person_search' },
  { id: 'deposits', label: 'Depósitos', icon: 'download' },
  { id: 'withdrawals', label: 'Retiros', icon: 'upload' },
  { id: 'disputes', label: 'Disputas', icon: 'warning' },
];

function Stat({ label, value, sub, icon, accent }) {
  return (
    <div className="adm-stat">
      <div className="adm-stat-head">
        <span className="adm-stat-ic" style={accent ? { color: accent } : undefined}>
          <Icon name={icon} />
        </span>
        <span className="mono adm-stat-value">{value}</span>
      </div>
      <div className="adm-stat-label">{label}</div>
      {sub && <div className="adm-stat-sub">{sub}</div>}
    </div>
  );
}

function Dashboard({ stats }) {
  return (
    <div className="adm-stats">
      <Stat icon="group" label="Usuarios" value={stats?.users ?? '—'} sub={`+${stats?.users24h ?? '—'} en 24h`} />
      <Stat icon="verified_user" label="Anuncios activos" value={stats?.activeAds ?? '—'} accent="var(--primary)" />
      <Stat icon="receipt_long" label="Operaciones abiertas" value={stats?.openDeals ?? '—'} sub={`${stats?.disputed ?? '—'} en disputa`} accent="var(--secondary)" />
      <Stat icon="trending_up" label="Completadas 24h" value={stats?.completed24h ?? '—'} accent="var(--primary)" />
      <Stat icon="swap_horiz" label="Volumen 24h" value={stats?.volume24h != null ? `${Math.round(stats.volume24h).toLocaleString('de-DE')}` : '—'} sub="USDT" accent="var(--primary)" />
      <Stat icon="download" label="Depósitos pend." value={stats?.pendingDeposits ?? '—'} accent="var(--tertiary-container)" />
      <Stat icon="upload" label="Retiros pend." value={stats?.pendingWithdrawals ?? '—'} accent="var(--tertiary-container)" />
      <Stat icon="error" label="Reportes abiertos" value={stats?.openReports ?? '—'} accent="var(--error)" />
    </div>
  );
}

function kycChip(s) {
  const map = {
    approved: { cls: 'ok', label: 'Aprobado' },
    pending: { cls: 'pend', label: 'Pendiente' },
    rejected: { cls: 'fail', label: 'Rechazado' },
    none: { cls: 'fail', label: 'Sin KYC' },
  };
  return map[s] || { cls: 'fail', label: s };
}

function Users({ users, onSelect, selected, refresh }) {
  const [q, setQ] = useState('');
  const filtered = users.filter((u) => (u.email + (u.full_name || '')).toLowerCase().includes(q.toLowerCase()));
  const sel = selected ? users.find((u) => u.id === selected) : null;
  return (
    <div className="adm-col">
      <div className="input-wrap adm-search">
        <Icon name="search" size={18} />
        <input placeholder="Buscar por email o nombre…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {selected && sel && (
        <UserDetail
          user={sel}
          refresh={refresh}
          onClose={() => onSelect(null)}
          bal={null}
        />
      )}
      <div className="adm-list">
        {filtered.map((u) => {
          const k = kycChip(u.kyc_status);
          return (
            <button key={u.id} className={`adm-row ${selected === u.id ? 'sel' : ''}`} onClick={() => onSelect(u.id)}>
              <div className="adm-row-main">
                <div className="deal-avatar">{((u.full_name || u.email) || '?')[0].toUpperCase()}</div>
                <div className="adm-row-info">
                  <div className="adm-row-name">
                    {u.full_name || u.email}
                    {u.role === 'admin' && <span className="adm-role">ADMIN</span>}
                  </div>
                  <div className="deal-sub">{u.email}</div>
                </div>
              </div>
              <div className="adm-row-right">
                <span className={`d-status ${u.status === 'suspended' ? 'disputed' : 'done'}`}>
                  <Icon name={u.status === 'suspended' ? 'block' : 'check_circle'} filled={u.status !== 'suspended'} />
                  {u.status === 'suspended' ? 'Suspendido' : 'Activo'}
                </span>
                <span className={`d-status ${k.cls}`}>{k.label}</span>
                <Icon name="chevron_right" />
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && <p className="empty">Sin resultados</p>}
      </div>
    </div>
  );
}

function UserDetail({ user, refresh, onClose }) {
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState('');
  const [credit, setCredit] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    let alive = true;
    api.get(`/admin/users/${user.id}`).then((res) => alive && setDetail(res));
    return () => {
      alive = false;
    };
  }, [user.id]);

  const act = async (name, fn) => {
    setBusy(name);
    try {
      await fn();
      refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy('');
    }
  };

  const doCredit = async (e) => {
    e.preventDefault();
    const amount = Number(credit);
    if (!(amount > 0)) return;
    await act('credit', async () => {
      await api.post('/admin/balances/manual', { user_id: user.id, asset: 'USDT', amount, note });
      setCredit('');
      setNote('');
    });
  };

  const k = kycChip(user.kyc_status);

  return (
    <div className="adm-detail">
      <div className="adm-detail-head">
        <div>
          <div className="adm-detail-name">{user.full_name || 'Sin nombre'}</div>
          <div className="deal-sub">{user.email}</div>
        </div>
        <button className="copy-btn" onClick={onClose} aria-label="Cerrar">
          <Icon name="close" />
        </button>
      </div>

      <div className="adm-detail-grid">
        <div className="adm-badge">ID: {user.id.slice(0, 8)}…</div>
        <span className={`d-status ${k.cls}`}>{k.label}</span>
        <span className={`d-status ${user.status === 'suspended' ? 'disputed' : 'done'}`}>
          {user.status === 'suspended' ? 'Suspendido' : 'Activo'}
        </span>
      </div>

      <div className="adm-lists">
        <div>
          <div className="adm-sub">Saldos</div>
          {(detail?.balances || []).length === 0 && <p className="empty">Sin saldos</p>}
          {(detail?.balances || []).map((b) => (
            <div key={b.asset} className="fee-row">
              <span className="mono">{b.asset}</span>
              <span className="mono">
                {Number(b.available).toLocaleString('de-DE', { maximumFractionDigits: 6 })} disp
                {Number(b.locked) > 0 && ` / ${Number(b.locked).toLocaleString('de-DE', { maximumFractionDigits: 6 })} escrow`}
              </span>
            </div>
          ))}
        </div>
        <div>
          <div className="adm-sub">Billeteras</div>
          {(detail?.wallets || []).length === 0 && <p className="empty">Sin direcciones</p>}
          {(detail?.wallets || []).map((w) => (
            <div key={`${w.network}-${w.asset}`} className="fee-row">
              <span className="mono">{w.network.toUpperCase()}</span>
              <span className="mono">{w.address}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="adm-actions">
        {user.kyc_status !== 'approved' ? (
          <button className="btn btn-small ok" disabled={busy === 'kyc'} onClick={() => act('kyc', () => api.post(`/admin/users/${user.id}/kyc`, { status: 'approved' }))}>
            <Icon name="verified_user" /> Aprobar KYC
          </button>
        ) : (
          <button className="btn btn-small" disabled={busy === 'kyc'} onClick={() => act('kyc', () => api.post(`/admin/users/${user.id}/kyc`, { status: 'pending' }))}>
            <Icon name="badge" /> Quitar KYC
          </button>
        )}
        {user.status !== 'suspended' ? (
          <button className="btn btn-small danger" disabled={busy === 'sus'} onClick={() => act('sus', () => api.post(`/admin/users/${user.id}/status`, { status: 'suspended' }))}>
            <Icon name="block" /> Suspender
          </button>
        ) : (
          <button className="btn btn-small ok" disabled={busy === 'sus'} onClick={() => act('sus', () => api.post(`/admin/users/${user.id}/status`, { status: 'active' }))}>
            <Icon name="check_circle" filled /> Reactivar
          </button>
        )}
      </div>

      <form className="adm-credit" onSubmit={doCredit}>
        <div className="field">
          <span className="field-label">Acreditar USDT manualmente</span>
          <div className="input-wrap">
            <input type="number" min="0.000001" step="any" placeholder="0.00" value={credit} onChange={(e) => setCredit(e.target.value)} />
            <button type="submit" className="max-btn" disabled={busy === 'credit' || !(Number(credit) > 0)}>
              ACREDITAR
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

const DEP_ST = { pending: 'Pendiente', confirmed: 'Confirmado', failed: 'Fallido' };
const WDR_ST = { pending: 'Pendiente', processing: 'Procesando', completed: 'Completado', failed: 'Fallido', refunded: 'Reembolsado' };

function Deposits({ deposits }) {
  return (
    <div className="adm-list">
      {deposits.map((d) => (
        <div key={d.id} className="adm-row">
          <div className="adm-row-main">
            <div className="act-icon in">
              <Icon name="arrow_downward" />
            </div>
            <div className="adm-row-info">
              <div className="adm-row-name">{d.email}</div>
              <div className="deal-sub">#{d.id.slice(0, 8)} · {d.network} · {timeAgo(d.created_at)}</div>
            </div>
          </div>
          <div className="adm-row-right">
            <span className="mono adm-amt">+{Number(d.amount).toLocaleString('de-DE', { maximumFractionDigits: 4 })} {d.asset}</span>
            <span className={`d-status ${d.status === 'confirmed' ? 'done' : d.status === 'pending' ? 'pending' : 'cancelled'}`}>
              {DEP_ST[d.status] || d.status}
            </span>
          </div>
        </div>
      ))}
      {deposits.length === 0 && <p className="empty">Sin depósitos</p>}
    </div>
  );
}

function Withdrawals({ withdrawals, refresh }) {
  const [busy, setBusy] = useState('');
  const proc = async (id) => {
    setBusy(id);
    try {
      await api.post(`/admin/withdrawals/${id}/process`, {});
      refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy('');
    }
  };
  return (
    <div className="adm-list">
      {withdrawals.map((w) => (
        <div key={w.id} className="adm-row">
          <div className="adm-row-main">
            <div className="act-icon out">
              <Icon name="arrow_upward" />
            </div>
            <div className="adm-row-info">
              <div className="adm-row-name">{w.email}</div>
              <div className="deal-sub">#{w.id.slice(0, 8)} · {w.network} · {timeAgo(w.created_at)}</div>
            </div>
          </div>
          <div className="adm-row-right">
            <span className="mono adm-amt">−{Number(w.amount).toLocaleString('de-DE', { maximumFractionDigits: 4 })} {w.asset}</span>
            <span className={`d-status ${w.status === 'completed' ? 'done' : w.status === 'pending' || w.status === 'processing' ? 'pending' : 'cancelled'}`}>
              {WDR_ST[w.status] || w.status}
            </span>
            {w.status === 'pending' && (
              <button className="btn btn-small ok" disabled={busy === w.id} onClick={() => proc(w.id)}>
                <Icon name="send" /> Procesar
              </button>
            )}
          </div>
        </div>
      ))}
      {withdrawals.length === 0 && <p className="empty">Sin retiros</p>}
    </div>
  );
}

function Disputes({ deals, reports, refresh }) {
  const [busy, setBusy] = useState('');
  const resolved = async (id, outcome) => {
    setBusy(`${id}-${outcome}`);
    try {
      await api.post(`/admin/deals/${id}/resolve`, { outcome });
      refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy('');
    }
  };
  const disputed = deals.filter((d) => d.status === 'DISPUTED');
  const open = reports.filter((r) => r.status === 'open');

  return (
    <div className="adm-col">
      <div className="adm-sub">Operaciones en disputa</div>
      {disputed.length === 0 && <p className="empty">Sin disputas abiertas</p>}
      {disputed.map((d) => (
        <div key={d.id} className="adm-detail adm-dispute">
          <div className="adm-detail-head">
            <div>
              <div className="adm-detail-name">{d.code || d.id}</div>
              <div className="deal-sub">
                {Number(d.amount).toLocaleString('de-DE', { maximumFractionDigits: 4 })} {d.asset} ·{formatCUP(d.fiat_total)} · {d.method}
              </div>
              <div className="deal-sub">{d.seller_email} → {d.buyer_email}</div>
            </div>
            <span className="d-status disputed">
              <Icon name="warning" /> En disputa
            </span>
          </div>
          <div className="adm-actions">
            <button className="btn btn-small ok" disabled={busy === `${d.id}-release_to_buyer`} onClick={() => resolved(d.id, 'release_to_buyer')}>
              <Icon name="verified_user" /> Liberar al comprador
            </button>
            <button className="btn btn-small" disabled={busy === `${d.id}-refund_seller`} onClick={() => resolved(d.id, 'refund_seller')}>
              <Icon name="lock_open" /> Devolver al vendedor
            </button>
          </div>
        </div>
      ))}

      <div className="adm-sub" style={{ marginTop: '1rem' }}>Reportes abiertos</div>
      {open.length === 0 && <p className="empty">Sin reportes abiertos</p>}
      <div className="adm-list">
        {open.map((r) => (
          <div key={r.id} className="adm-row">
            <div className="adm-row-main">
              <div className="act-icon pend">
                <Icon name="error" />
              </div>
              <div className="adm-row-info">
                <div className="adm-row-name">{r.reason}</div>
                <div className="deal-sub">{r.reporter_email} reportó a {r.target_email} · {timeAgo(r.created_at)}</div>
              </div>
            </div>
            <span className="d-status pend">Abierto</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [deals, setDeals] = useState([]);
  const [reports, setReports] = useState([]);
  const [sel, setSel] = useState(null);

  const load = () => {
    api.get('/admin/stats').then((res) => setStats(res)).catch(() => {});
    api.get('/admin/users').then((res) => setUsers(res.users || [])).catch(() => {});
    api.get('/admin/deposits').then((res) => setDeposits(res.deposits || [])).catch(() => {});
    api.get('/admin/withdrawals').then((res) => setWithdrawals(res.withdrawals || [])).catch(() => {});
    api.get('/admin/deals').then((res) => setDeals(res.deals || [])).catch(() => {});
    api.get('/admin/reports').then((res) => setReports(res.reports || [])).catch(() => {});
  };

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate(user ? '/' : '/login', { replace: true });
      return;
    }
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (user?.role !== 'admin') return null;

  return (
    <>
      <TopBar />
      <main className="app-shell page admin">
        <div className="admin-head">
          <div>
            <h1 className="section-title" style={{ paddingTop: '1.5rem', margin: 0 }}>
              Panel de Admin
            </h1>
            <p className="deal-sub">Gestión de la plataforma</p>
          </div>
          <button className="copy-btn" onClick={() => dispatch(logout())} aria-label="Cerrar sesión">
            <Icon name="logout" />
          </button>
        </div>

        <div className="wallet-tabs admin-tabs">
          {TABS.map((t) => (
            <button key={t.id} className={`wt ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <Icon name={t.icon} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {tab === 'dashboard' && <Dashboard stats={stats} />}
        {tab === 'users' && <Users users={users} selected={sel} onSelect={setSel} refresh={load} />}
        {tab === 'deposits' && <Deposits deposits={deposits} />}
        {tab === 'withdrawals' && <Withdrawals withdrawals={withdrawals} refresh={load} />}
        {tab === 'disputes' && <Disputes deals={deals} reports={reports} refresh={load} />}
      </main>
    </>
  );
}