import { useState } from "react";

type KycDecisionPanelProps = {
  onApprove: () => Promise<unknown>;
  onReject: (reason: string, notes?: string) => Promise<unknown>;
  onRequestMoreInfo: (reason: string, notes?: string) => Promise<unknown>;
  isActing?: boolean;
};

export function KycDecisionPanel({
  onApprove,
  onReject,
  onRequestMoreInfo,
  isActing = false,
}: KycDecisionPanelProps) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleReject() {
    if (!reason.trim()) {
      setLocalError("A reason is required before rejecting KYC.");
      return;
    }
    setLocalError(null);
    await onReject(reason.trim(), notes.trim() || undefined);
  }

  async function handleMoreInfo() {
    if (!reason.trim()) {
      setLocalError("A reason is required before requesting more information.");
      return;
    }
    setLocalError(null);
    await onRequestMoreInfo(reason.trim(), notes.trim() || undefined);
  }

  async function handleApprove() {
    setLocalError(null);
    await onApprove();
  }

  return (
    <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-ink">Review decision</h2>
        <p className="text-sm text-muted">
          Record an approval or send the driver back with an explicit reason.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Reason</span>
          <input
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="w-full rounded-2xl border border-sand-300 px-4 py-3 text-sm text-ink outline-none transition focus:border-green-600"
            placeholder="Required for reject or request more info"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="min-h-[120px] w-full rounded-2xl border border-sand-300 px-4 py-3 text-sm text-ink outline-none transition focus:border-green-600"
            placeholder="Optional internal notes"
          />
        </label>

        {localError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {localError}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleApprove}
            disabled={isActing}
            className="rounded-full bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isActing ? "Saving..." : "Approve"}
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={isActing}
            className="rounded-full border border-rose-300 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={handleMoreInfo}
            disabled={isActing}
            className="rounded-full border border-amber-300 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          >
            Request more info
          </button>
        </div>
      </div>
    </div>
  );
}
