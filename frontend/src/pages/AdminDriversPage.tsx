import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AdminStatusBadge } from "../components/admin/AdminStatusBadge";
import { api } from "../services/api";

export function AdminDriversPage() {
  const [search, setSearch] = useState("");
  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: () => api.getAdminDrivers(),
    refetchInterval: 10000,
  });

  if (isLoading) {
    return <div className="rounded-[28px] border border-line bg-white p-6 text-sm text-muted">Loading drivers...</div>;
  }

  if (isError) {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-white p-6 text-sm text-rose-700">
        {error instanceof Error ? error.message : "Unable to load drivers."}
      </div>
    );
  }

  const filtered = data.filter((driver) => [driver.name, driver.email, driver.region].join(" ").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="rounded-[28px] border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="mt-1 text-sm text-muted">Availability, onboarding, and regional fleet operations.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        <select className="rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 text-sm outline-none"><option>Region</option></select>
        <select className="rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 text-sm outline-none"><option>Availability</option></select>
        <select className="rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 text-sm outline-none"><option>Onboarding</option></select>
        <select className="rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 text-sm outline-none"><option>Vehicle type</option></select>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search driver" className="rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 text-sm outline-none" />
      </div>

      <div className="mt-5 overflow-hidden rounded-[24px] border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#faf8f4] text-muted">
            <tr>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3">Availability</th>
              <th className="px-4 py-3">Onboarding</th>
              <th className="px-4 py-3">Rating</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? (
              filtered.map((driver) => (
                <tr key={driver.driver_id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link to={`/admin/drivers/${driver.driver_id}`} className="font-semibold text-accent">
                      {driver.name}
                    </Link>
                    <div className="mt-1 text-xs text-muted">{driver.email}</div>
                  </td>
                  <td className="px-4 py-3">{driver.region}</td>
                  <td className="px-4 py-3">
                    <AdminStatusBadge value={driver.online_status} />
                  </td>
                  <td className="px-4 py-3">
                    <AdminStatusBadge value={driver.onboarding_status} />
                  </td>
                  <td className="px-4 py-3">{driver.rating}</td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-line">
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  No drivers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
