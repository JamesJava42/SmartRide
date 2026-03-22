const tabs = ["personal", "vehicle", "documents", "account"] as const;

export type ProfileTab = (typeof tabs)[number];

export function ProfileTabs({ activeTab, onChange }: { activeTab: ProfileTab; onChange: (tab: ProfileTab) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === tab ? "bg-ink text-white" : "bg-white text-muted ring-1 ring-line hover:text-ink"
          }`}
        >
          {tab === "personal" ? "Personal Info" : tab === "vehicle" ? "Vehicle" : tab === "documents" ? "Documents" : "Account"}
        </button>
      ))}
    </div>
  );
}
