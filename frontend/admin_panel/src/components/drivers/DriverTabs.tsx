import styles from './DriverTabs.module.css';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'documents', label: 'Documents' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'ride-history', label: 'Ride History' },
  { id: 'payouts', label: 'Payouts' },
  { id: 'audit-trail', label: 'Audit Trail' },
];

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DriverTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className={styles.bar}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
