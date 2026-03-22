import { SectionCard } from "../../common/SectionCard";
import { InfoRow } from "../../common/InfoRow";
import type { RiderPaymentSummary } from "../../../types/riderProfile";

type PaymentsTabProps = {
  payments: RiderPaymentSummary;
};

export function PaymentsTab({ payments }: PaymentsTabProps) {
  return (
    <div className="space-y-5">
      <SectionCard
        title="Payment Summary"
        subtitle="Your billing defaults and stored payment overview."
        action={<button type="button" className="rounded-full border border-line px-3 py-2 text-xs font-semibold text-ink transition hover:bg-canvas">Manage payment methods</button>}
      >
        <InfoRow label="Default payment method" value={payments.defaultPaymentMethod} />
        <InfoRow label="Saved methods" value={payments.savedMethodsCount} />
        <InfoRow label="Billing email" value={payments.billingEmail} />
        <InfoRow label="Wallet balance" value={<span className="text-[#1A6B45]">{payments.walletBalance}</span>} />
        <InfoRow label="Ride credits" value={<span className="text-[#1A6B45]">{payments.rideCredits}</span>} />
      </SectionCard>

      <SectionCard title="Payment Actions" subtitle="Quick shortcuts for the things riders use most.">
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-canvas">
            View payment history
          </button>
          <button type="button" className="rounded-2xl bg-[#1A6B45] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#15593A]">
            Add payment method
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
