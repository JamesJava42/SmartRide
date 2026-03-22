import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AdminStatusBadge } from "../components/admin/AdminStatusBadge";
import { api } from "../services/api";

export function AdminOnboardingQueuePage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["admin-onboarding-queue"], queryFn: () => api.getAdminOnboardingQueue(), refetchInterval: 10000 });

  if (isLoading || !data) {
    return <div className="rounded-[28px] border border-line bg-white p-6 text-sm text-muted">Loading onboarding queue...</div>;
  }

  const filtered = data.filter((item) => [item.driver_name, item.driver_email, item.region].join(" ").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="rounded-[28px] border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Driver Onboarding Queue</h1>
          <p className="mt-1 text-sm text-muted">Approval workbench for new and pending drivers.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <select className="rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 text-sm outline-none"><option>Region</option></select>
        <select className="rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 text-sm outline-none"><option>Status</option></select>
        <select className="rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 text-sm outline-none"><option>Submitted date</option></select>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search driver" className="rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 text-sm outline-none" />
      </div>
      <div className="mt-5 overflow-hidden rounded-[24px] border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#faf8f4] text-muted">
            <tr>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3">Documents</th>
              <th className="px-4 py-3">Review Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.driver_id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link to={`/admin/onboarding/${item.driver_id}`} className="font-semibold text-accent">
                    {item.driver_name}
                  </Link>
                  <div className="mt-1 text-xs text-muted">{item.driver_email}</div>
                </td>
                <td className="px-4 py-3">{item.region}</td>
                <td className="px-4 py-3">{item.documents.length} docs</td>
                <td className="px-4 py-3">
                  <AdminStatusBadge value={item.onboarding_status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
