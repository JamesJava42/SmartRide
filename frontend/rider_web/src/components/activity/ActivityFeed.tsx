import type { RiderActivityItem } from "../../types/activity";
import { EmptyState } from "../common/EmptyState";
import { ActivityItem } from "./ActivityItem";

export function ActivityFeed({
  groupedItems,
  selectedItemId,
  onSelect,
  mobile = false,
  emptyTitle,
  emptySubtitle,
}: {
  groupedItems: Array<{ label: string; items: RiderActivityItem[] }>;
  selectedItemId: string | null;
  onSelect: (id: string) => void;
  mobile?: boolean;
  emptyTitle: string;
  emptySubtitle: string;
}) {
  if (!groupedItems.length) {
    return <EmptyState title={emptyTitle} subtitle={emptySubtitle} />;
  }

  return (
    <div className="space-y-4">
      {groupedItems.map((group) => (
        <section
          key={group.label}
          className={
            mobile
              ? "space-y-3"
              : "overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white shadow-[0_16px_40px_rgba(23,33,27,0.04)]"
          }
        >
          <div className={`${mobile ? "px-1 pb-1" : "bg-[#F9FAF8] px-6 py-3"} text-[10px] font-semibold uppercase tracking-[0.09em] text-[#9CA3AF]`}>
            {group.label}
          </div>
          <div className={mobile ? "space-y-3" : ""}>
            {group.items.map((item) => (
              <ActivityItem
                key={item.id}
                item={item}
                mobile={mobile}
                selected={selectedItemId === item.id}
                onSelect={() => onSelect(item.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
