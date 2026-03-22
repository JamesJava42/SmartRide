import { useEffect, useState } from 'react';

type Props = {
  driverId: string;
  initialNotes: string | null;
  onSave: (notes: string) => void;
  saving: boolean;
};

export function ReviewNotesPanel({ initialNotes, onSave, saving }: Props) {
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNotes(initialNotes ?? '');
  }, [initialNotes]);

  function handleSave() {
    onSave(notes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Review Notes</h3>
        {saved && (
          <span className="text-xs font-medium text-emerald-600">✓ Saved</span>
        )}
      </div>
      <textarea
        className="w-full resize-none rounded-xl border border-line bg-[#fafaf8] px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
        rows={5}
        placeholder="Add internal review notes here. These are saved separately from the final decision."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="mt-3 flex justify-end">
        <button
          disabled={saving}
          onClick={handleSave}
          className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink transition hover:bg-[#f7f7f5] disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Notes'}
        </button>
      </div>
    </div>
  );
}
