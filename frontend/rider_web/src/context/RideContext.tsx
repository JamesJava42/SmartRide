import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { AddressResult, FareEstimateResponse, PaymentMethod, VehicleType } from "../types/ride";

interface RideContextValue {
  pickup: AddressResult | null;
  dropoff: AddressResult | null;
  seats: number;
  selectedVehicleType: VehicleType | null;
  selectedFare: number | null;
  paymentMethod: PaymentMethod | null;
  activeRideId: string | null;
  fareEstimateData: FareEstimateResponse | null;
  setPickup: (a: AddressResult | null) => void;
  setDropoff: (a: AddressResult | null) => void;
  setSeats: (n: number) => void;
  setSelectedVehicleType: (t: VehicleType | null) => void;
  setSelectedFare: (f: number | null) => void;
  setPaymentMethod: (m: PaymentMethod | null) => void;
  setActiveRideId: (id: string | null) => void;
  setFareEstimateData: (d: FareEstimateResponse | null) => void;
  clearRide: () => void;
}

const ACTIVE_RIDE_KEY = "rc_active_ride_id";
const RideContext = createContext<RideContextValue | null>(null);

export function RideProvider({ children }: { children: ReactNode }) {
  const [pickup, setPickup] = useState<AddressResult | null>(null);
  const [dropoff, setDropoff] = useState<AddressResult | null>(null);
  const [seats, setSeats] = useState(1);
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | null>(null);
  const [selectedFare, setSelectedFare] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [activeRideId, setActiveRideIdState] = useState<string | null>(null);
  const [fareEstimateData, setFareEstimateData] = useState<FareEstimateResponse | null>(null);

  useEffect(() => {
    const storedRideId = window.localStorage.getItem(ACTIVE_RIDE_KEY);
    if (storedRideId) {
      setActiveRideIdState(storedRideId);
    }
  }, []);

  function setActiveRideId(id: string | null) {
    setActiveRideIdState(id);
    if (id) {
      window.localStorage.setItem(ACTIVE_RIDE_KEY, id);
    } else {
      window.localStorage.removeItem(ACTIVE_RIDE_KEY);
    }
  }

  function clearRide() {
    setPickup(null);
    setDropoff(null);
    setSeats(1);
    setSelectedVehicleType(null);
    setSelectedFare(null);
    setPaymentMethod(null);
    setActiveRideId(null);
    setFareEstimateData(null);
  }

  const value = useMemo(
    () => ({
      pickup,
      dropoff,
      seats,
      selectedVehicleType,
      selectedFare,
      paymentMethod,
      activeRideId,
      fareEstimateData,
      setPickup,
      setDropoff,
      setSeats,
      setSelectedVehicleType,
      setSelectedFare,
      setPaymentMethod,
      setActiveRideId,
      setFareEstimateData,
      clearRide,
    }),
    [pickup, dropoff, seats, selectedVehicleType, selectedFare, paymentMethod, activeRideId, fareEstimateData],
  );

  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
}

export function useRideContext() {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error("useRideContext must be used within RideProvider");
  }
  return context;
}
