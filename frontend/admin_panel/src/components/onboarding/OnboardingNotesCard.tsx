import { useEffect, useState } from 'react';

type Props = {
  initialNotes: string | null;
  onSave: (notes: string) => Promise<void>;
  saving: boolean;
};

export function OnboardingNotesCard({ initialNotes, onSave, saving }: Props) {
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNotes(initialNotes ?? '');
  }, [initialNotes]);

  async function handleSave() {
    await onSave(notes);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="rounded-3xl border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Internal Notes</p>
        {saved ? <span className="text-xs font-medium text-emerald-600">Saved</span> : null}
      </div>
      <div className="space-y-3 px-5 py-5">
        <textarea
          rows={5}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Add internal compliance or operations notes..."
          className="w-full rounded-2xl border border-line bg-[#faf8f3] px-4 py-3 text-sm text-ink placeholder:text-muted outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">Only admins can see these notes.</p>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-2xl border border-line px-4 py-2 text-sm font-medium text-ink transition hover:bg-[#f7f5ef] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}
