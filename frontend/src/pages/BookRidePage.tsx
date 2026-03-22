import { useState } from "react";

import { RideTypeDropdown } from "../components/RideTypeDropdown";
import { RouteInput } from "../components/RouteInput";
import { ScheduleSelector } from "../components/ScheduleSelector";
import { RideOptionCard } from "../components/RideOptionCard";
import { DriverCard } from "../components/DriverCard";
import { TrackingMap } from "../components/TrackingMap";
import { PageContainer } from "../components/PageContainer";
import { useBookingFlow } from "../hooks/useBookingFlow";

export function BookRidePage() {
  const booking = useBookingFlow();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");

  const statusCopy = {
    idle: "Enter your route to get started.",
    estimate_ready: "Choose the ride type that fits your trip.",
    ride_selected: "Review the fare and request your ride.",
    requesting: "Requesting your ride...",
    matching: "Finding a nearby driver...",
    driver_assigned: "Your driver is assigned.",
    driver_arriving: "Driver is on the way.",
    ride_started: "Trip in progress.",
    ride_completed: "Trip complete.",
    route_ready: "Route ready.",
  }[booking.uiState];

  const estimatedTotal = booking.selectedOption?.price ?? booking.fareEstimate?.breakdown.rider_total ?? null;

  async function handleConfirmRide() {
    await booking.requestRide();
    setIsPaymentOpen(false);
  }

  return (
    <div>
      <PageContainer>
        <div className="grid gap-0 xl:min-h-[calc(100vh-10rem)] xl:grid-cols-[320px_320px_minmax(0,1fr)]">
          <aside className="order-2 border-b border-line p-5 xl:order-1 xl:border-b-0 xl:border-r">
            <div className="space-y-4">
              <RideTypeDropdown value={booking.mode} onChange={booking.setMode} />
              <RouteInput
                placeholder="From"
                icon="pickup"
                value={booking.pickupLocation}
                onChange={booking.setPickupLocation}
                onFocus={() => booking.setMapSelectionTarget("pickup")}
                suggestions={booking.savedPlaces.map((item) => item.address)}
              />
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const nextPickup = booking.destinationLocation;
                    booking.setDestinationLocation(booking.pickupLocation);
                    booking.setPickupLocation(nextPickup);
                  }}
                  className="flex h-10 w-10 items-center justify-center bg-transparent text-xl font-semibold text-[#6e7f86]"
                  aria-label="Swap route"
                >
                  ⇅
                </button>
              </div>
              <RouteInput
                placeholder="To"
                icon="destination"
                value={booking.destinationLocation}
                onChange={booking.setDestinationLocation}
                onFocus={() => booking.setMapSelectionTarget("destination")}
                suggestions={booking.savedPlaces.map((item) => item.address)}
                trailingAction={{
                  label: "Add stop",
                  onClick: () => undefined,
                }}
              />

              <ScheduleSelector
                value={booking.scheduleMode}
                date={booking.scheduleDate}
                time={booking.scheduleTime}
                onChange={booking.setScheduleMode}
                onDateChange={booking.setScheduleDate}
                onTimeChange={booking.setScheduleTime}
              />

              <button
                type="button"
                onClick={() => void booking.searchRoute()}
                disabled={Boolean(booking.routeData) || booking.routeLoading}
                className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#b7cabc] disabled:text-white/80"
              >
                {booking.routeLoading ? "Searching..." : booking.routeData ? "Search Locked" : "Search"}
              </button>
            </div>
          </aside>

          {booking.routeData ? (
            <section className="order-3 border-b border-line p-5 xl:order-2 xl:border-b-0 xl:border-r">
              <div className="flex items-center justify-end">
                <span className="rounded-full bg-[#edf6ef] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                  {booking.routeData ? "Route ready" : "Idle"}
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
            </section>
          ) : null}

          <section className={`order-1 p-4 xl:order-3 ${booking.routeData ? "" : "xl:col-span-2"}`}>
            <TrackingMap
              routeData={booking.routeData}
              fareValue={booking.selectedOption?.price ?? booking.fareEstimate?.breakdown.rider_total ?? null}
              currentLocation={booking.currentLocation ? [booking.currentLocation.latitude, booking.currentLocation.longitude] : null}
              draftPickup={booking.routeData ? null : booking.pickupPinnedLocation ? [booking.pickupPinnedLocation.latitude, booking.pickupPinnedLocation.longitude] : null}
              draftDestination={
                booking.routeData ? null : booking.destinationPinnedLocation ? [booking.destinationPinnedLocation.latitude, booking.destinationPinnedLocation.longitude] : null
              }
              onMapClick={(point) => {
                if (!booking.mapSelectionTarget) {
                  return;
                }
                void booking.setMapPoint(booking.mapSelectionTarget, point);
              }}
              hideOverlay
            />
          </section>
        </div>
      </PageContainer>

      {booking.error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{booking.error}</div> : null}

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
              <button
                type="button"
                onClick={() => setIsPaymentOpen(false)}
                className="flex-1 rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-ink"
              >
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
