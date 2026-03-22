import { apiRequest } from "./client";
import { getDriverRideHistory } from "./rides";
import type { EarningsSummary, PayoutHistoryItem } from "../types/earnings";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

type EarningsApi = {
  today_earnings: string | number;
  week_earnings: string | number;
  month_earnings: string | number;
  rides_completed_today: number;
};

export async function getDriverEarningsSummary(): Promise<EarningsSummary> {
  const response = await apiRequest<ApiEnvelope<EarningsApi>>("/drivers/me/earnings/summary", { method: "GET" });
  const month = Number(response.data.month_earnings);
  return {
    todayEarnings: Number(response.data.today_earnings),
    weekEarnings: Number(response.data.week_earnings),
    monthEarnings: month,
    pendingPayout: 0,
    grossFares: month,
    platformFee: 0,
    adjustments: 0,
    netPayout: month,
    tripsToday: response.data.rides_completed_today,
  };
}

export async function getDriverPayoutHistory(): Promise<PayoutHistoryItem[]> {
  const history = await getDriverRideHistory({ range: "month", status: "completed", search: "" });
  return history.items.slice(0, 12).map((item, index) => ({
    payoutId: `PAYOUT-${item.rideId.slice(0, 6).toUpperCase()}`,
    payoutDate: item.completedAt ?? new Date().toISOString(),
    amount: item.fareEarned ?? 0,
    method: "Bank transfer",
    status: "Paid",
    referenceNumber: `RC-${String(index + 1).padStart(4, "0")}`,
  }));
}
