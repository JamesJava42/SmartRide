export function AuthHero() {
  return (
    <div className="hidden rounded-[36px] bg-[linear-gradient(160deg,_rgba(58,143,91,0.95),_rgba(23,33,27,0.96))] p-10 text-white shadow-soft lg:block">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">RideConnect Access</p>
      <h1 className="mt-4 text-5xl font-extrabold leading-tight">Premium urban rides, with a cleaner auth flow.</h1>
      <p className="mt-5 max-w-md text-sm leading-7 text-white/80">
        Sign in to request rides, view activity, and manage saved places. Demo rider credentials are seeded for local development.
      </p>
      <div className="mt-10 space-y-4 rounded-[28px] border border-white/10 bg-white/10 p-6">
        <p className="text-sm font-semibold">Demo rider</p>
        <p className="text-sm text-white/80">Email: rider@rideconnect.local</p>
        <p className="text-sm text-white/80">Password: RideConnect123!</p>
      </div>
    </div>
  );
}
