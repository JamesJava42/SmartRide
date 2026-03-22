import { request } from "./client";
import { formatCurrency } from "../utils/formatters";

export type RiderSpendingSummary = {
  totalSpent: number;
  tripCount: number;
  avgTripCost: number;
  feesTotal: number;
  tipsTotal: number;
  discountsTotal: number;
  defaultPaymentMethod: string;
  currentPeriodLabel: string;
};

export type RiderRecentPayment = {
  rideId: string;
  date: string;
  route: string;
  amount: number;
  paymentMethod: string;
  status: string;
};

type RiderPaymentSummaryApi = {
  total_spent?: number | string | null;
  trip_count?: number | null;
  avg_trip_cost?: number | string | null;
  fees_total?: number | string | null;
  tips_total?: number | string | null;
  discounts_total?: number | string | null;
  wallet_balance?: number | string | null;
  ride_credits?: number | string | null;
  default_payment_method?: string | null;
};

type RiderPaymentItemApi = {
  ride_id?: string | null;
  created_at?: string | null;
  completed_at?: string | null;
  pickup_address?: string | null;
  dropoff_address?: string | null;
  amount?: number | string | null;
  payment_method?: string | null;
  payment_status?: string | null;
  ride_status?: string | null;
};

function asNumber(value: number | string | null | undefined) {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
}

function safeText(value: string | null | undefined, fallback = "—") {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export async function getRiderSpendingSummary(_params?: { period?: string }): Promise<RiderSpendingSummary> {
  const data = await request<RiderPaymentSummaryApi>("/riders/me/payment-summary");
  return {
    totalSpent: asNumber(data.total_spent),
    tripCount: Number(data.trip_count ?? 0),
    avgTripCost: asNumber(data.avg_trip_cost),
    feesTotal: asNumber(data.fees_total),
    tipsTotal: asNumber(data.tips_total),
    discountsTotal: asNumber(data.discounts_total),
    defaultPaymentMethod: safeText(data.default_payment_method, "No payment method"),
    currentPeriodLabel: `Total spent ${formatCurrency(asNumber(data.total_spent))}`,
  };
}

export async function getRiderRecentPayments(): Promise<RiderRecentPayment[]> {
  const data = await request<RiderPaymentItemApi[]>("/riders/me/payments?limit=8");
  return data.map((payment, index) => ({
    rideId: safeText(payment.ride_id, `payment-${index + 1}`),
    date: payment.completed_at ?? payment.created_at ?? new Date().toISOString(),
    route: `${safeText(payment.pickup_address, "Unknown location")} → ${safeText(payment.dropoff_address, "Unknown location")}`,
    amount: asNumber(payment.amount),
    paymentMethod: safeText(payment.payment_method),
    status: safeText(payment.payment_status ?? payment.ride_status, "PENDING"),
  }));
}
