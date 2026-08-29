export function formatCUP(n) {
  if (n == null) return '';
  const s = Number(n).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${s} CUP`;
}

export function formatUSDT(n) {
  if (n == null) return '';
  const cleaned = Number(n).toLocaleString('de-DE', { maximumFractionDigits: 6 });
  return `${cleaned} USDT`;
}

export function formatRate(rate) {
  if (rate == null) return '';
  return `${Number(rate).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CUP`;
}

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora mismo';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

export function countdown(iso) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return { done: true, h: 0, m: 0, s: 0 };
  const s = Math.floor(diff / 1000);
  return {
    done: false,
    h: Math.floor(s / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export function pad(n) {
  return String(n).padStart(2, '0');
}

export function formatClock(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const sameDay =
    d.toDateString() === new Date().toDateString();
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return sameDay ? `hoy ${hm}` : `${pad(d.getDate())} ${pad(d.getMonth() + 1)} ${hm}`;
}