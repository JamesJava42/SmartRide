import type { AvailabilityMode, DashboardMode } from "../types/dashboard";

export type DashboardSnapshot = {
  greeting: string;
  subtext: string;
  badgeText: string;
  availabilityMode: AvailabilityMode;
  stats: {
    ridesToday: string;
    earnedToday: string;
    rating: string;
    totalRides: string;
  };
};

export const dashboardSnapshots: Record<DashboardMode, DashboardSnapshot> = {
  desktop_default: {
    greeting: "Good morning, Ram",
    subtext: "Tuesday, March 18 · Long Beach, CA",
    badgeText: "Approved driver",
    availabilityMode: "online",
    stats: {
      ridesToday: "3",
      earnedToday: "$41.50",
      rating: "4.9★",
      totalRides: "312",
    },
  },
  mobile_online_waiting: {
    greeting: "Good morning, Ram",
    subtext: "Tuesday, March 18 · Long Beach, CA",
    badgeText: "Approved driver",
    availabilityMode: "online",
    stats: {
      ridesToday: "3",
      earnedToday: "$41.50",
      rating: "4.9★",
      totalRides: "312",
    },
  },
  mobile_offline: {
    greeting: "Good morning, Ram",
    subtext: "Tuesday, March 18 · Long Beach, CA",
    badgeText: "Approved driver",
    availabilityMode: "offline",
    stats: {
      ridesToday: "0",
      earnedToday: "$0.00",
      rating: "4.9★",
      totalRides: "312",
    },
  },
  mobile_offer_waiting: {
    greeting: "Good morning, Ram",
    subtext: "Tuesday, March 18 · Long Beach, CA",
    badgeText: "Approved driver",
    availabilityMode: "online",
    stats: {
      ridesToday: "3",
      earnedToday: "$41.50",
      rating: "4.9★",
      totalRides: "312",
    },
  },
  mobile_active_ride: {
    greeting: "Good morning, Ram",
    subtext: "Tuesday, March 18 · Long Beach, CA",
    badgeText: "Approved driver",
    availabilityMode: "busy",
    stats: {
      ridesToday: "3",
      earnedToday: "$41.50",
      rating: "4.9★",
      totalRides: "312",
    },
  },
};
