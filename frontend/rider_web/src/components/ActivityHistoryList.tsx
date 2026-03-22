import { Link } from "react-router-dom";

import type { RideHistoryItem } from "../types/api";
import { formatCurrency, formatDateTime, titleizeStatus } from "../utils/formatters";

export function ActivityHistoryList({ items }: { items: RideHistoryItem[] }) {
  if (!items.length) {
    return <div className="rounded-[24px] border border-dashed border-line bg-canvas px-4 py-6 text-sm text-muted">No rides yet.</div>;
  }

  return (
    <div className="space-y-4">
      {items.map((ride) => (
        <article key={ride.ride_id} className="rounded-[24px] border border-line bg-surface p-4 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-base font-semibold text-ink">
                {ride.pickup_label} to {ride.destination_label}
              </p>
              <p className="mt-1 text-sm text-muted">{formatDateTime(ride.created_at)}</p>
              <p className="mt-1 text-sm text-muted">{titleizeStatus(ride.status)}</p>
            </div>
            <div className="text-right">
              <p className="text-base font-semibold text-ink">{formatCurrency(ride.fare)}</p>
              <p className="mt-1 text-sm text-muted">{ride.driver_name ?? "Driver pending"}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={`/tracking/${ride.ride_id}`} className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white">
              View details
            </Link>
            <button type="button" className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink">
              View receipt
            </button>
            <button type="button" className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink">
              Rebook
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
