import type { RouteData } from "../types/api";
import { formatMiles, formatMinutes } from "../utils/formatters";

export function StickyRideSummaryBar({
  fareValue,
  onRequestRide,
  loading,
  rideRequested,
  driverAssigned,
  statusText,
  routeData,
  ctaLabel,
}: {
  fareValue: string;
  onRequestRide: () => void;
  loading: boolean;
  rideRequested: boolean;
  driverAssigned: boolean;
  statusText: string;
  routeData: RouteData | null;
  ctaLabel?: string;
}) {
  if (!routeData) {
    return null;
  }

  return (
    <div className="sticky bottom-3 z-20 rounded-[20px] border border-line bg-surface/95 p-3 shadow-soft backdrop-blur">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-[1.2rem] font-semibold text-ink">
          <span>${fareValue}</span>
          <span className="text-muted">|</span>
          <span>{formatMinutes(routeData.durationSeconds)} min</span>
          <span className="text-muted">|</span>
          <span className="text-sm font-medium text-muted">Est. Fare:</span>
          <span>${fareValue}</span>
          <p className="w-full text-xs font-medium text-muted md:mt-1">
            {statusText} • {formatMiles(routeData.distanceMeters)} mi
          </p>
        </div>
        <button
          type="button"
          onClick={onRequestRide}
          disabled={loading || rideRequested}
          className="min-w-[10rem] rounded-md bg-[#6f716d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5a5c58] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Requesting..." : driverAssigned ? "Driver Assigned" : rideRequested ? "Ride Requested" : ctaLabel ?? "Request Ride"}
        </button>
      </div>
    </div>
  );
}
