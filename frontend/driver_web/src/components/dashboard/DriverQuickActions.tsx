import { useNavigate } from "react-router-dom";
import styles from "./DriverQuickActions.module.css";

export function DriverQuickActions() {
  const navigate = useNavigate();

  return (
    <div className={styles.row}>
      <button type="button" className={styles.action} onClick={() => navigate("/profile")}>
        Profile
      </button>
      <button type="button" className={styles.action} onClick={() => navigate("/onboarding-pending")}>
        Approval
      </button>
      <button type="button" className={styles.action} onClick={() => navigate("/earnings")}>
        Earnings
      </button>
    </div>
  );
}
