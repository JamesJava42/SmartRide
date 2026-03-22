export type RiderProfileTab = "profile" | "preferences" | "payments" | "security";

export interface RiderSavedPlace {
  id: string;
  label: string;
  address: string;
}

export interface RiderProfileData {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  memberSince: string;
  memberSinceLabel: string;
  preferredLanguage: string;
  emergencyContact: string;
  totalRides: number;
  savedPlacesCount: number;
  preferredPayment: string;
  preferredCity: string;
  statusLabel: string;
  savedPlaces: RiderSavedPlace[];
}

export interface RiderProfileUpdatePayload {
  fullName: string;
  email?: string;
  phone?: string;
}

export interface RiderPreferences {
  preferredPickupType: string;
  preferredPaymentMethod: string;
  accessibilityNeeds: string;
  savedPlacesCount: number;
  notifications: {
    rideUpdates: boolean;
    promos: boolean;
    receipts: boolean;
  };
}

export interface RiderPaymentSummary {
  defaultPaymentMethod: string;
  savedMethodsCount: number;
  billingEmail: string;
  walletBalance: string;
  rideCredits: string;
}

export interface RiderSecuritySummary {
  passwordStatus: string;
  twoFactorStatus: string;
  recentLogin: string;
  recentDevice: string;
}
