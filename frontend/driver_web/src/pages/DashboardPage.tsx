import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import {
  acceptDriverOffer,
  completeDriverRide,
  getDriverDashboard,
  markDriverArrived,
  markDriverEnRoute,
  rejectDriverOffer,
  startDriverRide,
  submitDriverLocation,
  updateDriverAvailability,
} from "../api/driver";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingState } from "../components/common/LoadingState";
import { SectionCard } from "../components/common/SectionCard";
import { ActiveTripCard } from "../components/dashboard/ActiveTripCard";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { PendingOfferCard } from "../components/dashboard/PendingOfferCard";
import { StatusToggleCard } from "../components/dashboard/StatusToggleCard";
import { DriverLayout } from "../components/layout/DriverLayout";
import { DriverMap } from "../components/map/DriverMap";
import type { Coordinate } from "../types/ride";
import { titleizeStatus } from "../utils/formatters";

function useBrowserLocation(enabled: boolean) {
  const [location, setLocation] = useState<Coordinate | null>(null);

  useEffect(() => {
    if (!enabled || !("geolocation" in navigator)) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) =>
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () => undefined,
      {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 15000,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled]);

  return location;
}

export function DashboardPage() {
  const queryClient = useQueryClient();
  const browserLocation = useBrowserLocation(true);

  const dashboardQuery = useQuery({
    queryKey: ["driver-dashboard", browserLocation?.latitude, browserLocation?.longitude],
    queryFn: () => getDriverDashboard(browserLocation),
    refetchInterval: 20000,
  });

  const availabilityMutation = useMutation({
    mutationFn: updateDriverAvailability,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["driver-dashboard"] });
    },
  });

  const trackingMutation = useMutation({
    mutationFn: submitDriverLocation,
  });
  const offerActionMutation = useMutation({
    mutationFn: async (payload: { offerId: string; mode: "accept" | "reject" }) => {
      if (payload.mode === "accept") {
        return acceptDriverOffer(payload.offerId);
      }
      return rejectDriverOffer(payload.offerId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["driver-dashboard"] });
    },
  });
  const tripActionMutation = useMutation({
    mutationFn: async (payload: { rideId: string; status: string }) => {
      if (payload.status === "DRIVER_ASSIGNED") {
        return markDriverEnRoute(payload.rideId);
      }
      if (payload.status === "DRIVER_EN_ROUTE") {
        return markDriverArrived(payload.rideId);
      }
      if (payload.status === "DRIVER_ARRIVED") {
        return startDriverRide(payload.rideId);
      }
      return completeDriverRide(payload.rideId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["driver-dashboard"] });
    },
  });

  useEffect(() => {
    const rideId = dashboardQuery.data?.activeTrip?.rideId ?? null;
    if (!browserLocation) {
      return;
    }
    void trackingMutation.mutateAsync({
      rideId,
      latitude: browserLocation.latitude,
      longitude: browserLocation.longitude,
    });
  }, [browserLocation, dashboardQuery.data?.activeTrip?.rideId]);

  const tripStatus = dashboardQuery.data?.activeTrip?.status ?? null;
  const tripMessage = useMemo(() => {
    if (!tripStatus) {
      return "No active ride";
    }
    return titleizeStatus(tripStatus);
  }, [tripStatus]);
  const tripActionLabel = useMemo(() => {
    if (!tripStatus) {
      return null;
    }
    if (tripStatus === "DRIVER_ASSIGNED") {
      return "Mark en route";
    }
    if (tripStatus === "DRIVER_EN_ROUTE") {
      return "Arrived at pickup";
    }
    if (tripStatus === "DRIVER_ARRIVED") {
      return "Start ride";
    }
    if (tripStatus === "RIDE_STARTED") {
      return "Finish ride";
    }
    return null;
  }, [tripStatus]);

  async function handleToggleAvailability() {
    const current = dashboardQuery.data?.profile;
    if (!current) {
      return;
    }
    const goOnline = !current.isOnline;
    await availabilityMutation.mutateAsync({
      isOnline: goOnline,
      isAvailable: goOnline,
    });
  }

  async function handleTripAction() {
    const trip = dashboardQuery.data?.activeTrip;
    if (!trip) {
      return;
    }
    await tripActionMutation.mutateAsync({
      rideId: trip.rideId,
      status: trip.status,
    });
  }

  return (
    <DriverLayout>
      <div className="space-y-5">
        <section className="rounded-[32px] border border-line bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Driver Dashboard</p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">{dashboardQuery.data?.summary.driverName ?? "Driver"}</h2>
              <p className="mt-2 text-sm text-muted">
                Current state: {titleizeStatus(dashboardQuery.data?.summary.availabilityState ?? "OFFLINE")}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-canvas px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Today earnings</p>
                <p className="mt-2 text-xl font-semibold text-ink">
                  {dashboardQuery.data ? dashboardQuery.data.summary.todayEarnings.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "—"}
                </p>
              </div>
              <div className="rounded-2xl bg-canvas px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Trips today</p>
                <p className="mt-2 text-xl font-semibold text-ink">{dashboardQuery.data?.summary.tripsToday ?? "—"}</p>
              </div>
            </div>
          </div>
        </section>

        {dashboardQuery.isLoading ? <LoadingState label="Loading dashboard..." /> : null}
        {dashboardQuery.isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {dashboardQuery.error instanceof Error ? dashboardQuery.error.message : "Unable to load driver dashboard."}
          </div>
        ) : null}

        {dashboardQuery.data ? (
          <>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_380px]">
              <DriverMap currentLocation={dashboardQuery.data.summary.currentLocation} activeTrip={dashboardQuery.data.activeTrip} />
              <div className="space-y-4">
                <StatusToggleCard
                  status={dashboardQuery.data.summary.availabilityState}
                  statusLabel={dashboardQuery.data.summary.statusLabel}
                  isToggling={availabilityMutation.isPending}
                  onToggle={handleToggleAvailability}
                />
                {dashboardQuery.data.pendingOffer ? (
                  <PendingOfferCard
                    offer={dashboardQuery.data.pendingOffer}
                    actionLoading={offerActionMutation.isPending}
                    onAccept={() => offerActionMutation.mutate({ offerId: dashboardQuery.data!.pendingOffer!.offerId, mode: "accept" })}
                    onReject={() => offerActionMutation.mutate({ offerId: dashboardQuery.data!.pendingOffer!.offerId, mode: "reject" })}
                  />
                ) : null}
                <ActiveTripCard
                  trip={dashboardQuery.data.activeTrip}
                  actionLabel={tripActionLabel}
                  actionLoading={tripActionMutation.isPending}
                  onAction={tripActionLabel ? handleTripAction : undefined}
                />
              </div>
            </div>

            <DashboardStats
              todayEarnings={dashboardQuery.data.summary.todayEarnings}
              tripsToday={dashboardQuery.data.summary.tripsToday}
              activeRideState={dashboardQuery.data.summary.activeRideState}
              currentRegion={dashboardQuery.data.summary.currentRegion}
            />

            <SectionCard title="Current trip state" description="What the driver should focus on next.">
              {dashboardQuery.data.activeTrip ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Pickup</p>
                    <p className="mt-2 text-sm text-ink">{dashboardQuery.data.activeTrip.pickupAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Destination</p>
                    <p className="mt-2 text-sm text-ink">{dashboardQuery.data.activeTrip.destinationAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">ETA</p>
                    <p className="mt-2 text-sm text-ink">{dashboardQuery.data.activeTrip.etaMinutes ?? "—"} min</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Status</p>
                    <p className="mt-2 text-sm text-ink">{tripMessage}</p>
                  </div>
                </div>
              ) : (
                <EmptyState title="No active ride" description="Go online and keep location sharing active to receive the next trip." />
              )}
            </SectionCard>
          </>
        ) : null}
      </div>
    </DriverLayout>
  );
}
