type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">⌕</span>
      <input
        className="w-full rounded-2xl border border-line bg-white px-10 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
