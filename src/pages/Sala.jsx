import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import TopNav from '../components/TopNav.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { api, getToken } from '../api/client.js';
import { deal as mockDeal, dealTimeline, messages as mockMessages } from '../data/mock.js';
import { formatUSDT, formatCUP, formatRate, formatClock, pad, countdown } from '../lib/format.js';

function useTimer(ms) {
  const [left, setLeft] = useState(countdown(new Date(Date.now() + ms).toISOString()));
  useEffect(() => {
    const t = setInterval(() => {
      setLeft(countdown(new Date(Date.now() + ms).toISOString()));
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

function buildTimeline(t) {
  const at = (ts) => formatClock(ts);
  const items = [{ key: 'created', label: 'Operación creada', at: at(t.created_at), done: true }];
  if (t.paid_at) {
    items.push({
      key: 'paid',
      label: t.my_side === 'SELL' ? 'El comprador pagó' : `Pagaste ${formatCUP(t.fiat_total)}`,
      at: at(t.paid_at),
      done: true,
      current: t.status === 'PENDING_CONFIRMATION',
    });
  } else {
    items.push({ key: 'paid', label: 'Esperando tu pago', at: '', done: false });
  }
  if (t.status === 'COMPLETED') {
    items.push({ key: 'released', label: 'Vendedor confirmó: USDT liberado', at: at(t.confirmed_at), done: true });
    items.push({ key: 'complete', label: 'Operación completada', at: at(t.confirmed_at), done: true });
  } else if (t.status === 'DISPUTED') {
    items.push({ key: 'released', label: 'Disputa abierta · revisa soporte', at: at(t.disputed_at), done: true });
  } else if (t.status === 'CANCELLED') {
    items.push({ key: 'released', label: 'Cancelada · fondos devueltos', at: at(t.cancelled_at), done: true });
  } else {
    items.push({ key: 'released', label: 'Vendedor confirma en su app', at: '', done: false });
  }
  return items;
}

export default function Sala() {
  const { dealId } = useParams();
  const [live, setLive] = useState(null); // datos reales de la API
  const [demo, setDemo] = useState(true);
  const [role, setRole] = useState('COMPRADOR');
  const [list, setList] = useState(mockMessages);
  const [text, setText] = useState('');
  const [released, setReleased] = useState(false);
  const [justPaid, setJustPaid] = useState(false);
  const [busy, setBusy] = useState('');
  const fileRef = useRef(null);
  const endRef = useRef(null);
  const t = useTimer(2 * 60 * 60 * 1000);

  const reload = (silent = false) => {
    if (silent) setBusy('');
    api
      .get(`/deals/${dealId}`)
      .then((res) => {
        setLive(res);
        setList(res.messages);
        setDemo(false);
      })
      .catch(() => {
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

  // ---------- acciones ----------
  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy('send');
    if (!demo) {
      api
        .post(`/deals/${dealId}/messages`, { content: text.trim() })
        .then(() => reload())
        .catch(() => reload());
    } else {
      setList([...list, { id: Date.now(), from: 'me', name: 'Tú', text: text.trim(), at: 'ahora' }]);
    }
    setText('');
    setBusy('');
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !getToken()) return;
    setBusy('proof');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const comma = dataUrl.indexOf(',');
      const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
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

  const partnerName = () =>
    live ? live.partner.full_name || 'Contraparte' : 'Carlos M.';
  const payment = () =>
    live
      ? live.payment_target
      : {
          method: 'Transfermóvil',
          holder: 'Carlos Manuel Ortega Prieto',
          account: mockDeal.partner.phone,
          phone: mockDeal.partner.phone,
        };

  // ---------- render ----------
  const isSeller = live
    ? live.deal.my_side === 'SELL'
    : demo && role === 'VENDEDOR';
  const status = live ? live.deal.status : released ? 'COMPLETED' : justPaid || demo ? 'PENDING_CONFIRMATION' : 'FROZEN';
  const code = live ? live.deal.code : mockDeal.id;
  const amount = live ? live.deal.amount : mockDeal.amount;
  const rate = live ? live.deal.rate : mockDeal.rate;
  const method = live ? live.deal.method : mockDeal.method;
  const timeline = live ? buildTimeline(live.deal) : dealTimeline;
  const p = payment();

  return (
    <div className="page sala">
      <TopNav />

      <div className="sala-head">
        <div className="sala-head-row">
          <Link to="/mercado" className="back">
            ←
          </Link>
          <div>
            <b>Operación #{code}</b>
            <p className="muted small">
              {amount} USDT a {formatRate(rate)} · {method}
            </p>
          </div>
          <StatusBadge status={status} />
          {demo && (
            <select className="role-switch" value={role} onChange={(e) => setRole(e.target.value)}>
              <option>COMPRADOR</option>
              <option>VENDEDOR</option>
            </select>
          )}
        </div>

        <div className="escrow-strip">
          <span className="dot-pulse" />
          Escrow activo: el USDT del vendedor está congelado. Nada se libera por captura: solo la
          confirmación del vendedor en su app del banco.
        </div>

        {(status === 'FROZEN' || status === 'PENDING_CONFIRMATION') && (
          <div className={`timer ${t.h === 0 && t.m <= 5 ? 'timer-warn' : ''}`}>
            <span className="muted small">Tiempo límite para esta etapa</span>
            <strong>
              {pad(t.h)}:{pad(t.m)}:{pad(t.s)}
            </strong>
          </div>
        )}
      </div>

      <div className="sala-body">
        <div className="timeline">
          {timeline.map((s) => (
            <div key={s.key} className={`tl-item ${s.done ? 'tl-done' : ''} ${s.current ? 'tl-current' : ''}`}>
              <span className="tl-dot" />
              <div>
                <b>{s.label}</b>
                <span className="muted small">{s.at}</span>
              </div>
            </div>
          ))}
        </div>

        {isSeller ? (
          <div className="pay-card card">
            <h3>Como vendedor</h3>
            {status === 'FROZEN' ? (
              <>
                <p className="muted small">
                  El comprador aún no paga. Cuando lo haga, verifica en <b>tu</b> app del banco;
                  las capturas aquí son solo evidencia, no confirmación.
                </p>
                <button className="btn btn-ghost btn-block" onClick={() => act('cancel', '/cancel')} disabled={!!busy}>
                  Cancelar operación
                </button>
              </>
            ) : status === 'PENDING_CONFIRMATION' ? (
              <>
                <p className="muted">
                  El comprador marcó el pago. Confirma en tu app del banco y libera los USDT.
                </p>
                <div className="pay-rows">
                  <div>
                    <span className="muted small">Monto a recibir</span>
                    <b>{formatCUP(live ? live.deal.fiat_total : mockDeal.fiatTotal)}</b>
                  </div>
                  <div>
                    <span className="muted small">Comprador</span>
                    <b>{partnerName()}</b>
                  </div>
                </div>
                <button
                  className="btn btn-ok btn-block"
                  onClick={() => act('release', '/confirm-received')}
                  disabled={!!busy}
                >
                  Confirmo que recibí el pago
                </button>
                <button
                  className="btn btn-danger-ghost btn-block"
                  onClick={() => act('dispute', '/dispute')}
                  disabled={!!busy}
                >
                  Abrir disputa
                </button>
              </>
            ) : (
              <p className="ok center">Operación finalizada.</p>
            )}
          </div>
        ) : (
          <div className="pay-card card">
            <h3>Como comprador</h3>
            {status === 'FROZEN' ? (
              <>
                <div className="pay-rows">
                  <div>
                    <span className="muted small">Pagar a</span>
                    <b>{p.holder}</b>
                  </div>
                  <div>
                    <span className="muted small">Cuenta</span>
                    <b className="mono">{p.account || p.phone}</b>
                  </div>
                  <div>
                    <span className="muted small">Método</span>
                    <b>{p.method}</b>
                  </div>
                </div>
                <p className="muted small">
                  Paga el total ({formatCUP(live ? live.deal.fiat_total : mockDeal.fiatTotal)}) y
                  marca "Ya pagué" subiendo la captura.
                </p>
                <button className="btn btn-primary btn-block" onClick={() => fileRef.current?.click()}>
                  Ya pagué: cargar comprobante
                </button>
                <button className="btn btn-danger-ghost btn-block" onClick={() => act('cancel', '/cancel')} disabled={!!busy}>
                  Cancelar operación
                </button>
              </>
            ) : status === 'PENDING_CONFIRMATION' ? (
              <>
                <p className="muted">Aguarda la confirmación del vendedor en su app del banco.</p>
                {live &&
                  live.proofs.length > 0 &&
                  live.proofs.map((pr) => (
                    <div className="sent-proof" key={pr.id}>
                      <span className="proof-thumb" />
                      <div>
                        <b>Captura adjunta</b>
                        <span className="muted small">{formatClock(pr.created_at)}</span>
                      </div>
                      <span className="pill pill-ok">EVIDENCIA</span>
                    </div>
                  ))}
                <button className="btn btn-danger-ghost btn-block" onClick={() => act('dispute', '/dispute')} disabled={!!busy}>
                  El vendedor no confirma: abrir disputa
                </button>
              </>
            ) : (
              <p className="ok center">Operación finalizada.</p>
            )}
          </div>
        )}
      </div>

      <div className="chat" ref={endRef}>
        {list
          .filter((m) => m.content || !demo)
          .map((m) => {
            const isSystem = m.sender_id == null || m.from === 'system';
            const isMe = demo ? m.from === 'me' : live && m.sender_id === myUserId();
            return (
              <div key={m.id} className={`bubble ${isMe ? 'bubble-me' : ''} ${isSystem ? 'bubble-sys' : ''}`}>
                {!isSystem && !isMe && <span className="bubble-name">{live && m.sender_name ? m.sender_name : 'Contraparte'}</span>}
                {m.content && <p>{m.content}</p>}
                {m.proof && (
                  <div className="att">
                    <span className="att-thumb" />
                    <div>
                      <b>{m.proof}</b>
                      <span className="muted small">{m.proofMeta}</span>
                    </div>
                  </div>
                )}
                <span className="bubble-at">{formatClock(m.created_at) || m.at || ''}</span>
              </div>
            );
          })}
      </div>

      <form className="composer" onSubmit={send}>
        <button type="button" className="composer-attach" onClick={() => fileRef.current?.click()} title="Adjuntar captura">
          +
        </button>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje…" />
        <button type="submit" className="composer-send" disabled={!text.trim() || !!busy}>
          Enviar
        </button>
        <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" ref={fileRef} hidden onChange={onFile} />
      </form>
    </div>
  );
}