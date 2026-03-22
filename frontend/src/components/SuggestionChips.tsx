export function SuggestionChips({
  items,
  onSelect,
}: {
  items: string[];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onSelect(item)}
          className="rounded-full border border-line bg-surface px-3 py-2 text-sm font-medium text-muted transition hover:border-accent hover:text-ink"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
