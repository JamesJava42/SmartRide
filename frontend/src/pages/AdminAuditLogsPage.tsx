import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export function AdminAuditLogsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-audit-logs"], queryFn: () => api.getAdminAuditLogs(), refetchInterval: 15000 });

  if (isLoading || !data) {
    return <div className="rounded-[28px] border border-line bg-white p-6 text-sm text-muted">Loading audit logs...</div>;
  }

  return (
    <div className="rounded-[28px] border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="mt-1 text-sm text-muted">Admin action trail for approvals, suspensions, and workflow changes.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <input placeholder="Admin" className="rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 text-sm outline-none" />
        <input placeholder="Action type" className="rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 text-sm outline-none" />
        <input placeholder="Date range" className="rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 text-sm outline-none" />
      </div>
      <div className="mt-5 overflow-hidden rounded-[24px] border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#faf8f4] text-muted">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {data.map((log) => (
              <tr key={log.id} className="border-t border-line">
                <td className="px-4 py-3">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-4 py-3">{log.admin_email}</td>
                <td className="px-4 py-3 font-semibold">{log.action_type}</td>
                <td className="px-4 py-3">
                  {log.entity_type} · {log.entity_id}
                </td>
                <td className="px-4 py-3 text-muted">{Object.keys(log.details_json).join(", ") || "--"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
