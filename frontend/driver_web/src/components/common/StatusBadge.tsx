type StatusTone = "green" | "gray" | "blue" | "amber" | "red";

function toneClasses(tone: StatusTone) {
  switch (tone) {
    case "green":
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    case "blue":
      return "bg-sky-50 text-sky-700 ring-sky-100";
    case "amber":
      return "bg-amber-50 text-amber-700 ring-amber-100";
    case "red":
      return "bg-rose-50 text-rose-700 ring-rose-100";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

export function StatusBadge({ label, tone = "gray" }: { label: string; tone?: StatusTone }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${toneClasses(tone)}`}>{label}</span>;
}
