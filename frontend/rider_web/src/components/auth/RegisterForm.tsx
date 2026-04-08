import { AlertCircle, Check, Eye, EyeOff, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { useRiderSession } from "../../hooks/useRiderSession";
import { AuthApiError } from "../../types/auth";
import { PasswordStrengthBar } from "./PasswordStrengthBar";
import styles from "./RegisterForm.module.css";

type FieldName = "fullName" | "email" | "phoneNumber" | "password" | "confirmPassword";
type TouchedState = Record<FieldName, boolean>;
type ErrorState = Partial<Record<FieldName, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getErrors(values: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}): ErrorState {
  const errors: ErrorState = {};
  const trimmedFullName = values.fullName.trim();
  const trimmedEmail = values.email.trim();
  const trimmedPhone = values.phoneNumber.trim();

  if (!trimmedFullName) {
    errors.fullName = "Full name is required";
  } else if (trimmedFullName.length < 2) {
    errors.fullName = "Minimum 2 characters required";
  } else if (trimmedFullName.length > 128) {
    errors.fullName = "Name is too long";
  }

  if (!trimmedEmail) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = "Enter a valid email address";
  }

  if (!trimmedPhone) {
    errors.phoneNumber = "Phone number is required";
  } else if (trimmedPhone.length < 7) {
    errors.phoneNumber = "Phone number is too short (min 7 characters)";
  } else if (trimmedPhone.length > 50) {
    errors.phoneNumber = "Phone number is too long (max 50 characters)";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (values.password.length > 128) {
    errors.password = "Password is too long";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

export function RegisterForm({
  onSwitchToLogin,
  onSuccess,
}: {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}) {
  const auth = useRiderSession();
  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmRef = useRef<HTMLInputElement | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState<ErrorState>({});
  const [touched, setTouched] = useState<TouchedState>({
    fullName: false,
    email: false,
    phoneNumber: false,
    password: false,
    confirmPassword: false,
  });

  const clientErrors = useMemo(
    () => getErrors({ fullName, email, phoneNumber, password, confirmPassword }),
    [confirmPassword, email, fullName, password, phoneNumber],
  );

  function visibleError(name: FieldName) {
    if (!(touched[name] || submitAttempted)) {
      return "";
    }
    return serverFieldErrors[name] || clientErrors[name] || "";
  }

  function clearServerFieldError(name: FieldName) {
    setServerFieldErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function focusFirstError(errors: ErrorState) {
    const refs = {
      fullName: fullNameRef,
      email: emailRef,
      phoneNumber: phoneRef,
      password: passwordRef,
      confirmPassword: confirmRef,
    };
    const first = (["fullName", "email", "phoneNumber", "password", "confirmPassword"] as FieldName[]).find(
      (name) => errors[name],
    );
    if (first) {
      refs[first].current?.focus();
    }
  }

  async function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setSubmitAttempted(true);
    setApiError(null);
    setServerFieldErrors({});
    setTouched({
      fullName: true,
      email: true,
      phoneNumber: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.keys(clientErrors).length > 0) {
      focusFirstError(clientErrors);
      return;
    }

    setIsLoading(true);
    try {
      await auth.signUp({
        full_name: fullName.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim(),
        password,
      });
      onSuccess();
    } catch (error) {
      if (error instanceof AuthApiError) {
        if (error.status === 422) {
          setApiError("Please check your information and try again");
        } else if (error.status === 503 || error.status === 502) {
          setApiError("Service is starting up — please wait a moment and try again");
        } else {
          // Show the actual server error message so we can debug
          const serverMsg = typeof (error.body as any)?.message === "string"
            ? (error.body as any).message
            : error.message;
          setApiError(serverMsg || `Request failed (${error.status}). Please try again`);
        }
      } else if (error instanceof TypeError) {
        setApiError("No connection — check your internet and try again");
      } else {
        setApiError("Registration failed. Please try again");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const hasBlockingErrors =
    isLoading ||
    !fullName.trim() ||
    !email.trim() ||
    !phoneNumber.trim() ||
    !password ||
    !confirmPassword ||
    Object.keys(clientErrors).length > 0 ||
    Object.keys(serverFieldErrors).length > 0;

  const confirmMatches = confirmPassword.length > 0 && confirmPassword === password;
  const confirmHasError = Boolean(visibleError("confirmPassword"));

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Start riding in minutes</p>
      </div>

      {apiError ? (
        <div className={styles.errorBanner}>
          <AlertCircle size={14} color="#EF4444" />
          <span className={styles.errorText}>{apiError}</span>
        </div>
      ) : null}

      <label className={styles.field} data-error={visibleError("fullName") ? "true" : "false"}>
        <span className={styles.label}>Full name <span className={styles.asterisk}>*</span></span>
        <input
          ref={fullNameRef}
          className={`${styles.input} ${visibleError("fullName") ? styles.inputError : ""}`}
          type="text"
          autoComplete="name"
          autoCapitalize="words"
          placeholder="Ram Teja"
          spellCheck={false}
          value={fullName}
          onChange={(event) => {
            setFullName(event.target.value);
            clearServerFieldError("fullName");
          }}
          onBlur={() => {
            setTouched((state) => ({ ...state, fullName: true }));
            setFullName((value) => value.trim());
          }}
          disabled={isLoading}
        />
        <span className={styles.hint}>Minimum 2 characters</span>
        {visibleError("fullName") ? <span className={styles.fieldError}>{visibleError("fullName")}</span> : null}
      </label>

      <label className={styles.field} data-error={visibleError("email") ? "true" : "false"}>
        <span className={styles.label}>Email <span className={styles.asterisk}>*</span></span>
        <input
          ref={emailRef}
          className={`${styles.input} ${visibleError("email") ? styles.inputError : ""}`}
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            clearServerFieldError("email");
          }}
          onBlur={() => setTouched((state) => ({ ...state, email: true }))}
          disabled={isLoading}
        />
        {visibleError("email") ? <span className={styles.fieldError}>{visibleError("email")}</span> : null}
      </label>

      <label className={styles.field} data-error={visibleError("phoneNumber") ? "true" : "false"}>
        <span className={styles.label}>Phone number <span className={styles.asterisk}>*</span></span>
        <input
          ref={phoneRef}
          className={`${styles.input} ${visibleError("phoneNumber") ? styles.inputError : ""}`}
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+1 555 000 0000"
          value={phoneNumber}
          onChange={(event) => {
            setPhoneNumber(event.target.value);
            clearServerFieldError("phoneNumber");
          }}
          onBlur={() => setTouched((state) => ({ ...state, phoneNumber: true }))}
          disabled={isLoading}
        />
        <span className={styles.hint}>7–50 characters</span>
        {visibleError("phoneNumber") ? <span className={styles.fieldError}>{visibleError("phoneNumber")}</span> : null}
      </label>

      <label className={styles.field} data-error={visibleError("password") ? "true" : "false"}>
        <span className={styles.label}>Password <span className={styles.asterisk}>*</span></span>
        <span className={styles.passwordWrap}>
          <input
            ref={passwordRef}
            className={`${styles.input} ${styles.inputWithIcon} ${visibleError("password") ? styles.inputError : ""}`}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearServerFieldError("password");
            }}
            onBlur={() => setTouched((state) => ({ ...state, password: true }))}
            disabled={isLoading}
          />
          <button type="button" className={styles.toggle} onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </span>
        <PasswordStrengthBar password={password} />
        {visibleError("password") ? <span className={styles.fieldError}>{visibleError("password")}</span> : null}
      </label>

      <label className={styles.field} data-error={visibleError("confirmPassword") ? "true" : "false"}>
        <span className={styles.label}>Confirm password <span className={styles.asterisk}>*</span></span>
        <span className={styles.passwordWrap}>
          <input
            ref={confirmRef}
            className={`${styles.input} ${styles.inputWithStatus} ${confirmHasError ? styles.inputError : ""}`}
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              clearServerFieldError("confirmPassword");
            }}
            onBlur={() => setTouched((state) => ({ ...state, confirmPassword: true }))}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                void handleSubmit();
              }
            }}
            disabled={isLoading}
          />
          <span className={styles.statusIcon}>
            {confirmMatches ? <Check size={14} color="#1A6B45" /> : null}
            {!confirmMatches && confirmHasError ? <X size={14} color="#EF4444" /> : null}
          </span>
          <button type="button" className={styles.toggleConfirm} onClick={() => setShowConfirmPassword((value) => !value)}>
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </span>
        {visibleError("confirmPassword") ? <span className={styles.fieldError}>{visibleError("confirmPassword")}</span> : null}
      </label>

      <button type="submit" className={styles.submit} disabled={hasBlockingErrors}>
        <span className={styles.submitInner}>
          {isLoading ? <span className={styles.spinner} /> : null}
          <span>{isLoading ? "Creating account..." : "Create account"}</span>
        </span>
      </button>

      <div className={styles.switch}>
        Already have an account?{" "}
        <button type="button" className={styles.switchBtn} onClick={onSwitchToLogin}>
          Sign in ←
        </button>
      </div>
    </form>
  );
}
