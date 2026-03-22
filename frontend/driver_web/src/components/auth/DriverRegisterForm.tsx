import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AlertCircle, Check, CheckCircle2, Eye, EyeOff, X } from "lucide-react";

import { getDriverRegistrationRegions, registerDriver } from "../../api/driverAuth";
import type { RegistrationRegion } from "../../types/auth";
import { DriverAuthApiError, type DriverRegisterPayload } from "../../types/driverAuth";
import { PasswordStrengthBar } from "./PasswordStrengthBar";
import styles from "./DriverRegisterForm.module.css";
import formStyles from "../../styles/forms.module.css";

type DriverRegisterFormProps = {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
};

type FieldName = "fullName" | "email" | "phoneNumber" | "regionId" | "password" | "confirmPassword";

type Values = Record<FieldName, string>;

function validateField(field: FieldName, values: Values) {
  switch (field) {
    case "fullName": {
      const trimmed = values.fullName.trim();
      if (!trimmed) return "Full name is required";
      if (trimmed.length < 2) return "Minimum 2 characters";
      if (trimmed.length > 128) return "Maximum 128 characters";
      return "";
    }
    case "email":
      if (!values.email.trim()) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) return "Enter a valid email address";
      return "";
    case "phoneNumber": {
      const trimmed = values.phoneNumber.trim();
      if (!trimmed) return "Phone number is required";
      if (!/^\+?[0-9()\-\s]{7,20}$/.test(trimmed)) return "Use digits only with optional +, spaces, () or -";
      if (trimmed.replace(/\D/g, "").length < 7) return "Enter a valid phone number";
      return "";
    }
    case "regionId":
      if (!values.regionId.trim()) return "Select an onboarding region";
      return "";
    case "password":
      if (!values.password) return "Password is required";
      if (values.password.length < 8) return "Minimum 8 characters";
      if (values.password.length > 128) return "Maximum 128 characters";
      return "";
    case "confirmPassword":
      if (!values.confirmPassword) return "Please confirm your password";
      if (values.confirmPassword !== values.password) return "Passwords do not match";
      return "";
    default:
      return "";
  }
}

export function DriverRegisterForm({ onSwitchToLogin, onSuccess }: DriverRegisterFormProps) {
  const [values, setValues] = useState<Values>({
    fullName: "",
    email: "",
    phoneNumber: "",
    regionId: "",
    password: "",
    confirmPassword: "",
  });
  const [regions, setRegions] = useState<RegistrationRegion[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<FieldName, string>>({
    fullName: "",
    email: "",
    phoneNumber: "",
    regionId: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    fullName: false,
    email: false,
    phoneNumber: false,
    regionId: false,
    password: false,
    confirmPassword: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const firstErrorField = useRef<HTMLInputElement | null>(null);

  const firstName = useMemo(() => values.fullName.trim().split(/\s+/)[0] || "Driver", [values.fullName]);

  useEffect(() => {
    let cancelled = false;

    async function loadRegions() {
      setRegionsLoading(true);
      try {
        const nextRegions = await getDriverRegistrationRegions();
        if (!cancelled) {
          setRegions(nextRegions);
          setValues((current) => ({
            ...current,
            regionId: current.regionId || nextRegions[0]?.id || "",
          }));
        }
      } catch {
        if (!cancelled) {
          setRegions([]);
        }
      } finally {
        if (!cancelled) {
          setRegionsLoading(false);
        }
      }
    }

    loadRegions();
    return () => {
      cancelled = true;
    };
  }, []);

  function applyValidation(field: FieldName, nextValues: Values) {
    const nextError = validateField(field, nextValues);
    setFieldErrors((current) => ({ ...current, [field]: nextError }));
    return nextError;
  }

  function handleChange(field: FieldName, value: string) {
    setValues((current) => {
      const nextValues = {
        ...current,
        [field]:
          field === "phoneNumber"
            ? value.replace(/[^0-9()+\-\s]/g, "")
            : value,
      };
      if (touched[field]) applyValidation(field, nextValues);
      if (field === "password" && touched.confirmPassword) applyValidation("confirmPassword", nextValues);
      return nextValues;
    });
  }

  function handleBlur(field: FieldName) {
    setTouched((current) => ({ ...current, [field]: true }));
    applyValidation(field, values);
  }

  function validateAll() {
    const fields: FieldName[] = ["fullName", "email", "phoneNumber", "regionId", "password", "confirmPassword"];
    let firstInvalid: FieldName | null = null;
    const nextErrors = { ...fieldErrors };
    fields.forEach((field) => {
      const error = validateField(field, values);
      nextErrors[field] = error;
      if (!firstInvalid && error) firstInvalid = field;
    });
    setFieldErrors(nextErrors);
    setTouched({
      fullName: true,
      email: true,
      phoneNumber: true,
      regionId: true,
      password: true,
      confirmPassword: true,
    });
    return { valid: !firstInvalid };
  }

  function getFieldRef(field: FieldName) {
    return (node: HTMLInputElement | null) => {
      if (!firstErrorField.current && fieldErrors[field]) firstErrorField.current = node;
    };
  }

  function handleApiError(error: unknown) {
    if (error instanceof DriverAuthApiError && error.status === 409) {
      const lowered = error.message.toLowerCase();
      if (lowered.includes("email")) {
        setFieldErrors((current) => ({ ...current, email: "This email is already registered" }));
        return;
      }
      if (lowered.includes("phone")) {
        setFieldErrors((current) => ({ ...current, phoneNumber: "This phone number is already registered" }));
        return;
      }
    }
    if (error instanceof DriverAuthApiError && error.status === 422) {
      setApiError("Please check your information and try again");
      return;
    }
    setApiError("Registration failed. Please try again");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    setApiError(null);

    if (!validateAll().valid) {
      firstErrorField.current?.focus();
      return;
    }

    setIsLoading(true);

    try {
      const payload: DriverRegisterPayload = {
        full_name: values.fullName.trim(),
        email: values.email.trim(),
        phone_number: values.phoneNumber.trim(),
        region_id: values.regionId,
        password: values.password,
        role: "DRIVER",
      };
      await registerDriver(payload);
      setIsSuccess(true);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className={styles.successState}>
        <div className={styles.successIcon}>
          <CheckCircle2 size={28} color="#1A6B45" />
        </div>
        <h2 className={styles.successTitle}>Account created!</h2>
        <p className={styles.successSubtitle}>Welcome to RideConnect, {firstName}</p>
        <div className={styles.successInfo}>
          <strong>{values.email.trim()}</strong>
          <span>Your driver account is created. Sign in and wait for admin approval to unlock the dashboard.</span>
        </div>
        <button type="button" className={formStyles.cta} onClick={onSuccess}>
          Go to sign in →
        </button>
      </div>
    );
  }

  const hasErrors = Object.values(fieldErrors).some(Boolean);
  const hasEmptyFields = Object.values(values).some((value) => !value.trim());
  const confirmMatches = values.confirmPassword && values.confirmPassword === values.password;

  return (
    <form className={styles.formShell} onSubmit={handleSubmit}>
      <div className={styles.titleBlock}>
        <h2 className={styles.title}>Create account</h2>
        <p className={styles.subtitle}>Join as a driver partner</p>
      </div>

      {apiError ? (
        <div className={formStyles.errorBanner}>
          <AlertCircle size={14} color="#DC2626" />
          <span className={formStyles.errorBannerText}>{apiError}</span>
        </div>
      ) : null}

      <div className={styles.formGrid}>
        <div className={styles.twoCol}>
          <div className={formStyles.field}>
            <label className={formStyles.label}>
              Full name <span className={formStyles.required}>*</span>
            </label>
            <input
              ref={getFieldRef("fullName")}
              className={`${formStyles.input} ${fieldErrors.fullName ? formStyles.errorInput : ""}`}
              type="text"
              autoComplete="name"
              autoCapitalize="words"
              placeholder="Ram Kumar"
              value={values.fullName}
          onBlur={() => handleBlur("fullName")}
          onChange={(event) => handleChange("fullName", event.target.value)}
            />
            <div className={formStyles.messageSlot}>
              {fieldErrors.fullName ? <span className={formStyles.errorMsg}>{fieldErrors.fullName}</span> : null}
            </div>
          </div>

          <div className={formStyles.field}>
            <label className={formStyles.label}>
              Phone number <span className={formStyles.required}>*</span>
            </label>
            <input
              ref={getFieldRef("phoneNumber")}
              className={`${formStyles.input} ${fieldErrors.phoneNumber ? formStyles.errorInput : ""}`}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+1 555 000 0000"
              value={values.phoneNumber}
              onBlur={() => handleBlur("phoneNumber")}
              onChange={(event) => handleChange("phoneNumber", event.target.value)}
            />
            <div className={formStyles.messageSlot}>
              {fieldErrors.phoneNumber ? (
                <span className={formStyles.errorMsg}>{fieldErrors.phoneNumber}</span>
              ) : (
                <span className={formStyles.hint}>7-50 characters</span>
              )}
            </div>
          </div>
        </div>

        <div className={formStyles.field}>
          <label className={formStyles.label}>
            Email <span className={formStyles.required}>*</span>
          </label>
          <input
            ref={getFieldRef("email")}
            className={`${formStyles.input} ${fieldErrors.email ? formStyles.errorInput : ""}`}
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            placeholder="you@example.com"
            value={values.email}
            onBlur={() => handleBlur("email")}
            onChange={(event) => handleChange("email", event.target.value)}
          />
          <div className={formStyles.messageSlot}>
            {fieldErrors.email ? <span className={formStyles.errorMsg}>{fieldErrors.email}</span> : null}
          </div>
        </div>

        <div className={formStyles.field}>
          <label className={formStyles.label}>
            Onboarding region <span className={formStyles.required}>*</span>
          </label>
          <select
            className={`${formStyles.input} ${fieldErrors.regionId ? formStyles.errorInput : ""}`}
            value={values.regionId}
            onBlur={() => handleBlur("regionId")}
            onChange={(event) => handleChange("regionId", event.target.value)}
            disabled={regionsLoading || regions.length === 0}
          >
            <option value="">{regionsLoading ? "Loading regions..." : "Select a region"}</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
                {region.city || region.state ? `, ${[region.city, region.state].filter(Boolean).join(", ")}` : ""}
              </option>
            ))}
          </select>
          <div className={formStyles.messageSlot}>
            {fieldErrors.regionId ? (
              <span className={formStyles.errorMsg}>{fieldErrors.regionId}</span>
            ) : (
              <span className={formStyles.hint}>Your application will appear in this region&apos;s admin queue.</span>
            )}
          </div>
        </div>

        <div className={styles.twoCol}>
          <div className={formStyles.field}>
            <label className={formStyles.label}>
              Password <span className={formStyles.required}>*</span>
            </label>
            <div className={formStyles.inputWrap}>
              <input
                ref={getFieldRef("password")}
                className={`${formStyles.input} ${formStyles.inputWithIcon} ${
                  fieldErrors.password ? formStyles.errorInput : ""
                }`}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                value={values.password}
                onBlur={() => handleBlur("password")}
                onChange={(event) => handleChange("password", event.target.value)}
              />
              <button type="button" className={formStyles.eyeBtn} onClick={() => setShowPassword((current) => !current)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className={formStyles.messageSlot}>
              {fieldErrors.password ? (
                <span className={formStyles.errorMsg}>{fieldErrors.password}</span>
              ) : values.password ? (
                <PasswordStrengthBar password={values.password} />
              ) : null}
            </div>
          </div>

          <div className={formStyles.field}>
            <label className={formStyles.label}>
              Confirm password <span className={formStyles.required}>*</span>
            </label>
            <div className={formStyles.inputWrap}>
              <input
                ref={getFieldRef("confirmPassword")}
                className={`${formStyles.input} ${formStyles.inputWithIcon} ${
                  fieldErrors.confirmPassword ? formStyles.errorInput : ""
                }`}
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={values.confirmPassword}
                onBlur={() => handleBlur("confirmPassword")}
                onChange={(event) => handleChange("confirmPassword", event.target.value)}
              />
              <button
                type="button"
                className={`${formStyles.eyeBtn} ${styles.confirmEye}`}
                onClick={() => setShowConfirmPassword((current) => !current)}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {values.confirmPassword ? (
                <span className={styles.confirmStatus}>
                  {confirmMatches ? <Check size={16} color="#1A6B45" /> : <X size={16} color="#EF4444" />}
                </span>
              ) : null}
            </div>
            <div className={formStyles.messageSlot}>
              {fieldErrors.confirmPassword ? (
                <span className={formStyles.errorMsg}>{fieldErrors.confirmPassword}</span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <button type="submit" className={formStyles.cta} disabled={isLoading || hasErrors || hasEmptyFields}>
        {isLoading ? (
          <>
            <span className={formStyles.spinner} />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </button>

      <div className={formStyles.switchLink}>
        Already a driver?{" "}
        <button type="button" onClick={onSwitchToLogin}>
          Sign in ←
        </button>
      </div>
    </form>
  );
}
