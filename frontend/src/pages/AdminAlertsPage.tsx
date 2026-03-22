import { useQuery } from "@tanstack/react-query";
import { AdminStatusBadge } from "../components/admin/AdminStatusBadge";
import { api } from "../services/api";

export function AdminAlertsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-alerts"], queryFn: () => api.getAdminAlerts(), refetchInterval: 5000 });

  if (isLoading || !data) {
    return <div className="rounded-[28px] border border-line bg-white p-6 text-sm text-muted">Loading alerts...</div>;
  }

  return (
    <div className="rounded-[28px] border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alerts Center</h1>
          <p className="mt-1 text-sm text-muted">Operational spikes, onboarding backlog, and health warnings.</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        {data.map((alert) => (
          <div key={alert.title} className="rounded-[24px] border border-line bg-[#faf8f4] p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="text-lg font-semibold">{alert.title}</div>
              <AdminStatusBadge value={alert.level} />
            </div>
            <div className="mt-2 text-sm text-muted">{alert.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
