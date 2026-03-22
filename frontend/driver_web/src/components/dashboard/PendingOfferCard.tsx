import type { PendingRideOffer } from "../../types/ride";
import { formatDistance, formatDuration, titleizeStatus } from "../../utils/formatters";
import { StatusBadge } from "../common/StatusBadge";

function expiresInLabel(expiresAt: string | null) {
  if (!expiresAt) {
    return "Expiring soon";
  }
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) {
    return "Expired";
  }
  const minutes = Math.max(1, Math.ceil(ms / 60000));
  return `${minutes} min left`;
}

export function PendingOfferCard({
  offer,
  actionLoading,
  onAccept,
  onReject,
}: {
  offer: PendingRideOffer;
  actionLoading: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-amber-800">New ride offer</p>
          <h3 className="mt-2 text-xl font-semibold text-ink">{offer.pickupAddress}</h3>
          <p className="mt-1 text-sm text-muted">to {offer.destinationAddress}</p>
        </div>
        <StatusBadge label={titleizeStatus(offer.status)} tone="amber" />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Trip</p>
          <p className="mt-2 text-lg font-semibold text-ink">{formatDistance(offer.estimatedDistanceMiles)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Payout</p>
          <p className="mt-2 text-lg font-semibold text-ink">{offer.payoutEstimate != null ? `$${offer.payoutEstimate.toFixed(2)}` : "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Offer window</p>
          <p className="mt-2 text-lg font-semibold text-ink">{expiresInLabel(offer.expiresAt)}</p>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onAccept}
          disabled={actionLoading}
          className="flex-1 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accentDark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {actionLoading ? "Accepting..." : "Accept ride"}
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={actionLoading}
          className="flex-1 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-70"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
