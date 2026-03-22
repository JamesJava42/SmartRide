import { SectionCard } from '../../common/SectionCard';
import { StatusBadge } from '../../StatusBadge';
import { useDriverCompliance } from '../../../hooks/useDriverDetail';
import type { ComplianceItem } from '../../../types/driver';
import styles from './ComplianceTab.module.css';

interface Props { driverId: string; }

const STATUS_ICONS: Record<ComplianceItem['status'], string> = {
  PASS: '✓',
  FAIL: '✗',
  PENDING: '⏳',
  EXPIRED: '⚠',
  NOT_CHECKED: '—',
};

function mapToStatusBadge(s: ComplianceItem['status']): string {
  const map: Record<ComplianceItem['status'], string> = {
    PASS: 'ACTIVE',
    FAIL: 'SUSPENDED',
    PENDING: 'PENDING_APPROVAL',
    EXPIRED: 'INACTIVE',
    NOT_CHECKED: 'INACTIVE',
  };
  return map[s];
}

export function ComplianceTab({ driverId }: Props) {
  const { data: items = [], isLoading } = useDriverCompliance(driverId);

  if (isLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className={styles.sk} />)}
      </div>
    );
  }

  return (
    <div>
      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.label} className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.icon} ${styles[`icon_${item.status}` as keyof typeof styles]}`}>{STATUS_ICONS[item.status]}</span>
              <span className={styles.label}>{item.label}</span>
            </div>
            <StatusBadge status={mapToStatusBadge(item.status)} size="sm" />
            {item.detail && <p className={styles.detail}>{item.detail}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// Suppress unused import warning
void SectionCard;
