import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../api/client.js';

const NETWORK_LABEL = {
  tron: { name: 'TRON', network: 'USDT-TRC20' },
  bsc: { name: 'BSC', network: 'BNB + USDT-BEP20' },
};

function AddressCard({ wallet }) {
  const [copied, setCopied] = useState(false);
  const label = NETWORK_LABEL[wallet.network];

  const copy = () => {
    navigator.clipboard?.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card address-card">
      <div className="address-head">
        <div>
          <h3>{label.name}</h3>
          <span className="muted">{label.network}</span>
        </div>
      </div>
      <div className="qr">
        <QRCodeSVG value={wallet.address} size={140} />
      </div>
      <code className="address">{wallet.address}</code>
      <button className="ghost" onClick={copy}>
        {copied ? 'Copiado' : 'Copiar dirección'}
      </button>
      <p className="muted small">
        Envía a esta dirección para recargar tu saldo. Depósitos en otras redes se pierden.
      </p>
    </div>
  );
}

export default function Dashboard() {
  const token = useSelector((s) => s.auth.token);
  const [balances, setBalances] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [bal, wal, dep] = await Promise.all([
          api.get('/balances', token),
          api.get('/wallets', token),
          api.get('/deposits', token),
        ]);
        setBalances(bal.balances);
        setWallets(wal.wallets);
        setDeposits(dep.deposits);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [token]);

  return (
    <div className="stack">
      {error && <p className="error">{error}</p>}

      <section>
        <h2>Mis saldos</h2>
        <div className="cards">
          {balances.length === 0 && <p className="muted">Aún no tienes saldo.</p>}
          {balances.map((b) => (
            <div className="card balance" key={b.asset}>
              <span className="muted">{b.asset}</span>
              <strong>{Number(b.available).toFixed(6)}</strong>
              {Number(b.locked) > 0 && (
                <span className="badge warn">congelado {Number(b.locked).toFixed(6)}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Direcciones de depósito</h2>
        <div className="cards">
          {wallets.map((w) => (
            <AddressCard key={w.id} wallet={w} />
          ))}
        </div>
      </section>

      <section>
        <h2>Depósitos recientes</h2>
        {deposits.length === 0 && <p className="muted">Sin movimientos todavía.</p>}
        <ul className="list">
          {deposits.slice(0, 10).map((d) => (
            <li key={d.id} className="card row">
              <div>
                <strong>
                  +{Number(d.amount)} {d.asset}
                </strong>
                <span className="muted small">{d.network}</span>
              </div>
              <span className={`status ${d.status}`}>{d.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
