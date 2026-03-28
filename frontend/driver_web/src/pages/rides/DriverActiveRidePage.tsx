import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import { Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { cancelRide, getActiveRide, updateRideStage } from "../../api/driverRides";
import { DriverLayout } from "../../components/layout/DriverLayout";
import { RideStagePanel } from "../../components/rides/RideStagePanel";
import { fetchRoute } from "../../services/maps";
import type { ActiveRide, RideStage } from "../../types/driverOperations";
import styles from "./DriverActiveRidePage.module.css";
import "leaflet/dist/leaflet.css";

const dotIcon = L.divIcon({
  className: styles.markerPin,
  html: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

type DialogState =
  | { title: string; message: string; action: "enRoute" | "arrived" | "start" | "complete" | "cancel" }
  | null;

function getStageBadge(stage: RideStage) {
  switch (stage) {
    case "DRIVER_ASSIGNED":
      return "Assigned";
    case "DRIVER_ARRIVED":
      return "Arrived";
    case "RIDE_STARTED":
      return "Ride started";
    default:
      return "On ride";
  }
}

function getEtaLabel(ride: ActiveRide) {
  if (ride.stage === "DRIVER_ARRIVED") {
    return { value: "Arrived", label: "at pickup" };
  }
  if (ride.stage === "RIDE_STARTED") {
    return { value: ride.eta_minutes ? `${ride.eta_minutes} min` : "Updating", label: "to dropoff" };
  }
  return { value: ride.eta_minutes ? `${ride.eta_minutes} min` : "Updating", label: "to pickup" };
}

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "R"
  );
}

export default function DriverActiveRidePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const rideQuery = useQuery({
    queryKey: ["active-ride"],
    queryFn: getActiveRide,
    refetchInterval: 3000,
  });

  const routeMapQuery = useQuery({
    queryKey: ["active-ride-route", rideQuery.data?.ride_id],
    queryFn: async () => {
      if (!rideQuery.data) {
        return null;
      }
      return fetchRoute({
        pickupPinnedLocation: {
          label: rideQuery.data.pickup_address,
          latitude: rideQuery.data.pickup_latitude,
          longitude: rideQuery.data.pickup_longitude,
        },
        destinationPinnedLocation: {
          label: rideQuery.data.dropoff_address,
          latitude: rideQuery.data.dropoff_latitude,
          longitude: rideQuery.data.dropoff_longitude,
        },
      });
    },
    enabled: Boolean(rideQuery.data),
    staleTime: 60_000,
  });

  const stageMutation = useMutation({
    mutationFn: ({ rideId, stage }: { rideId: string; stage: RideStage }) => updateRideStage(rideId, stage),
    onSuccess: (ride) => {
      setDialog(null);
      setPageError(null);
      queryClient.setQueryData(["active-ride"], ride);
    },
    onError: () => {
      setDialog(null);
      setPageError("Unable to update ride stage right now.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelRide,
    onSuccess: () => {
      setDialog(null);
      navigate("/dashboard", { replace: true });
    },
    onError: () => {
      setDialog(null);
      setPageError("Unable to cancel this ride right now.");
    },
  });

  function openNavigation(lat: number, lng: number) {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const url = isIOS
      ? `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, "_blank");
  }

  const ride = rideQuery.data;
  const eta = ride ? getEtaLabel(ride) : null;
  const panelTitle = ride ? getStageBadge(ride.stage) : "On ride";
  const mapCenter = useMemo<[number, number]>(() => {
    if (!ride) {
      return [0, 0];
    }
    return [ride.pickup_latitude, ride.pickup_longitude];
  }, [ride]);

  const onConfirmDialog = () => {
    if (!ride || !dialog) {
      return;
    }
    if (dialog.action === "cancel") {
      cancelMutation.mutate(ride.ride_id);
      return;
    }

    const nextStage: Record<Exclude<NonNullable<DialogState>["action"], "cancel">, RideStage> = {
      enRoute: "DRIVER_EN_ROUTE",
      arrived: "DRIVER_ARRIVED",
      start: "RIDE_STARTED",
      complete: "RIDE_COMPLETED",
    };

    stageMutation.mutate({ rideId: ride.ride_id, stage: nextStage[dialog.action] });
  };

  if (rideQuery.isLoading) {
    return (
      <DriverLayout>
        <div className={styles.page}>
          <div className={styles.stateCard}>Loading active ride...</div>
        </div>
      </DriverLayout>
    );
  }

  if (rideQuery.isError || !ride) {
    return (
      <DriverLayout>
        <div className={styles.page}>
          <div className={styles.stateCard}>
            <p>{rideQuery.isError ? "Unable to load the active ride." : "No active ride right now."}</p>
            <div className={styles.dialogActions}>
              <button type="button" className={styles.outlineButton} onClick={() => navigate("/dashboard")}>
                Back to dashboard
              </button>
              <button type="button" className={styles.primaryButton} onClick={() => void rideQuery.refetch()}>
                {rideQuery.isError ? "Retry" : "Refresh"}
              </button>
            </div>
          </div>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderTitle}>Active ride</div>
          <span className={styles.stageBadge}>{panelTitle}</span>
        </div>

        {pageError ? <div className={styles.errorBanner}>{pageError}</div> : null}

        <div className={styles.layout}>
          <section className={styles.mapPanel}>
            <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false} className={styles.map}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[ride.pickup_latitude, ride.pickup_longitude]} icon={dotIcon}>
                <Popup>Pickup</Popup>
              </Marker>
              <Marker position={[ride.dropoff_latitude, ride.dropoff_longitude]} icon={dotIcon}>
                <Popup>Dropoff</Popup>
              </Marker>
              {routeMapQuery.data?.geometry ? (
                <Polyline
                  positions={routeMapQuery.data.geometry.map(([lng, lat]) => [lat, lng] as [number, number])}
                  pathOptions={{ color: "#1A6B45", weight: 4 }}
                />
              ) : null}
            </MapContainer>
          </section>

          <section className={styles.statusPanel}>
            <RideStagePanel stage={ride.stage} />

            <div className={styles.riderCard}>
              <div className={styles.avatar}>{getInitials(ride.rider_name)}</div>
              <div className={styles.riderMeta}>
                <div className={styles.riderName}>{ride.rider_name}</div>
                <div className={styles.riderSubtext}>
                  {ride.vehicle_type} · {ride.seats} seats
                </div>
              </div>
              {ride.rider_phone ? (
                <a href={`tel:${ride.rider_phone}`} className={styles.callButton}>
                  <Phone size={16} />
                </a>
              ) : null}
            </div>

            <div className={styles.routeCard}>
              <div className={`${styles.routeRow} ${ride.stage !== "DRIVER_ASSIGNED" && ride.stage !== "DRIVER_EN_ROUTE" ? styles.crossed : ""}`}>
                <span className={styles.pickupDot} />
                <span>{ride.pickup_address}</span>
              </div>
              <div className={styles.routeConnector} />
              <div className={`${styles.routeRow} ${ride.stage === "RIDE_STARTED" ? styles.dropoffActive : ""}`}>
                <span className={styles.dropoffDot} />
                <span>{ride.dropoff_address}</span>
              </div>
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaCard}>
                <div className={styles.metaValue}>{eta?.value}</div>
                <div className={styles.metaLabel}>{eta?.label}</div>
              </div>
              <div className={styles.metaCard}>
                <div className={styles.metaValue}>${ride.fare_amount.toFixed(2)}</div>
                <div className={styles.metaLabel}>fare</div>
              </div>
            </div>

            <div className={styles.actionBlock}>
              {(ride.stage === "DRIVER_ASSIGNED" || ride.stage === "DRIVER_EN_ROUTE") && (
                <>
                  {ride.stage === "DRIVER_ASSIGNED" ? (
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => {
                        openNavigation(ride.pickup_latitude, ride.pickup_longitude);
                        setDialog({
                          title: "Head to pickup",
                          message: "Confirm you are starting the drive to the pickup location.",
                          action: "enRoute",
                        });
                      }}
                    >
                      Navigate to pickup
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => openNavigation(ride.pickup_latitude, ride.pickup_longitude)}
                      >
                        Navigate to pickup
                      </button>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() =>
                          setDialog({
                            title: "Mark as arrived",
                            message: "Confirm you have arrived at the pickup location.",
                            action: "arrived",
                          })
                        }
                      >
                        Mark as arrived
                      </button>
                    </>
                  )}
                </>
              )}

              {ride.stage === "DRIVER_ARRIVED" && (
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() =>
                    setDialog({
                      title: "Start ride",
                      message: "Confirm the rider is in the vehicle.",
                      action: "start",
                    })
                  }
                >
                  Start ride
                </button>
              )}

              {ride.stage === "RIDE_STARTED" && (
                <>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => openNavigation(ride.dropoff_latitude, ride.dropoff_longitude)}
                  >
                    Navigate to dropoff
                  </button>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() =>
                      setDialog({
                        title: "Complete ride",
                        message: "Confirm you've reached the dropoff location.",
                        action: "complete",
                      })
                    }
                  >
                    Complete ride
                  </button>
                </>
              )}

              {ride.stage !== "RIDE_STARTED" && ride.stage !== "RIDE_COMPLETED" ? (
                <button
                  type="button"
                  className={styles.cancelLink}
                  onClick={() =>
                    setDialog({
                      title: "Cancel ride",
                      message: "Cancel this ride before it starts?",
                      action: "cancel",
                    })
                  }
                >
                  Cancel ride
                </button>
              ) : null}
            </div>
          </section>
        </div>

        {dialog ? (
          <div className={styles.dialogBackdrop}>
            <div className={styles.dialogCard}>
              <h2>{dialog.title}</h2>
              <p>{dialog.message}</p>
              <div className={styles.dialogActions}>
                <button type="button" className={styles.outlineButton} onClick={() => setDialog(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={onConfirmDialog}
                  disabled={stageMutation.isPending || cancelMutation.isPending}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DriverLayout>
  );
}
