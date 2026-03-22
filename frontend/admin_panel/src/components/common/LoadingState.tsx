type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({ label = "Loading...", className }: LoadingStateProps) {
  return (
    <div className={`rounded-3xl border border-line bg-white px-6 py-12 text-center text-sm text-muted ${className ?? ""}`}>
      {label}
    </div>
  );
}
