import type { RideMode } from "../types/api";

const options: Array<{ value: RideMode; label: string }> = [
  { value: "ride", label: "Ride" },
  { value: "reserve", label: "Reserve" },
  { value: "courier", label: "Courier" },
  { value: "hourly", label: "Hourly" },
];

export function RideTypeDropdown({ value, onChange }: { value: RideMode; onChange: (value: RideMode) => void }) {
  return (
    <div>
      <select value={value} onChange={(event) => onChange(event.target.value as RideMode)} className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
