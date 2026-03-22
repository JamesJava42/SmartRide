import type { ActivityFilterTab } from "../../types/activity";

const tabs: { value: ActivityFilterTab; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "PAST", label: "Past" },
  { value: "PAYMENTS", label: "Payments" },
];

export function ActivityFilterTabs({
  activeTab,
  onChange,
}: {
  activeTab: ActivityFilterTab;
  onChange: (tab: ActivityFilterTab) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex min-w-max items-center gap-1 rounded-[22px] border border-[#E5E7EB] bg-white p-1 shadow-[0_10px_26px_rgba(23,33,27,0.04)]">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`whitespace-nowrap rounded-[18px] px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.value
                ? "bg-[#EDF9F2] text-[#1A6B45]"
                : "text-[#67746C] hover:text-[#17211B]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
