import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  getDriverEmailVerificationStatus,
  resendDriverEmailVerification,
} from "../../api/auth";
import { useDriverSession } from "../../hooks/useDriverSession";

export default function DriverVerifyEmailPage() {
  const auth = useDriverSession();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<string | null>(null);
  const statusQuery = useQuery({
    queryKey: ["driver-email-verification-status"],
    queryFn: getDriverEmailVerificationStatus,
    enabled: auth.isSignedIn,
  });

  const resendMutation = useMutation({
    mutationFn: resendDriverEmailVerification,
    onSuccess: () => setFeedback("Verification email sent again."),
  });

  useEffect(() => {
    if (statusQuery.data?.emailVerified) {
      navigate("/driver/verify-phone", { replace: true });
    }
  }, [navigate, statusQuery.data?.emailVerified]);

  if (!auth.isLoading && !auth.isSignedIn) {
    return <Navigate replace to="/driver/login" />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12">
      <section className="w-full max-w-xl rounded-[32px] border border-line bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Email verification</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Check your inbox</h1>
        <p className="mt-2 text-sm text-muted">
          We sent a verification email to {auth.user?.email ?? "your email address"}. Confirm it, then refresh status.
        </p>

        <div className="mt-8 space-y-4">
          <div className="rounded-2xl bg-canvas px-4 py-4 text-sm text-muted">
            {statusQuery.isLoading
              ? "Checking your email verification state..."
              : statusQuery.data?.emailVerified
                ? "Email already verified."
                : "Email verification is still pending."}
          </div>

          {statusQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {statusQuery.error instanceof Error
                ? statusQuery.error.message
                : "Unable to load email verification status."}
            </div>
          ) : null}

          {feedback ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              {feedback}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void resendMutation.mutateAsync({ email: auth.user?.email })}
              disabled={resendMutation.isPending}
              className="rounded-2xl bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {resendMutation.isPending ? "Sending..." : "Resend email"}
            </button>
            <button
              type="button"
              onClick={() => void statusQuery.refetch()}
              disabled={statusQuery.isFetching}
              className="rounded-2xl border border-line px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#f7f5ef] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {statusQuery.isFetching ? "Checking..." : "Refresh status"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted">
          Wrong account?{" "}
          <Link to="/driver/login" className="font-semibold text-[#2563eb]">
            Sign in again
          </Link>
        </p>
      </section>
    </main>
  );
}
