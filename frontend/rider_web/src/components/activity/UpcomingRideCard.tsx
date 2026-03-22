import type { RiderUpcomingRide } from "../../types/activity";
import { formatDate } from "../../utils/formatters";

export function UpcomingRideCard({ ride }: { ride: RiderUpcomingRide }) {
  return (
    <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_36px_rgba(23,33,27,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="inline-flex rounded-full bg-[#FEF3C7] px-3 py-1 text-[11px] font-semibold text-[#92400E]">
            Scheduled
          </span>
          <div className="mt-3 text-base font-semibold text-[#17211B]">{ride.short_route}</div>
          <div className="mt-2 text-sm text-[#67746C]">{formatDate(ride.scheduled_for)}</div>
        </div>
        <div className="text-right text-sm text-[#67746C]">
          <div>{ride.ride_type}</div>
          <div className="mt-1">{ride.payment_method}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAF8] px-4 py-2.5 text-sm font-medium text-[#17211B]">
          View details
        </button>
        <button type="button" className="rounded-2xl border border-[#FCA5A5] bg-white px-4 py-2.5 text-sm font-medium text-[#B91C1C]">
          Cancel ride
        </button>
      </div>
    </div>
  );
}
