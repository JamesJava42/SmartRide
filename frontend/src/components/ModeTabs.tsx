import type { RideMode } from "../types/api";

const modes: RideMode[] = ["ride", "reserve", "courier", "hourly"];

export function ModeTabs({
  value,
  onChange,
}: {
  value: RideMode;
  onChange: (mode: RideMode) => void;
}) {
  return (
    <div className="inline-flex rounded-2xl bg-canvas p-1">
      {modes.map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold capitalize transition ${
            value === mode ? "bg-surface text-ink shadow-soft" : "text-muted"
          }`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}
