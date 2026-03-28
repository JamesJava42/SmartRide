import { GoogleLogin } from "@react-oauth/google";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useToast } from "../../components/common/Toast";
import { useRiderSession } from "../../hooks/useRiderSession";
import { AuthApiError } from "../../types/auth";
import styles from "./LoginForm.module.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapLoginError(error: unknown) {
  if (error instanceof AuthApiError) {
    if (error.status === 401) return "Invalid email or password";
    if (error.status === 422) return "Please check your email format";
    if (error.status >= 500) return "Something went wrong. Please try again";
  }
  if (error instanceof TypeError) {
    return "No connection. Check your internet";
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again";
}

function validateEmail(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Email is required";
  if (!EMAIL_REGEX.test(trimmed)) return "Enter a valid email";
  return "";
}

function validatePassword(value: string) {
  return value ? "" : "Password is required";
}

export function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const auth = useRiderSession();
  const navigate = useNavigate();
  const toast = useToast();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const emailError = (emailTouched || submitAttempted) ? validateEmail(email) : "";
  const passwordError = (passwordTouched || submitAttempted) ? validatePassword(password) : "";

  async function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setSubmitAttempted(true);
    setApiError(null);

    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);

    if (nextEmailError || nextPasswordError) {
      if (nextEmailError) {
        emailRef.current?.focus();
      } else {
        passwordRef.current?.focus();
      }
      return;
    }

    setIsLoading(true);
    try {
      await auth.signIn({ email: email.trim(), password });
      navigate("/");
    } catch (error) {
      setApiError(mapLoginError(error));
      setPassword("");
      window.setTimeout(() => emailRef.current?.focus(), 0);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your account</p>
      </div>

      {apiError ? (
        <div className={styles.errorBanner}>
          <AlertCircle size={14} color="#EF4444" />
          <span className={styles.errorText}>{apiError}</span>
        </div>
      ) : null}

      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input
          ref={emailRef}
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          inputMode="email"
          className={`${styles.input} ${(emailError || apiError) ? styles.inputError : ""}`}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => setEmailTouched(true)}
          placeholder="you@example.com"
          disabled={isLoading}
          data-error={emailError ? "true" : "false"}
        />
        {emailError ? <span className={styles.fieldError}>{emailError}</span> : null}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Password</span>
        <span className={styles.passwordWrap}>
          <input
            ref={passwordRef}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className={`${styles.input} ${styles.inputWithIcon} ${(passwordError || apiError) ? styles.inputError : ""}`}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={() => setPasswordTouched(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void handleSubmit();
              }
            }}
            placeholder="••••••••"
            disabled={isLoading}
            data-error={passwordError ? "true" : "false"}
          />
          <button type="button" className={styles.toggle} onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </span>
        {passwordError ? <span className={styles.fieldError}>{passwordError}</span> : null}
      </label>

      <button
        type="button"
        className={styles.forgot}
        onClick={() => toast.showSuccess("Password reset coming soon")}
      >
        Forgot password?
      </button>

      <button type="submit" className={`${styles.submit} ${apiError ? styles.submitError : ""}`} disabled={isLoading}>
        <span className={styles.submitInner}>
          {isLoading ? <span className={styles.spinner} /> : null}
          <span>{isLoading ? "Signing in..." : "Sign in"}</span>
        </span>
      </button>

      <div className={styles.divider}>
        <span className={styles.line} />
        <span className={styles.or}>or</span>
        <span className={styles.line} />
      </div>

      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          if (!credentialResponse.credential) return;
          setIsLoading(true);
          try {
            await auth.signInWithGoogle(credentialResponse.credential);
            navigate("/");
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

      <div className={styles.switch}>
        Don&apos;t have an account?{" "}
        <button type="button" className={styles.switchBtn} onClick={onSwitchToRegister}>
          Create account →
        </button>
      </div>
    </form>
  );
}
