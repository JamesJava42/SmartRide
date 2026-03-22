import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { LoginForm } from "../components/auth/LoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";
import { useRiderSession } from "../hooks/useRiderSession";
import styles from "./LoginPage.module.css";

type LoginPageProps = {
  initialFace?: "login" | "register";
};

export function LoginPage({ initialFace = "login" }: LoginPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useRiderSession();
  const [isFlipped, setIsFlipped] = useState(initialFace === "register" || location.pathname === "/register");
  const [tagline, setTagline] = useState(
    initialFace === "register" || location.pathname === "/register"
      ? "Join the community"
      : "Your community ride network",
  );

  useEffect(() => {
    if (auth.isSignedIn) {
      navigate("/", { replace: true });
    }
  }, [auth.isSignedIn, navigate]);

  useEffect(() => {
    const shouldFlip = location.pathname === "/register";
    setIsFlipped(shouldFlip);
    setTagline(shouldFlip ? "Join the community" : "Your community ride network");
  }, [location.pathname]);

  function handleFlipToRegister() {
    setIsFlipped(true);
    setTagline("Join the community");
    navigate("/register", { replace: true });
  }

  function handleFlipToLogin() {
    setIsFlipped(false);
    setTagline("Your community ride network");
    navigate("/login", { replace: true });
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.logo}>RideConnect</span>
          <span className={styles.tagline}>{tagline}</span>
        </div>

        <div className={styles.cardWrap}>
          <div className={styles.scene}>
            <div className={`${styles.flipCard} ${isFlipped ? styles.flipped : ""}`}>
              <div className={`${styles.face} ${styles.front}`}>
                <LoginForm onSwitchToRegister={handleFlipToRegister} />
              </div>

              <div className={`${styles.face} ${styles.back}`}>
                <RegisterForm onSwitchToLogin={handleFlipToLogin} onSuccess={handleFlipToLogin} />
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              {isFlipped
                ? "By signing up you agree to our Terms of Service & Privacy Policy"
                : "By continuing you agree to our Terms of Service"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
