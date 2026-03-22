import { useNavigate } from "react-router-dom";

import styles from "./DriverWelcomePage.module.css";

const steps = [
  "Create your account",
  "Verify your identity",
  "Upload your documents",
  "Start earning with RideConnect",
];

function SteeringIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#1A6B45" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="#1A6B45" strokeWidth="1.8" />
      <path
        d="M12 2v7M5.6 5.6l4.95 4.95M2 12h7M5.6 18.4l4.95-4.95M12 22v-7M18.4 18.4l-4.95-4.95M22 12h-7M18.4 5.6l-4.95 4.95"
        stroke="#1A6B45"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DriverWelcomePage() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <SteeringIcon />
          </div>
          <h1 className={styles.title}>Become a driver</h1>
          <p className={styles.subtitle}>Earn on your schedule. Drive when you want.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.stepsCard}>
            <div className={styles.stepsGrid}>
              {steps.map((step, index) => (
                <div key={step} className={styles.stepRow}>
                  <span className={styles.stepCircle}>{index + 1}</span>
                  <span className={styles.stepLabel}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <button type="button" className={styles.primaryButton} onClick={() => navigate("/driver/register")}>
            Create account
          </button>
          <button type="button" className={styles.secondaryButton} onClick={() => navigate("/driver/login")}>
            Sign in
          </button>
          <p className={styles.terms}>By continuing you agree to our Terms of Service</p>
        </div>
      </section>
    </main>
  );
}
