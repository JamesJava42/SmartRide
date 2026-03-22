import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import { VEHICLE_TYPE_CONFIG } from "@shared/components/vehicle";

import { AddressSearchPanel } from "../components/booking/AddressSearchPanel";
import { AddressSearchSheet } from "../components/booking/AddressSearchSheet";
import { RouteInputCard } from "../components/booking/RouteInputCard";
import { VehicleSelectPanel } from "../components/booking/VehicleSelectPanel";
import { LoadingButton } from "../components/common/LoadingButton";
import { MobileNav } from "../components/common/MobileNav";
import { useToast } from "../components/common/Toast";
import { PaymentModal } from "../components/modals/PaymentModal";
import { RideSummaryModal } from "../components/modals/RideSummaryModal";
import { useRideContext } from "../context/RideContext";
import { reverseGeocode } from "../api/geocoder";
import { getRiderPaymentSettings } from "../api/riderProfile";
import { getLatestRiderTrip, requestRide } from "../api/rides";
import { useAddressSearch } from "../hooks/useAddressSearch";
import { useFareEstimates } from "../hooks/useFareEstimates";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useRiderSession } from "../hooks/useRiderSession";
import { fetchRoute } from "../services/maps";
import type { AddressResult } from "../types/ride";
import { saveRecentPlace } from "../utils/recentPlaces";
import styles from "./HomePage.module.css";

type AddressField = "pickup" | "dropoff" | null;

const pickupIcon = L.divIcon({
  className: "",
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#141A13;border:2px solid #fff;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const dropoffIcon = L.divIcon({
  className: "",
  html: '<div style="width:18px;height:18px;border-radius:50%;background:#1A6B45;border:2px solid #fff;"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapViewport({
  pickup,
  dropoff,
  currentOnly,
}: {
  pickup: AddressResult | null;
  dropoff: AddressResult | null;
  currentOnly: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (currentOnly && pickup) {
      map.flyTo([pickup.latitude, pickup.longitude], 14);
      return;
    }
    if (pickup && dropoff) {
      map.fitBounds(
        [
          [pickup.latitude, pickup.longitude],
          [dropoff.latitude, dropoff.longitude],
        ],
        { padding: [30, 30] },
      );
    }
  }, [currentOnly, dropoff, map, pickup]);

  return null;
}

function MobileMapControls({ hiddenLocate, onLocate }: { hiddenLocate: boolean; onLocate: () => void }) {
  const map = useMap();

  return (
    <>
      <div className={styles.zoomStack}>
        <button type="button" className={styles.zoomBtn} onClick={() => map.zoomIn()} aria-label="Zoom in">
          +
        </button>
        <button type="button" className={`${styles.zoomBtn} ${styles.zoomBtnBottom}`} onClick={() => map.zoomOut()} aria-label="Zoom out">
          −
        </button>
      </div>
      {!hiddenLocate ? (
        <button type="button" className={styles.locateBtn} onClick={onLocate} aria-label="Locate me" title="Use my location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="3.5" stroke="#1A6B45" strokeWidth="2" />
            <path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22" stroke="#1A6B45" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="7" stroke="#1A6B45" strokeOpacity="0.4" strokeWidth="1.2" />
          </svg>
        </button>
      ) : null}
    </>
  );
}

function HomeContent() {
  const navigate = useNavigate();
  const toast = useToast();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const session = useRiderSession();
  const ride = useRideContext();
  const [pageState, setPageState] = useState<"idle" | "results">(ride.fareEstimateData ? "results" : "idle");
  const [addressField, setAddressField] = useState<AddressField>(null);
  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showSeatsPopover, setShowSeatsPopover] = useState(false);
  const [query, setQuery] = useState("");
  const mountedRef = useRef(false);
  const recoveryCheckedRef = useRef(false);
  const seatsPopoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (recoveryCheckedRef.current) {
      return;
    }
    recoveryCheckedRef.current = true;

    let isCancelled = false;

    async function recoverLatestRide() {
      const latestRide = await getLatestRiderTrip();
      if (isCancelled || !latestRide) {
        return;
      }

      if (latestRide.ride_status === "RIDE_COMPLETED" && !latestRide.completion_acknowledged) {
        ride.clearRide();
        navigate(`/ride/complete/${latestRide.ride_id}`, { replace: true });
        return;
      }

      if (latestRide.ride_status === "NO_DRIVERS_FOUND") {
        ride.setActiveRideId(latestRide.ride_id);
        navigate(`/ride/tracking/${latestRide.ride_id}`, { replace: true });
        return;
      }

      if (latestRide.ride_status !== "RIDE_COMPLETED" && latestRide.ride_status !== "CANCELLED") {
        ride.setActiveRideId(latestRide.ride_id);
        navigate(`/ride/tracking/${latestRide.ride_id}`, { replace: true });
      }
    }

    void recoverLatestRide();

    return () => {
      isCancelled = true;
    };
  }, [navigate, ride]);

  useEffect(() => {
    if (mountedRef.current || ride.pickup || !("geolocation" in navigator)) {
      return;
    }
    mountedRef.current = true;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const address = await reverseGeocode(coords.latitude, coords.longitude);
          ride.setPickup(address);
        } catch {
          ride.setPickup({
            display_name: "Current Location",
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        }
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }, [ride]);

  const addressSearch = useAddressSearch(query, Boolean(addressField) && !isMobile);
  const fareQuery = useFareEstimates({
    pickup_lat: ride.pickup?.latitude ?? null,
    pickup_lng: ride.pickup?.longitude ?? null,
    pickup_address: ride.pickup?.display_name ?? null,
    dropoff_lat: ride.dropoff?.latitude ?? null,
    dropoff_lng: ride.dropoff?.longitude ?? null,
    dropoff_address: ride.dropoff?.display_name ?? null,
    seats: ride.seats,
    enabled: false,
  });
  const paymentSettingsQuery = useQuery({
    queryKey: ["rider-payment-settings"],
    queryFn: getRiderPaymentSettings,
  });

  const selectedEstimate =
    ride.fareEstimateData?.estimates.find((item) => item.vehicle_type === ride.selectedVehicleType) ??
    ride.fareEstimateData?.estimates[0] ??
    null;
  const effectivePaymentMethod =
    ride.paymentMethod ??
    (((paymentSettingsQuery.data?.defaultPaymentMethod ?? "").toUpperCase().replace(/\s+/g, "_") as typeof ride.paymentMethod) || null);

  const routePoints = useMemo(() => {
    const points: [number, number][] = [];
    if (ride.pickup) {
      points.push([ride.pickup.latitude, ride.pickup.longitude]);
    }
    if (ride.dropoff) {
      points.push([ride.dropoff.latitude, ride.dropoff.longitude]);
    }
    return points;
  }, [ride.dropoff, ride.pickup]);

  const polyline = routeGeometry.length > 1 ? routeGeometry : routePoints;

  function syncFareResults() {
    const firstAvailable =
      fareQuery.data?.estimates.find((item) => item.available) ?? fareQuery.data?.estimates[0] ?? null;
    if (fareQuery.data) {
      ride.setFareEstimateData(fareQuery.data);
    }
    if (firstAvailable) {
      ride.setSelectedVehicleType(firstAvailable.vehicle_type);
      ride.setSelectedFare(firstAvailable.total_estimated_fare);
    }
    setPageState("results");
  }

  useEffect(() => {
    if (fareQuery.data) {
      syncFareResults();
    }
  }, [fareQuery.data]);

  const requestRideMutation = useMutation({
    mutationFn: () =>
      requestRide({
        pickup_latitude: ride.pickup?.latitude ?? 0,
        pickup_longitude: ride.pickup?.longitude ?? 0,
        pickup_address: ride.pickup?.display_name ?? "",
        dropoff_latitude: ride.dropoff?.latitude ?? 0,
        dropoff_longitude: ride.dropoff?.longitude ?? 0,
        dropoff_address: ride.dropoff?.display_name ?? "",
        ride_type: "ON_DEMAND",
        vehicle_type: ride.selectedVehicleType ?? "ECONOMY",
        fare_estimate_id: selectedEstimate?.estimate_id ?? null,
        payment_method: effectivePaymentMethod ?? "CASH",
        seats: ride.seats,
      }),
    onSuccess: (response) => {
      setShowSummaryModal(false);
      ride.setActiveRideId(response.ride_id);
      navigate(`/ride/tracking/${response.ride_id}`);
    },
    onError: () => {
      toast.showError("Failed to book ride. Please try again.");
    },
  });

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!seatsPopoverRef.current?.contains(event.target as Node)) {
        setShowSeatsPopover(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowSeatsPopover(false);
      }
    }
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleLocateMe() {
    if (!("geolocation" in navigator)) {
      toast.showError("Unable to access your location.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const address = await reverseGeocode(coords.latitude, coords.longitude);
          ride.setPickup(address);
        } catch {
          toast.showError("Unable to locate your address.");
        }
      },
      () => toast.showError("Unable to access your location."),
    );
  }

  function handleSelectSuggestion(value: AddressResult) {
    saveRecentPlace(value);
    if (addressField === "pickup") {
      ride.setPickup(value);
    }
    if (addressField === "dropoff") {
      ride.setDropoff(value);
    }
    setAddressField(null);
    setQuery("");
  }

  function renderSeatsControl(className: string) {
    return (
      <div className={styles.seatsWrap} ref={seatsPopoverRef}>
        <button
          type="button"
          className={className}
          onClick={() => setShowSeatsPopover((current) => !current)}
          aria-haspopup="dialog"
          aria-expanded={showSeatsPopover}
        >
          <span>
            Seats: <strong className={styles.seatValue}>{ride.seats}</strong>
          </span>
          <span>▾</span>
        </button>
        {showSeatsPopover ? (
          <div className={styles.seatsPopover}>
            {([1, 2, 3, 4, 5, 6] as const).map((seat) => (
              <button
                key={seat}
                type="button"
                className={`${styles.seatOption} ${ride.seats === seat ? styles.seatOptionActive : ""}`}
                onClick={() => {
                  ride.setSeats(seat);
                  setShowSeatsPopover(false);
                }}
              >
                {seat}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  async function handleSearch() {
    if (!ride.pickup || !ride.dropoff) {
      toast.showError("Set both pickup and dropoff to continue.");
      return;
    }

    setRouteLoading(true);
    try {
      const [estimateResult, route] = await Promise.all([
        fareQuery.refetch(),
        fetchRoute({
          pickupPinnedLocation: {
            label: ride.pickup.display_name,
            latitude: ride.pickup.latitude,
            longitude: ride.pickup.longitude,
          },
          destinationPinnedLocation: {
            label: ride.dropoff.display_name,
            latitude: ride.dropoff.latitude,
            longitude: ride.dropoff.longitude,
          },
        }),
      ]);
      if (estimateResult.data) {
        ride.setFareEstimateData(estimateResult.data);
      }
      setRouteGeometry(route.geometry.map(([lng, lat]) => [lat, lng]));
      setPageState("results");
    } catch {
      toast.showError("Could not get fare estimates. Try again.");
    } finally {
      setRouteLoading(false);
    }
  }

  function handleVehicleSelect(vehicleType: NonNullable<typeof ride.selectedVehicleType>) {
    ride.setSelectedVehicleType(vehicleType);
    const nextEstimate = ride.fareEstimateData?.estimates.find((item) => item.vehicle_type === vehicleType);
    ride.setSelectedFare(nextEstimate?.total_estimated_fare ?? null);
  }

  const mobileForm = (
    <>
      <MobileNav showLogout />
      <section className={styles.mobileMapWrap}>
        <MapContainer
          center={routePoints[0] ?? [33.8041, -118.1874]}
          zoom={13}
          zoomControl={false}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
          {ride.pickup && pageState === "idle" ? (
            <>
              <Circle center={[ride.pickup.latitude, ride.pickup.longitude]} radius={55} pathOptions={{ color: "#1A6B45", opacity: 0.3, weight: 1 }} />
              <CircleMarker center={[ride.pickup.latitude, ride.pickup.longitude]} radius={8} pathOptions={{ color: "#FFFFFF", weight: 2, fillColor: "#1A6B45", fillOpacity: 1 }} />
            </>
          ) : null}
          {ride.pickup && pageState === "results" ? (
            <Marker position={[ride.pickup.latitude, ride.pickup.longitude]} icon={pickupIcon}>
              <Tooltip permanent direction="top" offset={[0, -10]}>
                Pickup
              </Tooltip>
            </Marker>
          ) : null}
          {ride.dropoff && pageState === "results" ? (
            <Marker position={[ride.dropoff.latitude, ride.dropoff.longitude]} icon={dropoffIcon}>
              <Tooltip permanent direction="top" offset={[0, -10]}>
                Drop-off
              </Tooltip>
            </Marker>
          ) : null}
          {polyline.length > 1 ? (
            <Polyline positions={polyline} pathOptions={{ color: "#141A13", weight: 3.5, opacity: 0.78, lineCap: "round" }} />
          ) : null}
          <MapViewport pickup={ride.pickup} dropoff={pageState === "results" ? ride.dropoff : null} currentOnly={pageState === "idle"} />
          <MobileMapControls hiddenLocate={pageState === "results"} onLocate={() => void handleLocateMe()} />
        </MapContainer>
      </section>
      <section className={styles.mobileForm}>
        <button type="button" className={styles.mobileDropdown}>
          <span>Ride</span>
          <span>▾</span>
        </button>
        <RouteInputCard
          pickup={ride.pickup}
          dropoff={ride.dropoff}
          onPickupChange={ride.setPickup}
          onDropoffChange={ride.setDropoff}
          onPickupPress={() => setAddressField("pickup")}
          onDropoffPress={() => setAddressField("dropoff")}
        />
        <div className={styles.mobileHint}>≡ Drag to swap</div>
        <div className={styles.mobileTimeRow}>
          <button type="button" className={styles.mobileCompactBtn}>
            <span>Leave now</span>
            <span>▾</span>
          </button>
          {renderSeatsControl(styles.mobileCompactBtn)}
        </div>
        <LoadingButton
          loading={routeLoading}
          loadingLabel="Searching..."
          disabled={!ride.dropoff}
          className={`${styles.mobileSearchBtn} ${pageState === "results" ? styles.mobileSearchBtnOutlined : ""}`}
          onClick={() => void handleSearch()}
        >
          Search
        </LoadingButton>
      </section>
      {pageState === "results" && ride.fareEstimateData ? (
        <>
          <VehicleSelectPanel
            mobile
            estimates={ride.fareEstimateData.estimates}
            selectedVehicleType={ride.selectedVehicleType}
            routeDistanceKm={ride.fareEstimateData.route_distance_km}
            routeDurationMin={ride.fareEstimateData.route_duration_min}
            onSelect={handleVehicleSelect}
            onBook={() => navigate("/payment")}
          />
        </>
      ) : null}
      <AddressSearchSheet
        open={Boolean(addressField)}
        field={addressField ?? "dropoff"}
        initialValue={addressField === "pickup" ? ride.pickup?.display_name ?? "" : ride.dropoff?.display_name ?? ""}
        onClose={() => setAddressField(null)}
        onSelect={handleSelectSuggestion}
      />
    </>
  );

  if (isMobile) {
    return <div className={styles.mobilePage}>{mobileForm}</div>;
  }

  function handleLogout() {
    session.signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <div className={styles.logo}>RideConnect</div>
        <nav className={styles.centerNav}>
          <Link to="/dashboard">Trips</Link>
          <Link to="/dashboard">Reserve</Link>
          <Link to="/dashboard">Courier</Link>
          <Link to="/dashboard">Hourly</Link>
          <Link className={styles.mutedLink} to="/activity">
            Activity
          </Link>
          <Link className={styles.mutedLink} to="/profile">
            Profile
          </Link>
        </nav>
        <div className={styles.navActions}>
          <div className={styles.avatar}>R</div>
          <button type="button" className={styles.iconBtn}>⌕</button>
          <button type="button" className={styles.iconBtn}>☺</button>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <div className={styles.body}>
        <section className={styles.formCol}>
          <div className={styles.formInner}>
            <button type="button" className={styles.dropdownBtn}>
              Ride <span>▾</span>
            </button>
            <div className={styles.routeCardWrap}>
              <RouteInputCard
                pickup={ride.pickup}
                dropoff={ride.dropoff}
                onPickupChange={ride.setPickup}
                onDropoffChange={ride.setDropoff}
                onPickupPress={() => {
                  setAddressField("pickup");
                  setQuery(ride.pickup?.display_name ?? "");
                }}
                onDropoffPress={() => {
                  setAddressField("dropoff");
                  setQuery(ride.dropoff?.display_name ?? "");
                }}
                activeField={addressField}
                query={query}
                isLoading={addressSearch.isLoading}
                suggestions={addressSearch.results}
                onQueryChange={setQuery}
                onCloseEditor={() => setAddressField(null)}
                onSelectSuggestion={handleSelectSuggestion}
              />
            </div>
            <div className={styles.dragHint}>≡ Drag either field to swap pickup and dropoff</div>
            <div className={styles.timeRow}>
              <button type="button" className={styles.dropdownBtn}>
                Leave now <span>▾</span>
              </button>
              {renderSeatsControl(styles.dropdownBtn)}
            </div>
            <LoadingButton
              loading={routeLoading}
              loadingLabel="Searching..."
              disabled={!ride.dropoff}
              className={`${styles.searchBtn} ${pageState === "results" ? styles.searchBtnOutlined : ""}`}
              onClick={() => void handleSearch()}
            >
              Search
            </LoadingButton>
          </div>
        </section>
        <section className={styles.mapCol}>
          <MapContainer
            center={routePoints[0] ?? [33.8041, -118.1874]}
            zoom={13}
            zoomControl={false}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            {ride.pickup && pageState === "idle" ? (
              <>
                <Circle center={[ride.pickup.latitude, ride.pickup.longitude]} radius={55} pathOptions={{ color: "#1A6B45", opacity: 0.3, weight: 1 }} />
                <CircleMarker center={[ride.pickup.latitude, ride.pickup.longitude]} radius={8} pathOptions={{ color: "#FFFFFF", weight: 2, fillColor: "#1A6B45", fillOpacity: 1 }} />
              </>
            ) : null}
            {ride.pickup && pageState === "results" ? (
              <Marker position={[ride.pickup.latitude, ride.pickup.longitude]} icon={pickupIcon}>
                <Tooltip permanent direction="top" offset={[0, -10]}>
                  Pickup
                </Tooltip>
              </Marker>
            ) : null}
            {ride.dropoff && pageState === "results" ? (
              <Marker position={[ride.dropoff.latitude, ride.dropoff.longitude]} icon={dropoffIcon}>
                <Tooltip permanent direction="top" offset={[0, -10]}>
                  Drop-off
                </Tooltip>
              </Marker>
            ) : null}
            {polyline.length > 1 ? (
              <Polyline positions={polyline} pathOptions={{ color: "#141A13", weight: 4.5, opacity: 0.82 }} />
            ) : null}
            <MapViewport pickup={ride.pickup} dropoff={pageState === "results" ? ride.dropoff : null} currentOnly={pageState === "idle"} />
            <MobileMapControls hiddenLocate={pageState === "results"} onLocate={() => void handleLocateMe()} />
          </MapContainer>
        </section>
        {pageState === "results" && ride.fareEstimateData ? (
          <aside className={styles.vehicleCol}>
            <VehicleSelectPanel
              estimates={ride.fareEstimateData.estimates}
              selectedVehicleType={ride.selectedVehicleType}
              routeDistanceKm={ride.fareEstimateData.route_distance_km}
              routeDurationMin={ride.fareEstimateData.route_duration_min}
              onSelect={handleVehicleSelect}
              onBook={() => setShowPaymentModal(true)}
            />
          </aside>
        ) : null}
      </div>
      {showPaymentModal && selectedEstimate ? (
        <PaymentModal
          open={showPaymentModal}
          selectedMethod={effectivePaymentMethod}
          pickupLabel={ride.pickup?.display_name ?? "Pickup"}
          dropoffLabel={ride.dropoff?.display_name ?? "Dropoff"}
          fare={selectedEstimate.total_estimated_fare}
          vehicleType={selectedEstimate.vehicle_type}
          onClose={() => setShowPaymentModal(false)}
          onSelectMethod={(method) => {
            ride.setPaymentMethod(method);
          }}
          onConfirm={() => {
            if (!ride.paymentMethod && effectivePaymentMethod) {
              ride.setPaymentMethod(effectivePaymentMethod);
            }
            setShowPaymentModal(false);
            setShowSummaryModal(true);
          }}
        />
      ) : null}
      {showSummaryModal && selectedEstimate ? (
        <RideSummaryModal
          open={showSummaryModal}
          pickup={ride.pickup?.display_name ?? "Pickup"}
          dropoff={ride.dropoff?.display_name ?? "Dropoff"}
          distance={ride.fareEstimateData?.route_distance_km ?? 0}
          duration={ride.fareEstimateData?.route_duration_min ?? 0}
          paymentMethod={effectivePaymentMethod ?? "CASH"}
          vehicleType={selectedEstimate.vehicle_type}
          fare={selectedEstimate.total_estimated_fare}
          loading={requestRideMutation.isPending}
          onClose={() => setShowSummaryModal(false)}
          onConfirm={() => {
            requestRideMutation.mutate();
          }}
        />
      ) : null}
    </div>
  );
}

export function HomePage() {
  return <HomeContent />;
}
