export function DriverCard({
  name,
  rating,
  vehicle,
  color,
  plate,
  eta,
}: {
  name: string;
  rating: string;
  vehicle: string;
  color: string;
  plate: string;
  eta: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-[24px] border border-line bg-surface p-4 shadow-soft">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-canvas text-sm font-bold text-ink">{initials}</div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-ink">{name}</p>
          <p className="text-sm text-muted">
            {vehicle} • {color}
          </p>
          <p className="text-sm text-muted">
            {plate} • {rating} rating
          </p>
        </div>
        <div className="rounded-full bg-[#edf6ef] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">{eta}</div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {["Call", "Message", "Cancel Ride"].map((action) => (
          <button key={action} type="button" className="rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink">
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}
