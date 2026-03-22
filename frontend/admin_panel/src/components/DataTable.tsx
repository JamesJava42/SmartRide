import styles from './DataTable.module.css';

interface Column {
  key: string;
  header: string;
  width?: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface Props {
  columns: Column[];
  rows: Record<string, unknown>[];
  onRowClick?: (row: Record<string, unknown>) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable({ columns, rows, onRowClick, isLoading, emptyMessage = 'No results found.' }: Props) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key}><div className={styles.skeleton} /></td>
                ))}
              </tr>
            ))}
          {!isLoading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>{emptyMessage}</td>
            </tr>
          )}
          {!isLoading &&
            rows.map((row, i) => (
              <tr
                key={i}
                className={onRowClick ? styles.clickable : ''}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
