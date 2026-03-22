import { StatusPill } from "../common/StatusPill";
import type { RiderProfileData } from "../../types/riderProfile";

type RiderProfileSummaryCardProps = {
  profile: RiderProfileData;
  onLogout: () => void;
};

function getInitial(value: string) {
  return value.trim().charAt(0).toUpperCase() || "R";
}

export function RiderProfileSummaryCard({ profile, onLogout }: RiderProfileSummaryCardProps) {
  return (
    <aside className="rounded-[28px] border border-line bg-white p-5 shadow-[0_20px_60px_rgba(23,33,27,0.05)] sm:p-6">
      <div className="flex flex-col items-center text-center md:items-start md:text-left">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-[2.5px] border-[#1A6B45] bg-white text-[2rem] font-semibold text-[#1A6B45]">
          {getInitial(profile.fullName)}
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.03em] text-ink">{profile.fullName}</h1>
        <p className="mt-2 text-sm text-muted">{profile.email}</p>
        <div className="mt-4">
          <StatusPill>{profile.statusLabel}</StatusPill>
        </div>
      </div>

      <div className="mt-6 rounded-[22px] border border-line bg-[#FCFCFA] p-4">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">Total rides</p>
            <p className="mt-2 text-xl font-bold text-ink">{profile.totalRides}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">Member since</p>
            <p className="mt-2 text-xl font-bold text-ink">{profile.memberSinceLabel}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">Preferred payment</p>
            <p className="mt-2 text-xl font-bold text-ink">{profile.preferredPayment}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3 rounded-[22px] border border-line bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Saved places</span>
          <span className="text-sm font-semibold text-ink">{profile.savedPlacesCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Preferred city</span>
          <span className="text-sm font-semibold text-ink">{profile.preferredCity}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Rider ID</span>
          <span className="text-sm font-semibold text-ink">{profile.userId}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="mt-6 w-full rounded-2xl border border-rose-500 bg-white px-4 py-3 text-sm font-semibold text-rose-500 transition hover:bg-rose-50"
      >
        Log out
      </button>
    </aside>
  );
}
