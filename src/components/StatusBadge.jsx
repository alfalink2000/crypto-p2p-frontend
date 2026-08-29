const LABELS = {
  FROZEN: 'En escrow',
  PENDING_CONFIRMATION: 'Pago enviado',
  COMPLETED: 'Completada',
  DISPUTED: 'En disputa',
  CANCELLED: 'Cancelada',
  OPEN: 'Abierta',
};

export default function StatusBadge({ status }) {
  return <span className={`stat stat-${status}`}>{LABELS[status] || status}</span>;
}