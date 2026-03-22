import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { DriverHeaderCard } from '../components/drivers/DriverHeaderCard';
import { DriverQuickActions } from '../components/drivers/DriverQuickActions';
import { DriverTabs } from '../components/drivers/DriverTabs';
import { DriverNotesPanel } from '../components/drivers/DriverNotesPanel';
import { DriverRiskPanel } from '../components/drivers/DriverRiskPanel';
import { ProfileTab } from '../components/drivers/tabs/ProfileTab';
import { DocumentsTab } from '../components/drivers/tabs/DocumentsTab';
import { VehicleTab } from '../components/drivers/tabs/VehicleTab';
import { ComplianceTab } from '../components/drivers/tabs/ComplianceTab';
import { RideHistoryTab } from '../components/drivers/tabs/RideHistoryTab';
import { PayoutsTab } from '../components/drivers/tabs/PayoutsTab';
import { AuditTrailTab } from '../components/drivers/tabs/AuditTrailTab';
import { useDriverDetail } from '../hooks/useDriverDetail';
import { ToastProvider } from '../hooks/useToast';
import styles from './DriverDetailPage.module.css';

type TabId = 'profile' | 'documents' | 'vehicle' | 'compliance' | 'ride-history' | 'payouts' | 'audit-trail';

function DriverDetailContent() {
  const { driverId } = useParams<{ driverId: string }>();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const qc = useQueryClient();

  const { data: driver, isLoading, isError } = useDriverDetail(driverId ?? '');

  if (!driverId) return <div className={styles.error}>No driver ID</div>;

  if (isError) {
    return (
      <div className={styles.errorState}>
        <p>Failed to load driver.</p>
        <Link to="/drivers" className={styles.backLink}>← Back to Drivers</Link>
      </div>
    );
  }

  function handleActionSuccess() {
    qc.invalidateQueries({ queryKey: ['driver', driverId] });
  }

  return (
    <div className={styles.root}>
      <Link to="/drivers" className={styles.backLink}>← Back to Drivers</Link>

      {/* Header row */}
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <DriverHeaderCard driver={driver ?? null} isLoading={isLoading} />
        </div>
        <div className={styles.headerRight}>
          <DriverQuickActions driver={driver ?? null} driverId={driverId} onActionSuccess={handleActionSuccess} />
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsRow}>
        <DriverTabs activeTab={activeTab} onTabChange={(t) => setActiveTab(t as TabId)} />
      </div>

      {/* Tab content */}
      <div className={styles.tabContent}>
        {activeTab === 'profile' && <ProfileTab driverId={driverId} />}
        {activeTab === 'documents' && <DocumentsTab driverId={driverId} />}
        {activeTab === 'vehicle' && <VehicleTab driverId={driverId} />}
        {activeTab === 'compliance' && <ComplianceTab driverId={driverId} />}
        {activeTab === 'ride-history' && <RideHistoryTab driverId={driverId} totalRides={driver?.total_rides_completed} rating={driver?.rating_avg} />}
        {activeTab === 'payouts' && <PayoutsTab driverId={driverId} />}
        {activeTab === 'audit-trail' && <AuditTrailTab driverId={driverId} />}
      </div>

      {/* Bottom panels */}
      <div className={styles.bottomRow}>
        <div className={styles.bottomLeft}>
          <DriverNotesPanel driverId={driverId} />
        </div>
        <div className={styles.bottomRight}>
          <DriverRiskPanel driverId={driverId} />
        </div>
      </div>
    </div>
  );
}

export default function DriverDetailPage() {
  return (
    <ToastProvider>
      <DriverDetailContent />
    </ToastProvider>
  );
}
