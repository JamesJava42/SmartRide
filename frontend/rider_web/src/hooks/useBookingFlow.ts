import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { useRideFlow } from "../state/RideFlowContext";
import { ridesApi } from "../api";
import { fetchRoute, reverseGeocodeLocation, searchAddressSuggestions } from "../services/maps";
import type { CurrentLocation, RideMode, RideOption, RouteLocation } from "../types/api";

const SAVED_PLACES = [
  { label: "Home", address: "Long Beach, CA" },
  { label: "Work", address: "Downtown LA" },
  { label: "LAX", address: "Los Angeles International Airport" },
  { label: "Downtown LA", address: "Downtown LA" },
];

function buildRideOptions(total: string): RideOption[] {
  const base = Number(total);
  return [
    {
      id: "economy",
      productName: "Economy",
      descriptor: "Affordable rides for everyday trips",
      etaMinutes: 4,
      price: base.toFixed(2),
      capacity: 4,
      luggage: "2 bags",
    },
    {
      id: "comfort",
      productName: "Comfort",
      descriptor: "Newer cars with extra legroom",
      etaMinutes: 6,
      price: (base + 8.4).toFixed(2),
      capacity: 4,
      luggage: "3 bags",
    },
    {
      id: "premium",
      productName: "Premium",
      descriptor: "Luxury vehicles for elevated travel",
      etaMinutes: 10,
      price: (base + 15.8).toFixed(2),
      capacity: 4,
      luggage: "3 bags",
    },
    {
      id: "xl",
      productName: "XL",
      descriptor: "More room for larger groups",
      etaMinutes: 9,
      price: (base + 21.25).toFixed(2),
      capacity: 6,
      luggage: "4 bags",
    },
  ];
}

export function useBookingFlow() {
  const flow = useRideFlow();
  const [mode, setMode] = useState<RideMode>("ride");
  const [pickupLocation, setPickupLocation] = useState(flow.routeData?.pickup.label ?? "Current Location");
  const [destinationLocation, setDestinationLocation] = useState(flow.routeData?.destination.label ?? "Los Angeles International Airport");
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(
    flow.routeData
      ? {
          label: flow.routeData.pickup.label,
          latitude: flow.routeData.pickup.latitude,
          longitude: flow.routeData.pickup.longitude,
        }
      : null,
  );
  const [pickupUsesCurrentLocation, setPickupUsesCurrentLocation] = useState(flow.routeData ? false : true);
  const [pickupPinnedLocation, setPickupPinnedLocation] = useState<CurrentLocation | null>(
    flow.routeData
      ? {
          label: flow.routeData.pickup.label,
          latitude: flow.routeData.pickup.latitude,
          longitude: flow.routeData.pickup.longitude,
        }
      : null,
  );
  const [destinationPinnedLocation, setDestinationPinnedLocation] = useState<CurrentLocation | null>(
    flow.routeData
      ? {
          label: flow.routeData.destination.label,
          latitude: flow.routeData.destination.latitude,
          longitude: flow.routeData.destination.longitude,
        }
      : null,
  );
  const [mapSelectionTarget, setMapSelectionTarget] = useState<"pickup" | "destination" | null>(null);
  const [scheduleMode, setScheduleMode] = useState<"Leave now" | "Schedule">("Leave now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pickupSuggestions, setPickupSuggestions] = useState<RouteLocation[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<RouteLocation[]>([]);
  const pickupUsesCurrentLocationRef = useRef(pickupUsesCurrentLocation);

  useEffect(() => {
    pickupUsesCurrentLocationRef.current = pickupUsesCurrentLocation;
  }, [pickupUsesCurrentLocation]);

  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const nextLocation = {
          label: "Current Location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setCurrentLocation(nextLocation);

        void reverseGeocodeLocation(position.coords.latitude, position.coords.longitude)
          .then((resolved) => {
            setCurrentLocation(resolved);
            if (pickupUsesCurrentLocationRef.current) {
              setPickupLocation(resolved.label);
            }
          })
          .catch(() => {
            if (pickupUsesCurrentLocationRef.current) {
              setPickupLocation("Current Location");
            }
          });
      },
      () => undefined,
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 10000,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (pickupUsesCurrentLocation) {
      setPickupSuggestions([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void searchAddressSuggestions(pickupLocation)
        .then(setPickupSuggestions)
        .catch(() => setPickupSuggestions([]));
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [pickupLocation, pickupUsesCurrentLocation]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void searchAddressSuggestions(destinationLocation)
        .then(setDestinationSuggestions)
        .catch(() => setDestinationSuggestions([]));
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [destinationLocation]);

  const searchMutation = useMutation({
    mutationFn: async () => {
      if (pickupUsesCurrentLocation && !currentLocation) {
        throw new Error("Current location is not available yet. Please allow location access or enter a pickup address.");
      }

      const route = await fetchRoute({
        pickupQuery: pickupLocation,
        destinationQuery: destinationLocation,
        pickupCurrentLocation: pickupUsesCurrentLocation ? currentLocation : null,
        pickupPinnedLocation: pickupUsesCurrentLocation ? null : pickupPinnedLocation,
        destinationPinnedLocation,
      });
      const estimate = await ridesApi.getFareEstimates({
        pickup_lat: route.pickup.latitude,
        pickup_lng: route.pickup.longitude,
        pickup_address: route.pickup.label,
        dropoff_lat: route.destination.latitude,
        dropoff_lng: route.destination.longitude,
        dropoff_address: route.destination.label,
        seats: 1,
      }) as any;
      return { route, estimate };
    },
    onSuccess: ({ route, estimate }) => {
      flow.setRouteContext(route, estimate, buildRideOptions(estimate.breakdown.rider_total));
      window.localStorage.setItem("rideconnect_last_route", JSON.stringify({ rideId: null, route }));
      setError(null);
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to calculate route.");
    },
  });

  const requestMutation = useMutation({
    mutationFn: async () => {
      if (!flow.fareEstimate) {
        throw new Error("Search for a route first.");
      }
      if (!flow.selectedOption) {
        throw new Error("Choose a ride option first.");
      }
      if (!flow.routeData) {
        throw new Error("Route details are missing.");
      }
      flow.setUiState("requesting");
      return ridesApi.requestRide({
        pickup_address: flow.routeData.pickup.label,
        pickup_latitude: flow.routeData.pickup.latitude,
        pickup_longitude: flow.routeData.pickup.longitude,
        dropoff_address: flow.routeData.destination.label,
        dropoff_latitude: flow.routeData.destination.latitude,
        dropoff_longitude: flow.routeData.destination.longitude,
        vehicle_type: flow.selectedOption.productName.toUpperCase() as any,
        payment_method: "CASH",
        seats: 1,
      }) as any;
    },
    onSuccess: (ride) => {
      flow.setRequestedRide(ride);
      flow.setDriver(null);
      flow.setUiState(ride.driver_id ? "driver_assigned" : "matching");
      setError(null);
      window.localStorage.setItem("rideconnect_last_ride_id", ride.ride_id);
      if (flow.routeData) {
        window.localStorage.setItem("rideconnect_last_route", JSON.stringify({ rideId: ride.ride_id, route: flow.routeData }));
      }
    },
    onError: (mutationError) => {
      flow.setUiState("ride_selected");
      setError(mutationError instanceof Error ? mutationError.message : "Unable to request ride.");
    },
  });

  return {
    ...flow,
    mode,
    pickupLocation,
    destinationLocation,
    scheduleMode,
    scheduleDate,
    scheduleTime,
    savedPlaces: SAVED_PLACES,
    pickupSuggestions,
    destinationSuggestions,
    error,
    pickupPinnedLocation,
    destinationPinnedLocation,
    mapSelectionTarget,
    routeLoading: searchMutation.isPending,
    requestLoading: requestMutation.isPending,
    setMode,
    setPickupLocation: (value: string) => {
      setPickupLocation(value);
      setPickupUsesCurrentLocation(value.trim().toLowerCase() === "current location");
      if (value.trim().toLowerCase() !== "current location") {
        setPickupPinnedLocation(null);
      }
    },
    setDestinationLocation: (value: string) => {
      setDestinationLocation(value);
      setDestinationPinnedLocation(null);
    },
    setPickupFromLocation: (location: CurrentLocation | null) => {
      setPickupPinnedLocation(location);
      setPickupUsesCurrentLocation(false);
      setPickupLocation(location?.label ?? "");
      setPickupSuggestions([]);
    },
    setDestinationFromLocation: (location: CurrentLocation | null) => {
      setDestinationPinnedLocation(location);
      setDestinationLocation(location?.label ?? "");
      setDestinationSuggestions([]);
    },
    selectPickupSuggestion: (suggestion: RouteLocation) => {
      setPickupUsesCurrentLocation(false);
      setPickupPinnedLocation(suggestion);
      setPickupLocation(suggestion.label);
      setPickupSuggestions([]);
    },
    selectDestinationSuggestion: (suggestion: RouteLocation) => {
      setDestinationPinnedLocation(suggestion);
      setDestinationLocation(suggestion.label);
      setDestinationSuggestions([]);
    },
    setScheduleMode,
    setScheduleDate,
    setScheduleTime,
    currentLocation,
    setMapSelectionTarget,
    setMapPoint: async (target: "pickup" | "destination", point: [number, number]) => {
      const fallbackLabel = `${point[0].toFixed(5)}, ${point[1].toFixed(5)}`;
      let label = fallbackLabel;

      try {
        const resolved = await reverseGeocodeLocation(point[0], point[1]);
        label = resolved.label;
      } catch {
        label = fallbackLabel;
      }

      const nextLocation = {
        label,
        latitude: point[0],
        longitude: point[1],
      };

      if (target === "pickup") {
        setPickupPinnedLocation(nextLocation);
        setPickupUsesCurrentLocation(false);
        setPickupLocation(nextLocation.label);
      } else {
        setDestinationPinnedLocation(nextLocation);
        setDestinationLocation(nextLocation.label);
      }

      setMapSelectionTarget(null);
    },
    selectRideOption: (option: RideOption | null) => {
      flow.selectRideOption(option);
      flow.setUiState(option ? "ride_selected" : "estimate_ready");
    },
    swapRouteFields: () => {
      const nextPickupLabel = destinationLocation;
      const nextDestinationLabel = pickupLocation;
      const nextPickupPinned = destinationPinnedLocation;
      const nextDestinationPinned = pickupUsesCurrentLocation ? currentLocation : pickupPinnedLocation;
      const nextPickupUsesCurrent = false;

      setPickupLocation(nextPickupLabel);
      setDestinationLocation(nextDestinationLabel);
      setPickupPinnedLocation(nextPickupPinned);
      setDestinationPinnedLocation(nextDestinationPinned);
      setPickupUsesCurrentLocation(nextPickupUsesCurrent);
      setPickupSuggestions([]);
      setDestinationSuggestions([]);
    },
    searchRoute: () => searchMutation.mutateAsync(),
    requestRide: () => requestMutation.mutateAsync(),
    resetFlow: flow.reset,
  };
}
