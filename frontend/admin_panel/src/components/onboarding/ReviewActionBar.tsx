import { useState } from 'react';
import type { DriverReviewData } from '../../types/onboarding';
import { getApprovalReadiness } from '../../utils/onboarding';

type ActionResult = { type: 'success' | 'error'; message: string };

type Props = {
  data: DriverReviewData;
  notes: string;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onRequestInfo: (notes: string) => void;
  acting: boolean;
  result?: ActionResult | null;
};

export function ReviewActionBar({ data, notes, onApprove, onReject, onRequestInfo, acting, result }: Props) {
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { canApprove, reason: blockReason } = getApprovalReadiness(data);
  const onboarding = data.onboarding;

  if (onboarding?.status === 'APPROVED') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <p className="text-sm font-semibold text-emerald-700">
          ✓ Driver has been approved. No further actions needed.
        </p>
      </div>
    );
  }

  if (onboarding?.status === 'REJECTED') {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 space-y-1">
        <p className="text-sm font-semibold text-red-700">✗ Application rejected</p>
        {onboarding.rejection_reason && (
          <p className="text-xs text-red-600">{onboarding.rejection_reason}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {result && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${result.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {result.message}
        </div>
      )}

      {!canApprove && blockReason && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          {blockReason}
        </div>
      )}

      {showReject && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Rejection Reason</p>
          <textarea
            className="w-full resize-none rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
            rows={3}
            placeholder="Explain why this application is being rejected…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              disabled={acting || !rejectReason.trim()}
              onClick={() => { onReject(rejectReason.trim()); setShowReject(false); }}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition"
            >
              {acting ? 'Saving…' : 'Confirm Reject'}
            </button>
            <button
              onClick={() => setShowReject(false)}
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink hover:bg-[#f7f7f5] transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showReject && (
        <div className="flex flex-wrap gap-3">
          <button
            disabled={acting || !canApprove}
            onClick={onApprove}
            title={!canApprove ? (blockReason ?? '') : ''}
            className="flex-1 rounded-xl bg-accent py-3 text-sm font-semibold text-white hover:bg-accentDark disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {acting ? 'Processing…' : 'Approve Onboarding'}
          </button>
          <button
            disabled={acting}
            onClick={() => onRequestInfo(notes)}
            className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-60 transition"
          >
            Request More Info
          </button>
          <button
            disabled={acting}
            onClick={() => { setShowReject(true); setRejectReason(''); }}
            className="rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 transition"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
