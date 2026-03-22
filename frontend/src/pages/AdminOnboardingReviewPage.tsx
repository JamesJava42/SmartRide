import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { AdminStatusBadge } from "../components/admin/AdminStatusBadge";
import { api } from "../services/api";

function DocumentStatusDot({ value }: { value: string }) {
  const tone =
    value === "APPROVED"
      ? "bg-emerald-500"
      : value === "REJECTED"
        ? "bg-rose-500"
        : "bg-amber-400";

  return <span className={`inline-flex h-3 w-3 rounded-full ${tone}`} aria-label={value} title={value} />;
}

export function AdminOnboardingReviewPage() {
  const { driverId = "" } = useParams();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-onboarding", driverId], queryFn: () => api.getAdminOnboardingDetail(driverId), enabled: Boolean(driverId) });
  const approve = useMutation({ mutationFn: () => api.approveAdminOnboarding(driverId), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-onboarding", driverId] }) });
  const reject = useMutation({
    mutationFn: () => api.rejectAdminOnboarding(driverId, { notes: "Rejected by admin review" }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-onboarding", driverId] }),
  });
  const requestInfo = useMutation({
    mutationFn: () => api.requestAdminOnboardingInfo(driverId, { notes: "Please provide corrected documents." }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-onboarding", driverId] }),
  });

  if (isLoading || !data) {
    return <div className="rounded-[28px] border border-line bg-white p-6 text-sm text-muted">Loading onboarding review...</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(340px,0.58fr)]">
      <section className="space-y-6">
        <div className="rounded-[28px] border border-line bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{data.driver_name}</h1>
              <div className="mt-2 text-sm text-muted">{data.driver_email}</div>
              <div className="mt-1 text-sm text-muted">{data.region}</div>
            </div>
            <AdminStatusBadge value={data.onboarding_status} />
          </div>
        </div>
        <div className="rounded-[28px] border border-line bg-white p-6">
          <h2 className="text-xl font-bold">Document Review</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {data.documents.map((document) => (
              <div key={document.id} className="rounded-[22px] border border-line p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{document.document_type}</div>
                  <DocumentStatusDot value={document.verification_status} />
                </div>
                <div className="mt-3 text-sm text-muted">Submitted {new Date(document.submitted_at).toLocaleDateString()}</div>
                <a href={document.file_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-semibold text-accent">
                  Open document
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-[28px] border border-line bg-white p-6">
          <h2 className="text-xl font-bold">Notes</h2>
          <textarea value={data.review_notes ?? ""} readOnly className="mt-4 min-h-40 w-full rounded-[22px] border border-line bg-[#fbfaf7] px-4 py-3 text-sm outline-none" />
        </div>
        <div className="rounded-[28px] border border-line bg-white p-6">
          <h2 className="text-xl font-bold">Decision</h2>
          <div className="mt-4 flex flex-col gap-3">
            <button onClick={() => approve.mutate()} className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white">
              Approve
            </button>
            <button onClick={() => reject.mutate()} className="rounded-2xl border border-line px-4 py-3 text-sm font-semibold">
              Reject
            </button>
            <button onClick={() => requestInfo.mutate()} className="rounded-2xl border border-line px-4 py-3 text-sm font-semibold">
              Request More Info
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
