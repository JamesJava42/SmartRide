import type { DriverReviewTab } from "../../api/onboarding";
import { AdminStatusBadge } from "../admin/AdminStatusBadge";

type ReviewTab = DriverReviewTab;

type DriverReviewTabsProps = {
  tabs: ReviewTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

function MetadataList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2 text-sm text-muted">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function DriverReviewTabs({ tabs, activeTab, onTabChange }: DriverReviewTabsProps) {
  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className="rounded-3xl border border-line bg-white shadow-sm">
      <div className="flex flex-wrap gap-2 border-b border-line p-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`rounded-xl px-4 py-2 text-sm transition ${
              tab.id === currentTab.id ? "bg-[#eef6f0] text-accent" : "bg-[#f7f7f5] text-muted hover:text-ink"
            }`}
            onClick={() => onTabChange(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-ink">{currentTab.label}</h3>
          {currentTab.verification_status ? <AdminStatusBadge value={currentTab.verification_status} /> : null}
        </div>
        <p className="mt-4 text-sm leading-7 text-muted">{currentTab.content}</p>
        {currentTab.metadata?.length ? <MetadataList items={currentTab.metadata} /> : null}
        {currentTab.file_url ? (
          <a
            className="mt-5 inline-flex rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#f7f7f5]"
            href={currentTab.file_url}
            rel="noreferrer"
            target="_blank"
          >
            Open document
          </a>
        ) : null}
      </div>
    </div>
  );
}
