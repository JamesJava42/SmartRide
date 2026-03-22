import type { RideOption } from "../types/api";

export function RideOptionCard({
  option,
  selected,
  onSelect,
}: {
  option: RideOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={option.unavailable}
      className={`w-full rounded-[24px] border p-4 text-left transition ${
        option.unavailable
          ? "cursor-not-allowed border-line bg-canvas/50 opacity-50"
          : selected
            ? "border-accent bg-[#edf6ef] shadow-soft"
            : "border-line bg-surface hover:border-accent/40 hover:shadow-soft"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink">{option.productName}</h3>
          <p className="mt-1 text-sm text-muted">{option.descriptor}</p>
        </div>
        <span className="text-lg font-semibold text-ink">${option.price}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium uppercase tracking-[0.14em] text-muted">
        <span>{option.etaMinutes} min away</span>
        <span>{option.capacity} seats</span>
        <span>{option.luggage}</span>
      </div>
    </button>
  );
}
