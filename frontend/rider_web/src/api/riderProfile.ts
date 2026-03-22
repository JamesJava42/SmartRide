import { authApi, request } from "./index";
import type {
  RiderPaymentSummary,
  RiderPreferences,
  RiderProfileData,
  RiderProfileUpdatePayload,
  RiderSecuritySummary,
  RiderSavedPlace,
} from "../types/riderProfile";

type SavedPlaceApi = {
  id?: string;
  label?: string | null;
  address_line?: string | null;
};

type RideHistoryApi = {
  items?: unknown[];
  pagination?: {
    total_items?: number;
  };
};

const PREFERENCES_KEY = "rc_rider_preferences";
function createIdempotencyKey(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
type LocalRiderPreferences = Omit<RiderPreferences, "savedPlacesCount" | "preferredPaymentMethod">;

type RiderProfileApi = {
  id?: string;
  user_id?: string;
  first_name?: string | null;
  last_name?: string | null;
  default_payment_method?: string | null;
};

type RiderPaymentSettingsApi = {
  default_payment_method?: string | null;
};

type RiderPaymentSummaryApi = {
  default_payment_method?: string | null;
  wallet_balance?: number | string | null;
  ride_credits?: number | string | null;
};

function safeText(value: string | null | undefined, fallback = "—") {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function normalizePaymentMethod(value: string | null | undefined, fallback = "Cash") {
  const normalized = value?.trim().toUpperCase();
  if (normalized === "DIGITAL_WALLET") {
    return "Digital Wallet";
  }
  if (normalized === "CARD") {
    return "Card";
  }
  if (normalized === "CASH") {
    return "Cash";
  }
  return fallback;
}

function formatMoney(value: number | string | null | undefined) {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? `$${next.toFixed(2)}` : "$0.00";
}

function formatMemberSince(isoString?: string) {
  if (!isoString) {
    return "Recently joined";
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "Recently joined";
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getPreferredCity(savedPlaces: RiderSavedPlace[]) {
  const firstAddress = savedPlaces[0]?.address ?? "";
  const parts = firstAddress.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.length >= 2 ? `${parts[parts.length - 2]}, ${parts[parts.length - 1]}` : "Long Beach, CA";
}

function formatRiderId(userId: string) {
  if (!userId) {
    return "Not available";
  }
  return `RDR-${userId.slice(0, 8).toUpperCase()}`;
}

function loadPreferences(): LocalRiderPreferences {
  if (typeof window === "undefined") {
    return {
      preferredPickupType: "Pin on map",
      accessibilityNeeds: "None added",
      notifications: {
        rideUpdates: true,
        promos: false,
        receipts: true,
      },
    };
  }

  try {
    const stored = window.localStorage.getItem(PREFERENCES_KEY);
    if (!stored) {
      throw new Error("missing");
    }
    const parsed = JSON.parse(stored) as LocalRiderPreferences;
    return {
      preferredPickupType: safeText(parsed.preferredPickupType, "Pin on map"),
      accessibilityNeeds: safeText(parsed.accessibilityNeeds, "None added"),
      notifications: {
        rideUpdates: parsed.notifications?.rideUpdates ?? true,
        promos: parsed.notifications?.promos ?? false,
        receipts: parsed.notifications?.receipts ?? true,
      },
    };
  } catch {
    return {
      preferredPickupType: "Pin on map",
      accessibilityNeeds: "None added",
      notifications: {
        rideUpdates: true,
        promos: false,
        receipts: true,
      },
    };
  }
}

function savePreferences(value: LocalRiderPreferences) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(value));
}

async function getSavedPlaces(): Promise<RiderSavedPlace[]> {
  try {
    const response = await request<SavedPlaceApi[]>("/riders/me/saved-places");
    return (response ?? []).map((item, index) => ({
      id: item.id ?? `saved-place-${index + 1}`,
      label: safeText(item.label, "Saved place"),
      address: safeText(item.address_line, "Not added"),
    }));
  } catch {
    return [];
  }
}

async function getRideHistorySummary(): Promise<{ totalRides: number }> {
  try {
    const response = await request<RideHistoryApi>("/rides/me/history?page=1&page_size=1");
    return {
      totalRides: Number(response.pagination?.total_items ?? response.items?.length ?? 0),
    };
  } catch {
    return { totalRides: 0 };
  }
}

async function getRiderRecord(): Promise<RiderProfileApi | null> {
  try {
    return await request<RiderProfileApi>("/riders/me");
  } catch {
    return null;
  }
}

export async function getRiderPaymentSettings(): Promise<{ defaultPaymentMethod: string }> {
  const response = await request<RiderPaymentSettingsApi>("/riders/me/payment-settings");
  return {
    defaultPaymentMethod: normalizePaymentMethod(response.default_payment_method, "Cash"),
  };
}

export async function updateRiderPaymentSettings(defaultPaymentMethod: string): Promise<{ defaultPaymentMethod: string }> {
  const apiValue = defaultPaymentMethod.trim().toUpperCase().replace(/\s+/g, "_");
  const response = await request<RiderPaymentSettingsApi>("/riders/me/payment-settings", {
    method: "PATCH",
    headers: {
      "Idempotency-Key": createIdempotencyKey("payment-settings"),
    },
    body: JSON.stringify({ default_payment_method: apiValue }),
  });
  return {
    defaultPaymentMethod: normalizePaymentMethod(response.default_payment_method, "Cash"),
  };
}

export async function getRiderProfile(): Promise<RiderProfileData> {
  const [user, rider, savedPlaces, rideSummary] = await Promise.all([
    authApi.getMe(),
    getRiderRecord(),
    getSavedPlaces(),
    getRideHistorySummary(),
  ]);

  return {
    userId: formatRiderId(user.user_id ?? user.id),
    fullName: safeText(user.full_name, "RideConnect Rider"),
    email: safeText(user.email, "Not added"),
    phone: safeText(user.phone_number, "Not added"),
    address: savedPlaces[0]?.address ?? "Not added",
    city: getPreferredCity(savedPlaces),
    region: "Southern California",
    memberSince: user.created_at ?? "",
    memberSinceLabel: formatMemberSince(user.created_at),
    preferredLanguage: "English",
    emergencyContact: "Not added",
    totalRides: rideSummary.totalRides,
    savedPlacesCount: savedPlaces.length,
    preferredPayment: normalizePaymentMethod(rider?.default_payment_method, "No default payment method"),
    preferredCity: getPreferredCity(savedPlaces),
    statusLabel: "Active rider",
    savedPlaces,
  };
}

export async function updateRiderProfile(payload: RiderProfileUpdatePayload): Promise<RiderProfileData> {
  await authApi.updateMe({
    full_name: payload.fullName,
    email: payload.email,
    phone_number: payload.phone,
  });
  return getRiderProfile();
}

export async function getRiderPreferences(): Promise<RiderPreferences> {
  const [profile, stored, paymentSettings] = await Promise.all([getRiderProfile(), Promise.resolve(loadPreferences()), getRiderPaymentSettings()]);
  return {
    preferredPickupType: stored.preferredPickupType,
    preferredPaymentMethod: paymentSettings.defaultPaymentMethod,
    accessibilityNeeds: stored.accessibilityNeeds,
    savedPlacesCount: profile.savedPlacesCount,
    notifications: stored.notifications,
  };
}

export async function updateRiderPreferences(payload: Partial<RiderPreferences>): Promise<RiderPreferences> {
  const current = loadPreferences();
  const next = {
    preferredPickupType: safeText(payload.preferredPickupType ?? current.preferredPickupType, "Pin on map"),
    accessibilityNeeds: safeText(payload.accessibilityNeeds ?? current.accessibilityNeeds, "None added"),
    notifications: {
      rideUpdates: payload.notifications?.rideUpdates ?? current.notifications.rideUpdates,
      promos: payload.notifications?.promos ?? current.notifications.promos,
      receipts: payload.notifications?.receipts ?? current.notifications.receipts,
    },
  };
  savePreferences(next);
  if (payload.preferredPaymentMethod) {
    await updateRiderPaymentSettings(payload.preferredPaymentMethod);
  }
  const [profile, paymentSettings] = await Promise.all([getRiderProfile(), getRiderPaymentSettings()]);
  return {
    ...next,
    preferredPaymentMethod: paymentSettings.defaultPaymentMethod,
    savedPlacesCount: profile.savedPlacesCount,
  };
}

export async function getRiderPaymentSummary(): Promise<RiderPaymentSummary> {
  const [profile, summary] = await Promise.all([
    getRiderProfile(),
    request<RiderPaymentSummaryApi>("/riders/me/payment-summary"),
  ]);
  return {
    defaultPaymentMethod: normalizePaymentMethod(summary.default_payment_method, profile.preferredPayment),
    savedMethodsCount: summary.default_payment_method ? 1 : 0,
    billingEmail: profile.email,
    walletBalance: formatMoney(summary.wallet_balance),
    rideCredits: formatMoney(summary.ride_credits),
  };
}

export async function getRiderSecuritySummary(): Promise<RiderSecuritySummary> {
  return {
    passwordStatus: "Last changed recently",
    twoFactorStatus: "Not enabled",
    recentLogin: "Today",
    recentDevice: "Current browser session",
  };
}
