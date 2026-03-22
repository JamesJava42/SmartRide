import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { AdminKpiCard } from "../components/admin/AdminKpiCard";
import { api } from "../services/api";

export function AdminRegionDetailPage() {
  const { regionId = "" } = useParams();
  const metricsQuery = useQuery({ queryKey: ["admin-region-metrics", regionId], queryFn: () => api.getAdminRegionMetrics(regionId), enabled: Boolean(regionId) });

  if (metricsQuery.isLoading || !metricsQuery.data) {
    return <div className="rounded-[28px] border border-line bg-white p-6 text-sm text-muted">Loading region operations...</div>;
  }

  const data = metricsQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{data.region_name}</h1>
        <p className="mt-1 text-sm text-muted">Region-level operations summary.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard label="Active rides" value={data.active_rides} />
        <AdminKpiCard label="Drivers online" value={data.drivers_online} />
        <AdminKpiCard label="Pending approvals" value={data.pending_approvals} />
        <AdminKpiCard label="Matching load" value={data.matching_load} />
      </div>
    </div>
  );
}
