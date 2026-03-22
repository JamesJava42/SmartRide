import { useState } from "react";
import { OnboardingStatusBadge } from "./OnboardingStatusBadge";
import type { OnboardingProfile } from "@shared/types/driver";

type Props = {
  onboarding: OnboardingProfile;
  onApprove: (notes: string) => void;
  onReject: (reason: string) => void;
  isSubmitting: boolean;
};

function fmt(ts: string | null) {
  if (!ts) return null;
  return new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function OnboardingReviewPanel({ onboarding, onApprove, onReject, isSubmitting }: Props) {
  const [notes, setNotes] = useState(onboarding.review_notes ?? "");
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  // Only allow actions on statuses that are pending review
  const canAct = onboarding.status === "SUBMITTED" || onboarding.status === "UNDER_REVIEW" || onboarding.status === "DOCS_PENDING";
  const isApproved = onboarding.status === "APPROVED";
  const isRejected = onboarding.status === "REJECTED";

  return (
    <div className="rounded-2xl border border-line bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-line flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Onboarding Review</h3>
        <OnboardingStatusBadge status={onboarding.status} size="sm" />
      </div>
      <div className="px-5 py-4 space-y-3">
        {/* Timeline */}
        {onboarding.submitted_at && (
          <div className="flex justify-between text-xs">
            <span className="text-muted">Submitted</span>
            <span className="text-ink">{fmt(onboarding.submitted_at)}</span>
          </div>
        )}
        {onboarding.review_started_at && (
          <div className="flex justify-between text-xs">
            <span className="text-muted">Review started</span>
            <span className="text-ink">{fmt(onboarding.review_started_at)}</span>
          </div>
        )}
        {onboarding.reviewed_at && (
          <div className="flex justify-between text-xs">
            <span className="text-muted">Reviewed</span>
            <span className="text-ink">{fmt(onboarding.reviewed_at)}</span>
          </div>
        )}

        {/* Approved — show confirmation banner, no action buttons */}
        {isApproved && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2">
            <span className="text-emerald-600 font-semibold text-sm">✓ Driver approved</span>
          </div>
        )}

        {/* Rejected — show reason */}
        {isRejected && onboarding.rejection_reason && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 space-y-1">
            <p className="text-xs font-semibold text-red-700">Rejection reason</p>
            <p className="text-xs text-red-700">{onboarding.rejection_reason}</p>
          </div>
        )}

        {/* Review notes (for all terminal statuses) */}
        {onboarding.review_notes && !canAct && (
          <div className="rounded-xl bg-[#f7f7f5] px-4 py-3 text-xs text-ink">
            <span className="font-medium text-muted">Notes: </span>{onboarding.review_notes}
          </div>
        )}

        {/* Action area — only for pending statuses */}
        {canAct && (
          <div className="space-y-3 pt-2 border-t border-line">
            <textarea
              className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 resize-none"
              rows={3}
              placeholder="Review notes (optional for approval)…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {!showReject ? (
              <div className="flex gap-2">
                <button
                  disabled={isSubmitting}
                  onClick={() => onApprove(notes)}
                  className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accentDark disabled:opacity-60 transition"
                >
                  {isSubmitting ? "Saving…" : "Approve"}
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => setShowReject(true)}
                  className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 transition"
                >
                  Reject
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  className="w-full rounded-xl border border-red-200 px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 resize-none"
                  rows={2}
                  placeholder="Rejection reason (required)…"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    disabled={isSubmitting || !rejectReason.trim()}
                    onClick={() => onReject(rejectReason.trim())}
                    className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition"
                  >
                    {isSubmitting ? "Saving…" : "Confirm Reject"}
                  </button>
                  <button onClick={() => setShowReject(false)} className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink hover:bg-[#f7f7f5] transition">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
