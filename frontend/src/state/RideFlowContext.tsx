import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import type { FareEstimate, RideOption, RideResponse, RideUiState, RouteData } from "../types/api";

interface DriverSnapshot {
  name: string;
  rating: string;
  vehicle: string;
  color: string;
  plate: string;
  etaMinutes: number;
}

interface RideFlowContextValue {
  uiState: RideUiState;
  routeData: RouteData | null;
  fareEstimate: FareEstimate | null;
  ride: RideResponse | null;
  rideOptions: RideOption[];
  selectedOption: RideOption | null;
  driver: DriverSnapshot | null;
  setRouteContext: (route: RouteData, estimate: FareEstimate, options: RideOption[]) => void;
  selectRideOption: (option: RideOption | null) => void;
  setUiState: (state: RideUiState) => void;
  setRequestedRide: (ride: RideResponse | null) => void;
  setDriver: (driver: DriverSnapshot | null) => void;
  reset: () => void;
}

const STORAGE_KEY = "rideconnect_ride_flow";

const RideFlowContext = createContext<RideFlowContextValue | null>(null);

export function RideFlowProvider({ children }: { children: ReactNode }) {
  const [uiState, setUiState] = useState<RideUiState>("idle");
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [fareEstimate, setFareEstimate] = useState<FareEstimate | null>(null);
  const [ride, setRide] = useState<RideResponse | null>(null);
  const [rideOptions, setRideOptions] = useState<RideOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<RideOption | null>(null);
  const [driver, setDriver] = useState<DriverSnapshot | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Omit<RideFlowContextValue, "setRouteContext" | "selectRideOption" | "setUiState" | "setRequestedRide" | "setDriver" | "reset">;
      setUiState(parsed.uiState);
      setRouteData(parsed.routeData);
      setFareEstimate(parsed.fareEstimate);
      setRide(parsed.ride);
      setRideOptions(parsed.rideOptions);
      setSelectedOption(parsed.selectedOption);
      setDriver(parsed.driver);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        uiState,
        routeData,
        fareEstimate,
        ride,
        rideOptions,
        selectedOption,
        driver,
      }),
    );
  }, [driver, fareEstimate, ride, rideOptions, routeData, selectedOption, uiState]);

  function setRouteContext(route: RouteData, estimate: FareEstimate, options: RideOption[]) {
    setRouteData(route);
    setFareEstimate(estimate);
    setRideOptions(options);
    setSelectedOption(null);
    setRide(null);
    setDriver(null);
    setUiState("estimate_ready");
  }

  function reset() {
    setUiState("idle");
    setRouteData(null);
    setFareEstimate(null);
    setRide(null);
    setRideOptions([]);
    setSelectedOption(null);
    setDriver(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <RideFlowContext.Provider
      value={{
        uiState,
        routeData,
        fareEstimate,
        ride,
        rideOptions,
        selectedOption,
        driver,
        setRouteContext,
        selectRideOption: setSelectedOption,
        setUiState,
        setRequestedRide: setRide,
        setDriver,
        reset,
      }}
    >
      {children}
    </RideFlowContext.Provider>
  );
}

export function useRideFlow() {
  const context = useContext(RideFlowContext);
  if (!context) {
    throw new Error("useRideFlow must be used inside RideFlowProvider");
  }
  return context;
}
