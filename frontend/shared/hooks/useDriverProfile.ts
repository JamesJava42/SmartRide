import { useCallback, useEffect, useState } from "react";
import type { DriverProfileData, ViewMode } from "../types/driver";
import { useAuth } from "./useAuth";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/+$/, "");

async function fetchJson<T>(url: string, token: string | null): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  return (body.data ?? body) as T;
}

export function useDriverProfile(driverId: string | null, viewMode: ViewMode) {
  const { token } = useAuth();
  const [data, setData] = useState<DriverProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    if (!driverId) return;
    setIsLoading(true);
    setError(null);
    try {
      if (viewMode === "admin") {
        // Single endpoint returns everything
        const detail = await fetchJson<any>(`${BASE_URL}/api/v1/admin/drivers/${driverId}`, token);
        setData({
          user: {
            id: driverId,
            email: "",
            phone_number: detail.phone_number ?? "",
            role: "DRIVER",
            is_active: detail.status !== "INACTIVE",
            is_verified: detail.is_approved ?? false,
          },
          profile: {
            id: detail.driver_id ?? driverId,
            user_id: detail.user_id ?? "",
            first_name: detail.first_name ?? "",
            last_name: detail.last_name ?? null,
            phone_number: detail.phone_number ?? "",
            region_id: detail.region_id ?? null,
            status: detail.status ?? "PENDING_APPROVAL",
            is_approved: detail.is_approved ?? false,
            is_online: detail.is_online ?? false,
            is_available: detail.is_available ?? false,
            rating_avg: detail.rating_avg ?? null,
            total_rides_completed: detail.total_rides_completed ?? 0,
          },
          vehicle: detail.vehicle ?? null,
          onboarding: detail.onboarding ?? null,
          documents: Array.isArray(detail.documents) ? detail.documents : [],
        });
      } else if (viewMode === "driver") {
        const profile = await fetchJson<any>(`${BASE_URL}/api/v1/drivers/me`, token);
        const vehicle = await fetchJson<any>(`${BASE_URL}/api/v1/drivers/me/vehicle`, token).catch(() => null);
        const documents = await fetchJson<any[]>(`${BASE_URL}/api/v1/drivers/me/documents`, token).catch(() => []);
        setData({
          user: {
            id: driverId,
            email: "",
            phone_number: profile.phone_number ?? "",
            role: "DRIVER",
            is_active: true,
            is_verified: profile.is_approved ?? false,
          },
          profile: {
            id: profile.id ?? driverId,
            user_id: profile.user_id ?? "",
            first_name: profile.first_name ?? "",
            last_name: profile.last_name ?? null,
            phone_number: profile.phone_number ?? "",
            region_id: profile.region_id ?? null,
            status: profile.status ?? "PENDING_APPROVAL",
            is_approved: profile.is_approved ?? false,
            is_online: profile.is_online ?? false,
            is_available: profile.is_available ?? false,
            rating_avg: profile.rating_avg ?? null,
            total_rides_completed: profile.total_rides_completed ?? 0,
          },
          vehicle: vehicle ?? null,
          onboarding: null,
          documents: Array.isArray(documents) ? documents : [],
        });
      } else {
        // rider view — only public profile + vehicle via admin endpoint
        const detail = await fetchJson<any>(`${BASE_URL}/api/v1/admin/drivers/${driverId}`, token);
        setData({
          user: {
            id: driverId,
            email: "",
            phone_number: detail.phone_number ?? "",
            role: "DRIVER",
            is_active: true,
            is_verified: true,
          },
          profile: {
            id: detail.driver_id ?? driverId,
            user_id: "",
            first_name: detail.first_name ?? "",
            last_name: detail.last_name ?? null,
            phone_number: detail.phone_number ?? "",
            region_id: null,
            status: detail.status ?? "ACTIVE",
            is_approved: true,
            is_online: detail.is_online ?? false,
            is_available: detail.is_available ?? false,
            rating_avg: detail.rating_avg ?? null,
            total_rides_completed: detail.total_rides_completed ?? 0,
          },
          vehicle: detail.vehicle ?? null,
          onboarding: null,
          documents: [],
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load driver profile");
    } finally {
      setIsLoading(false);
    }
  }, [driverId, viewMode, token]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { data, isLoading, error, refetch: fetch_ };
}
