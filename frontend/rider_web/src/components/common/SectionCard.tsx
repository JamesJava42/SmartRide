import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function SectionCard({ title, subtitle, action, children }: SectionCardProps) {
  return (
    <section className="rounded-[24px] border border-line bg-white shadow-[0_16px_40px_rgba(23,33,27,0.04)]">
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
        <div>
          <h3 className="text-base font-semibold text-ink sm:text-lg">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="px-5 py-2 sm:px-6 sm:py-3">{children}</div>
    </section>
  );
}
