import type { ReactNode } from "react";

type InfoRowProps = {
  label: string;
  value: ReactNode;
  action?: ReactNode;
  stackedOnMobile?: boolean;
};

export function InfoRow({ label, value, action, stackedOnMobile = true }: InfoRowProps) {
  return (
    <div className={`flex gap-3 border-b border-line py-3 last:border-b-0 ${stackedOnMobile ? "flex-col sm:flex-row sm:items-center sm:justify-between" : "items-center justify-between"}`}>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
      </div>
      <div className="flex min-w-0 items-center gap-3 sm:ml-auto">
        <div className="min-w-0 text-sm font-semibold text-ink sm:text-right">{value}</div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
