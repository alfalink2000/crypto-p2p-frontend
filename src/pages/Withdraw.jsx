import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../api/client.js';

const ASSETS = [
  { value: 'USDT', label: 'USDT', network: 'tron', networkLabel: 'TRON (TRC20)' },
  { value: 'USDT', label: 'USDT', network: 'bsc', networkLabel: 'BSC (BEP20)' },
  { value: 'BNB', label: 'BNB', network: 'bsc', networkLabel: 'BSC' },
];

export default function Withdraw() {
  const token = useSelector((s) => s.auth.token);
  const [balances, setBalances] = useState([]);
  const [pair, setPair] = useState('USDT-tron');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get('/balances', token).then((r) => setBalances(r.balances)).catch(() => {});
  }, [token]);

  const asset = pair.split('-')[0];
  const network = pair.split('-')[1];
  const available = Number(
    balances.find((b) => b.asset === asset)?.available ?? 0
  ).toFixed(6);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setMessage(null);
    setError(null);
    try {
      const res = await api.post('/withdrawals', { asset, network, to_address: toAddress, amount }, token);
      setMessage(`Retiro creado (${res.withdrawal.id}). Se procesará en breve.`);
      setAmount('');
      setToAddress('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="stack">
      <section className="card">
        <h2>Retirar fondos</h2>
        <form onSubmit={submit}>
          <label>
            Activo / Red
            <select value={pair} onChange={(e) => setPair(e.target.value)}>
              {ASSETS.map((a) => (
                <option key={`${a.value}-${a.network}`} value={`${a.value}-${a.network}`}>
                  {a.label} · {a.networkLabel}
                </option>
              ))}
            </select>
          </label>
          <p className="muted small">Disponible: {available} {asset}</p>
          <label>
            Dirección de destino
            <input
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder={network === 'tron' ? 'T...' : '0x...'}
              required
            />
          </label>
          <label>
            Monto
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          {message && <p className="ok">{message}</p>}
          <button type="submit" disabled={sending}>
            {sending ? 'Enviando...' : 'Retirar'}
          </button>
        </form>
      </section>
    </div>
  );
}
