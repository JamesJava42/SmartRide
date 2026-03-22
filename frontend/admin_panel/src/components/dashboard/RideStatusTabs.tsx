const tabs = ["ALL", "MATCHING", "DRIVER_ASSIGNED", "DRIVER_EN_ROUTE", "DRIVER_ARRIVED", "RIDE_STARTED", "NO_DRIVERS_FOUND"];

type RideStatusTabsProps = {
  activeTab: string;
  counts: Record<string, number>;
  onChange: (value: string) => void;
};

export function RideStatusTabs({ activeTab, counts, onChange }: RideStatusTabsProps) {
  const labels: Record<string, string> = {
    ALL: "All",
    MATCHING: "Matching",
    DRIVER_ASSIGNED: "Assigned",
    DRIVER_EN_ROUTE: "En Route",
    DRIVER_ARRIVED: "Arrived",
    RIDE_STARTED: "Started",
    NO_DRIVERS_FOUND: "No Drivers Found",
  };
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-white p-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`rounded-xl px-4 py-2 text-sm transition ${
            activeTab === tab ? "bg-[#f1f1ef] text-ink" : "text-muted hover:bg-[#f7f7f5]"
          }`}
          onClick={() => onChange(tab)}
          type="button"
        >
          {labels[tab] ?? tab.replace(/_/g, " ")} ({counts[tab] ?? 0})
        </button>
      ))}
    </div>
  );
}
