import type { ActivitySectionGroup } from "../../types/activity";
import { ActivityItemCard } from "./ActivityItemCard";

export function ActivitySection({ group }: { group: ActivitySectionGroup }) {
  return (
    <section className="space-y-3">
      <h2 className="text-[20px] font-medium text-[#17211B]">{group.label}</h2>
      <div className="space-y-3">
        {group.items.map((item) => (
          <ActivityItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
