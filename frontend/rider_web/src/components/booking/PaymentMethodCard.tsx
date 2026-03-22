import type { KeyboardEvent } from "react";

import type { PaymentMethod } from "../../types/ride";
import styles from "./PaymentMethodCard.module.css";

const methodMeta: Record<PaymentMethod, { title: string; subtitle: string; accent: string }> = {
  CASH: { title: "Cash", subtitle: "Pay driver directly", accent: "#EDF9F2" },
  CARD: { title: "Card", subtitle: "Credit or debit card", accent: "#EFF6FF" },
  DIGITAL_WALLET: { title: "Digital Wallet", subtitle: "Apple Pay, Google Pay", accent: "#F5F3FF" },
};

export function PaymentMethodCard({
  method,
  selected,
  onSelect,
  onKeyDown,
  tabIndex,
  buttonRef,
}: {
  method: PaymentMethod;
  selected: boolean;
  onSelect: (method: PaymentMethod) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  tabIndex?: number;
  buttonRef?: (element: HTMLButtonElement | null) => void;
}) {
  const meta = methodMeta[method];
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={tabIndex}
      ref={buttonRef}
      className={`${styles.card} ${selected ? styles.selected : ""}`}
      onClick={() => onSelect(method)}
      onKeyDown={onKeyDown}
    >
      <span className={styles.icon} style={{ background: meta.accent }} />
      <span className={styles.content}>
        <span className={styles.title}>{meta.title}</span>
        <span className={styles.subtitle}>{meta.subtitle}</span>
      </span>
      <span className={`${styles.radio} ${selected ? styles.radioSelected : ""}`} />
    </button>
  );
}
