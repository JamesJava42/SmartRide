import { useState, type KeyboardEvent } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { loginDriver, loginDriverWithGoogle } from "../../api/driverAuth";
import { getDriverProfile } from "../../api/driverDashboard";
import { useDriverAuth } from "../../hooks/useDriverAuth";
import { setAccessToken, setStoredUser } from "../../utils/authStorage";
import styles from "./DriverLoginForm.module.css";
import formStyles from "../../styles/forms.module.css";

type DriverLoginFormProps = {
  onSwitchToRegister: () => void;
};

function getApiErrorMessage(status?: number) {
  if (status === 401) return "Invalid email or password";
  if (status === 403) return "Account suspended. Contact support.";
  if (status === 422) return "Please check your email format";
  return "Something went wrong. Please try again";
}

export function DriverLoginForm({ onSwitchToRegister }: DriverLoginFormProps) {
  const navigate = useNavigate();
  const auth = useDriverAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const emailError = (submitAttempted || emailTouched) && !email.trim() ? "Email is required" : null;
  const passwordError =
    (submitAttempted || passwordTouched) && !password.trim() ? "Password is required" : null;

  async function handleSubmit() {
    setSubmitAttempted(true);
    if (emailError || passwordError || !email.trim() || !password.trim()) return;

    setIsLoading(true);
    setApiError(null);

    try {
      const response = await loginDriver({ email: email.trim(), password });
      auth.login({
        accessToken: response.access_token,
        user: {
          userId: response.driver_id,
          fullName: response.full_name,
          email: response.email,
          role: "DRIVER",
        },
      });
      setAccessToken(response.access_token);
      setStoredUser({
        userId: response.driver_id,
        fullName: response.full_name,
        email: response.email,
        role: "DRIVER",
      });

      const profile = await getDriverProfile();
      const destination = profile.is_approved ? "/dashboard" : "/onboarding-pending";

      navigate(destination, { replace: true });
    } catch (error) {
      const status =
        error && typeof error === "object" && "status" in error ? Number(error.status) : undefined;
      setApiError(getApiErrorMessage(status));
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  }

  function handlePasswordKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <div className={styles.formShell}>
      <div className={styles.titleBlock}>
        <h2 className={styles.title}>Welcome back</h2>
        <p className={styles.subtitle}>Sign in to your driver account</p>
      </div>

      {apiError ? (
        <div className={formStyles.errorBanner}>
          <AlertCircle size={14} color="#DC2626" />
          <span className={formStyles.errorBannerText}>{apiError}</span>
        </div>
      ) : null}

      <div className={styles.fields}>
        <div className={formStyles.field}>
          <label className={formStyles.label}>Email</label>
          <input
            className={`${formStyles.input} ${emailError ? formStyles.errorInput : ""}`}
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onBlur={() => setEmailTouched(true)}
            onChange={(event) => setEmail(event.target.value)}
          />
          <div className={formStyles.messageSlot}>
            {emailError ? <span className={formStyles.errorMsg}>{emailError}</span> : null}
          </div>
        </div>

        <div className={formStyles.field}>
          <label className={formStyles.label}>Password</label>
          <div className={formStyles.inputWrap}>
            <input
              className={`${formStyles.input} ${formStyles.inputWithIcon} ${
                passwordError ? formStyles.errorInput : ""
              }`}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onBlur={() => setPasswordTouched(true)}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={handlePasswordKeyDown}
            />
            <button
              type="button"
              className={formStyles.eyeBtn}
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className={formStyles.messageSlot}>
            {passwordError ? <span className={formStyles.errorMsg}>{passwordError}</span> : null}
          </div>
        </div>

        <div className={styles.forgotRow}>
          <button
            type="button"
            className={styles.forgotLink}
            onClick={() => window.alert("Password reset coming soon")}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="button"
          className={`${formStyles.cta} ${apiError ? styles.errorCta : ""}`}
          disabled={isLoading}
          onClick={() => void handleSubmit()}
        >
          {isLoading ? (
            <>
              <span className={formStyles.spinner} />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>

        <div className={formStyles.divider}>
          <span className={formStyles.divLine} />
          <span className={formStyles.divText}>or</span>
          <span className={formStyles.divLine} />
        </div>

        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            if (!credentialResponse.credential) return;
            setIsLoading(true);
            setApiError(null);
            try {
              const response = await loginDriverWithGoogle(credentialResponse.credential);
              auth.login({
                accessToken: response.access_token,
                user: {
                  userId: response.driver_id,
                  fullName: response.full_name,
                  email: response.email,
                  role: "DRIVER",
                },
              });
              setAccessToken(response.access_token);
              setStoredUser({
                userId: response.driver_id,
                fullName: response.full_name,
                email: response.email,
                role: "DRIVER",
              });
              const profile = await getDriverProfile();
              navigate(profile.is_approved ? "/dashboard" : "/onboarding-pending", { replace: true });
            } catch {
              setApiError("Google sign-in failed. Please try again.");
            } finally {
              setIsLoading(false);
            }
          }}
          onError={() => setApiError("Google sign-in failed. Please try again.")}
          width="100%"
          text="signin_with"
          shape="rectangular"
          theme="outline"
        />

        <div className={formStyles.switchLink}>
          Don&apos;t have an account?{" "}
          <button type="button" onClick={onSwitchToRegister}>
            Create account <ArrowRight size={14} className={styles.inlineIcon} />
          </button>
        </div>
      </div>
    </div>
  );
}
