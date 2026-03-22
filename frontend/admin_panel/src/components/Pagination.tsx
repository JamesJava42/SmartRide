import styles from './Pagination.module.css';

interface Props {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, totalItems, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className={styles.root}>
      <span className={styles.info}>{totalItems} total</span>
      <button className={styles.btn} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>←</button>
      {pages.map((p) => (
        <button
          key={p}
          className={`${styles.btn} ${p === page ? styles.active : ''}`}
          onClick={() => onPageChange(p)}
        >{p}</button>
      ))}
      <button className={styles.btn} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>→</button>
    </div>
  );
}
