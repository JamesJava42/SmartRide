import { useNavigate } from "react-router-dom";
import { PageTitle } from "../../components/common/PageTitle";
import { KycQueueTable } from "../../components/kyc/KycQueueTable";
import { useKycQueue } from "../../hooks/useKycQueue";

export default function KycQueuePage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError, error } = useKycQueue();

  return (
    <section className="space-y-8">
      <PageTitle
        title="Driver KYC Queue"
        subtitle="Review submitted driver compliance records and move them through approval decisions."
      />

      {isLoading ? (
        <div className="rounded-3xl border border-sand-200 bg-white px-6 py-10 text-sm text-muted shadow-sm">
          Loading driver KYC queue...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700">
          {error instanceof Error ? error.message : "Unable to load the KYC queue."}
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <KycQueueTable items={data} onOpen={(driverUserId) => navigate(`/kyc/${driverUserId}`)} />
      ) : null}
    </section>
  );
}
