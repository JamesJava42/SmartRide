import styles from './FilterBar.module.css';

interface FilterOption {
  label: string;
  value: string;
}

interface Filter {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

interface Props {
  filters?: Filter[];
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function FilterBar({ filters = [], searchPlaceholder = 'Search...', searchValue, onSearchChange }: Props) {
  return (
    <div className={styles.bar}>
      {filters.map((f) => (
        <select key={f.id} className={styles.select} value={f.value} onChange={(e) => f.onChange(e.target.value)} aria-label={f.label}>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ))}
      {onSearchChange && (
        <div className={styles.searchWrap}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
      )}
    </div>
  );
}
