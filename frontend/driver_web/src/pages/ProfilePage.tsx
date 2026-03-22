import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { createDriverVehicle, getDriverDocuments, getDriverProfile, getDriverVehicle, updateDriverProfile, updateDriverVehicle } from "../api/profile";
import { LoadingState } from "../components/common/LoadingState";
import { SectionCard } from "../components/common/SectionCard";
import { DriverLayout } from "../components/layout/DriverLayout";
import { DocumentsCard } from "../components/profile/DocumentsCard";
import { ProfileInfoCard } from "../components/profile/ProfileInfoCard";
import { ProfileTabs, type ProfileTab } from "../components/profile/ProfileTabs";
import { VehicleInfoCard } from "../components/profile/VehicleInfoCard";
import { VehicleEditForm } from "@shared/components/vehicle";
import type { Vehicle } from "@shared/types/vehicle";

export function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as ProfileTab | null) ?? "personal";
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    ["personal", "vehicle", "documents", "account"].includes(initialTab) ? initialTab : "personal",
  );
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(false);
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["driver-profile-page"],
    queryFn: getDriverProfile,
  });
  const vehicleQuery = useQuery({
    queryKey: ["driver-profile-vehicle"],
    queryFn: getDriverVehicle,
  });
  const documentsQuery = useQuery({
    queryKey: ["driver-profile-documents"],
    queryFn: getDriverDocuments,
  });
  const vehicleMutation = useMutation({
    mutationFn: async (payload: Partial<Vehicle>) => {
      if (vehicleQuery.data) {
        return updateDriverVehicle(payload);
      }
      return createDriverVehicle({
        make: payload.make ?? emptyVehicleTemplate.make,
        model: payload.model ?? emptyVehicleTemplate.model,
        year: payload.year ?? emptyVehicleTemplate.year,
        color: payload.color ?? emptyVehicleTemplate.color,
        plate_number: payload.plate_number ?? emptyVehicleTemplate.plate_number,
        vehicle_type: payload.vehicle_type ?? emptyVehicleTemplate.vehicle_type,
        seat_capacity: payload.seat_capacity ?? emptyVehicleTemplate.seat_capacity,
        fuel_type: payload.fuel_type ?? emptyVehicleTemplate.fuel_type,
        mileage_city: payload.mileage_city ?? emptyVehicleTemplate.mileage_city,
        mileage_highway: payload.mileage_highway ?? emptyVehicleTemplate.mileage_highway,
        is_active: payload.is_active ?? emptyVehicleTemplate.is_active,
      });
    },
    onSuccess: async () => {
      setEditingVehicle(false);
      await queryClient.invalidateQueries({ queryKey: ["driver-profile-vehicle"] });
    },
  });
  const profileMutation = useMutation({
    mutationFn: async (payload: { fullName: string; phoneNumber: string }) => updateDriverProfile(payload),
    onSuccess: async () => {
      setEditingProfile(false);
      await queryClient.invalidateQueries({ queryKey: ["driver-profile-page"] });
    },
  });

  function toVehicleFormData(vehicle: NonNullable<typeof vehicleQuery.data>): Vehicle {
    return {
      id: vehicle.id,
      driver_id: vehicle.driverId,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      plate_number: vehicle.plateNumber,
      vehicle_type: vehicle.vehicleType as Vehicle["vehicle_type"],
      seat_capacity: vehicle.seatCount ?? 4,
      fuel_type: vehicle.fuelType,
      mileage_city: vehicle.mileageCity,
      mileage_highway: vehicle.mileageHighway,
      is_active: vehicle.isActive,
    };
  }

  const emptyVehicleTemplate: Vehicle = {
    id: "new-vehicle",
    driver_id: profileQuery.data?.id ?? "me",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: null,
    plate_number: "",
    vehicle_type: "ECONOMY",
    seat_capacity: 4,
    fuel_type: null,
    mileage_city: null,
    mileage_highway: null,
    is_active: true,
  };

  useEffect(() => {
    if (["personal", "vehicle", "documents", "account"].includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  function handleTabChange(tab: ProfileTab) {
    setActiveTab(tab);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("tab", tab);
      return next;
    }, { replace: true });
  }

  return (
    <DriverLayout>
      <div className="space-y-5">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Profile</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">Driver account details</h2>
          <p className="mt-2 text-sm text-muted">
            Inspect your personal info, vehicle details, and document verification state.
            {profileQuery.data && !profileQuery.data.isApproved ? " Operational pages will unlock after admin approval." : ""}
          </p>
        </section>

        <ProfileTabs activeTab={activeTab} onChange={handleTabChange} />

        {profileQuery.isLoading || vehicleQuery.isLoading || documentsQuery.isLoading ? <LoadingState label="Loading profile..." /> : null}
        {profileQuery.isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {profileQuery.error instanceof Error ? profileQuery.error.message : "Unable to load profile."}
          </div>
        ) : null}

        {profileQuery.data ? (
          <>
            {activeTab === "personal" && editingProfile ? (
              <SectionCard title="Edit details" description="Update your name and phone number used for onboarding review.">
                <form
                  className="grid gap-4 sm:grid-cols-2"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    await profileMutation.mutateAsync({
                      fullName: String(formData.get("fullName") ?? "").trim(),
                      phoneNumber: String(formData.get("phoneNumber") ?? "").trim(),
                    });
                  }}
                >
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Full name</span>
                    <input
                      name="fullName"
                      defaultValue={profileQuery.data.fullName}
                      className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Phone number</span>
                    <input
                      name="phoneNumber"
                      defaultValue={profileQuery.data.phoneNumber}
                      className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                    />
                  </label>
                  <div className="sm:col-span-2 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={profileMutation.isPending}
                    >
                      {profileMutation.isPending ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl border border-stone-300 px-5 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                      onClick={() => setEditingProfile(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </SectionCard>
            ) : null}
            {activeTab === "personal" && !editingProfile ? <ProfileInfoCard profile={profileQuery.data} onEdit={() => setEditingProfile(true)} /> : null}
            {activeTab === "vehicle" ? (
              <div className="space-y-4">
                {editingVehicle ? (
                  <VehicleEditForm
                    vehicle={vehicleQuery.data ? toVehicleFormData(vehicleQuery.data) : emptyVehicleTemplate}
                    onSave={async (diff) => {
                      await vehicleMutation.mutateAsync(diff);
                    }}
                    onCancel={() => setEditingVehicle(false)}
                    isSaving={vehicleMutation.isPending}
                  />
                ) : (
                  <VehicleInfoCard
                    vehicle={vehicleQuery.data ?? null}
                    onEdit={() => setEditingVehicle(true)}
                    onAdd={() => setEditingVehicle(true)}
                  />
                )}
              </div>
            ) : null}
            {activeTab === "documents" ? (
              <DocumentsCard
                documents={documentsQuery.data ?? []}
                onUploaded={async () => {
                  await queryClient.invalidateQueries({ queryKey: ["driver-profile-documents"] });
                }}
              />
            ) : null}
            {activeTab === "account" ? (
              <SectionCard title="Account" description="Account-level controls available in the current MVP.">
                <div className="space-y-3 text-sm text-muted">
                  <p>Password changes are not yet exposed in the driver API.</p>
                  <p>Notification preferences are not yet configurable from the web app.</p>
                  <p>Use the logout button in the header to securely end the session.</p>
                </div>
              </SectionCard>
            ) : null}
          </>
        ) : null}
      </div>
    </DriverLayout>
  );
}
