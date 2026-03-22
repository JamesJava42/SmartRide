import { apiRequest, buildAuthenticatedApiUrl } from "./client";
import { getCurrentDriverProfile } from "./auth";
import type { DriverDocument, DriverProfile, DriverVehicle } from "../types/profile";
import { getStoredUser, setStoredUser } from "../utils/authStorage";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

type DriverProfileApi = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  phone_number: string;
  status: string;
  is_online: boolean;
  is_available: boolean;
  is_approved: boolean;
  rating_avg?: string | number | null;
  total_rides_completed: number;
};

type DriverDocumentApi = {
  id: string;
  document_type: string;
  file_url: string | null;
  original_file_name?: string | null;
  document_number?: string | null;
  issuing_state?: string | null;
  issuing_country?: string | null;
  expires_at?: string | null;
  download_path?: string | null;
  verification_status: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  notes?: string | null;
  rejection_reason: string | null;
  metadata_json?: Record<string, unknown> | null;
};

type VehicleApi = {
  id: string;
  driver_id: string;
  make: string;
  model: string;
  year: number;
  color?: string | null;
  plate_number: string;
  vehicle_type: string;
  seat_capacity: number;
  fuel_type?: string | null;
  mileage_city?: string | number | null;
  mileage_highway?: string | number | null;
  is_active: boolean;
};

function toNumber(value: string | number | null | undefined) {
  if (value == null) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function getDriverProfile(): Promise<DriverProfile> {
  const [user, profile] = await Promise.all([
    getCurrentDriverProfile(),
    apiRequest<ApiEnvelope<DriverProfileApi>>("/drivers/me", { method: "GET" }),
  ]);

  const fullNameFromProfile = [profile.data.first_name, profile.data.last_name].filter(Boolean).join(" ").trim();

  return {
    id: profile.data.id,
    fullName: user.fullName || fullNameFromProfile || "Driver",
    email: user.email || "—",
    phoneNumber: profile.data.phone_number || user.phone || "—",
    address: null,
    region: null,
    languages: [],
    joinedDate: null,
    totalRidesCompleted: profile.data.total_rides_completed,
    rating: toNumber(profile.data.rating_avg),
    status: profile.data.status,
    isOnline: profile.data.is_online,
    isAvailable: profile.data.is_available,
    isApproved: profile.data.is_approved,
  };
}

export async function updateDriverProfile(payload: Partial<DriverProfile>): Promise<DriverProfile> {
  const nameParts = (payload.fullName ?? "").trim().split(/\s+/).filter(Boolean);
  const response = await apiRequest<ApiEnvelope<DriverProfileApi>>("/drivers/me", {
    method: "PATCH",
    body: {
      first_name: nameParts.length ? nameParts[0] : undefined,
      last_name: nameParts.length > 1 ? nameParts.slice(1).join(" ") : "",
      phone_number: payload.phoneNumber,
    },
  });

  const updatedProfile = response.data;
  const storedUser = getStoredUser();
  if (storedUser) {
    setStoredUser({
      ...storedUser,
      fullName: [updatedProfile.first_name, updatedProfile.last_name].filter(Boolean).join(" ").trim() || storedUser.fullName,
      phone: updatedProfile.phone_number || storedUser.phone,
    });
  }

  return getDriverProfile();
}

export async function updateDriverVehicle(payload: Partial<{
  make: string;
  model: string;
  year: number;
  color: string | null;
  plate_number: string;
  vehicle_type: string;
  seat_capacity: number;
  fuel_type: string | null;
  mileage_city: number | null;
  mileage_highway: number | null;
  is_active: boolean;
}>): Promise<DriverVehicle | null> {
  const response = await apiRequest<ApiEnvelope<VehicleApi>>("/drivers/me/vehicle", { method: "PATCH", body: payload });
  return {
    id: response.data.id,
    driverId: response.data.driver_id,
    make: response.data.make,
    model: response.data.model,
    year: response.data.year,
    color: response.data.color ?? null,
    plateNumber: response.data.plate_number,
    vehicleType: response.data.vehicle_type,
    seatCount: response.data.seat_capacity ?? null,
    fuelType: response.data.fuel_type ?? null,
    mileageCity: toNumber(response.data.mileage_city),
    mileageHighway: toNumber(response.data.mileage_highway),
    isActive: response.data.is_active,
  };
}

export async function createDriverVehicle(payload: {
  make: string;
  model: string;
  year: number;
  color: string | null;
  plate_number: string;
  vehicle_type: string;
  seat_capacity: number;
  fuel_type: string | null;
  mileage_city: number | null;
  mileage_highway: number | null;
  is_active: boolean;
}): Promise<DriverVehicle | null> {
  const response = await apiRequest<ApiEnvelope<VehicleApi>>("/drivers/me/vehicle", { method: "POST", body: payload });
  return {
    id: response.data.id,
    driverId: response.data.driver_id,
    make: response.data.make,
    model: response.data.model,
    year: response.data.year,
    color: response.data.color ?? null,
    plateNumber: response.data.plate_number,
    vehicleType: response.data.vehicle_type,
    seatCount: response.data.seat_capacity ?? null,
    fuelType: response.data.fuel_type ?? null,
    mileageCity: toNumber(response.data.mileage_city),
    mileageHighway: toNumber(response.data.mileage_highway),
    isActive: response.data.is_active,
  };
}

export async function getDriverVehicle(): Promise<DriverVehicle | null> {
  try {
    const [response, profile] = await Promise.all([
      apiRequest<ApiEnvelope<VehicleApi>>("/drivers/me/vehicle", { method: "GET" }),
      apiRequest<ApiEnvelope<DriverProfileApi>>("/drivers/me", { method: "GET" }),
    ]);
    const looksLikePlaceholderVehicle =
      !profile.data.is_approved &&
      profile.data.total_rides_completed === 0 &&
      (profile.data.first_name ?? "").trim() === "Driver" &&
      response.data.make === "Toyota" &&
      response.data.model === "Camry" &&
      /^DRV[A-Z0-9]{5}$/.test(response.data.plate_number);

    if (looksLikePlaceholderVehicle) {
      return null;
    }

    return {
      id: response.data.id,
      driverId: response.data.driver_id,
      make: response.data.make,
      model: response.data.model,
      year: response.data.year,
      color: response.data.color ?? null,
      plateNumber: response.data.plate_number,
      vehicleType: response.data.vehicle_type,
      seatCount: response.data.seat_capacity ?? null,
      fuelType: response.data.fuel_type ?? null,
      mileageCity: toNumber(response.data.mileage_city),
      mileageHighway: toNumber(response.data.mileage_highway),
      isActive: response.data.is_active,
    };
  } catch {
    return null;
  }
}

export async function getDriverDocuments(): Promise<DriverDocument[]> {
  const response = await apiRequest<ApiEnvelope<DriverDocumentApi[]>>("/onboarding/me/documents", { method: "GET" }).catch(() => null);
  const submitted = new Map(
    (response?.data ?? []).map((document) => [
      document.document_type,
      document,
    ]),
  );

  const requiredDocuments = [
    ["PROFILE_PHOTO", "Profile Photo"],
    ["GOVT_ID_FRONT", "Government ID Front"],
    ["GOVT_ID_BACK", "Government ID Back"],
    ["DRIVER_LICENSE", "Driver License"],
    ["VEHICLE_REGISTRATION", "Vehicle Registration"],
    ["INSURANCE", "Insurance"],
  ] as const;

  return requiredDocuments.map(([documentType, name]) => {
    const current = submitted.get(documentType);
    const metadata = (current?.metadata_json ?? {}) as Record<string, unknown>;
    const fileName = typeof metadata.file_name === "string" ? metadata.file_name : null;
    const statusMap: Record<string, DriverDocument["status"]> = {
      APPROVED: "VERIFIED",
      REJECTED: "REJECTED",
      UNDER_REVIEW: "PENDING",
      SUBMITTED: "PENDING",
    };

    return {
      id: current?.id ?? documentType.toLowerCase(),
      documentType,
      name,
      status: current ? statusMap[current.verification_status] ?? "PENDING" : "MISSING",
      updatedAt: current?.reviewed_at ?? current?.submitted_at ?? null,
      note: current
        ? current.rejection_reason || current.notes || (current.verification_status === "APPROVED" ? "Verified by admin." : "Submitted and waiting for admin review.")
        : "No document uploaded yet.",
      fileUrl: current?.file_url ?? (current?.download_path ? buildAuthenticatedApiUrl(current.download_path) : null),
      fileName: current?.original_file_name ?? fileName,
      documentNumber: current?.document_number ?? null,
      issuingState: current?.issuing_state ?? null,
      issuingCountry: current?.issuing_country ?? null,
      expiresAt: current?.expires_at ?? null,
      rejectionReason: current?.rejection_reason ?? null,
    };
  });
}

export async function uploadDriverDocument(
  documentType: string,
  file: File,
  metadata?: {
    documentNumber?: string | null;
    issuingState?: string | null;
    issuingCountry?: string | null;
    expiresAt?: string | null;
  }
): Promise<void> {
  const formData = new FormData();
  formData.append("document_type", documentType);
  if (metadata?.documentNumber) {
    formData.append("document_number", metadata.documentNumber);
  }
  if (metadata?.issuingState) {
    formData.append("issuing_state", metadata.issuingState);
  }
  if (metadata?.issuingCountry) {
    formData.append("issuing_country", metadata.issuingCountry);
  }
  if (metadata?.expiresAt) {
    formData.append("expires_at", metadata.expiresAt);
  }
  formData.append("file", file);
  await apiRequest("/onboarding/me/documents", {
    method: "POST",
    body: formData,
  });
}
