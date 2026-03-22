import { LocationInput } from "./LocationInput";
import { ModeTabs } from "./ModeTabs";
import { SuggestionChips } from "./SuggestionChips";
import type { RiderType, RideMode } from "../types/api";

interface SavedPlaceOption {
  label: string;
  address: string;
}

export function BookingSearchPanel(props: {
  mode: RideMode;
  pickupLocation: string;
  destinationLocation: string;
  timing: string;
  riderType: RiderType;
  savedPlaces: SavedPlaceOption[];
  recentSearches: string[];
  onModeChange: (mode: RideMode) => void;
  onPickupChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onTimingChange: (value: string) => void;
  onRiderTypeChange: (value: RiderType) => void;
  onSwapRoute: () => void;
  onSearch: () => void;
}) {
  const suggestionItems = [...props.savedPlaces.map((place) => place.address), ...props.recentSearches].slice(0, 6);

  return (
    <section className="rounded-[32px] border border-line bg-surface p-6 shadow-soft">
      <ModeTabs value={props.mode} onChange={props.onModeChange} />
      <div className="mt-6 space-y-4">
        <LocationInput label="Pickup" value={props.pickupLocation} onChange={props.onPickupChange} />
        <LocationInput label="Destination" value={props.destinationLocation} onChange={props.onDestinationChange} />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-muted">Pickup timing</span>
            <select
              value={props.timing}
              onChange={(event) => props.onTimingChange(event.target.value)}
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
            >
              <option>Leave now</option>
              <option>In 15 minutes</option>
              <option>Schedule later</option>
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-muted">Ride for</span>
            <select
              value={props.riderType}
              onChange={(event) => props.onRiderTypeChange(event.target.value as RiderType)}
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="self">For me</option>
              <option value="someone_else">Someone else</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
            Use current location
          </button>
          <button
            type="button"
            onClick={props.onSwapRoute}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink"
          >
            Swap route
          </button>
          <button type="button" className="rounded-full border border-dashed border-line px-4 py-2 text-sm font-semibold text-muted">
            Add stop
          </button>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted">Recent & saved</p>
          <SuggestionChips items={suggestionItems} onSelect={props.onDestinationChange} />
        </div>
        <button
          type="button"
          onClick={props.onSearch}
          className="w-full rounded-2xl bg-ink px-5 py-4 text-sm font-bold text-white transition hover:bg-[#0f1712]"
        >
          Search
        </button>
      </div>
    </section>
  );
}
