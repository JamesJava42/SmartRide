import { useQuery } from "@tanstack/react-query";
import type { KeyboardEvent } from "react";
import { useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { PaymentMethodCard } from "../components/booking/PaymentMethodCard";
import { LoadingButton } from "../components/common/LoadingButton";
import { MobileNav } from "../components/common/MobileNav";
import { useRideContext } from "../context/RideContext";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { getRiderPaymentSettings } from "../api/riderProfile";
import type { PaymentMethod } from "../types/ride";
import styles from "./PaymentPage.module.css";

function shortName(value?: string | null) {
  return value?.split(",")[0]?.trim() || "Location";
}

export function PaymentPage() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const ride = useRideContext();
  const fare = ride.selectedFare ?? 0;
  const paymentSettingsQuery = useQuery({
    queryKey: ["rider-payment-settings"],
    queryFn: getRiderPaymentSettings,
  });
  const paymentMethod = (ride.paymentMethod ?? paymentSettingsQuery.data?.defaultPaymentMethod?.toUpperCase()?.replace(/\s+/g, "_") ?? "CASH") as PaymentMethod;
  const methodRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const methods = ["CASH", "CARD", "DIGITAL_WALLET"] as PaymentMethod[];

  function handleMethodKeyDown(index: number, event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (index + 1) % methods.length;
      ride.setPaymentMethod(methods[nextIndex]);
      methodRefs.current[nextIndex]?.focus();
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = (index - 1 + methods.length) % methods.length;
      ride.setPaymentMethod(methods[nextIndex]);
      methodRefs.current[nextIndex]?.focus();
    }
  }

  if (!isMobile) {
    return <Navigate replace to="/" />;
  }

  if (!ride.pickup || !ride.dropoff || !ride.selectedVehicleType || ride.selectedFare == null) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className={styles.page}>
      <MobileNav />
      <div className={styles.content}>
        <button type="button" className={styles.back} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div>
          <h1 className={styles.title}>Payment method</h1>
          <p className={styles.subtitle}>How would you like to pay?</p>
        </div>
        <div className={styles.tripPill}>
          <span>{shortName(ride.pickup.display_name)} → {shortName(ride.dropoff.display_name)}</span>
          <strong>${fare.toFixed(2)}</strong>
        </div>
        <div className={styles.sectionLabel}>Choose payment</div>
        <div className={styles.methods} role="radiogroup" aria-label="Payment method">
          {methods.map((method, index) => (
            <PaymentMethodCard
              key={method}
              method={method}
              selected={paymentMethod === method}
              onSelect={(next) => ride.setPaymentMethod(next)}
              onKeyDown={(event) => handleMethodKeyDown(index, event)}
              tabIndex={paymentMethod === method ? 0 : -1}
              buttonRef={(element) => {
                methodRefs.current[index] = element;
              }}
            />
          ))}
        </div>
        <LoadingButton
          className={styles.confirm}
          onClick={() => {
            ride.setPaymentMethod(paymentMethod);
            navigate("/ride/summary");
          }}
        >
          Confirm payment method
        </LoadingButton>
      </div>
    </div>
  );
}
