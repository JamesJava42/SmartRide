type Props = { rating: number | null; totalRides: number; size?: "sm" | "md" | "lg" };

function Stars({ rating, size }: { rating: number; size: string }) {
  const starSize = size === "lg" ? "text-lg" : size === "md" ? "text-base" : "text-sm";
  return (
    <span className={`${starSize} leading-none`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.min(1, Math.max(0, rating - (i - 1)));
        if (fill >= 1) return <span key={i} className="text-amber-400">★</span>;
        if (fill > 0) return <span key={i} className="text-amber-300">★</span>;
        return <span key={i} className="text-slate-200">★</span>;
      })}
    </span>
  );
}

export function DriverRatingDisplay({ rating, totalRides, size = "md" }: Props) {
  const isNew = rating === null && totalRides < 5;
  const numSize = size === "lg" ? "text-2xl font-bold" : size === "md" ? "text-base font-semibold" : "text-sm font-medium";
  const subSize = size === "lg" ? "text-sm" : "text-xs";

  if (isNew) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">New Driver</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {rating !== null && <Stars rating={rating} size={size} />}
      <span className={`${numSize} text-ink`}>{rating !== null ? rating.toFixed(1) : "—"}</span>
      <span className={`${subSize} text-muted`}>{totalRides.toLocaleString()} rides</span>
    </div>
  );
}
