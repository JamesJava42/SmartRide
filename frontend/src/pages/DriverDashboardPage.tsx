import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TrackingMap } from "../components/TrackingMap";
import { api } from "../services/api";
import { fetchRoute } from "../services/maps";
import type { AuthUser, DriverOfferSummary } from "../types/api";

function RideActionButton({
  label,
  onClick,
  disabled,
  tone = "primary",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "primary" | "secondary" | "danger";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-accent text-white"
      : tone === "danger"
        ? "border border-[#f0c4c4] bg-[#fff4f4] text-[#8b2d2d]"
        : "border border-line bg-white text-ink";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${toneClass}`}
    >
      {label}
    </button>
  );
}

function nextRideAction(ride: DriverOfferSummary | null) {
  if (!ride) {
    return null;
  }

  switch (ride.status) {
    case "DRIVER_ASSIGNED":
      return { label: "Mark En Route", mutation: "enRoute" as const };
    case "DRIVER_EN_ROUTE":
      return { label: "Mark Arrived", mutation: "arrived" as const };
    case "DRIVER_ARRIVED":
      return { label: "Start Trip", mutation: "start" as const };
    case "RIDE_STARTED":
      return { label: "Complete Trip", mutation: "complete" as const };
    default:
      return null;
  }
}

function formatMoney(value: string | null | undefined) {
  if (!value) {
    return "--";
  }
  return `$${Number(value).toFixed(2)}`;
}

function formatMiles(value: string | null | undefined) {
  if (!value) {
    return "--";
  }
  return `${Number(value).toFixed(1)} mi`;
}

function formatMinutes(value: string | null | undefined) {
  if (!value) {
    return "--";
  }
  return `${Math.max(1, Math.round(Number(value)))} min`;
}

function RideSummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-[#fbfaf7] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-2 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

export function DriverDashboardPage({ user }: { user: AuthUser | null }) {
  const queryClient = useQueryClient();
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);

  const workspaceQuery = useQuery({
    queryKey: ["driver-workspace"],
    queryFn: () => api.getDriverWorkspace(),
    refetchInterval: 5000,
  });

  const refreshWorkspace = async () => {
    await queryClient.invalidateQueries({ queryKey: ["driver-workspace"] });
  };

  const acceptMutation = useMutation({
    mutationFn: (rideId: string) => api.acceptDriverRide(rideId),
    onSuccess: refreshWorkspace,
  });

  const declineMutation = useMutation({
    mutationFn: (rideId: string) => api.declineDriverRide(rideId),
    onSuccess: refreshWorkspace,
  });

  const enRouteMutation = useMutation({
    mutationFn: (rideId: string) => api.markDriverEnRoute(rideId),
    onSuccess: refreshWorkspace,
  });

  const arrivedMutation = useMutation({
    mutationFn: (rideId: string) => api.markDriverArrived(rideId),
    onSuccess: refreshWorkspace,
  });

  const startMutation = useMutation({
    mutationFn: (rideId: string) => api.startDriverRide(rideId),
    onSuccess: refreshWorkspace,
  });

  const completeMutation = useMutation({
    mutationFn: (rideId: string) => api.completeDriverRide(rideId),
    onSuccess: refreshWorkspace,
  });

  const locationMutation = useMutation({
    mutationFn: (payload: { ride_id?: string | null; lat: number; lng: number; heading?: number | null; speed?: number | null }) =>
      api.updateDriverLocation(payload),
  });

  const workspace = workspaceQuery.data;
  const currentRide = workspace?.current_ride ?? null;
  const pendingOffer = workspace?.pending_offer ?? null;
  const selectedRide =
    selectedRideId && currentRide?.ride_id === selectedRideId
      ? currentRide
      : selectedRideId && pendingOffer?.ride_id === selectedRideId
        ? pendingOffer
        : currentRide ?? pendingOffer ?? null;

  useEffect(() => {
    if (!selectedRideId && (currentRide || pendingOffer)) {
      setSelectedRideId(currentRide?.ride_id ?? pendingOffer?.ride_id ?? null);
    }
  }, [currentRide, pendingOffer, selectedRideId]);

  const detailQuery = useQuery({
    queryKey: ["driver-ride-detail-view", selectedRide?.ride_id, selectedRide?.pickup_lat, selectedRide?.pickup_lng, selectedRide?.destination_lat, selectedRide?.destination_lng],
    enabled: Boolean(selectedRide),
    queryFn: async () => {
      if (!selectedRide) {
        return null;
      }

      const pickupLat = Number(selectedRide.pickup_lat);
      const pickupLng = Number(selectedRide.pickup_lng);
      const destinationLat = Number(selectedRide.destination_lat);
      const destinationLng = Number(selectedRide.destination_lng);

      const [pickup, destination, routeData] = await Promise.all([
        api.reverseGeocode(pickupLat, pickupLng),
        api.reverseGeocode(destinationLat, destinationLng),
        fetchRoute({
          pickupPinnedLocation: { label: "Pickup", latitude: pickupLat, longitude: pickupLng },
          destinationPinnedLocation: { label: "Drop-off", latitude: destinationLat, longitude: destinationLng },
        }),
      ]);

      return { pickup, destination, routeData };
    },
  });

  useEffect(() => {
    if (!navigator.geolocation || !workspace) {
      return;
    }

    let cancelled = false;

    const pushLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (cancelled) {
            return;
          }
          setLocationError(null);
          void locationMutation.mutateAsync({
            ride_id: currentRide?.ride_id ?? null,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            heading: position.coords.heading ?? null,
            speed: position.coords.speed ?? null,
          });
        },
        (error) => {
          if (!cancelled) {
            setLocationError(error.message);
          }
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 12000 },
      );
    };

    pushLocation();
    const timer = window.setInterval(pushLocation, 12000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [currentRide?.ride_id, locationMutation, workspace]);

  const activeRideAction = useMemo(() => nextRideAction(currentRide), [currentRide]);
  const actionPending =
    acceptMutation.isPending ||
    declineMutation.isPending ||
    enRouteMutation.isPending ||
    arrivedMutation.isPending ||
    startMutation.isPending ||
    completeMutation.isPending;

  const runRideAction = () => {
    if (!currentRide || !activeRideAction) {
      return;
    }

    if (activeRideAction.mutation === "enRoute") {
      enRouteMutation.mutate(currentRide.ride_id);
      return;
    }
    if (activeRideAction.mutation === "arrived") {
      arrivedMutation.mutate(currentRide.ride_id);
      return;
    }
    if (activeRideAction.mutation === "start") {
      startMutation.mutate(currentRide.ride_id);
      return;
    }
    completeMutation.mutate(currentRide.ride_id);
  };

  if (workspaceQuery.isLoading) {
    return <div className="rounded-[28px] border border-line bg-white p-6 text-sm font-semibold text-muted">Loading driver workspace...</div>;
  }

  if (workspaceQuery.isError) {
    return (
      <div className="rounded-[28px] border border-[#f0c4c4] bg-[#fff8f8] p-6 text-sm text-[#8b2d2d]">
        {(workspaceQuery.error as Error).message}
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.88fr)_minmax(360px,0.62fr)]">
      <section className="space-y-6">
        <div className="rounded-[28px] border border-line bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Driver workspace</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Hello, {user?.full_name ?? "Driver"}</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Offers are reassigned automatically if you decline or miss the acceptance window. Select a ride card to inspect the route and trip details.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-line bg-white p-5">
            <div className="text-sm font-semibold text-muted">Status</div>
            <div className="mt-3 text-2xl font-bold text-ink">{workspace?.driver_status ?? "OFFLINE"}</div>
          </div>
          <div className="rounded-[24px] border border-line bg-white p-5">
            <div className="text-sm font-semibold text-muted">Current trip</div>
            <div className="mt-3 text-2xl font-bold text-ink">{currentRide ? currentRide.status.replaceAll("_", " ") : "None"}</div>
          </div>
          <div className="rounded-[24px] border border-line bg-white p-5">
            <div className="text-sm font-semibold text-muted">Offer queue</div>
            <div className="mt-3 text-2xl font-bold text-ink">{workspace?.queue_count ?? 0}</div>
          </div>
        </div>

        {pendingOffer ? (
          <button
            type="button"
            onClick={() => setSelectedRideId(pendingOffer.ride_id)}
            className={`w-full rounded-[28px] border p-6 text-left transition ${
              selectedRide?.ride_id === pendingOffer.ride_id ? "border-accent bg-[#f7fbf5]" : "border-[#dbe8d7] bg-white hover:border-accent/50"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Incoming offer</p>
                <h2 className="mt-2 text-2xl font-bold text-ink">Ride #{pendingOffer.ride_id.slice(0, 8)}</h2>
                <p className="mt-2 text-sm text-muted">Accept before {pendingOffer.expires_at ? new Date(pendingOffer.expires_at).toLocaleTimeString() : "offer timeout"}.</p>
              </div>
              <div className="rounded-full bg-[#edf6ef] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                {pendingOffer.status.replaceAll("_", " ")}
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <RideSummaryTile label="Distance" value={formatMiles(pendingOffer.estimated_distance_miles)} />
              <RideSummaryTile label="ETA" value={formatMinutes(pendingOffer.estimated_duration_minutes)} />
              <RideSummaryTile label="Driver Pay" value={formatMoney(pendingOffer.driver_estimated_payout)} />
              <RideSummaryTile label="Live ETA" value={formatMinutes(pendingOffer.eta_minutes)} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <RideActionButton label="Accept" onClick={() => acceptMutation.mutate(pendingOffer.ride_id)} disabled={actionPending} />
              <RideActionButton label="Decline" onClick={() => declineMutation.mutate(pendingOffer.ride_id)} disabled={actionPending} tone="danger" />
            </div>
          </button>
        ) : null}

        {currentRide ? (
          <button
            type="button"
            onClick={() => setSelectedRideId(currentRide.ride_id)}
            className={`w-full rounded-[28px] border p-6 text-left transition ${
              selectedRide?.ride_id === currentRide.ride_id ? "border-accent bg-[#f7fbf5]" : "border-line bg-white hover:border-accent/50"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Assigned ride</p>
                <h2 className="mt-2 text-2xl font-bold text-ink">{currentRide.status.replaceAll("_", " ")}</h2>
              </div>
              <div className="rounded-full bg-[#edf6ef] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                Rider {currentRide.rider_id.slice(0, 8)}
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <RideSummaryTile label="Distance" value={formatMiles(currentRide.estimated_distance_miles)} />
              <RideSummaryTile label="Trip ETA" value={formatMinutes(currentRide.estimated_duration_minutes)} />
              <RideSummaryTile label="Driver Pay" value={formatMoney(currentRide.driver_estimated_payout)} />
              <RideSummaryTile label="Live ETA" value={formatMinutes(currentRide.eta_minutes)} />
            </div>
            {activeRideAction ? (
              <div className="mt-6">
                <RideActionButton label={activeRideAction.label} onClick={runRideAction} disabled={actionPending} />
              </div>
            ) : null}
          </button>
        ) : null}

        {!pendingOffer && !currentRide ? (
          <div className="rounded-[28px] border border-line bg-white p-6 text-sm text-muted">
            No active offer right now. The next eligible request will appear here with its full route and payout details.
          </div>
        ) : null}
      </section>

      <aside className="space-y-6">
        <div className="rounded-[28px] border border-line bg-white p-4">
          <div className="mb-4 px-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Ride detail</p>
            <h2 className="mt-2 text-2xl font-bold text-ink">{selectedRide ? `Ride #${selectedRide.ride_id.slice(0, 8)}` : "Select a ride"}</h2>
          </div>
          <TrackingMap
            routeData={detailQuery.data?.routeData ?? null}
            driverPosition={null}
            hideOverlay
          />
        </div>

        <div className="rounded-[28px] border border-line bg-white p-6">
          {selectedRide ? (
            <>
              <div className="grid gap-4">
                <div className="rounded-2xl border border-line bg-[#fbfaf7] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Pickup</div>
                  <div className="mt-2 text-base font-semibold text-ink">{detailQuery.data?.pickup.label ?? "Resolving address..."}</div>
                </div>
                <div className="rounded-2xl border border-line bg-[#fbfaf7] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Drop-off</div>
                  <div className="mt-2 text-base font-semibold text-ink">{detailQuery.data?.destination.label ?? "Resolving address..."}</div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <RideSummaryTile label="Estimated Distance" value={formatMiles(selectedRide.estimated_distance_miles)} />
                <RideSummaryTile label="Estimated Duration" value={formatMinutes(selectedRide.estimated_duration_minutes)} />
                <RideSummaryTile label="Driver Pay" value={formatMoney(selectedRide.driver_estimated_payout)} />
                <RideSummaryTile label="ETA to Complete" value={formatMinutes(selectedRide.eta_minutes ?? selectedRide.estimated_duration_minutes)} />
              </div>

              <div className="mt-6 rounded-2xl border border-line bg-[#fbfaf7] p-4 text-sm text-muted">
                Status: <span className="font-semibold text-ink">{selectedRide.status.replaceAll("_", " ")}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">Select an active offer or assigned ride to see the full route, addresses, payout, and ETA.</p>
          )}
          {detailQuery.isError ? <p className="mt-4 text-sm text-[#8b2d2d]">{(detailQuery.error as Error).message}</p> : null}
        </div>

        <div className="rounded-[28px] border border-line bg-white p-6">
          <h2 className="text-xl font-bold text-ink">Location sync</h2>
          <p className="mt-3 text-sm text-muted">This page pushes browser geolocation to the backend every 12 seconds while it is open.</p>
          {locationError ? <p className="mt-4 text-sm text-[#8b2d2d]">{locationError}</p> : null}
          {locationMutation.isPending ? <p className="mt-4 text-sm text-muted">Updating location...</p> : null}
        </div>
      </aside>
    </div>
  );
}
