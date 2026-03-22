import type { ReactNode } from "react";

export function ActivityStatCard({
  icon,
  value,
  label,
}: {
  icon?: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[8px] border border-[#E2E4E0] bg-white px-5 py-5">
      <div className="flex items-center gap-2 text-[#154E38]">
        {icon ? <span className="shrink-0">{icon}</span> : null}
        <span className="text-[18px] font-medium leading-none text-[#17211B]">{value}</span>
      </div>
      <div className="mt-3 text-[16px] leading-none text-[#2B2F2C]">{label}</div>
    </div>
  );
}
