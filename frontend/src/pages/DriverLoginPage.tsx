import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import type { ReturnTypeAuth } from "../types/auth-session";

export function DriverLoginPage({ auth }: { auth: ReturnTypeAuth }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("driver1@rideconnect.local");
  const [password, setPassword] = useState("RideConnect123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await auth.signIn({ email, password });
      navigate("/driver", { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-canvas px-4 py-10 lg:grid-cols-[1fr_0.95fr] lg:px-8">
      <div className="hidden rounded-[36px] bg-[linear-gradient(160deg,_rgba(23,33,27,0.96),_rgba(58,143,91,0.94))] p-10 text-white shadow-soft lg:block">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Driver Access</p>
        <h1 className="mt-4 text-5xl font-extrabold leading-tight">Stay online, accept trips, and move your shift.</h1>
        <p className="mt-5 max-w-md text-sm leading-7 text-white/80">
          Use your RideConnect driver account to manage trip states and stay connected to dispatch.
        </p>
        <div className="mt-10 space-y-4 rounded-[28px] border border-white/10 bg-white/10 p-6">
          <p className="text-sm font-semibold">Demo driver</p>
          <p className="text-sm text-white/80">Email: driver1@rideconnect.local</p>
          <p className="text-sm text-white/80">Password: RideConnect123!</p>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-[36px] border border-line bg-surface p-8 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Driver sign in</p>
          <h1 className="mt-3 text-4xl font-extrabold text-ink">Welcome back, driver.</h1>
          <p className="mt-3 text-sm text-muted">Sign in to enter the RideConnect driver workspace.</p>
          <div className="mt-8 space-y-4">
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-line px-4 py-3" placeholder="Email" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full rounded-2xl border border-line px-4 py-3" placeholder="Password" />
          </div>
          {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          <button type="submit" disabled={loading} className="mt-6 w-full rounded-2xl bg-ink px-5 py-4 text-sm font-bold text-white">
            {loading ? "Signing in..." : "Sign in as driver"}
          </button>
          <p className="mt-6 text-sm text-muted">
            Need the rider app?{" "}
            <Link to="/sign-in" className="font-semibold text-accent">
              Go to rider sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
