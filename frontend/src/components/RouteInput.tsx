export function RouteInput({
  placeholder,
  icon,
  value,
  onChange,
  onFocus,
  trailingAction,
  suggestions,
}: {
  placeholder: string;
  icon: "pickup" | "destination";
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  trailingAction?: {
    label: string;
    onClick: () => void;
  };
  suggestions?: string[];
}) {
  const datalistId = suggestions?.length ? `${icon}-${placeholder.toLowerCase()}-suggestions` : undefined;

  return (
    <div className="relative">
      <span
        className={`pointer-events-none absolute left-5 top-1/2 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center ${
          icon === "pickup" ? "rounded-full bg-black text-white" : "rounded-[4px] bg-black text-white"
        }`}
      >
        <span
          className={`block ${icon === "pickup" ? "h-1.5 w-1.5 rounded-full border border-white" : "h-1.5 w-1.5 rounded-[1px] border border-white"}`}
        />
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        list={datalistId}
        className={`w-full rounded-[22px] border border-[#ece7df] bg-[#f7f6f3] py-5 pl-14 text-[15px] text-ink outline-none ${
          trailingAction ? "pr-16" : "pr-4"
        }`}
      />
      {datalistId ? (
        <datalist id={datalistId}>
          {suggestions?.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      ) : null}
      {trailingAction ? (
        <button
          type="button"
          onClick={trailingAction.onClick}
          aria-label={trailingAction.label}
          className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black bg-black text-[1.8rem] leading-none text-white"
        >
          +
        </button>
      ) : null}
    </div>
  );
}
