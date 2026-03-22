import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthHero } from "../components/AuthHero";
import type { ReturnTypeAuth } from "../types/auth-session";

export function SignUpPage({ auth }: { auth: ReturnTypeAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    role: "rider" as "rider" | "driver",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await auth.signUp(form);
      navigate("/book-ride", { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-canvas px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
      <AuthHero />
      <div className="flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-[36px] border border-line bg-surface p-8 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Create account</p>
          <h1 className="mt-3 text-4xl font-extrabold text-ink">Start with RideConnect.</h1>
          <div className="mt-8 space-y-4">
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full rounded-2xl border border-line px-4 py-3" placeholder="Full name" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-line px-4 py-3" placeholder="Email" />
            <input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="w-full rounded-2xl border border-line px-4 py-3" placeholder="Phone number" />
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" className="w-full rounded-2xl border border-line px-4 py-3" placeholder="Password" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "rider" | "driver" })} className="w-full rounded-2xl border border-line px-4 py-3">
              <option value="rider">Rider</option>
              <option value="driver">Driver</option>
            </select>
          </div>
          {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          <button type="submit" disabled={loading} className="mt-6 w-full rounded-2xl bg-accent px-5 py-4 text-sm font-bold text-white">
            {loading ? "Creating..." : "Create account"}
          </button>
          <p className="mt-6 text-sm text-muted">
            Already have an account?{" "}
            <Link to="/sign-in" className="font-semibold text-accent">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
