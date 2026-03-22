export type VehicleType = "ECONOMY" | "COMFORT" | "PREMIUM" | "XL";

export interface VehicleTypeConfig {
  type: VehicleType;
  label: string;
  description: string;
  capacity: string;
  examples: string;
  color: string;
  bgColor: string;
  borderColor: string;
  lightBorder: string;
}

export const VEHICLE_TYPE_CONFIG: Record<VehicleType, VehicleTypeConfig> = {
  ECONOMY: {
    type: "ECONOMY",
    label: "Economy",
    description: "Affordable everyday rides",
    capacity: "Up to 4 riders",
    examples: "Corolla, Civic",
    color: "#1A6B45",
    bgColor: "#EDF9F2",
    borderColor: "#1A6B45",
    lightBorder: "rgba(26,107,69,0.35)",
  },
  COMFORT: {
    type: "COMFORT",
    label: "Comfort",
    description: "More space, smoother ride",
    capacity: "Up to 4 riders",
    examples: "Camry, Accord",
    color: "#1E40AF",
    bgColor: "#EFF6FF",
    borderColor: "#1E40AF",
    lightBorder: "rgba(30,64,175,0.35)",
  },
  PREMIUM: {
    type: "PREMIUM",
    label: "Premium",
    description: "Luxury vehicles",
    capacity: "Up to 4 riders",
    examples: "BMW 5, Mercedes E",
    color: "#92400E",
    bgColor: "#FFFBEB",
    borderColor: "#D97706",
    lightBorder: "rgba(217,119,6,0.35)",
  },
  XL: {
    type: "XL",
    label: "XL",
    description: "Extra space for groups",
    capacity: "Up to 6 riders",
    examples: "Highlander, Odyssey",
    color: "#5B21B6",
    bgColor: "#F5F3FF",
    borderColor: "#7C3AED",
    lightBorder: "rgba(124,58,237,0.35)",
  },
};
