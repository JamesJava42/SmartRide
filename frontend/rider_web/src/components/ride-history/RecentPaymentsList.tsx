import type { RiderRecentPayment } from "../../api/payments";
import { formatCurrency, formatDateShort, shortAddress } from "../../utils/formatters";
import { StatusBadge } from "../common/StatusBadge";

export function RecentPaymentsList({ payments }: { payments: RiderRecentPayment[] }) {
  return (
    <div className="rounded-[24px] border border-line bg-white p-5 shadow-[0_16px_40px_rgba(23,33,27,0.04)]">
      <div className="mb-4 text-sm font-semibold text-[#111111]">Recent payments</div>
      <div className="space-y-3">
        {payments.map((payment) => (
          <div key={payment.rideId} className="flex items-center justify-between gap-4 rounded-[18px] border border-[#F1F3EE] px-4 py-3">
            <div className="min-w-0">
              <div className="text-[11px] text-[#9CA3AF]">{formatDateShort(payment.date)}</div>
              <div className="truncate text-sm font-semibold text-[#111111]">
                {shortAddress(payment.route.split("→")[0] ?? "")} → {shortAddress(payment.route.split("→")[1] ?? "")}
              </div>
              <div className="text-xs text-[#6B7280]">{payment.paymentMethod}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-sm font-bold text-[#111111]">{formatCurrency(payment.amount)}</div>
              <div className="mt-2">
                <StatusBadge status={payment.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
