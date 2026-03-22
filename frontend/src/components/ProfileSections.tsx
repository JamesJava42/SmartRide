import type { User } from "../types/api";

export function ProfileSections({ user }: { user: User | undefined }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[28px] border border-line bg-surface p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">Account summary</h2>
        <div className="mt-4 space-y-2 text-sm text-muted">
          <p className="text-base font-semibold text-ink">{user?.full_name}</p>
          <p>{user?.email}</p>
          <p>{user?.phone_number}</p>
        </div>
        <div className="mt-5 space-y-3">
          {["Home", "Work", "Add a place"].map((item) => (
            <div key={item} className="rounded-2xl border border-line bg-canvas px-4 py-3 text-sm text-ink">
              {item}
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-[28px] border border-line bg-surface p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">Preferences & support</h2>
        <div className="mt-4 space-y-3 text-sm text-muted">
          {["Payment methods", "Ride preferences", "Notifications", "Help & support", "Logout"].map((item) => (
            <div key={item} className="rounded-2xl border border-line bg-canvas px-4 py-3">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
