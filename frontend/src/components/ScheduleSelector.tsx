export function ScheduleSelector({
  value,
  date,
  time,
  onChange,
  onDateChange,
  onTimeChange,
}: {
  value: "Leave now" | "Schedule";
  date: string;
  time: string;
  onChange: (value: "Leave now" | "Schedule") => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <select value={value} onChange={(event) => onChange(event.target.value as "Leave now" | "Schedule")} className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none">
        <option>Leave now</option>
        <option>Schedule</option>
      </select>
      {value === "Schedule" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <input type="date" value={date} onChange={(event) => onDateChange(event.target.value)} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none" />
          <input type="time" value={time} onChange={(event) => onTimeChange(event.target.value)} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none" />
        </div>
      ) : null}
    </div>
  );
}
