import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminStatusBadge } from "../components/admin/AdminStatusBadge";
import { useParams } from "react-router-dom";
import { api } from "../services/api";

export function AdminDriverDetailPage() {
  const { driverId = "" } = useParams();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-driver", driverId], queryFn: () => api.getAdminDriverDetail(driverId), enabled: Boolean(driverId) });
  const activate = useMutation({ mutationFn: () => api.activateAdminDriver(driverId), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-driver", driverId] }) });
  const suspend = useMutation({ mutationFn: () => api.suspendAdminDriver(driverId), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-driver", driverId] }) });

  if (isLoading || !data) {
    return <div className="rounded-[28px] border border-line bg-white p-6 text-sm text-muted">Loading driver detail...</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.72fr)_minmax(0,1fr)]">
      <aside className="rounded-[28px] border border-line bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{data.driver_name}</h1>
            <div className="mt-2 text-sm text-muted">{data.driver_email}</div>
            <div className="mt-1 text-sm text-muted">{data.region}</div>
          </div>
          <AdminStatusBadge value={data.onboarding_status} />
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={() => activate.mutate()} className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white">
            Activate Driver
          </button>
          <button onClick={() => suspend.mutate()} className="rounded-2xl border border-line px-4 py-3 text-sm font-semibold">
            Suspend Driver
          </button>
        </div>
      </aside>
      <section className="rounded-[28px] border border-line bg-white p-6">
        <h2 className="text-xl font-bold">Uploaded Documents</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {data.documents.map((document) => (
            <div key={document.id} className="rounded-[22px] border border-line p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">{document.document_type}</div>
                <AdminStatusBadge value={document.verification_status} />
              </div>
              <div className="mt-3 text-sm text-muted">Submitted {new Date(document.submitted_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
