export type DashboardMode =
  | "desktop_default"
  | "mobile_online_waiting"
  | "mobile_offline"
  | "mobile_offer_waiting"
  | "mobile_active_ride";

export type DashboardNavItem =
  | "dashboard"
  | "ride_offers"
  | "active_ride"
  | "ride_history"
  | "earnings"
  | "profile"
  | "verification"
  | "logout";

export type AvailabilityMode = "online" | "offline" | "busy";

export type StatusPanelVariant = "waiting" | "offline" | "offer" | "active_ride" | "waiting_more";
