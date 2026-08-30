import { iconPaths } from '../data/icons.js';

export default function Icon({ name, filled = false, className = '', style, size }) {
  const d = iconPaths[name + (filled ? '-fill' : '')] || [];
  const cls = ['mi', filled ? 'filled' : '', className].filter(Boolean).join(' ');
  return (
    <svg
      className={cls}
      width={size || '1em'}
      height={size || '1em'}
      viewBox="0 -960 960 960"
      fill="currentColor"
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {d.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  );
}