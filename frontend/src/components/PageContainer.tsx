import type { ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="rounded-[30px] border border-line bg-surface shadow-soft">{children}</div>;
}
