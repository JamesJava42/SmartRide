export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-white/70 p-8 text-center">
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </div>
  );
}
