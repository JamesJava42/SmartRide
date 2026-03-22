import { useState, type FormEvent } from "react";
import type { VerifyPhoneOtpPayload } from "@shared/types/auth";

type PhoneOtpFormProps = {
  phone?: string;
  onSubmit: (payload: VerifyPhoneOtpPayload) => Promise<void>;
  onResend: () => Promise<void>;
  isSubmitting?: boolean;
  isResending?: boolean;
  errorMessage?: string | null;
};

export function PhoneOtpForm({
  phone,
  onSubmit,
  onResend,
  isSubmitting = false,
  isResending = false,
  errorMessage,
}: PhoneOtpFormProps) {
  const [otp, setOtp] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!otp.trim()) {
      setLocalError("Enter the OTP sent to your phone.");
      return;
    }
    if (!phone) {
      setLocalError("A phone number is required before verification.");
      return;
    }
    setLocalError(null);
    await onSubmit({ phone, otp: otp.trim() });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="rounded-2xl bg-canvas px-4 py-3 text-sm text-muted">
        {phone ? `Verifying ${phone}` : "Your verified phone number will be used for OTP confirmation."}
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink">One-time passcode</span>
        <input
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm tracking-[0.32em] text-ink outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
          inputMode="numeric"
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
          placeholder="123456"
          required
        />
      </label>

      {localError || errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {localError ?? errorMessage}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-2xl bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Verifying..." : "Verify phone"}
        </button>
        <button
          type="button"
          onClick={() => void onResend()}
          disabled={isResending}
          className="rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-ink transition hover:bg-[#f7f5ef] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isResending ? "Sending..." : "Resend code"}
        </button>
      </div>
    </form>
  );
}
