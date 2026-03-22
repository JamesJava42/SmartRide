import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { MapContainer, Marker, Polyline, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";

import { VEHICLE_TYPE_CONFIG } from "@shared/components/vehicle";
import type { VehicleType } from "@shared/types/vehicle";

import { RouteInputCard } from "../components/booking/RouteInputCard";
import { MobileVehicleCard } from "../components/booking/MobileVehicleCard";
import { VehicleSelectColumn } from "../components/booking/VehicleSelectColumn";
import { useBookingFlow } from "../hooks/useBookingFlow";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useRiderSession } from "../hooks/useRiderSession";
import { searchAddressSuggestions } from "../services/maps";
import type { RideMode, RouteLocation } from "../types/api";
import styles from "./SearchResultsPage.module.css";

type AddressEditorField = "pickup" | "dropoff" | null;

const rideTypeOptions: Array<{ value: RideMode; label: string }> = [
  { value: "ride", label: "Ride" },
  { value: "reserve", label: "Schedule" },
];

const vehicleTypeByOption: Record<string, VehicleType> = {
  Economy: "ECONOMY",
  Comfort: "COMFORT",
  Premium: "PREMIUM",
  XL: "XL",
};

const displayOrder: VehicleType[] = ["ECONOMY", "COMFORT", "PREMIUM", "XL"];

const pickupIcon = L.divIcon({
  className: "",
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#111111;border:2.5px solid #FFFFFF;box-shadow:0 1px 3px rgba(0,0,0,0.18);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const dropoffIcon = L.divIcon({
  className: "",
  html: '<div style="width:18px;height:18px;border-radius:50%;background:#1A6B45;border:2.5px solid #FFFFFF;box-shadow:0 1px 3px rgba(0,0,0,0.18);"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FitRouteBounds({
  pickup,
  dropoff,
}: {
  pickup: [number, number];
  dropoff: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds([pickup, dropoff], { padding: [30, 30] });
  }, [dropoff, map, pickup]);

  return null;
}

function ResultsMap({
  pickup,
  dropoff,
  geometry,
}: {
  pickup: [number, number];
  dropoff: [number, number];
  geometry: [number, number][];
}) {
  return (
    <div className={styles.mapCol}>
      <MapContainer center={pickup} zoom={11} zoomControl={false} style={{ width: "100%", height: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <ZoomControl position="topleft" />
        <Marker position={dropoff} icon={dropoffIcon}>
          <Popup autoClose={false} closeButton={false} closeOnClick={false} closeOnEscapeKey={false} offset={[0, -10]}>
            Drop-off
          </Popup>
        </Marker>
        <Marker position={pickup} icon={pickupIcon}>
          <Popup autoClose={false} closeButton={false} closeOnClick={false} closeOnEscapeKey={false} offset={[0, -10]}>
            Pickup
          </Popup>
        </Marker>
        <Polyline positions={geometry} pathOptions={{ color: "#111111", weight: 4, opacity: 0.82, lineCap: "round" }} />
        <FitRouteBounds pickup={pickup} dropoff={dropoff} />
      </MapContainer>
    </div>
  );
}

export function SearchResultsPage() {
  const booking = useBookingFlow();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const session = useRiderSession();
  const [addressEditorField, setAddressEditorField] = useState<AddressEditorField>(null);
  const [addressQuery, setAddressQuery] = useState("");
  const [addressResults, setAddressResults] = useState<RouteLocation[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showRideTypeMenu, setShowRideTypeMenu] = useState(false);
  const [showDepartureMenu, setShowDepartureMenu] = useState(false);
  const [showSeatsPicker, setShowSeatsPicker] = useState(false);
  const [seats, setSeats] = useState(1);
  const seatsPickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (booking.routeData && booking.rideOptions.length > 0 && !booking.selectedOption) {
      booking.selectRideOption(booking.rideOptions[0] ?? null);
    }
  }, [booking]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (seatsPickerRef.current && !seatsPickerRef.current.contains(event.target as Node)) {
        setShowSeatsPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!addressEditorField) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (addressQuery.trim().length < 2) {
        setAddressResults([]);
        return;
      }

      setAddressLoading(true);
      void searchAddressSuggestions(addressQuery)
        .then((results) => setAddressResults(results))
        .catch(() => setAddressResults([]))
        .finally(() => setAddressLoading(false));
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [addressEditorField, addressQuery]);

  if (!booking.routeData || booking.rideOptions.length === 0) {
    return <Navigate replace to="/dashboard" />;
  }

  const pickupAddress = booking.pickupPinnedLocation ?? booking.currentLocation ?? null;
  const dropoffAddress = booking.destinationPinnedLocation ?? null;
  const selectedRideType = rideTypeOptions.find((option) => option.value === booking.mode)?.label ?? "Ride";
  const departureLabel = booking.scheduleMode === "Schedule" ? "Schedule" : "Leave now";
  const routeDistance = `${(booking.routeData.distanceMeters / 1609.34).toFixed(1)} mi`;
  const routeDuration = `${Math.round(booking.routeData.durationSeconds / 60)} min`;
  const selectedVehicleType = (booking.selectedOption ? vehicleTypeByOption[booking.selectedOption.productName] : null) ?? "ECONOMY";
  const selectedEstimate = booking.rideOptions.find((option) => vehicleTypeByOption[option.productName] === selectedVehicleType) ?? booking.rideOptions[0] ?? null;

  const estimates = useMemo(
    () =>
      displayOrder
        .map((type) =>
          booking.rideOptions
            .map((option) => ({
              vehicleType: vehicleTypeByOption[option.productName],
              fare: Number(option.price),
              etaMinutes: option.etaMinutes,
              unavailable: option.unavailable,
            }))
            .find((item) => item.vehicleType === type),
        )
        .filter(Boolean) as Array<{ vehicleType: VehicleType; fare: number; etaMinutes: number; unavailable?: boolean }>,
    [booking.rideOptions],
  );

  function openAddressEditor(field: Exclude<AddressEditorField, null>) {
    setAddressEditorField(field);
    setAddressQuery(field === "pickup" ? booking.pickupLocation : booking.destinationLocation);
    setAddressResults([]);
  }

  function closeAddressEditor() {
    setAddressEditorField(null);
    setAddressQuery("");
    setAddressResults([]);
    setAddressLoading(false);
  }

  function handleAddressSelect(locationResult: RouteLocation) {
    if (addressEditorField === "pickup") {
      booking.selectPickupSuggestion(locationResult);
    } else if (addressEditorField === "dropoff") {
      booking.selectDestinationSuggestion(locationResult);
    }
    closeAddressEditor();
  }

  async function handleSearch() {
    await booking.searchRoute();
  }

  function handleBook() {
    navigate("/dashboard");
  }

  function handleLogout() {
    session.signOut();
    navigate("/login", { replace: true });
  }

  const mapPickup: [number, number] = [booking.routeData.pickup.latitude, booking.routeData.pickup.longitude];
  const mapDropoff: [number, number] = [booking.routeData.destination.latitude, booking.routeData.destination.longitude];
  const mapGeometry = booking.routeData.geometry.length > 0 ? booking.routeData.geometry : [mapPickup, mapDropoff];

  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <div className={styles.brand}>RideConnect</div>
        <div className={styles.navRight}>
          <div className={styles.avatar}>R</div>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {!isMobile ? (
          <aside className={styles.searchCol}>
            <div className={styles.searchInner}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRideTypeMenu((current) => !current)}
                  className="flex w-full items-center justify-between rounded-[12px] border border-line bg-white px-[14px] py-[11px] text-left text-[14px] text-ink"
                >
                  <span>{selectedRideType}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 6L8 10L12 6" stroke="#8A9B85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {showRideTypeMenu ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-[12px] border border-line bg-white p-1 shadow-[0_18px_40px_rgba(15,23,18,0.12)]">
                    {rideTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          booking.setMode(option.value);
                          setShowRideTypeMenu(false);
                        }}
                        className={`flex w-full items-center rounded-[10px] px-3 py-2 text-sm ${
                          booking.mode === option.value ? "bg-[#edf9f2] text-accent" : "text-ink hover:bg-[#fafaf8]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <RouteInputCard
                pickup={pickupAddress ? { display_name: pickupAddress.label, latitude: pickupAddress.latitude, longitude: pickupAddress.longitude } : null}
                dropoff={dropoffAddress ? { display_name: dropoffAddress.label, latitude: dropoffAddress.latitude, longitude: dropoffAddress.longitude } : null}
                onPickupChange={(address) => {
                  if (!address) {
                    booking.setPickupLocation("");
                    return;
                  }
                  booking.setPickupFromLocation({ label: address.display_name, latitude: address.latitude, longitude: address.longitude });
                }}
                onDropoffChange={(address) => {
                  if (!address) {
                    booking.setDestinationLocation("");
                    return;
                  }
                  booking.setDestinationFromLocation({ label: address.display_name, latitude: address.latitude, longitude: address.longitude });
                }}
                onPickupPress={() => openAddressEditor("pickup")}
                onDropoffPress={() => openAddressEditor("dropoff")}
                activeField={addressEditorField}
                query={addressQuery}
                isLoading={addressLoading}
                suggestions={addressResults.map((result) => ({
                  display_name: result.label,
                  latitude: result.latitude,
                  longitude: result.longitude,
                }))}
                currentLocationOption={
                  addressEditorField === "pickup" && booking.currentLocation
                    ? {
                        display_name: booking.currentLocation.label,
                        latitude: booking.currentLocation.latitude,
                        longitude: booking.currentLocation.longitude,
                      }
                    : null
                }
                onQueryChange={setAddressQuery}
                onCloseEditor={closeAddressEditor}
                onSelectSuggestion={(address) =>
                  handleAddressSelect({
                    label: address.display_name,
                    latitude: address.latitude,
                    longitude: address.longitude,
                  })
                }
              />

              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDepartureMenu((current) => !current)}
                    className="flex w-full items-center justify-between rounded-[12px] border border-line bg-white px-[14px] py-[11px] text-left text-[14px] text-ink"
                  >
                    <span>{departureLabel}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M4 6L8 10L12 6" stroke="#8A9B85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <div className="relative" ref={seatsPickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowSeatsPicker((current) => !current)}
                    className="flex min-w-[116px] items-center gap-2 rounded-[12px] border border-line bg-white px-[12px] py-[11px] text-[14px] text-ink"
                  >
                    <span className="text-[#5A6B56]">Seats:</span>
                    <span className="font-medium text-accent">{seats}</span>
                  </button>
                  {showSeatsPicker ? (
                    <div className="absolute right-0 top-[calc(100%+8px)] z-30 rounded-[10px] border border-line bg-white p-2 shadow-[0_18px_40px_rgba(15,23,18,0.12)]">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setSeats(value);
                              setShowSeatsPicker(false);
                            }}
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${
                              seats === value ? "bg-accent text-white" : "bg-[#f4f5f2] text-ink"
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <button type="button" onClick={() => void handleSearch()} className={styles.searchBtn}>
                Search
              </button>
            </div>
          </aside>
        ) : null}

        <ResultsMap pickup={mapPickup} dropoff={mapDropoff} geometry={mapGeometry} />

        {!isMobile ? (
          <aside className={styles.vehicleCol}>
            <VehicleSelectColumn
              estimates={estimates}
              selectedType={selectedVehicleType}
              routeDistance={routeDistance}
              routeDuration={routeDuration}
              onSelect={(type) => {
                const option = booking.rideOptions.find((item) => vehicleTypeByOption[item.productName] === type) ?? null;
                booking.selectRideOption(option);
              }}
              onBook={handleBook}
            />
          </aside>
        ) : null}
      </div>

      {isMobile ? (
        <>
          <div className={styles.mobileForm}>
            <RouteInputCard
              pickup={pickupAddress ? { display_name: pickupAddress.label, latitude: pickupAddress.latitude, longitude: pickupAddress.longitude } : null}
              dropoff={dropoffAddress ? { display_name: dropoffAddress.label, latitude: dropoffAddress.latitude, longitude: dropoffAddress.longitude } : null}
              onPickupChange={(address) => {
                if (!address) {
                  booking.setPickupLocation("");
                  return;
                }
                booking.setPickupFromLocation({ label: address.display_name, latitude: address.latitude, longitude: address.longitude });
              }}
              onDropoffChange={(address) => {
                if (!address) {
                  booking.setDestinationLocation("");
                  return;
                }
                booking.setDestinationFromLocation({ label: address.display_name, latitude: address.latitude, longitude: address.longitude });
              }}
              onPickupPress={() => openAddressEditor("pickup")}
              onDropoffPress={() => openAddressEditor("dropoff")}
              activeField={addressEditorField}
              query={addressQuery}
              isLoading={addressLoading}
              suggestions={addressResults.map((result) => ({
                display_name: result.label,
                latitude: result.latitude,
                longitude: result.longitude,
              }))}
              currentLocationOption={
                addressEditorField === "pickup" && booking.currentLocation
                  ? {
                      display_name: booking.currentLocation.label,
                      latitude: booking.currentLocation.latitude,
                      longitude: booking.currentLocation.longitude,
                    }
                  : null
              }
              onQueryChange={setAddressQuery}
              onCloseEditor={closeAddressEditor}
              onSelectSuggestion={(address) =>
                handleAddressSelect({
                  label: address.display_name,
                  latitude: address.latitude,
                  longitude: address.longitude,
                })
              }
            />

            <div className={styles.mobileTimeSeats}>
              <button type="button" className={styles.mobileControl}>
                <span>Leave now</span>
                <span className={styles.chevron}>▾</span>
              </button>
              <div className={styles.mobileSeatsWrap} ref={seatsPickerRef}>
                <button type="button" className={styles.mobileControl} onClick={() => setShowSeatsPicker((current) => !current)}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="8" cy="5" r="3" stroke="#6B7280" strokeWidth="1.3" />
                    <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#6B7280" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  <span>Seats:</span>
                  <strong>{seats}</strong>
                  <span className={styles.chevron}>▾</span>
                </button>
                {showSeatsPicker ? (
                  <div className={styles.mobileSeatsPicker}>
                    {[1, 2, 3, 4, 5, 6].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setSeats(value);
                          setShowSeatsPicker(false);
                        }}
                        className={`${styles.mobileSeatOption} ${seats === value ? styles.mobileSeatOptionSelected : ""}`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <button type="button" onClick={() => void handleSearch()} className={styles.mobileSearchBtn}>
              {booking.routeLoading ? "Searching..." : "Search"}
            </button>
          </div>

          <div className={styles.mobileRoute}>
            <p className={styles.routeReady}>Route ready</p>
            <p className={styles.routeMeta}>{routeDistance} · {routeDuration}</p>
            <span className={styles.chooseBadge}>Choose a vehicle</span>
          </div>

          <div className={styles.mobileVehicles}>
            {estimates.map((estimate) => (
              <MobileVehicleCard
                key={estimate.vehicleType}
                estimate={estimate}
                selected={selectedVehicleType === estimate.vehicleType}
                onClick={() => {
                  const option = booking.rideOptions.find((item) => vehicleTypeByOption[item.productName] === estimate.vehicleType) ?? null;
                  booking.selectRideOption(option);
                }}
              />
            ))}
          </div>

          <div className={styles.mobileBook}>
            <button type="button" className={styles.mobileBookBtn} onClick={handleBook}>
              Book {VEHICLE_TYPE_CONFIG[selectedVehicleType].label} · ${Number(selectedEstimate?.price ?? 0).toFixed(2)}
            </button>
          </div>

          <div className={styles.mobileFooter}>
            <div>
              <p className={styles.footerBrand}>RideConnect</p>
              <div className={styles.footerLinks}>
                <span>Help Center</span>
                <span>Contact Support</span>
              </div>
            </div>
            <div className={styles.footerCopy}>
              <p>© 2024 RideConnect.</p>
              <p>All Rights Reserved</p>
            </div>
          </div>
        </>
      ) : (
        <footer className={styles.footer}>
          <div className={styles.footerLeft}>
            <span className={styles.footerBrand}>RideConnect</span>
            <span className={styles.footerSep}>·</span>
            <a href="#" className={styles.footerLink}>
              Help Center
            </a>
            <span className={styles.footerSep}>·</span>
            <a href="#" className={styles.footerLink}>
              Contact Support
            </a>
          </div>
          <span className={styles.footerCopy}>© 2024 RideConnect. All Rights Reserved</span>
        </footer>
      )}
    </div>
  );
}
