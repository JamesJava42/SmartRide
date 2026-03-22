import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DriverLoginForm } from "../../components/auth/DriverLoginForm";
import { DriverRegisterForm } from "../../components/auth/DriverRegisterForm";
import styles from "./DriverAuthPage.module.css";

type DriverAuthPageProps = {
  initialFace: "login" | "register";
};

export default function DriverAuthPage({ initialFace }: DriverAuthPageProps) {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(initialFace === "register");
  const tagline = useMemo(
    () => (isFlipped ? "Join as a driver partner" : "Driver Partner App"),
    [isFlipped],
  );
  const supportTitle = isFlipped ? "Welcome back" : "New here?";
  const supportSubtitle = isFlipped
    ? "Sign in to your driver account and continue once your profile is approved."
    : "Create your driver account to begin onboarding with RideConnect.";
  const supportCta = isFlipped ? "Sign in" : "Create account";

  useEffect(() => {
    setIsFlipped(initialFace === "register");
  }, [initialFace]);

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logo}>RideConnect</div>
          <div className={styles.tagline}>{tagline}</div>
        </div>

        <div className={styles.cardWrap} dir="ltr">
          <div className={styles.authGrid}>
            <section className={styles.formPanel}>
              {isFlipped ? (
                <DriverRegisterForm
                  onSwitchToLogin={() => setIsFlipped(false)}
                  onSuccess={() => navigate("/driver/login")}
                />
              ) : (
                <DriverLoginForm onSwitchToRegister={() => setIsFlipped(true)} />
              )}
            </section>

            <aside className={styles.supportPanel}>
              <div className={styles.supportInner}>
                <p className={styles.supportEyebrow}>RideConnect Drivers</p>
                <h2 className={styles.supportTitle}>{supportTitle}</h2>
                <p className={styles.supportSubtitle}>{supportSubtitle}</p>
                <button
                  type="button"
                  className={styles.supportCta}
                  onClick={() => setIsFlipped((current) => !current)}
                >
                  {supportCta}
                </button>
              </div>
            </aside>
          </div>

          <div className={styles.footer}>
            {isFlipped
              ? "By signing up you agree to our Terms of Service & Privacy Policy"
              : "By continuing you agree to our Terms of Service"}
          </div>
        </div>
      </section>
    </main>
  );
}
