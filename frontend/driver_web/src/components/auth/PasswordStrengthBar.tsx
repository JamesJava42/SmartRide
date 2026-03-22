import styles from "./PasswordStrengthBar.module.css";

type PasswordStrengthBarProps = {
  password: string;
};

function getScore(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const score = getScore(password);
  if (score === 0) return null;

  const tone = score === 1 ? "weak" : score === 2 ? "fair" : "strong";
  const label =
    score === 1
      ? "Weak — add numbers or symbols"
      : score === 2
        ? "Fair — add uppercase or symbols"
        : "Strong password";
  const activeBars = score === 1 ? 1 : score === 2 ? 2 : 3;

  return (
    <div className={styles.wrapper}>
      <div className={styles.bars}>
        {[0, 1, 2].map((index) => (
          <span key={index} className={`${styles.bar} ${index < activeBars ? styles[tone] : styles.empty}`} />
        ))}
      </div>
      <div className={`${styles.label} ${styles[tone]}`}>{label}</div>
    </div>
  );
}
