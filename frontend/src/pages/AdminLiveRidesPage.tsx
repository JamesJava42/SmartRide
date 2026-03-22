import { Fragment, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";
import { AdminStatusBadge } from "../components/admin/AdminStatusBadge";
import { api } from "../services/api";

export function AdminLiveRidesPage() {
  const [search, setSearch] = useState("");
  const ridesQuery = useQuery({ queryKey: ["admin-live-rides"], queryFn: () => api.getAdminActiveRides(), refetchInterval: 5000 });
  const liveMapQuery = useQuery({ queryKey: ["admin-live-map"], queryFn: () => api.getAdminLiveMap(), refetchInterval: 5000 });

  const rides = useMemo(
    () =>
      (ridesQuery.data ?? []).filter((ride) =>
        [ride.ride_id, ride.rider_name, ride.driver_name ?? "", ride.region].join(" ").toLowerCase().includes(search.toLowerCase()),
      ),
    [ridesQuery.data, search],
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
      <section className="rounded-[28px] border border-line bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Live Rides</h1>
            <p className="mt-1 text-sm text-muted">Operational ride monitor with fast scanning and map-linked rows.</p>
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Polling every 5s</div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-5">
          <select className="rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 text-sm outline-none"><option>Region</option></select>
          <select className="rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 text-sm outline-none"><option>Ride status</option></select>
          <select className="rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 text-sm outline-none"><option>Product type</option></select>
          <select className="rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 text-sm outline-none"><option>Time window</option></select>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ride, rider, driver"
            className="rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 text-sm outline-none"
          />
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
                <th className="px-4 py-3">Requested</th>
                <th className="px-4 py-3">ETA</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => (
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
                  <td className="px-4 py-3">{new Date(ride.requested_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</td>
                  <td className="px-4 py-3">{ride.eta ? `${ride.eta} min` : "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[28px] border border-line bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">Live Map</h2>
          <div className="text-xs uppercase tracking-[0.14em] text-muted">Driver markers + ride pins</div>
        </div>
        <div className="overflow-hidden rounded-[24px] border border-line">
          <MapContainer center={[33.77, -118.19]} zoom={11} className="h-[640px] w-full">
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {(liveMapQuery.data ?? []).map((ride) => (
              <Fragment key={ride.ride_id}>
                <Marker position={[Number(ride.pickup_lat), Number(ride.pickup_lng)]} />
                <Marker position={[Number(ride.destination_lat), Number(ride.destination_lng)]} />
                {ride.driver_lat && ride.driver_lng ? <Marker position={[Number(ride.driver_lat), Number(ride.driver_lng)]} /> : null}
                <Polyline positions={[[Number(ride.pickup_lat), Number(ride.pickup_lng)], [Number(ride.destination_lat), Number(ride.destination_lng)]]} pathOptions={{ color: "#2f8f5b", weight: 4, opacity: 0.8 }} />
              </Fragment>
            ))}
          </MapContainer>
        </div>
      </section>
    </div>
  );
}
