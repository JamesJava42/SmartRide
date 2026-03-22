import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DriverCard } from "../components/DriverCard";
import { RideOptionCard } from "../components/RideOptionCard";
import { TrackingMap } from "../components/TrackingMap";
import { RouteInputCard } from "../components/booking/RouteInputCard";
import { VehicleSelectColumn } from "../components/booking/VehicleSelectColumn";
import { useBookingFlow } from "../hooks/useBookingFlow";
import { searchAddressSuggestions } from "../services/maps";
import type { RouteLocation, RideMode } from "../types/api";
import type { VehicleType } from "@shared/types/vehicle";

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

export function DashboardPage() {
  const navigate = useNavigate();
  const booking = useBookingFlow();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [addressEditorField, setAddressEditorField] = useState<AddressEditorField>(null);
  const [addressQuery, setAddressQuery] = useState("");
  const [addressResults, setAddressResults] = useState<RouteLocation[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showRideTypeMenu, setShowRideTypeMenu] = useState(false);
  const [showDepartureMenu, setShowDepartureMenu] = useState(false);
  const [showSeatsPicker, setShowSeatsPicker] = useState(false);
  const [seats, setSeats] = useState(1);
  const seatsPickerRef = useRef<HTMLDivElement | null>(null);

  const estimatedTotal = booking.selectedOption?.price ?? booking.fareEstimate?.breakdown.rider_total ?? null;
  const pickupAddress = booking.pickupPinnedLocation ?? booking.currentLocation ?? null;
  const dropoffAddress = booking.destinationPinnedLocation ?? null;
  const isSearchDisabled = !dropoffAddress || booking.routeLoading;

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
  }, [addressQuery, addressEditorField]);

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

  function handleAddressSelect(location: RouteLocation) {
    if (addressEditorField === "pickup") {
      booking.selectPickupSuggestion(location);
    } else if (addressEditorField === "dropoff") {
      booking.selectDestinationSuggestion(location);
    }
    closeAddressEditor();
  }

  async function handleConfirmRide() {
    await booking.requestRide();
    setIsPaymentOpen(false);
  }

  async function handleSearchSubmit() {
    await booking.searchRoute();
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      navigate("/search-results");
    }
  }

  const departureLabel = booking.scheduleMode === "Schedule" ? "Schedule" : "Leave now";
  const seatLabel = `${seats}`;
  const selectedRideType = rideTypeOptions.find((option) => option.value === booking.mode)?.label ?? "Ride";

  const routeSummary = useMemo(() => {
    if (!booking.routeData) {
      return null;
    }
    return `${(booking.routeData.distanceMeters / 1609.34).toFixed(1)} mi • ${Math.round(booking.routeData.durationSeconds / 60)} min`;
  }, [booking.routeData]);

  const selectedVehicleType = (booking.selectedOption ? vehicleTypeByOption[booking.selectedOption.productName] : null) ?? "ECONOMY";
  const vehicleEstimates = booking.rideOptions
    .map((option) => ({
      vehicleType: vehicleTypeByOption[option.productName],
      fare: Number(option.price),
      etaMinutes: option.etaMinutes,
      unavailable: option.unavailable,
    }))
    .filter((item) => Boolean(item.vehicleType));

  return (
    <div>
        <div className="w-full bg-white pb-0">
          <div className={`${booking.routeData ? "md:grid md:grid-cols-[360px_minmax(0,1fr)_340px]" : "md:grid md:grid-cols-[360px_minmax(0,1fr)]"} md:items-stretch md:gap-0`}>
          <section className={`${booking.routeData ? "md:order-2" : "md:order-2"}`}>
            <TrackingMap
              routeData={booking.routeData}
              fareValue={booking.selectedOption?.price ?? booking.fareEstimate?.breakdown.rider_total ?? null}
              currentLocation={booking.currentLocation ? [booking.currentLocation.latitude, booking.currentLocation.longitude] : null}
              draftPickup={booking.routeData ? null : booking.pickupPinnedLocation ? [booking.pickupPinnedLocation.latitude, booking.pickupPinnedLocation.longitude] : null}
              draftDestination={booking.routeData ? null : booking.destinationPinnedLocation ? [booking.destinationPinnedLocation.latitude, booking.destinationPinnedLocation.longitude] : null}
              onMapClick={(point) => {
                if (!booking.mapSelectionTarget) {
                  return;
                }
                void booking.setMapPoint(booking.mapSelectionTarget, point);
              }}
              hideOverlay
              edgeToEdge
              showLocateButton
            />
          </section>

          <section className="w-full bg-white px-[14px] pb-5 pt-4 md:order-1 md:border-r md:border-line md:px-6 md:py-6">
            <div className="space-y-3">
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
                        className={`flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-sm ${
                          booking.mode === option.value ? "bg-[#edf9f2] text-accent" : "text-ink hover:bg-[#fafaf8]"
                        }`}
                      >
                        <span>{option.label}</span>
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

              <div className="flex items-center justify-center gap-[5px] pt-0.5 text-center text-[11px] text-[#b8c4b3]">
                <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
                  <path d="M2 2H12M2 6H12M2 10H12" stroke="#B8C4B3" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>Drag either field to swap pickup and dropoff</span>
              </div>

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
                  {showDepartureMenu ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-[12px] border border-line bg-white p-1 shadow-[0_18px_40px_rgba(15,23,18,0.12)]">
                      {["Leave now", "Schedule"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            booking.setScheduleMode(option as "Leave now" | "Schedule");
                            booking.setMode(option === "Schedule" ? "reserve" : "ride");
                            setShowDepartureMenu(false);
                          }}
                          className={`flex w-full items-center rounded-[10px] px-3 py-2 text-sm ${
                            booking.scheduleMode === option ? "bg-[#edf9f2] text-accent" : "text-ink hover:bg-[#fafaf8]"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="relative" ref={seatsPickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowSeatsPicker((current) => !current)}
                    className="flex min-w-[132px] items-center gap-2 rounded-[12px] border border-line bg-white px-[12px] py-[11px] text-[14px] text-ink"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="5" r="2.3" stroke="#8A9B85" strokeWidth="1.3" />
                      <path d="M4.2 12.2C4.8 10.4 6.1 9.5 8 9.5C9.9 9.5 11.2 10.4 11.8 12.2" stroke="#8A9B85" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    <span className="text-[#5A6B56]">Seats:</span>
                    <span className="font-medium text-accent">{seatLabel}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M4 6L8 10L12 6" stroke="#8A9B85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
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

              {booking.scheduleMode === "Schedule" ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="date"
                    value={booking.scheduleDate}
                    onChange={(event) => booking.setScheduleDate(event.target.value)}
                    className="rounded-[12px] border border-line bg-white px-[14px] py-[11px] text-[14px] text-ink outline-none"
                  />
                  <input
                    type="time"
                    value={booking.scheduleTime}
                    onChange={(event) => booking.setScheduleTime(event.target.value)}
                    className="rounded-[12px] border border-line bg-white px-[14px] py-[11px] text-[14px] text-ink outline-none"
                  />
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => void handleSearchSubmit()}
                disabled={isSearchDisabled}
                className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-accent px-4 py-[14px] text-[16px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#A8E6C5]"
              >
                {booking.routeLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <span>Search</span>
                )}
              </button>
            </div>

            {booking.error ? <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{booking.error}</div> : null}
          </section>

          {booking.routeData ? (
            <section className="hidden bg-white md:order-3 md:block md:border-l md:border-line">
              <div className="flex h-full min-h-0 flex-col">
                <VehicleSelectColumn
                  estimates={vehicleEstimates}
                  selectedType={selectedVehicleType}
                  routeDistance={routeSummary?.split(" • ")[0] ?? "—"}
                  routeDuration={routeSummary?.split(" • ")[1] ?? "—"}
                  onSelect={(type) => {
                    const option = booking.rideOptions.find((item) => vehicleTypeByOption[item.productName] === type) ?? null;
                    booking.selectRideOption(option);
                  }}
                  onBook={() => setIsPaymentOpen(true)}
                />

                {booking.driver && ["driver_assigned", "driver_arriving", "ride_started", "ride_completed"].includes(booking.uiState) ? (
                  <div className="border-t border-line bg-white px-4 py-4">
                    <DriverCard
                      name={booking.driver.name}
                      rating={booking.driver.rating}
                      vehicle={booking.driver.vehicle}
                      color={booking.driver.color}
                      plate={booking.driver.plate}
                      eta={booking.uiState === "ride_started" ? "On trip" : `${booking.driver.etaMinutes} min`}
                    />
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
          </div>

          {booking.routeData ? (
            <section className="mt-4 bg-white px-[14px] pb-5 md:hidden">
              <div className="rounded-[28px] border border-line bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Route ready</p>
                  <p className="mt-1 text-sm text-muted">{routeSummary}</p>
                </div>
                <span className="rounded-full bg-[#edf6ef] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                  {booking.selectedOption ? "Ride selected" : "Choose a vehicle"}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {booking.rideOptions.map((option) => (
                  <RideOptionCard
                    key={option.id}
                    option={option}
                    selected={booking.selectedOption?.id === option.id}
                    onSelect={() => booking.selectRideOption(option)}
                  />
                ))}
              </div>

              {booking.selectedOption ? (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setIsPaymentOpen(true)}
                    disabled={booking.requestLoading || ["requesting", "matching", "driver_assigned", "driver_arriving", "ride_started", "ride_completed"].includes(booking.uiState)}
                    className="w-full rounded-[24px] bg-[#787a75] px-4 py-4 text-lg font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-[#b7b8b4]"
                  >
                    {booking.requestLoading
                      ? "Requesting..."
                      : ["driver_assigned", "driver_arriving", "ride_started", "ride_completed"].includes(booking.uiState)
                        ? "Driver Assigned"
                        : ["requesting", "matching"].includes(booking.uiState)
                          ? "Finding Driver"
                          : "Request Ride"}
                  </button>
                </div>
              ) : null}

              {booking.driver && ["driver_assigned", "driver_arriving", "ride_started", "ride_completed"].includes(booking.uiState) ? (
                <div className="mt-4">
                  <DriverCard
                    name={booking.driver.name}
                    rating={booking.driver.rating}
                    vehicle={booking.driver.vehicle}
                    color={booking.driver.color}
                    plate={booking.driver.plate}
                    eta={booking.uiState === "ride_started" ? "On trip" : `${booking.driver.etaMinutes} min`}
                  />
                </div>
              ) : null}
              </div>
            </section>
          ) : null}
        </div>

      {isPaymentOpen && booking.selectedOption ? (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,18,0.16)]">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-ink">Choose payment method</h2>
              <p className="text-sm text-muted">Confirm how you want to pay before sending the ride request.</p>
            </div>

            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  paymentMethod === "cash" ? "border-accent bg-[#edf6ef]" : "border-line bg-canvas"
                }`}
              >
                <div className="text-base font-semibold text-ink">Cash</div>
                <div className="mt-1 text-sm text-muted">Pay the driver in cash at the end of the ride.</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  paymentMethod === "card" ? "border-accent bg-[#edf6ef]" : "border-line bg-canvas"
                }`}
              >
                <div className="text-base font-semibold text-ink">Card</div>
                <div className="mt-1 text-sm text-muted">Card gateway integration will be connected with an open-source payment option later.</div>
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-line bg-canvas p-4">
              <div className="text-sm text-muted">Estimated amount</div>
              <div className="mt-1 text-2xl font-semibold text-ink">${estimatedTotal}</div>
              <p className="mt-2 text-sm text-muted">
                {paymentMethod === "cash"
                  ? "You will pay this estimated amount in cash. Final fare may change if the trip changes."
                  : "Your card will be charged through the future payment gateway once card payments are enabled."}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setIsPaymentOpen(false)} className="flex-1 rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-ink">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmRide()}
                disabled={booking.requestLoading}
                className="flex-1 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#b7cabc]"
              >
                {booking.requestLoading ? "Confirming..." : paymentMethod === "cash" ? "Confirm Cash Ride" : "Confirm Ride"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
