export type RideStatus =
  | "MATCHING"
  | "DRIVER_OFFERED"
  | "DRIVER_ASSIGNED"
  | "DRIVER_EN_ROUTE"
  | "DRIVER_ARRIVED"
  | "RIDE_STARTED"
  | "RIDE_COMPLETED"
  | "CANCELLED"
  | string;

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type RouteCoordinate = {
  latitude: number;
  longitude: number;
};

export type RideHistoryItem = {
  rideId: string;
  pickupAddress: string;
  dropoffAddress: string;
  status: RideStatus;
  completedAt: string | null;
  distanceMiles: number | null;
  durationMinutes: number | null;
  riderName: string | null;
  fareEarned: number | null;
  payoutStatus: string | null;
};

export type RideHistoryFilters = {
  range: "today" | "week" | "month" | "all";
  status: "all" | "completed" | "cancelled";
  search: string;
};

export type ActiveTrip = {
  rideId: string;
  status: RideStatus;
  riderName: string | null;
  pickupAddress: string;
  destinationAddress: string;
  etaMinutes: number | null;
  estimatedDistanceMiles: number | null;
  estimatedDurationMinutes: number | null;
  payoutEstimate: number | null;
  driverLocation: Coordinate | null;
  pickupLocation: Coordinate | null;
  dropoffLocation: Coordinate | null;
  route: RouteCoordinate[];
  routeDistanceMeters?: number | null;
  routeDurationSeconds?: number | null;
};

export type PendingRideOffer = {
  offerId: string;
  rideId: string;
  status: string;
  pickupAddress: string;
  destinationAddress: string;
  estimatedDistanceMiles: number | null;
  payoutEstimate: number | null;
  expiresAt: string | null;
};

export type RideSummaryStats = {
  totalCompletedRides: number;
  totalEarnings: number;
  averageFare: number;
  cancellationCount: number;
};
