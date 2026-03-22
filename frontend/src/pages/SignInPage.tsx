import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthHero } from "../components/AuthHero";
import type { ReturnTypeAuth } from "../types/auth-session";

export function SignInPage({ auth }: { auth: ReturnTypeAuth }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("rider@rideconnect.local");
  const [password, setPassword] = useState("RideConnect123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await auth.signIn({ email, password });
      navigate("/book-ride", { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-canvas px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
      <AuthHero />
      <div className="flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-[36px] border border-line bg-surface p-8 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Sign in</p>
          <h1 className="mt-3 text-4xl font-extrabold text-ink">Welcome back.</h1>
          <p className="mt-3 text-sm text-muted">Use your RideConnect account to request and track rides.</p>
          <div className="mt-8 space-y-4">
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-line px-4 py-3" placeholder="Email" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full rounded-2xl border border-line px-4 py-3" placeholder="Password" />
          </div>
          {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          <button type="submit" disabled={loading} className="mt-6 w-full rounded-2xl bg-ink px-5 py-4 text-sm font-bold text-white">
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p className="mt-6 text-sm text-muted">
            New to RideConnect?{" "}
            <Link to="/sign-up" className="font-semibold text-accent">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
