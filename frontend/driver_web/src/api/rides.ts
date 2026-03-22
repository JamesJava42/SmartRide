import { apiRequest } from "./client";
import type { RideHistoryFilters, RideHistoryItem, RideSummaryStats } from "../types/ride";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

type RideHistoryApiItem = {
  ride_id: string;
  pickup_address: string;
  dropoff_address: string;
  status: string;
  completed_at?: string | null;
  driver_payout_amount?: string | number | null;
};

type RideHistoryApiResponse = {
  items: RideHistoryApiItem[];
};

function toNumber(value: string | number | null | undefined): number | null {
  if (value == null) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeHistoryItem(item: RideHistoryApiItem): RideHistoryItem {
  return {
    rideId: item.ride_id,
    pickupAddress: item.pickup_address || "—",
    dropoffAddress: item.dropoff_address || "—",
    status: item.status,
    completedAt: item.completed_at ?? null,
    distanceMiles: null,
    durationMinutes: null,
    riderName: null,
    fareEarned: toNumber(item.driver_payout_amount),
    payoutStatus: item.status === "RIDE_COMPLETED" ? "Paid" : null,
  };
}

export async function getDriverRideHistory(filters: RideHistoryFilters): Promise<{
  items: RideHistoryItem[];
  stats: RideSummaryStats;
}> {
  const response = await apiRequest<ApiEnvelope<RideHistoryApiResponse>>("/drivers/me/rides?page=1&page_size=100", { method: "GET" });
  let items = response.data.items.map(normalizeHistoryItem);

  if (filters.status === "completed") {
    items = items.filter((item) => item.status === "RIDE_COMPLETED");
  } else if (filters.status === "cancelled") {
    items = items.filter((item) => item.status === "CANCELLED");
  }

  if (filters.range !== "all") {
    const now = Date.now();
    const dayWindow = filters.range === "today" ? 1 : filters.range === "week" ? 7 : 30;
    items = items.filter((item) => {
      if (!item.completedAt) {
        return false;
      }
      return now - new Date(item.completedAt).getTime() <= dayWindow * 24 * 60 * 60 * 1000;
    });
  }

  const searchTerm = filters.search.trim().toLowerCase();
  if (searchTerm) {
    items = items.filter((item) =>
      [item.rideId, item.pickupAddress, item.dropoffAddress, item.riderName ?? ""].some((value) => value.toLowerCase().includes(searchTerm)),
    );
  }

  const completed = items.filter((item) => item.status === "RIDE_COMPLETED");
  const cancelled = items.filter((item) => item.status === "CANCELLED");
  const totalEarnings = completed.reduce((sum, item) => sum + (item.fareEarned ?? 0), 0);

  return {
    items,
    stats: {
      totalCompletedRides: completed.length,
      totalEarnings,
      averageFare: completed.length ? totalEarnings / completed.length : 0,
      cancellationCount: cancelled.length,
    },
  };
}
