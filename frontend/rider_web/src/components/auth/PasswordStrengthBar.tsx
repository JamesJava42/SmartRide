import styles from "./PasswordStrengthBar.module.css";

function getStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export function PasswordStrengthBar({ password }: { password: string }) {
  if (!password.length) {
    return null;
  }

  const score = getStrength(password);
  if (score === 0) {
    return null;
  }
  const filledBars = score <= 1 ? 1 : score === 2 ? 2 : 3;
  const tone = score <= 1 ? "weak" : score === 2 ? "fair" : "strong";
  const label = score <= 1 ? "Weak" : score === 2 ? "Fair" : "Strong";

  return (
    <div className={styles.wrap}>
      <div className={styles.bars}>
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={`${styles.bar} ${index < filledBars ? styles[tone] : ""}`}
          />
        ))}
      </div>
      {score > 0 ? <div className={`${styles.label} ${styles[tone]}`}>{label}</div> : null}
    </div>
  );
}
