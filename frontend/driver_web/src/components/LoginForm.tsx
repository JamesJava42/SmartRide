import { FormEvent, useState } from "react";
import type { RegistrationRegion } from "../types/auth";

type LoginFormProps = {
  title: string;
  subtitle: string;
  loading: boolean;
  error: string | null;
  onSubmit: (email: string, password: string) => Promise<void>;
  regions: RegistrationRegion[];
  regionsLoading: boolean;
  onRegister: (payload: { fullName: string; email: string; phoneNumber: string; password: string; regionId: string }) => Promise<void>;
};

export function LoginForm({ title, subtitle, loading, error, regions, regionsLoading, onSubmit, onRegister }: LoginFormProps) {
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [regionId, setRegionId] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);
    await onSubmit(email, password);
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (registerPassword !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (!regionId) {
      setLocalError("Choose the region you want to onboard in.");
      return;
    }
    setLocalError(null);
    setSuccessMessage(null);
    await onRegister({
      fullName,
      email,
      phoneNumber,
      password: registerPassword,
      regionId,
    });
    setSuccessMessage("Registration submitted. Your onboarding is now pending admin approval for the selected region.");
    setIsRegisterView(false);
    setPassword(registerPassword);
    setRegisterPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="w-full max-w-md [perspective:1400px]">
      <div className={`relative min-h-[620px] transition-transform duration-700 [transform-style:preserve-3d] ${isRegisterView ? "[transform:rotateY(180deg)]" : ""}`}>
        <div className="absolute inset-0 rounded-3xl border border-line bg-surface p-8 shadow-soft [backface-visibility:hidden]">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#2563eb]">{title}</p>
            <h1 className="mt-3 text-3xl font-semibold text-ink">Sign in</h1>
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Email</span>
              <input
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
                type="email"
                autoComplete="email"
                placeholder="driver@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Password</span>
              <input
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            {successMessage ? <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{successMessage}</div> : null}
            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            <button
              className="w-full rounded-2xl bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted">
            New to RideConnect?{" "}
            <button type="button" onClick={() => setIsRegisterView(true)} className="font-semibold text-[#2563eb]">
              Register now
            </button>
          </div>
        </div>

        <div className="absolute inset-0 rounded-3xl border border-line bg-surface p-8 shadow-soft [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#2563eb]">{title}</p>
            <h1 className="mt-3 text-3xl font-semibold text-ink">Create driver account</h1>
            <p className="mt-2 text-sm text-muted">Create your driver account and pick the region where you want admin review.</p>
          </div>

          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Full Name</span>
              <input
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
                type="text"
                autoComplete="name"
                placeholder="Ram Teja"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Email</span>
              <input
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
                type="email"
                autoComplete="email"
                placeholder="driver@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Phone Number</span>
              <input
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
                type="tel"
                autoComplete="tel"
                placeholder="+1 555 780 2235"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Region</span>
              <select
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
                value={regionId}
                onChange={(event) => setRegionId(event.target.value)}
                required
                disabled={regionsLoading}
              >
                <option value="">{regionsLoading ? "Loading regions..." : "Select your onboarding region"}</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}{region.city || region.state ? `, ${[region.city, region.state].filter(Boolean).join(", ")}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Password</span>
              <input
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
                type="password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Confirm Password</span>
              <input
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </label>

            {localError || error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{localError ?? error}</div> : null}

            <button
              className="w-full rounded-2xl bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={loading || regionsLoading}
            >
              {loading ? "Creating account..." : "Create driver account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <button type="button" onClick={() => setIsRegisterView(false)} className="font-semibold text-[#2563eb]">
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
