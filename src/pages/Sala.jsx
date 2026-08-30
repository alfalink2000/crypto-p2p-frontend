import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import TopBar from '../components/TopBar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { api, getToken } from '../api/client.js';
import { deal as mockDeal, messages as mockMessages } from '../data/mock.js';
import { formatCUP, formatRate, formatClock, pad, countdown } from '../lib/format.js';

import Icon from '../components/Icon.jsx';

function useTimer(ms) {
  const [left, setLeft] = useState({ h: 1, m: 59, s: 45 });
  useEffect(() => {
    const end = Date.now() + ms;
    const t = setInterval(() => {
      const diff = end - Date.now();
      if (diff <= 0) return setLeft({ h: 0, m: 0, s: 0 });
      const s = Math.floor(diff / 1000);
      setLeft({ h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 });
    }, 1000);
    return () => clearInterval(t);
  }, [ms]);
  return left;
}

function myUserId() {
  try {
    return JSON.parse(localStorage.getItem('crypto_p2p_user') || 'null')?.id;
  } catch {
    return null;
  }
}

function tlState(status) {
  if (status === 'COMPLETED') return { active: 4 };
  if (status === 'DISPUTED') return { active: 3, dispute: true };
  if (status === 'CANCELLED') return { active: 0, cancelled: true };
  if (status === 'PENDING_CONFIRMATION') return { active: 2 };
  return { active: 1 };
}

const steps = [
  { icon: 'check', label: 'Inicio' },
  { icon: 'lock', label: 'USDT\nCongelado' },
  { icon: 'circle', label: 'Pago\nEnviado' },
  { icon: 'receipt', label: 'Pago\nRecibido' },
  { icon: 'lock_open', label: 'Liberado' },
];

export default function Sala() {
  const { dealId } = useParams();
  const [live, setLive] = useState(null); // datos API (deal, partner, messages, proofs, payment_target)
  const [demo, setDemo] = useState(true);
  const [role, setRole] = useState('COMPRADOR');
  const [list, setList] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState('');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);
  const endRef = useRef(null);
  const t = useTimer(2 * 60 * 60 * 1000);

  const deal = live ? live.deal : mockDeal;

  const reload = (silent = false) => {
    if (silent) setBusy('');
    api
      .get(`/deals/${dealId}`)
      .then((res) => {
        setLive(res);
        setList(res.messages || []);
        setDemo(false);
      })
      .catch(() => {
        setList(mockMessages);
        setDemo(true);
      });
  };

  useEffect(() => {
    reload(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [list, live]);

  const status = live ? deal.status : demo ? (role === 'VENDEDOR' ? 'FROZEN' : 'PENDING_CONFIRMATION') : deal.status;
  const isSeller = live ? deal.my_side === 'SELL' : demo && role === 'VENDEDOR';

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!demo) {
      api.post(`/deals/${dealId}/messages`, { content: text.trim() }).then(() => reload()).catch(() => reload());
    } else {
      setList((l) => [...l, { id: Date.now(), from: 'me', name: 'Tú', text: text.trim(), at: 'ahora' }]);
    }
    setText('');
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !getToken()) return;
    setBusy('proof');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
      api
        .upload(`/deals/${dealId}/proof`, { data: base64, mime: file.type })
        .then(() => reload())
        .catch((err) => alert(err.message))
        .finally(() => setBusy(''));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const act = (name, path) => {
    setBusy(name);
    api
      .post(`/deals/${dealId}${path}`, {})
      .then(() => reload())
      .catch((err) => alert(err.message))
      .finally(() => setBusy(''));
  };

  const copyAccount = () => {
    const acc = live ? live.payment_target?.account : mockDeal.partner.accountName;
    if (navigator.clipboard) navigator.clipboard.writeText(acc || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const payment = live
    ? live.payment_target || { method: deal.method, holder: live.partner?.full_name, account: '' }
    : {
        method: mockDeal.method,
        holder: mockDeal.partner.accountName,
        account: mockDeal.partner.paymentMethod,
      };

  const amount = Number(deal.amount);
  const rate = Number(deal.rate);
  const fiat = live ? deal.fiat_total : mockDeal.fiatTotal || amount * rate;

  const tls = tlState(status);
  const activeIdx = tls.active;

  const renderMsg = (m) => {
    if (live && m.sender_id == null) {
      return (
        <div key={m.id} className="msg-sys ok">
          <div className="bubble-sys">
            <Icon name="check_circle" />
            <span>{m.content}</span>
          </div>
        </div>
      );
    }
    if (!live && m.from === 'system') {
      return (
        <div key={m.id} className="msg-sys ok">
          <div className="bubble-sys">
            <Icon name="check_circle" />
            <span>{m.text}</span>
          </div>
        </div>
      );
    }
    const me = live ? m.sender_id === myUserId() : m.from === 'me';
    const name = live ? m.sender_name : m.name;
    const at = formatClock(m.created_at) || m.at || '';
    return (
      <div key={m.id} className={`msg-row ${me ? 'me' : ''}`} style={{ justifyContent: me ? 'flex-end' : 'flex-start' }}>
        {!me && (
          <div className="avatar-xs">{name ? name[0].toUpperCase() : 'C'}</div>
        )}
        <div className="msg-body">
          {!me && (
            <div className="msg-meta">
              <span className="name">{name}</span>
            </div>
          )}
          <div className={`bubble ${me ? 'me' : 'them'}`}>
            <p>{(live ? m.content : m.text) || m.content}</p>
            {m.proof && (
              <div className="att">
                <span className="att-thumb" />
                <div>
                  <b>{m.proof.name || m.proof}</b>
                  <small>{m.proofMeta || ''}</small>
                </div>
              </div>
            )}
          </div>
          <div className="msg-meta" style={{ justifyContent: me ? 'flex-end' : 'flex-start' }}>
            <span className="time">{at}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <TopBar />
      <main className="app-shell sala-page" style={{ paddingBottom: demo || live ? 0 : '6rem' }}>
        <div className="sala-sticky">
          <div className="sala-head-row">
            <div>
              <h1 className="sala-title">Operación #{deal.code || deal.id}</h1>
              <div className="sala-sub">
                <span className="escrow-pill">
                  {status === 'COMPLETED' ? 'Completado' : status === 'CANCELLED' ? 'Cancelado' : status === 'DISPUTED' ? 'En disputa' : 'Escrow Activo'}
                </span>
                {status !== 'COMPLETED' && status !== 'CANCELLED' && (
                  <span className="countdown">
                    <Icon name="schedule" />
                    <span className="animate-pulse">
                      {pad(t.h)}:{pad(t.m)}:{pad(t.s)}
                    </span>
                  </span>
                )}
              </div>
            </div>
            {demo && (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  height: 40,
                  background: 'var(--surface-high)',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: '0.75rem',
                  color: 'var(--on-surface)',
                  fontSize: 12,
                  padding: '0 0.5rem',
                }}
                aria-label="Rol de demostración"
              >
                <option>COMPRADOR</option>
                <option>VENDEDOR</option>
              </select>
            )}
            <button className="help-btn" aria-label="Ayuda">
              <Icon name="help" />
            </button>
          </div>
          <div className="protect-banner">
            <Icon name="verified_user" filled />
            <span>Tus fondos están protegidos en Escrow</span>
          </div>
        </div>

        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!isSeller && status === 'FROZEN' && (
            <div className="info-banner">
              <Icon name="info" />
              <span>CambioYA nunca te pedirá tu contraseña ni códigos de verificación por este chat.</span>
            </div>
          )}

          {/* timeline */}
          <div className="tl-h">
            {steps.map((s, i) => (
              <div key={s.icon + i} style={{ display: 'contents' }}>
                {i > 0 && (
                  <div
                    className={`tl-fill ${i <= activeIdx ? 'done' : i === activeIdx + 1 ? 'partial' : ''}`}
                    style={i === activeIdx + 1 ? { background: 'rgba(63, 229, 108, 0.3)' } : undefined}
                  />
                )}
                <div className="tl-step">
                  <div className={`tl-dot ${i < activeIdx ? 'done' : ''} ${i === activeIdx && !tls.dispute ? 'current' : ''}`}>
                    {i < activeIdx ? <Icon name="check" /> : s.icon === 'circle' ? <span /> : <Icon name={s.icon} />}
                  </div>
                  <span className={`tl-label ${i <= activeIdx ? 'on' : ''}`}>{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          {tls.cancelled && (
            <div className="msg-sys ok">
              <div className="bubble-sys">
                <Icon name="info" />
                <span>Operación cancelada. El USDT fue devuelto al vendedor.</span>
              </div>
            </div>
          )}

          {tls.dispute && (
            <div className="msg-sys">
              <div className="bubble-sys">
                <Icon name="warning" />
                <span>Disputa abierta. Un mediador de CambioYA revisará la operación.</span>
              </div>
            </div>
          )}

          {/* tarjeta de pago */}
          {(status === 'FROZEN' || status === 'PENDING_CONFIRMATION') && (
            <div className="pay-card">
              <div className="pay-top">
                <div>
                  <span className="pay-label">Monto a pagar</span>
                  <div className="pay-amount">{formatCUP(fiat)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="pay-label">Tasa</span>
                  <div className="pay-rate">{rate.toFixed(2)}</div>
                </div>
              </div>
              <div className="pay-box">
                <div className="pay-bank">
                  <Icon name="account_balance" />
                  <span>{payment.method}</span>
                </div>
                <div>
                  <span className="pay-field-label">Titular</span>
                  <div className="pay-value">{payment.holder}</div>
                </div>
                <div>
                  <span className="pay-field-label">Número de Tarjeta / Cuenta</span>
                  <div className="pay-copy-row">
                    <span className="pay-value">{payment.account}</span>
                    <button className="copy-btn" onClick={copyAccount} aria-label="Copiar">
                      <Icon name={copied ? 'check' : 'content_copy'} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="pay-warning">
                <Icon name="warning" />
                <p>
                  Por tu seguridad, asegúrate de que el nombre del titular coincida exactamente en tu aplicación
                  bancaria antes de transferir.
                </p>
              </div>
            </div>
          )}

          {/* chat */}
          <div className="chat" style={{ margin: '0 -1rem' }}>
            <div className="chat-day">
              <span>Hoy</span>
            </div>
            {list.map(renderMsg)}
            <div ref={endRef} />
          </div>
        </div>

        {/* zona fija de acciones + mensajes */}
        {(status === 'FROZEN' || status === 'PENDING_CONFIRMATION') && (
          <div className="sala-fixed">
            <form className="composer" onSubmit={send}>
              <button type="button" className="attach-btn" onClick={() => fileRef.current?.click()} aria-label="Adjuntar">
                +
              </button>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje…" />
              <button type="submit" className="send-btn" disabled={!text.trim() || busy === 'send' || !demo && myUserId() == null}>
                <Icon name="send" />
              </button>
              <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" ref={fileRef} hidden onChange={onFile} />
            </form>

            <div className="sala-actions">
              {status === 'FROZEN' ? (
                !isSeller ? (
                  <>
                    <button className="btn btn-primary btn-block" onClick={() => fileRef.current?.click()} disabled={!!busy && busy !== 'proof'}>
                      <Icon name="upload_file" />
                      <span>{busy === 'proof' ? 'Subiendo…' : 'Subir comprobante'}</span>
                    </button>
                    <button className="btn btn-ghost btn-block" onClick={() => act('dispute', '/dispute')} disabled={!!busy}>
                      <span>Problemas con el pago (Abrir disputa)</span>
                    </button>
                  </>
                ) : (
                  <>
                    <p className="center txt-muted" style={{ fontSize: 14, margin: 0 }}>
                      El comprador aún no paga. Cuando lo haga, verifica en <b>tu</b> app del banco; las capturas aquí son
                      solo evidencia, no confirmación.
                    </p>
                    <button className="btn btn-ghost btn-block" disabled={!!busy} onClick={() => act('cancel', '/cancel')} style={{ color: 'var(--error)' }}>
                      Cancelar operación
                    </button>
                  </>
                )
              ) : !isSeller ? (
                <>
                  <div className="btn btn-disabled-state btn-block">
                    <Icon name="check_circle" />
                    <span>Pago Realizado</span>
                  </div>
                  <p className="note-under">El vendedor tiene un tiempo límite para liberar los fondos.</p>
                  <button className="btn btn-ghost btn-block" onClick={() => act('dispute', '/dispute')} disabled={!!busy}>
                    El vendedor no confirma (Abrir disputa)
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-primary btn-block" onClick={() => act('release', '/confirm-received')} disabled={!!busy}>
                    <Icon name="verified" />
                    <span>{busy === 'release' ? 'Confirmando…' : 'Confirmo que recibí el pago'}</span>
                  </button>
                  <button className="btn btn-ghost btn-block" onClick={() => act('dispute', '/dispute')} disabled={!!busy} style={{ color: 'var(--error)' }}>
                    Abrir disputa
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {status === 'COMPLETED' && (
          <div className="sala-fixed">
            <div className="btn btn-disabled-state btn-block">
              <Icon name="task_alt" />
              <span>Operación completada</span>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}