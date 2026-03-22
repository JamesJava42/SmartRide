import type { VehicleType } from "./vehicleConfig";
import { VEHICLE_TYPE_CONFIG } from "./vehicleConfig";
import styles from "./VehicleTypeIcon.module.css";

type Props = {
  type: VehicleType;
  size?: number;
  className?: string;
};

function Wheel({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r="7.5" fill="#1e293b" stroke="#334155" strokeWidth="1" />
      <circle cx={cx} cy={cy} r="4" fill="#334155" />
      <circle cx={cx} cy={cy} r="1.8" fill="#94a3b8" />
      <line x1={cx - 3.8} y1={cy} x2={cx + 3.8} y2={cy} stroke="#94a3b8" strokeWidth="0.7" opacity="0.5" />
      <line x1={cx} y1={cy - 3.8} x2={cx} y2={cy + 3.8} stroke="#94a3b8" strokeWidth="0.7" opacity="0.5" />
    </>
  );
}

function Economy({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 46" aria-hidden="true" focusable="false">
      <ellipse cx="40" cy="44" rx="28" ry="2" fill="#E2E5DE" fillOpacity="0.6" />
      <path d="M7 28 C7 28 9 21 13 19 L22 15 C25 14 29 13 36 13 L52 13 C57 13 61 14 64 16 L71 21 C74 23 74 26 74 28 L74 36 C74 37.1 73.1 38 72 38 L10 38 C8.9 38 8 37.1 8 36 Z" fill={color} fillOpacity="0.13" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M26 13 L31 4 C32 2.2 34 1.5 37 1.5 L51 1.5 C54 1.5 56 2.2 57 4 L62 13 Z" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
      <line x1="39" y1="1.5" x2="39" y2="13" stroke={color} strokeWidth="1" opacity="0.35" />
      <line x1="26" y1="15" x2="26" y2="36" stroke={color} strokeWidth="0.7" opacity="0.2" />
      <rect x="8" y="24" width="11" height="5" rx="2.5" fill="white" fillOpacity="0.8" />
      <rect x="63" y="24" width="10" height="5" rx="2.5" fill="#fbbf24" fillOpacity="0.85" />
      <Wheel cx={22} cy={38} />
      <Wheel cx={60} cy={38} />
    </svg>
  );
}

function Comfort({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 46" aria-hidden="true" focusable="false">
      <ellipse cx="40" cy="44" rx="28" ry="2" fill="#E2E5DE" fillOpacity="0.6" />
      <path d="M5 28 C5 27 7 20 12 18 L20 14 C24 13 28 12 36 12 L52 12 C59 12 63 13 67 16 L74 22 C77 24 77 27 77 28 L77 36 C77 37.1 76.1 38 75 38 L7 38 C5.9 38 5 37.1 5 36 Z" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M22 12 L28 3 C29 1.5 32 1 36 1 L52 1 C56 1 58 1.5 59 3 L64 12 Z" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.3" />
      <line x1="39" y1="1" x2="39" y2="12" stroke={color} strokeWidth="1" opacity="0.35" />
      <line x1="5" y1="25" x2="77" y2="25" stroke={color} strokeWidth="0.7" opacity="0.25" strokeDasharray="5 2" />
      <rect x="6" y="24" width="11" height="5" rx="2.5" fill="white" fillOpacity="0.8" />
      <rect x="64" y="24" width="10" height="5" rx="2.5" fill="#fbbf24" fillOpacity="0.85" />
      <Wheel cx={21} cy={38} />
      <Wheel cx={61} cy={38} />
    </svg>
  );
}

function Premium({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 82 46" aria-hidden="true" focusable="false">
      <ellipse cx="40" cy="44" rx="28" ry="2" fill="#E2E5DE" fillOpacity="0.6" />
      <path d="M4 29 C4 28 6 22 10 19 L18 15 C22 14 27 13 36 13 L54 13 C62 13 66 14 70 17 L77 23 C79 25 79 28 79 29 L79 36 C79 37.1 78.1 38 77 38 L6 38 C4.9 38 4 37.1 4 36 Z" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M25 13 L32 4 C33 2 36 1.5 40 1.5 L54 1.5 C58 1.5 60 2.5 63 5 L70 13 Z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.3" />
      <line x1="40" y1="1.5" x2="40" y2="13" stroke={color} strokeWidth="1" opacity="0.35" />
      <line x1="4" y1="23" x2="79" y2="23" stroke={color} strokeWidth="0.8" opacity="0.35" />
      <line x1="8" y1="20" x2="8" y2="25" stroke={color} strokeWidth="1.2" opacity="0.6" />
      <line x1="11.5" y1="19" x2="11.5" y2="25" stroke={color} strokeWidth="1.2" opacity="0.6" />
      <line x1="15" y1="20" x2="15" y2="25" stroke={color} strokeWidth="1.2" opacity="0.6" />
      <rect x="5" y="24" width="14" height="5" rx="2.5" fill="white" fillOpacity="0.8" />
      <rect x="66" y="24" width="12" height="5" rx="2.5" fill="#fbbf24" fillOpacity="0.85" />
      <Wheel cx={21} cy={38} />
      <Wheel cx={63} cy={38} />
    </svg>
  );
}

function XL({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 52" aria-hidden="true" focusable="false">
      <ellipse cx="40" cy="50" rx="28" ry="2" fill="#E2E5DE" fillOpacity="0.6" />
      <path d="M6 36 L6 18 C6 16 8 15 10 15 L14 15 L14 7 C14 5.9 14.9 5 16 5 L64 5 C65.1 5 66 5.9 66 7 L66 15 L70 15 C72 15 74 16 74 18 L74 36 C74 37.1 73.1 38 72 38 L8 38 C6.9 38 6 37.1 6 36 Z" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <line x1="6" y1="15" x2="74" y2="15" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <rect x="17" y="7" width="19" height="8" rx="1.5" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="0.9" />
      <rect x="40" y="7" width="22" height="8" rx="1.5" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="0.9" />
      <rect x="6" y="32" width="68" height="3.5" rx="1.5" fill={color} fillOpacity="0.2" />
      <rect x="6" y="24" width="12" height="5" rx="2.5" fill="white" fillOpacity="0.8" />
      <rect x="64" y="24" width="9" height="5" rx="2.5" fill="#fbbf24" fillOpacity="0.85" />
      <Wheel cx={20} cy={38} />
      <Wheel cx={60} cy={38} />
    </svg>
  );
}

function dimensions(type: VehicleType, size: number) {
  if (type === "PREMIUM") {
    return { width: size, height: size * (46 / 82) };
  }
  if (type === "XL") {
    return { width: size, height: size * (52 / 80) };
  }
  return { width: size, height: size * (46 / 80) };
}

export function VehicleTypeIcon({ type, size = 62, className }: Props) {
  const config = VEHICLE_TYPE_CONFIG[type];
  const { width, height } = dimensions(type, size);

  return (
    <span className={[styles.icon, className].filter(Boolean).join(" ")} style={{ width, height }}>
      {type === "ECONOMY" ? <Economy color={config.color} /> : null}
      {type === "COMFORT" ? <Comfort color={config.color} /> : null}
      {type === "PREMIUM" ? <Premium color={config.color} /> : null}
      {type === "XL" ? <XL color={config.color} /> : null}
    </span>
  );
}

export default VehicleTypeIcon;
