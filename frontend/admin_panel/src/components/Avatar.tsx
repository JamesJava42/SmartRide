import styles from './Avatar.module.css';

interface Props {
  name: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const COLORS = ['#1A6B45','#2563EB','#7C3AED','#DC2626','#D97706','#0891B2','#059669'];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export function Avatar({ name, imageUrl, size = 'md' }: Props) {
  const sizeClass = size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : styles.md;
  return (
    <span className={`${styles.avatar} ${sizeClass}`} style={{ background: imageUrl ? 'transparent' : getColor(name) }}>
      {imageUrl ? <img src={imageUrl} alt={name} /> : getInitials(name)}
    </span>
  );
}
