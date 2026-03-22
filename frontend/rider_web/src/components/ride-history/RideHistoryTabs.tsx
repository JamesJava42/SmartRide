type TabId = "HISTORY" | "SPENDING" | "INSIGHTS";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "HISTORY", label: "Ride History" },
  { id: "SPENDING", label: "Spending" },
  { id: "INSIGHTS", label: "Insights" },
];

export function RideHistoryTabs({
  activeTab,
  onChange,
}: {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="inline-flex min-w-full items-center gap-1 rounded-[22px] border border-line bg-white p-1 sm:min-w-0">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative whitespace-nowrap rounded-[18px] px-4 py-2.5 text-sm font-medium transition ${active ? "bg-[#EDF9F2] text-[#1A6B45]" : "text-muted hover:text-ink"}`}
            >
              {tab.label}
              {active ? <span className="absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-[#1A6B45]" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
