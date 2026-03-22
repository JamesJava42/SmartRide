import { useEffect, useState } from "react";
import styles from "./OfferCountdown.module.css";

type OfferCountdownProps = {
  expiresAt: string;
  onExpired?: () => void;
};

export function OfferCountdown({ expiresAt, onExpired }: OfferCountdownProps) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)),
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      const next = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) {
        window.clearInterval(interval);
        onExpired?.();
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [expiresAt, onExpired]);

  return (
    <div className={`${styles.circle} ${remaining <= 5 ? styles.urgent : ""}`}>
      <span className={styles.seconds}>{remaining}</span>
    </div>
  );
}
