import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate } from "react-router-dom";
import { VEHICLE_TYPE_CONFIG } from "@shared/components/vehicle";

import { LoadingButton } from "../components/common/LoadingButton";
import { MobileNav } from "../components/common/MobileNav";
import { useRideContext } from "../context/RideContext";
import { useToast } from "../components/common/Toast";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { getRiderPaymentSettings } from "../api/riderProfile";
import { requestRide } from "../api/rides";
import styles from "./RideSummaryPage.module.css";

function paymentLabel(method: string | null) {
  if (method === "CARD") return "Card";
  if (method === "DIGITAL_WALLET") return "Digital Wallet";
  return "Cash";
}

export function RideSummaryPage() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const ride = useRideContext();
  const toast = useToast();
  const vehicleType = ride.selectedVehicleType ?? "ECONOMY";
  const fare = ride.selectedFare ?? 0;
  const paymentSettingsQuery = useQuery({
    queryKey: ["rider-payment-settings"],
    queryFn: getRiderPaymentSettings,
  });
  const effectivePaymentMethod =
    (ride.paymentMethod ?? paymentSettingsQuery.data?.defaultPaymentMethod?.toUpperCase()?.replace(/\s+/g, "_") ?? "CASH");

  if (!isMobile) {
    return <Navigate replace to="/" />;
  }

  if (!ride.pickup || !ride.dropoff || !ride.fareEstimateData) {
    return <Navigate replace to="/" />;
  }

  const mutation = useMutation({
    mutationFn: () =>
      requestRide({
        pickup_latitude: ride.pickup?.latitude ?? 0,
        pickup_longitude: ride.pickup?.longitude ?? 0,
        pickup_address: ride.pickup?.display_name ?? "",
        dropoff_latitude: ride.dropoff?.latitude ?? 0,
        dropoff_longitude: ride.dropoff?.longitude ?? 0,
        dropoff_address: ride.dropoff?.display_name ?? "",
        vehicle_type: vehicleType,
        payment_method: effectivePaymentMethod,
        seats: ride.seats,
      }),
    onSuccess: (response) => {
      ride.setActiveRideId(response.ride_id);
      navigate(`/ride/tracking/${response.ride_id}`);
    },
    onError: () => toast.showError("Failed to book ride. Please try again."),
  });

  return (
    <div className={styles.page}>
      <MobileNav />
      <div className={styles.content}>
        <div className={styles.headerIcon}>✓</div>
        <h1 className={styles.title}>Ride summary</h1>
        <p className={styles.subtitle}>Confirm your booking details</p>
        <div className={styles.card}>
          <div className={styles.row}><span>From</span><strong>{ride.pickup?.display_name ?? "—"}</strong></div>
          <div className={styles.row}><span>To</span><strong>{ride.dropoff?.display_name ?? "—"}</strong></div>
          <div className={styles.row}><span>Vehicle</span><strong>{VEHICLE_TYPE_CONFIG[vehicleType].label} · {VEHICLE_TYPE_CONFIG[vehicleType].examples}</strong></div>
          <div className={styles.row}><span>Distance</span><strong>{(ride.fareEstimateData?.route_distance_km ?? 0).toFixed(1)} mi · ~{Math.round(ride.fareEstimateData?.route_duration_min ?? 0)} min</strong></div>
          <div className={styles.row}><span>Payment</span><strong>{paymentLabel(effectivePaymentMethod)}</strong></div>
          <div className={styles.row}><span>Fare</span><strong className={styles.fare}>${fare.toFixed(2)}</strong></div>
        </div>
        <div className={styles.note}>A driver will be assigned after you confirm</div>
        <LoadingButton loading={mutation.isPending} loadingLabel="Confirming..." className={styles.confirm} onClick={() => mutation.mutate()}>
          Confirm ride
        </LoadingButton>
        <button type="button" className={styles.cancel} onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </div>
  );
}
