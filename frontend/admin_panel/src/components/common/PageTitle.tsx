type PageTitleProps = {
  title: string;
  subtitle?: string;
};

export function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <div>
      <h1 className="text-4xl font-semibold tracking-tight text-ink">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
    </div>
  );
}
