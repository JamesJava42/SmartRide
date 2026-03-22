import type { RouteData } from "../types/api";
import { formatMiles, formatMinutes } from "../utils/formatters";

export function RouteOverlayCard({ route, fareValue }: { route: RouteData; fareValue?: string | null }) {
  return (
    <div className="absolute bottom-4 left-4 right-4 rounded-[22px] border border-white/60 bg-surface/95 p-4 shadow-soft backdrop-blur md:bottom-6 md:left-auto md:right-6 md:top-6 md:w-[22rem]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Route ready</p>
      <h3 className="mt-2 text-xl font-bold text-ink">
        {route.pickup.label} to {route.destination.label}
      </h3>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-canvas p-3">
          <p className="text-xs text-muted">Fare</p>
          <p className="mt-1 text-lg font-bold text-ink">${fareValue ?? "--"}</p>
        </div>
        <div className="rounded-2xl bg-canvas p-3">
          <p className="text-xs text-muted">Distance</p>
          <p className="mt-1 text-lg font-bold text-ink">{formatMiles(route.distanceMeters)} mi</p>
        </div>
        <div className="rounded-2xl bg-canvas p-3">
          <p className="text-xs text-muted">Duration</p>
          <p className="mt-1 text-lg font-bold text-ink">{formatMinutes(route.durationSeconds)} min</p>
        </div>
      </div>
    </div>
  );
}
