type Tab = {
  id: string;
  label: string;
};

type Props = {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
};

export function OnboardingTabs({ tabs, activeTab, onChange }: Props) {
  return (
    <div className="border-b border-line px-4 pt-3">
      <div className="flex min-w-max gap-5 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`border-b-2 px-0 pb-3 text-[15px] font-medium transition ${
                isActive
                  ? 'border-accent text-ink'
                  : 'border-transparent text-muted hover:text-ink'
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
