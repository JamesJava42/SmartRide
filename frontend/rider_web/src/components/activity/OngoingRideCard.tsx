import { Link } from "react-router-dom";

import type { RiderCurrentRide } from "../../types/activity";

function statusLabel(status: string) {
  if (status === "RIDE_STARTED") return "In progress";
  if (status === "DRIVER_ARRIVED") return "Waiting";
  return "Driver arriving";
}

export function OngoingRideCard({ ride }: { ride: RiderCurrentRide }) {
  return (
    <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-[0_18px_40px_rgba(23,33,27,0.05)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="inline-flex rounded-full bg-[#EDF9F2] px-3 py-1 text-[11px] font-semibold text-[#1A6B45]">
            {statusLabel(ride.status)}
          </span>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[#17211B]">Current ride</h2>
          <p className="mt-2 text-sm text-[#67746C]">{ride.short_route}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-[#17211B]">{ride.driver_name}</div>
          <div className="mt-1 text-xs text-[#67746C]">
            {ride.vehicle_label} {ride.plate_number !== "—" ? `· ${ride.plate_number}` : ""}
          </div>
          <div className="mt-2 text-xs font-medium text-[#1A6B45]">
            {ride.eta_minutes != null ? `${ride.eta_minutes} min ETA` : "ETA updating"}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          to={`/ride/tracking/${ride.ride_id}`}
          className="inline-flex items-center justify-center rounded-2xl bg-[#1A6B45] px-4 py-3 text-sm font-semibold text-white"
        >
          Track ride
        </Link>
        <button type="button" className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAF8] px-4 py-3 text-sm font-medium text-[#17211B]">
          Message driver
        </button>
        <button type="button" className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAF8] px-4 py-3 text-sm font-medium text-[#17211B]">
          Call driver
        </button>
        <button type="button" className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAF8] px-4 py-3 text-sm font-medium text-[#17211B]">
          Get help
        </button>
      </div>
    </div>
  );
}
