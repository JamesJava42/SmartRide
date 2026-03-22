import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ReturnTypeUseAdminSession } from "../types/admin-session";

export function AdminLoginPage({ auth }: { auth: ReturnTypeUseAdminSession }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@rideconnect.com");
  const [password, setPassword] = useState("ChangeMe123!");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await auth.signIn({ email, password });
      navigate("/admin/dashboard", { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f1eb] px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[28px] border border-line bg-white p-8 shadow-[0_20px_60px_rgba(15,23,18,0.08)]">
        <div className="text-3xl font-extrabold tracking-tight">RideConnect Admin</div>
        <p className="mt-2 text-sm text-muted">Sign in to monitor rides, onboarding, and regional operations.</p>
        <div className="mt-6 space-y-4">
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-line px-4 py-3" />
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-line px-4 py-3" />
          {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white">
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}
