const BASE = '/api';

export function getToken() {
  return localStorage.getItem('crypto_p2p_token');
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  const useToken = token || getToken();
  if (useToken) headers.Authorization = `Bearer ${useToken}`;
  let payload;
  if (body !== undefined) {
    if (body instanceof FormData || typeof body === 'string') {
      payload = body;
    } else {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
  }
  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: payload });
  } catch {
    const err = new Error('Sin conexión con el servidor');
    err.status = 0;
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Error de red');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  get: (path, token) => request(path, { token }),
  post: (path, body, token) => request(path, { method: 'POST', body, token }),
  patch: (path, body, token) => request(path, { method: 'PATCH', body, token }),
  del: (path, token) => request(path, { method: 'DELETE', token }),
  upload: (path, payload, token) => request(path, { method: 'POST', body: payload, token }),
};

// Normaliza un anuncio del backend al mismo modelo que usa la UI
export function mapAd(a) {
  return {
    id: a.id,
    side: a.side,
    asset: a.asset,
    amount: Number(a.amount),
    min: Number(a.min_amount),
    rate: Number(a.rate),
    method: a.method,
    seller: {
      name: a.seller_nickname || a.seller_name,
      city: a.seller_city || '',
      verified: !!a.seller_verified,
      trades: Number(a.seller_trades || 0),
      rating: Number(a.seller_rating || 0),
    },
    note: a.note || '',
    minClearance: 0,
  };
}