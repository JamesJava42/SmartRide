import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { AdminKpiCard } from "../components/admin/AdminKpiCard";
import { AdminStatusBadge } from "../components/admin/AdminStatusBadge";
import { api } from "../services/api";

export function AdminDashboardPage() {
  const dashboardQuery = useQuery({ queryKey: ["admin-dashboard"], queryFn: () => api.getAdminDashboardSummary(), refetchInterval: 5000 });
  const ridesQuery = useQuery({ queryKey: ["admin-dashboard-rides"], queryFn: () => api.getAdminActiveRides(), refetchInterval: 5000 });
  const mapQuery = useQuery({ queryKey: ["admin-dashboard-map"], queryFn: () => api.getAdminLiveMap(), refetchInterval: 5000 });
  const alertsQuery = useQuery({ queryKey: ["admin-alerts"], queryFn: () => api.getAdminAlerts(), refetchInterval: 5000 });
  const onboardingQuery = useQuery({ queryKey: ["admin-onboarding-preview"], queryFn: () => api.getAdminOnboardingQueue(), refetchInterval: 10000 });

  if (dashboardQuery.isLoading || !dashboardQuery.data) {
    return <div className="rounded-[28px] border border-line bg-white p-6 text-sm text-muted">Loading admin dashboard...</div>;
  }

  const data = dashboardQuery.data;
  const kpis = [
    { label: "Active rides", value: data.active_rides_now, detail: "Live rides across visible regions" },
    { label: "Drivers online", value: data.drivers_online, detail: "Available or busy now" },
    { label: "Matching rides", value: data.rides_matching_now, detail: "Waiting for assignment" },
    { label: "Rides in progress", value: data.rides_in_progress_now, detail: "Currently on trip" },
    { label: "Pending approvals", value: data.pending_onboarding_approvals, detail: "Onboarding queue" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
        {kpis.map((item) => (
          <AdminKpiCard key={item.label} label={item.label} value={item.value} detail={item.detail} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <section className="rounded-[28px] border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Rides by Region</h1>
              <p className="mt-1 text-sm text-muted">Status-first operations view for current ride load.</p>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-[#f4f1eb] px-3 py-2 text-xs font-semibold">All ({ridesQuery.data?.length ?? 0})</span>
              <span className="rounded-full bg-[#fff3dd] px-3 py-2 text-xs font-semibold text-amber-800">Matching ({data.rides_matching_now})</span>
              <span className="rounded-full bg-[#eaf7f4] px-3 py-2 text-xs font-semibold text-teal-800">In Progress ({data.rides_in_progress_now})</span>
            </div>
          </div>
          <div className="mt-5 overflow-hidden rounded-[24px] border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#faf8f4] text-muted">
                <tr>
                  <th className="px-4 py-3">Ride ID</th>
                  <th className="px-4 py-3">Rider</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">ETA</th>
                </tr>
              </thead>
              <tbody>
                {(ridesQuery.data ?? []).slice(0, 6).map((ride) => (
                  <tr key={ride.ride_id} className="border-t border-line">
                    <td className="px-4 py-3 font-semibold text-accent">
                      <Link to={`/admin/live-rides/${ride.ride_id}`}>{ride.ride_id.slice(0, 8)}</Link>
                    </td>
                    <td className="px-4 py-3">{ride.rider_name}</td>
                    <td className="px-4 py-3">{ride.driver_name ?? "Pending"}</td>
                    <td className="px-4 py-3">{ride.region}</td>
                    <td className="px-4 py-3">
                      <AdminStatusBadge value={ride.ride_status} />
                    </td>
                    <td className="px-4 py-3">{ride.eta ? `${ride.eta} min` : "--"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[28px] border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Live Map Snapshot</h2>
              <p className="mt-1 text-sm text-muted">Pickup markers reflect rides currently in scope.</p>
            </div>
            <Link to="/admin/live-rides" className="text-sm font-semibold text-accent">
              Open monitor
            </Link>
          </div>
          <div className="mt-4 overflow-hidden rounded-[24px] border border-line">
            <MapContainer center={[33.77, -118.19]} zoom={11} className="h-[360px] w-full">
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {(mapQuery.data ?? []).map((ride) => (
                <Marker key={ride.ride_id} position={[Number(ride.pickup_lat), Number(ride.pickup_lng)]} />
              ))}
            </MapContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 divide-x divide-line rounded-[22px] border border-line bg-[#faf8f4]">
            <div className="px-4 py-3 text-center">
              <div className="text-2xl font-bold">{data.active_rides_now}</div>
              <div className="text-xs uppercase tracking-[0.14em] text-muted">Active</div>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="text-2xl font-bold">{data.rides_matching_now}</div>
              <div className="text-xs uppercase tracking-[0.14em] text-muted">Matching</div>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="text-2xl font-bold">{data.rides_in_progress_now}</div>
              <div className="text-xs uppercase tracking-[0.14em] text-muted">In Progress</div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Onboarding Queue Preview</h2>
            <Link to="/admin/onboarding" className="text-sm font-semibold text-accent">
              Open queue
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {(onboardingQuery.data ?? []).slice(0, 4).map((item) => (
              <Link key={item.driver_id} to={`/admin/onboarding/${item.driver_id}`} className="flex items-center justify-between rounded-[22px] border border-line px-4 py-3 transition hover:border-accent">
                <div>
                  <div className="font-semibold">{item.driver_name}</div>
                  <div className="mt-1 text-sm text-muted">{item.region}</div>
                </div>
                <AdminStatusBadge value={item.onboarding_status} />
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Alerts</h2>
            <Link to="/admin/alerts" className="text-sm font-semibold text-accent">
              Open alerts
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {(alertsQuery.data ?? []).map((alert) => (
              <div key={alert.title} className="rounded-[22px] border border-line bg-[#faf8f4] px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold">{alert.title}</div>
                  <AdminStatusBadge value={alert.level} />
                </div>
                <div className="mt-2 text-sm text-muted">{alert.description}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
