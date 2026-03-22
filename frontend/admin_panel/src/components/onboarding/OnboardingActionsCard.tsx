import { useState } from 'react';

import type { DriverReviewData } from '../../types/onboarding';
import { getApprovalReadiness } from '../../utils/onboarding';

type ActionResult = { type: 'success' | 'error'; message: string };

type Props = {
  data: DriverReviewData;
  notes: string;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onRequestInfo: (notes: string) => Promise<void>;
  onSaveNote?: () => Promise<void>;
  acting: boolean;
  result?: ActionResult | null;
};

export function OnboardingActionsCard({
  data,
  notes,
  onApprove,
  onReject,
  onRequestInfo,
  onSaveNote,
  acting,
  result,
}: Props) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const readiness = getApprovalReadiness(data);

  async function handleRejectSubmit() {
    if (!rejectReason.trim()) {
      return;
    }
    await onReject(rejectReason.trim());
    setShowRejectForm(false);
    setRejectReason('');
  }

  return (
    <div className="rounded-[24px] border border-line bg-white">
      <div className="px-5 py-5">
        <h3 className="text-[18px] font-medium text-ink">Review Actions</h3>
      </div>

      <div className="space-y-4 px-5 pb-5">
        {result ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              result.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {result.message}
          </div>
        ) : null}

        {!readiness.canApprove && readiness.reason ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {readiness.reason}
          </div>
        ) : null}

        {showRejectForm ? (
          <div className="space-y-3">
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              rows={4}
              placeholder="Add a rejection reason for the driver record..."
              className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={acting || !rejectReason.trim()}
                onClick={handleRejectSubmit}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {acting ? 'Saving...' : 'Confirm Reject'}
              </button>
              <button
                type="button"
                disabled={acting}
                onClick={() => setShowRejectForm(false)}
                className="rounded-2xl border border-line px-4 py-3 text-sm font-medium text-ink transition hover:bg-[#f7f5ef]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={acting || !readiness.canApprove}
              onClick={onApprove}
              className="rounded-xl bg-accent px-4 py-3 text-base font-medium text-white transition hover:bg-accentDark disabled:opacity-60"
            >
              {acting ? 'Approving...' : 'Approve'}
            </button>
            <div className="rounded-xl border border-line bg-white" />
            <button
              type="button"
              disabled={acting}
              onClick={() => setShowRejectForm(true)}
              className="rounded-xl border border-line bg-[#f7f7f4] px-4 py-3 text-base font-medium text-ink transition hover:bg-[#f1f1ec] disabled:opacity-60"
            >
              Reject
            </button>
            <div className="rounded-xl border border-line bg-white" />
            <button
              type="button"
              disabled={acting}
              onClick={() => onRequestInfo(notes)}
              className="col-span-2 rounded-xl border border-line px-4 py-3 text-base font-medium text-ink transition hover:bg-[#f7f5ef] disabled:opacity-60"
            >
              {acting ? 'Saving...' : 'Request Info'}
            </button>
            <button
              type="button"
              disabled={acting || !onSaveNote}
              onClick={() => onSaveNote?.()}
              className="col-span-2 rounded-xl border border-line bg-[#f4f3ef] px-4 py-3 text-base font-medium text-ink transition hover:bg-[#ece9e1] disabled:opacity-60"
            >
              Save Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
