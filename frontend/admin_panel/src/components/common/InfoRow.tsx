import styles from './InfoRow.module.css';

interface Props {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function InfoRow({ label, value, className }: Props) {
  return (
    <div className={`${styles.row} ${className ?? ''}`}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value ?? '—'}</span>
    </div>
  );
}
