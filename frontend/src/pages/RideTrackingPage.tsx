import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { DriverCard } from "../components/DriverCard";
import { PageContainer } from "../components/PageContainer";
import { ReceiptCard } from "../components/ReceiptCard";
import { TrackingMap } from "../components/TrackingMap";
import { api } from "../services/api";
import { useRideFlow } from "../state/RideFlowContext";
import type { RouteData } from "../types/api";
import { titleizeStatus } from "../utils/formatters";

const timelineSteps = [
  "Ride Requested",
  "Driver Assigned",
  "Driver En Route",
  "Driver Arriving",
  "Trip Started",
  "Trip Completed",
];

function loadStoredRoute(rideId: string | undefined): RouteData | null {
  const raw = window.localStorage.getItem("rideconnect_last_route");
  if (!raw) {
    return null;
  }
  const parsed = JSON.parse(raw) as { rideId: string | null; route: RouteData };
  if (!rideId || !parsed.route) {
    return null;
  }
  if (parsed.rideId && parsed.rideId !== rideId) {
    return null;
  }
  return parsed.route;
}

export function RideTrackingPage() {
  const { rideId } = useParams();
  const flow = useRideFlow();
  const storedRoute = useMemo(() => loadStoredRoute(rideId), [rideId]);
  const rideQuery = useQuery({
    queryKey: ["ride", rideId],
    queryFn: () => api.getRide(rideId!),
    enabled: Boolean(rideId),
    refetchInterval: 8000,
  });
  const trackingQuery = useQuery({
    queryKey: ["ride-tracking", rideId],
    queryFn: () => api.getRideTracking(rideId!),
    enabled: Boolean(rideId),
    refetchInterval: 5000,
  });

  const driverPosition =
    trackingQuery.data?.driver_lat && trackingQuery.data?.driver_lng
      ? ([Number(trackingQuery.data.driver_lat), Number(trackingQuery.data.driver_lng)] as [number, number])
      : null;

  const derivedState =
    rideQuery.data?.status === "RIDE_COMPLETED"
      ? "ride_completed"
      : rideQuery.data?.status === "RIDE_STARTED"
        ? "ride_started"
        : rideQuery.data?.status === "DRIVER_ARRIVED"
          ? "driver_arriving"
          : rideQuery.data?.status === "DRIVER_ASSIGNED" || rideQuery.data?.status === "DRIVER_EN_ROUTE"
            ? "driver_assigned"
            : "matching";

  return (
    <PageContainer>
      <div className="grid gap-0 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-b border-line p-3 xl:border-b-0 xl:border-r">
          <h1 className="text-[1.7rem] font-semibold text-ink">
            {derivedState === "ride_completed"
              ? "Trip Complete"
              : derivedState === "ride_started"
                ? "Ride In Progress"
                : derivedState === "driver_arriving"
                  ? "Driver Arriving"
                  : "Ride Tracking"}
          </h1>

          <div className="mt-4 rounded-[18px] border border-line bg-canvas px-4 py-2.5 text-lg font-semibold text-ink">
            {derivedState === "ride_completed"
              ? "Trip complete"
              : derivedState === "ride_started"
                ? "ETA to destination 18 min"
                : derivedState === "driver_arriving"
                  ? "Driver has arrived"
                  : `Arriving in ${trackingQuery.data?.eta_minutes ? `${trackingQuery.data.eta_minutes} min` : "4 min"}`}
          </div>

          <div className="mt-4">
            <DriverCard
              name={flow.driver?.name ?? "Ravi Kumar"}
              rating={flow.driver?.rating ?? "4.9"}
              vehicle={flow.driver?.vehicle ?? "Toyota Camry"}
              color={flow.driver?.color ?? "Silver"}
              plate={flow.driver?.plate ?? "5AB6123"}
              eta={derivedState === "ride_started" ? "On trip" : derivedState === "ride_completed" ? "Completed" : "4 min"}
            />
          </div>

          <div className="mt-4 grid gap-2">
            <button type="button" className="flex items-center justify-between border border-line bg-surface px-4 py-2.5 text-sm text-ink">
              <span>Call Driver</span>
              <span>›</span>
            </button>
            <button type="button" className="flex items-center justify-between border border-line bg-surface px-4 py-2.5 text-sm text-ink">
              <span>Message</span>
              <span>›</span>
            </button>
          </div>

          <div className="mt-5 border border-line">
            <div className="border-b border-line px-4 py-2.5 text-sm font-semibold text-ink">Ride Timeline</div>
            <div className="space-y-3 p-4">
              {timelineSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 text-sm text-muted">
                  <span className={`h-3 w-3 rounded-full ${index <= 3 ? "bg-[#70716d]" : "bg-line"}`} />
                  <span>{step}</span>
                </div>
              ))}
              <div className="rounded-md bg-[#70716d] px-4 py-2 text-center text-sm font-semibold text-white">
                {titleizeStatus(rideQuery.data?.status ?? trackingQuery.data?.ride_status ?? "Driver En Route")}
              </div>
            </div>
          </div>

          <div className="mt-4 border border-line bg-surface p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Pickup</span>
              <span className="text-ink">{storedRoute?.pickup.label ?? "Long Beach, CA"}</span>
            </div>
            <div className="mt-3 flex justify-between">
              <span className="text-muted">Drop-Off</span>
              <span className="text-right text-ink">{storedRoute?.destination.label ?? "Los Angeles International Airport"}</span>
            </div>
          </div>
          {derivedState === "ride_completed" ? <div className="mt-4"><ReceiptCard fare="48.00" bookingFee="6.25" tolls="4.43" discounts="0.00" /></div> : null}
        </aside>

        <div className="p-3">
          <TrackingMap
            routeData={
              storedRoute ??
              (trackingQuery.data
                ? {
                    pickup: {
                      label: "Pickup",
                      latitude: Number(trackingQuery.data.pickup_lat),
                      longitude: Number(trackingQuery.data.pickup_lng),
                    },
                    destination: {
                      label: "Destination",
                      latitude: Number(trackingQuery.data.destination_lat),
                      longitude: Number(trackingQuery.data.destination_lng),
                    },
                    geometry: [
                      [Number(trackingQuery.data.pickup_lng), Number(trackingQuery.data.pickup_lat)],
                      [Number(trackingQuery.data.destination_lng), Number(trackingQuery.data.destination_lat)],
                    ],
                    distanceMeters: 37014,
                    durationSeconds: 1920,
                  }
                : null)
            }
            fareValue={flow.selectedOption?.price ?? "58.68"}
            driverPosition={driverPosition}
          />
          <div className="mt-4 flex justify-end">
            <Link to="/activity" className="rounded-md border border-line px-4 py-2.5 text-sm text-ink">
              Back to Activity
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
