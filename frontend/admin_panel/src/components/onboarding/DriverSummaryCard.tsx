import type { DriverReviewDetail } from "../../api/onboarding";
import { AdminStatusBadge } from "../admin/AdminStatusBadge";

type DriverSummaryCardProps = {
  detail: DriverReviewDetail;
};

export function DriverSummaryCard({ detail }: DriverSummaryCardProps) {
  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8e8e5] text-xl font-semibold text-ink">
          {detail.driver_name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl font-semibold text-ink">{detail.driver_name}</h2>
              <p className="mt-2 text-sm text-muted">{detail.email}</p>
              <p className="mt-1 text-sm text-muted">{detail.region_name}</p>
            </div>
            <AdminStatusBadge value={detail.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
