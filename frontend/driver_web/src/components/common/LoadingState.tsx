export function LoadingState({ label = "Loading driver data..." }: { label?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-white/70 p-8 text-center text-sm text-muted">
      {label}
    </div>
  );
}
