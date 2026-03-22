type EmptyStateProps = {
  title: string;
  description: string;
  icon?: string;
  className?: string;
};

export function EmptyState({ title, description, icon = "—", className }: EmptyStateProps) {
  return (
    <div className={`rounded-3xl border border-dashed border-line bg-white px-6 py-12 text-center ${className ?? ""}`}>
      <div className="mb-3 text-2xl text-muted">{icon}</div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </div>
  );
}
