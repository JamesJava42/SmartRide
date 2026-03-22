export function LoadingSkeleton() {
  return (
    <div className="space-y-4 rounded-[28px] border border-line bg-surface p-5 shadow-soft">
      <div className="h-5 w-40 animate-pulse rounded-full bg-line" />
      <div className="h-64 animate-pulse rounded-[24px] bg-line" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-14 animate-pulse rounded-2xl bg-line" />
        <div className="h-14 animate-pulse rounded-2xl bg-line" />
        <div className="h-14 animate-pulse rounded-2xl bg-line" />
      </div>
    </div>
  );
}
