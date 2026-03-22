import type { AuthUser } from "@shared/types/auth";

export function DriverTopbar({ user, onLogout }: { user: AuthUser | null; onLogout: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/90 px-4 py-4 backdrop-blur lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">RideConnect Driver</p>
          <h1 className="text-lg font-semibold text-ink lg:text-xl">{user?.fullName ?? "Driver workspace"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent sm:block">
            Daily Ops
          </div>
          <button type="button" onClick={onLogout} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-canvas">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
