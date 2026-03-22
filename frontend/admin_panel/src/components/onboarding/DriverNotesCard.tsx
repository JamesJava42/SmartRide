type DriverNotesCardProps = {
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
};

export function DriverNotesCard({ value, onChange, helperText }: DriverNotesCardProps) {
  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
      <h3 className="text-2xl font-semibold text-ink">Notes</h3>
      <textarea
        className="mt-4 min-h-32 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
        placeholder="Comments"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {helperText ? <p className="mt-3 text-xs text-muted">{helperText}</p> : null}
    </div>
  );
}
