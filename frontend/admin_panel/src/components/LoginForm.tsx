import { FormEvent, useState } from "react";

type LoginFormProps = {
  title: string;
  subtitle: string;
  loading: boolean;
  error: string | null;
  onSubmit: (email: string, password: string) => Promise<void>;
};

export function LoginForm({ title, subtitle, loading, error, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(email, password);
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8 shadow-soft">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent">{title}</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Sign in</h1>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Email</span>
          <input
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Password</span>
          <input
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accentDark disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
