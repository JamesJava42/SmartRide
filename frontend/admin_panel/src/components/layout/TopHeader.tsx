import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { clearSession, getCurrentUser, type CurrentUser } from "../../api/auth";

export function TopHeader() {
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => undefined);
  }, []);

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <header className="border-b border-[#e6e0d6] bg-white px-5 py-4 xl:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="hidden max-w-md flex-1 items-center gap-3 xl:flex">
          <input
            placeholder="Search rides, drivers, onboarding..."
            className="w-full rounded-2xl border border-[#e6e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none"
          />
          <div className="rounded-full bg-[#edf6ef] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {user?.role ? user.role.replaceAll("_", " ") : "Admin"}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e6e0d6] text-lg">
            ␣
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e6e0d6] text-lg">
            ↻
          </button>
          <div className="hidden text-right xl:block">
            <div className="text-sm font-semibold text-ink">{user?.email ?? "admin@rideconnect.com"}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">Operations</div>
          </div>
          <button
            className="rounded-full border border-[#d8d1c7] px-5 py-2 text-sm font-semibold"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
