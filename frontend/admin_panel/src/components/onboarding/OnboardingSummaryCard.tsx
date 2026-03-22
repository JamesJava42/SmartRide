import type { ReactNode } from 'react';

import type { DriverReviewData } from '../../types/onboarding';
import { formatDate } from '../../utils/onboarding';

type Props = {
  data: DriverReviewData;
};

function InfoRow({
  icon,
  value,
}: {
  icon: ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-[15px] text-ink">
      <span className="text-muted">{icon}</span>
      <span>{value || '—'}</span>
    </div>
  );
}

export function OnboardingSummaryCard({ data }: Props) {
  return (
    <div className="rounded-[24px] border border-line bg-white">
      <div className="space-y-6 px-6 py-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#d6ebf3] text-2xl font-medium text-[#46555e]">
            {data.avatar_initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] font-semibold text-ink">{data.full_name}</h2>
            <p className="mt-0.5 text-[15px] text-muted">{data.driver_id.slice(0, 8)}</p>
            <p className="mt-0.5 text-[15px] text-ink">{data.phone_number || '—'}</p>
          </div>
        </div>

        <div className="border-t border-line pt-5">
          <div className="space-y-4">
            <InfoRow
              icon={<span>✉</span>}
              value={data.email || '—'}
            />
            <InfoRow
              icon={<span>⌂</span>}
              value={data.region_name}
            />
            <InfoRow
              icon={<span>●</span>}
              value={`Member Since ${formatDate(data.member_since)}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
