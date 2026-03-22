import { SectionCard } from '../common/SectionCard';
import { InfoRow } from '../common/InfoRow';
import { useDriverDocuments, useDriverCompliance } from '../../hooks/useDriverDetail';
import styles from './DriverRiskPanel.module.css';

interface Props { driverId: string; }

export function DriverRiskPanel({ driverId }: Props) {
  const { data: docs = [] } = useDriverDocuments(driverId);
  const { data: compliance = [] } = useDriverCompliance(driverId);

  const idDoc = docs.find((d) => d.document_type === 'GOVT_ID_FRONT');
  const insuranceDoc = docs.find((d) => d.document_type === 'INSURANCE');
  const licenseDoc = docs.find((d) => d.document_type === 'DRIVER_LICENSE');

  const bgCheck = compliance.find((c) => c.label === 'Background Check');
  const safetyFlags = compliance.find((c) => c.label === 'Safety Flags');
  const fraudFlags = compliance.find((c) => c.label === 'Fraud Flags');
  const openFlags = compliance.filter((c) => c.status === 'FAIL').length;

  // Risk calculation
  const redFlags = compliance.filter((c) => c.status === 'FAIL' || c.status === 'EXPIRED').length;
  const warnFlags = compliance.filter((c) => c.status === 'PENDING' || c.status === 'NOT_CHECKED').length;
  const risk = redFlags > 0 ? 'High Risk' : warnFlags > 1 ? 'Medium Risk' : 'Low Risk';
  const riskColor = redFlags > 0 ? '#DC2626' : warnFlags > 1 ? '#D97706' : 'var(--green-700)';
  const riskBg = redFlags > 0 ? '#FEE2E2' : warnFlags > 1 ? '#FEF3C7' : 'var(--green-100)';

  return (
    <SectionCard title="Risk & Health">
      <InfoRow
        label="Background Check"
        value={<span style={{ color: bgCheck?.status === 'PASS' ? 'var(--green-700)' : '#D97706' }}>{bgCheck?.status ?? '—'}</span>}
      />
      <InfoRow
        label="Identity Verified"
        value={idDoc?.verification_status === 'APPROVED' ? <span style={{ color: 'var(--green-700)' }}>✓</span> : <span style={{ color: 'var(--text-muted)' }}>✗</span>}
      />
      <InfoRow
        label="Insurance Expires"
        value={insuranceDoc ? insuranceDoc.verification_status : '—'}
      />
      <InfoRow
        label="License Status"
        value={licenseDoc ? <span style={{ color: licenseDoc.verification_status === 'APPROVED' ? 'var(--green-700)' : '#D97706' }}>{licenseDoc.verification_status}</span> : '—'}
      />
      <InfoRow
        label="Open Flags"
        value={<span style={{ color: openFlags > 0 ? '#DC2626' : 'var(--green-700)', fontWeight: 700 }}>{openFlags}</span>}
      />
      <InfoRow
        label="Safety Incidents"
        value={<span style={{ color: safetyFlags?.status === 'FAIL' ? '#DC2626' : 'var(--green-700)' }}>{safetyFlags?.detail ?? '—'}</span>}
      />
      <InfoRow
        label="Fraud Flags"
        value={<span style={{ color: fraudFlags?.status === 'FAIL' ? '#DC2626' : 'var(--green-700)' }}>{fraudFlags?.detail ?? '—'}</span>}
      />

      <div className={styles.riskBadge} style={{ background: riskBg, color: riskColor }}>
        {risk}
      </div>
    </SectionCard>
  );
}
