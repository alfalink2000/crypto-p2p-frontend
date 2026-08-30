import { useCallback, useEffect, useState } from 'react';
import { api, getToken } from '../api/client.js';

// Saldos reales del usuario: { balances: [{ asset, available, locked }] }
export default function useBalance(fetchMs = 15000) {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback((silent = false) => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    api
      .get('/balances')
      .then((res) => setBalances(res.balances || []))
      .catch(() => setBalances([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
    if (!fetchMs) return undefined;
    const t = setInterval(() => refresh(true), fetchMs);
    return () => clearInterval(t);
  }, [refresh, fetchMs]);

  const byAsset = useCallback((asset) => balances.find((b) => b.asset === asset) || null, [balances]);

  return { balances, byAsset, loading, refresh };
}