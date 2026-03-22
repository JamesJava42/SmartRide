import type { ReactNode } from "react";

type StatusPillProps = {
  children: ReactNode;
  tone?: "green" | "amber" | "slate";
};

const toneClasses = {
  green: "bg-[#EDF9F2] text-[#1A6B45]",
  amber: "bg-[#FEF3C7] text-[#92400E]",
  slate: "bg-[#F3F4F6] text-[#6B7280]",
};

export function StatusPill({ children, tone = "green" }: StatusPillProps) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      <span className="h-2 w-2 rounded-full bg-current opacity-90" />
      {children}
    </span>
  );
}
