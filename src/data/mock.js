export const marketStats = {
  avgRate: 350.5,
  volume24h: 45200,
};

export const methodChips = ['Transfermóvil', 'EnZona', 'Efectivo', 'Tarjeta BPA', 'Tarjeta BANDEC'];

export const ads = [
  {
    id: 1,
    side: 'SELL',
    seller: { name: 'Carlos M.', city: 'La Habana', verified: true, trades: 124, rating: 4.9 },
    handle: 'carlos_exch',
    asset: 'USDT',
    amount: 200,
    min: 50,
    rate: 350.0,
    methods: ['Transfermóvil', 'Efectivo'],
    note: 'Solo acepto transferencias del mismo titular de la cuenta. Por favor, no poner palabras raras en el concepto de la transferencia. Pago rápido si estás en línea.',
  },
  {
    id: 2,
    side: 'SELL',
    seller: { name: 'María Alvear', city: 'Matanzas', verified: true, trades: 42, rating: 5.0 },
    handle: 'maria_alv',
    asset: 'USDT',
    amount: 150,
    min: 10,
    rate: 349.0,
    methods: ['Transfermóvil'],
    note: 'Atención rápido, pagos por Transfermóvil.',
  },
  {
    id: 3,
    side: 'SELL',
    seller: { name: 'Randy Ortiz', city: 'La Habana', verified: true, trades: 97, rating: 4.5 },
    handle: 'randy_p2p',
    asset: 'USDT',
    amount: 500,
    min: 100,
    rate: 351.5,
    methods: ['Tarjeta BPA', 'Tarjeta BANDEC'],
    note: 'Los CUP se envían por tarjeta. Confirmas en tu banca digital.',
  },
  {
    id: 4,
    side: 'SELL',
    seller: { name: 'Dayana Ruiz', city: 'Holguín', verified: false, trades: 21, rating: 3.9 },
    handle: 'day_holguin',
    asset: 'USDT',
    amount: 80,
    min: 20,
    rate: 348.0,
    methods: ['EnZona'],
    note: 'Nueva en la plataforma, precios bajos.',
  },
  {
    id: 5,
    side: 'BUY',
    seller: { name: 'Michel Fuentes', city: 'Santiago de Cuba', verified: true, trades: 1023, rating: 4.97 },
    handle: 'michel_top',
    asset: 'USDT',
    amount: 1000,
    min: 100,
    rate: 352.0,
    methods: ['Transfermóvil', 'Efectivo'],
    note: 'Compro al mejor precio del oriente. Pago seguro.',
  },
  {
    id: 6,
    side: 'BUY',
    seller: { name: 'Vivian Cardet', city: 'La Habana', verified: true, trades: 76, rating: 4.4 },
    handle: 'vivian_c',
    asset: 'USDT',
    amount: 120,
    min: 10,
    rate: 349.8,
    methods: ['Efectivo', 'EnZona'],
    note: 'Compro poco a poco, varios días a la semana.',
  },
];

export const deal = {
  id: 'A-4821',
  code: 'A-4821',
  status: 'PENDING_CONFIRMATION',
  my_side: 'BUY',
  side: 'SELL',
  asset: 'USDT',
  amount: 390.62,
  rate: 320.0,
  fiatTotal: 125000,
  method: 'BPA (CUP)',
  partner: {
    name: 'Roberto',
    full_name: 'Roberto Carlos Pérez',
    accountName: 'Roberto Carlos Pérez',
    paymentMethod: '9225 1234 5678 9012',
  },
  created_at: '2026-08-29T11:42:00Z',
};

export const timelineSteps = [
  { key: 'created', label: 'Inicio' },
  { key: 'locked', label: 'USDT\nCongelado' },
  { key: 'sent', label: 'Pago\nEnviado' },
  { key: 'received', label: 'Pago\nRecibido' },
  { key: 'released', label: 'Liberado' },
];

export const messages = [
  {
    id: 1,
    from: 'partner',
    name: 'Roberto',
    text: 'Hola, quedo atento a la transferencia.',
    at: '10:42 AM',
  },
  {
    id: 2,
    from: 'me',
    name: 'Tú',
    text: 'Transferencia realizada, hermano. Te adjunto el comprobante en un momento.',
    at: '10:45 AM',
  },
  {
    id: 3,
    from: 'system',
    text: 'El comprador ha marcado el pago como enviado.',
    at: '10:45 AM',
  },
  {
    id: 4,
    from: 'me',
    name: 'Tú',
    text: 'Comprobante del Transfermóvil.',
    at: '10:46 AM',
    proof: { name: 'captura-transfermovil.png', size: '1,4 MB' },
    proofMeta: '125 000,00 CUP · hoy 10:46',
  },
];

export const walletDemo = {
  balance: 4250,
  avgRate: 320.0,
  equivalent: 1360000,
  activity: [
    { id: 9284, kind: 'out', icon: 'arrow_outward', date: 'Hoy, 14:30', amount: 500, sign: '-', status: 'Completado' },
    { id: 9281, kind: 'in', icon: 'arrow_downward', date: 'Ayer, 09:15', amount: 1200, sign: '+', status: 'Completado' },
    { id: 9290, kind: 'pend', icon: 'swap_horiz', date: 'En proceso', amount: 250, sign: '', status: 'Pendiente' },
  ],
};

export const provinces = ['Todas', 'La Habana', 'Matanzas', 'Holguín', 'Santiago de Cuba'];