import type { ActivityFilter } from "../../types/activity";

const tabs: { value: ActivityFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "PAST", label: "Past" },
  { value: "PAYMENTS", label: "Payments" },
];

export function ActivityTabs({
  active,
  onChange,
}: {
  active: ActivityFilter;
  onChange: (value: ActivityFilter) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex min-w-max items-center rounded-[10px] border border-[#CFCFCB] bg-white">
        {tabs.map((tab) => {
          const isActive = tab.value === active;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={`border-r border-[#CFCFCB] px-4 py-2 text-[16px] font-medium leading-none transition last:border-r-0 ${
                isActive ? "bg-[#F1F3EF] text-[#1A6B45]" : "text-[#17211B]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
