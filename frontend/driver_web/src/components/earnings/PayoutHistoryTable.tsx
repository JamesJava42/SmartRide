import type { PayoutHistoryItem } from "../../types/earnings";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { StatusBadge } from "../common/StatusBadge";

export function PayoutHistoryTable({ items }: { items: PayoutHistoryItem[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-[#fbfaf7] text-left text-xs uppercase tracking-[0.15em] text-muted">
            <tr>
              <th className="px-4 py-3">Payout ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-white">
            {items.map((item) => (
              <tr key={item.payoutId}>
                <td className="px-4 py-4 font-semibold text-ink">{item.payoutId}</td>
                <td className="px-4 py-4 text-muted">{formatDate(item.payoutDate)}</td>
                <td className="px-4 py-4 font-medium text-ink">{formatCurrency(item.amount)}</td>
                <td className="px-4 py-4 text-muted">{item.method}</td>
                <td className="px-4 py-4 text-muted">{item.referenceNumber}</td>
                <td className="px-4 py-4">
                  <StatusBadge label={item.status} tone="green" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
