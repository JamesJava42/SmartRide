import { useEffect, useState } from "react";
import { DriverProfileDrawer } from "@shared/components/driver-profile";
import { OnboardingStatusBadge } from "@shared/components/driver-profile";
import { PageTitle } from "../components/common/PageTitle";
import { apiDataRequest } from "../api/client";
import { getOnboardingQueue, type OnboardingQueueItem } from "../api/onboarding";

type StatusFilter = "ALL" | "SUBMITTED" | "UNDER_REVIEW" | "DOCS_PENDING" | "APPROVED" | "REJECTED";

const STATUS_OPTS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "DOCS_PENDING", label: "Docs Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export function OnboardingQueuePage() {
  const [queue, setQueue] = useState<OnboardingQueueItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getOnboardingQueue().then((q) => { setQueue(q); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (notes: string) => {
    if (!selectedId) return;
    await apiDataRequest(`/admin/onboarding/${selectedId}/approve`, { method: "POST", body: { review_notes: notes || null } });
    load();
    setSelectedId(null);
  };

  const handleReject = async (reason: string) => {
    if (!selectedId) return;
    await apiDataRequest(`/admin/onboarding/${selectedId}/reject`, { method: "POST", body: { rejection_reason: reason } });
    load();
    setSelectedId(null);
  };

  const filtered = queue.filter((item) => statusFilter === "ALL" || item.status === statusFilter);

  return (
    <div className="space-y-6">
      <PageTitle title="Onboarding Queue" />

      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
        >
          {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f7f7f5] text-muted">
            <tr>
              <th className="px-5 py-4 font-medium">Driver</th>
              <th className="px-5 py-4 font-medium">Region</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Submitted</th>
              <th className="px-5 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-muted text-sm">Loading…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-muted text-sm">No submissions found.</td></tr>
            )}
            {filtered.map((item) => (
              <tr key={item.driver_id} className="border-t border-line hover:bg-[#fafaf8] transition cursor-pointer" onClick={() => setSelectedId(item.driver_id)}>
                <td className="px-5 py-4">
                  <div className="font-medium text-ink">{item.driver_name}</div>
                  {item.email && <div className="text-xs text-muted">{item.email}</div>}
                </td>
                <td className="px-5 py-4 text-muted text-xs">{item.region_name}</td>
                <td className="px-5 py-4"><OnboardingStatusBadge status={item.status as any} size="sm" /></td>
                <td className="px-5 py-4 text-xs text-muted">
                  {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-4">
                  <button
                    className="rounded-xl border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-[#f7f7f5] transition"
                    onClick={(e) => { e.stopPropagation(); setSelectedId(item.driver_id); }}
                  >Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DriverProfileDrawer
        driverId={selectedId}
        viewMode="admin"
        onClose={() => setSelectedId(null)}
        onApproveOnboarding={handleApprove}
        onRejectOnboarding={handleReject}
      />
    </div>
  );
}
