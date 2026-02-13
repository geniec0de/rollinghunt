/** Dice "3" mark matching the favicon – for use next to the rollinghunt wordmark. */
export function LogoIcon({ className = "", size = 28 }: { className?: string; size?: number }) {
  const s = size;
  const pad = s * 0.12;
  const box = s - pad * 2;
  const r = box * 0.12;
  const dotRadius = box * 0.14;
  const dotPos1 = pad + dotRadius;
  const dotPosMid = pad + box / 2;
  const dotPos3 = pad + box - dotRadius;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect
        x={pad}
        y={pad}
        width={box}
        height={box}
        rx={r}
        fill="#02080f"
      />
      <circle cx={dotPos1} cy={dotPos1} r={dotRadius} fill="#ffffff" />
      <circle cx={dotPosMid} cy={dotPosMid} r={dotRadius} fill="#b91c1c" />
      <circle cx={dotPos3} cy={dotPos3} r={dotRadius} fill="#ffffff" />
    </svg>
  );
}
