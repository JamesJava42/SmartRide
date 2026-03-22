import type { DriverReviewData } from '../../../types/onboarding';
import { OnboardingRiskCard } from '../OnboardingRiskCard';

type Props = {
  data: DriverReviewData;
};

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[15px] text-ink">{label}</p>
      <p className="mt-2 whitespace-pre-line text-[15px] text-ink">{value || '—'}</p>
    </div>
  );
}

export function SummaryTab({ data }: Props) {
  const licenseUploaded = data.normalized_documents.some(
    (document) => document.type === 'DRIVER_LICENSE' && !document.is_missing
  );
  const vehicleUploaded = data.normalized_documents.some(
    (document) => document.type === 'VEHICLE_REGISTRATION' && !document.is_missing
  );
  const insuranceUploaded = data.normalized_documents.some(
    (document) => document.type === 'INSURANCE' && !document.is_missing
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.55fr_0.75fr]">
      <div className="space-y-8 xl:border-r xl:border-line xl:pr-6">
        <section>
          <h3 className="text-[22px] font-medium text-ink">Application Progress</h3>
          <div className="mt-5 space-y-4 text-[15px] text-ink">
            <p>
              Documents submitted: {data.docs_submitted_count} / {data.docs_total}
            </p>
            <p>
              Missing: {data.missing_documents.length > 0 ? data.missing_documents.join(', ') : 'None'}
            </p>
          </div>
        </section>

        <section className="border-t border-line pt-6">
          <h3 className="text-[22px] font-medium text-ink">Contact Details</h3>
          <div className="mt-6 space-y-6">
            <SummaryField label="Address:" value={data.address || '245 Elm St, Long Beach, CA 90802'} />
            <SummaryField label="Language:" value={data.language || 'English, Spanish'} />
            <SummaryField
              label="Emergency Contact:"
              value={data.emergency_contact || 'Anjali Teja (Spouse)\n+1 555 890 9566'}
            />
          </div>
        </section>
      </div>

      <div className="space-y-5">
        <div className="rounded-[20px] border border-line bg-white px-5 py-5">
          <h4 className="text-[18px] font-semibold text-ink">Summary</h4>
          <div className="mt-5 space-y-4 text-[15px] text-ink">
            <p>Background Check: Pending</p>
            <p>Identity Verified: {data.docs_approved_count > 0 ? 'Yes' : 'No'}</p>
            <p>License Uploaded: {licenseUploaded ? 'Yes' : 'No'}</p>
            <p>Vehicle Uploaded: {vehicleUploaded ? 'Yes' : 'No'}</p>
            <p>Insurance Uploaded: {insuranceUploaded ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <OnboardingRiskCard data={data} compact />

        <div className="flex items-center justify-between px-1 text-[15px] text-muted">
          <span>Showing 0 of 0</span>
          <div className="flex items-center gap-2">
            <button type="button" className="text-lg">‹</button>
            <span className="rounded-lg border border-line px-3 py-1 text-sm text-ink">1</span>
            <button type="button" className="text-lg">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
