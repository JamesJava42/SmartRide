import type { Coordinate } from "./ride";

export type DriverAvailabilityState = "ONLINE" | "OFFLINE" | "ON_TRIP" | "WAITING";

export type DriverDashboardSummary = {
  driverName: string;
  driverInitials: string;
  availabilityState: DriverAvailabilityState;
  statusLabel: string;
  todayEarnings: number;
  tripsToday: number;
  currentRegion: string | null;
  activeRideState: string;
  currentLocation: Coordinate | null;
};

export type DriverStatusUpdate = {
  isOnline: boolean;
  isAvailable: boolean;
};
