import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  getCurrentDriverProfile,
  getDriverPhoneVerificationStatus,
  resendDriverPhoneOtp,
  verifyDriverPhoneOtp,
} from "../../api/auth";
import { getDriverProfile } from "../../api/driverDashboard";
import { PhoneOtpForm } from "../../components/auth/PhoneOtpForm";
import { useDriverAuth } from "../../hooks/useDriverAuth";
import { useDriverSession } from "../../hooks/useDriverSession";
import type { VerifyPhoneOtpPayload } from "@shared/types/auth";

export default function DriverVerifyPhonePage() {
  const auth = useDriverSession();
  const authState = useDriverAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const statusQuery = useQuery({
    queryKey: ["driver-phone-verification-status"],
    queryFn: getDriverPhoneVerificationStatus,
    enabled: auth.isSignedIn,
  });

  const verifyMutation = useMutation({
    mutationFn: verifyDriverPhoneOtp,
    onSuccess: async () => {
      const refreshedUser = await getCurrentDriverProfile();
      const profile = await getDriverProfile();
      authState.setUser(refreshedUser);
      navigate(profile.is_approved ? "/dashboard" : "/onboarding-pending", { replace: true });
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendDriverPhoneOtp,
    onSuccess: () => setFeedback("A new verification code has been sent."),
  });

  useEffect(() => {
    if (statusQuery.data?.phoneVerified) {
      void getDriverProfile().then((profile) => {
        navigate(profile.is_approved ? "/dashboard" : "/onboarding-pending", { replace: true });
      });
    }
  }, [navigate, statusQuery.data?.phoneVerified]);

  const phone = useMemo(() => auth.user?.phone, [auth.user?.phone]);

  if (!auth.isLoading && !auth.isSignedIn) {
    return <Navigate replace to="/driver/login" />;
  }

  async function handleVerify(payload: VerifyPhoneOtpPayload) {
    setErrorMessage(null);
    setFeedback(null);
    try {
      await verifyMutation.mutateAsync(payload);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to verify your phone.");
    }
  }

  async function handleResend() {
    setErrorMessage(null);
    try {
      await resendMutation.mutateAsync({ phone });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to resend the verification code.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12">
      <section className="w-full max-w-xl rounded-[32px] border border-line bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Phone verification</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Verify your phone</h1>
        <p className="mt-2 text-sm text-muted">
          Enter the OTP sent to your driver phone number to continue into the driver app.
        </p>

        <div className="mt-8 space-y-4">
          {statusQuery.isLoading ? (
            <div className="rounded-2xl bg-canvas px-4 py-4 text-sm text-muted">
              Checking your phone verification status...
            </div>
          ) : null}

          {statusQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {statusQuery.error instanceof Error
                ? statusQuery.error.message
                : "Unable to load phone verification status."}
            </div>
          ) : null}

          {feedback ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              {feedback}
            </div>
          ) : null}

          <PhoneOtpForm
            phone={phone}
            onSubmit={handleVerify}
            onResend={handleResend}
            isSubmitting={verifyMutation.isPending}
            isResending={resendMutation.isPending}
            errorMessage={errorMessage}
          />
        </div>
      </section>
    </main>
  );
}
