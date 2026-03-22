export function SavedPlaceChips({
  items,
  onSelect,
}: {
  items: Array<{ label: string; address: string }>;
  onSelect: (address: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onSelect(item.address)}
          className="rounded-full border border-line bg-canvas px-4 py-2 text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
