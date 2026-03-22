import styles from './SectionCard.module.css';

interface Props {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function SectionCard({ title, children, className, action }: Props) {
  return (
    <div className={`${styles.card} ${className ?? ''}`}>
      {title && (
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
