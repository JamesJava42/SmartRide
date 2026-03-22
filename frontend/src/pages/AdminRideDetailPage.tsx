import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";
import { AdminStatusBadge } from "../components/admin/AdminStatusBadge";
import { api } from "../services/api";

export function AdminRideDetailPage() {
  const { rideId = "" } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ["admin-ride", rideId], queryFn: () => api.getAdminRideDetail(rideId), enabled: Boolean(rideId), refetchInterval: 5000 });

  if (isLoading || !data) {
    return <div className="rounded-[28px] border border-line bg-white p-6 text-sm text-muted">Loading ride detail...</div>;
  }

  const timeline = ["Requested", "Matching", "Driver Assigned", "Driver En Route", "Driver Arrived", "Ride Started", "Ride Completed"];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(380px,0.75fr)]">
      <section className="space-y-6">
        <div className="rounded-[28px] border border-line bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Ride {data.ride_id.slice(0, 8)}</h1>
              <p className="mt-2 text-sm text-muted">Requested {new Date(data.requested_at).toLocaleString()}</p>
            </div>
            <AdminStatusBadge value={data.ride_status} />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[22px] bg-[#faf8f4] p-4">
              <div className="text-sm text-muted">Rider</div>
              <div className="mt-1 font-semibold">{data.rider_name}</div>
            </div>
            <div className="rounded-[22px] bg-[#faf8f4] p-4">
              <div className="text-sm text-muted">Driver</div>
              <div className="mt-1 font-semibold">{data.driver_name ?? "Unassigned"}</div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-line bg-white p-6">
          <h2 className="text-xl font-bold">Lifecycle Timeline</h2>
          <div className="mt-5 space-y-4">
            {timeline.map((item) => (
              <div key={item} className="flex items-center gap-4">
                <div className="h-3 w-3 rounded-full bg-[#ced8d0]" />
                <div className="text-sm font-medium">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-[28px] border border-line bg-white p-4">
          <h2 className="mb-4 text-xl font-bold">Route Map</h2>
          <div className="overflow-hidden rounded-[24px] border border-line">
            <MapContainer center={[Number(data.pickup_lat), Number(data.pickup_lng)]} zoom={11} className="h-[360px] w-full">
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[Number(data.pickup_lat), Number(data.pickup_lng)]} />
              <Marker position={[Number(data.destination_lat), Number(data.destination_lng)]} />
              <Polyline positions={[[Number(data.pickup_lat), Number(data.pickup_lng)], [Number(data.destination_lat), Number(data.destination_lng)]]} pathOptions={{ color: "#2f8f5b", weight: 4 }} />
            </MapContainer>
          </div>
        </div>

        <div className="rounded-[28px] border border-line bg-white p-6">
          <h2 className="text-xl font-bold">Event Log</h2>
          <div className="mt-4 space-y-3 text-sm text-muted">
            <div>Ride entered {data.ride_status.toLowerCase().replaceAll("_", " ")}</div>
            <div>Region: {data.region}</div>
            <div>ETA: {data.eta ? `${data.eta} min` : "Unavailable"}</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
