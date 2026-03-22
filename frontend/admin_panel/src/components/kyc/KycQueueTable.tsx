import { StatusBadge } from "../common/StatusBadge";
import type { AdminKycQueueItem } from "@shared/types/kyc";

type KycQueueTableProps = {
  items: AdminKycQueueItem[];
  onOpen: (driverUserId: string) => void;
};

function formatStatus(status: AdminKycQueueItem["overallStatus"]) {
  return status.replace(/_/g, " ");
}

function formatDate(value?: string) {
  if (!value) {
    return "Not submitted";
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function KycQueueTable({ items, onOpen }: KycQueueTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-sand-200">
          <thead className="bg-sand-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              <th className="px-5 py-4">Driver</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Submitted</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {items.map((item) => (
              <tr key={item.driverUserId} className="text-sm text-ink">
                <td className="px-5 py-4">
                  <div className="font-semibold text-ink">
                    {item.driverName ?? item.driverUserId}
                  </div>
                  <div className="text-xs text-muted">{item.driverUserId}</div>
                </td>
                <td className="px-5 py-4 text-muted">{item.driverEmail ?? "Unavailable"}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={item.overallStatus} label={formatStatus(item.overallStatus)} />
                </td>
                <td className="px-5 py-4 text-muted">{formatDate(item.submittedAt)}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onOpen(item.driverUserId)}
                    className="rounded-full border border-green-600 px-4 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted">
                  No KYC records need review right now.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
