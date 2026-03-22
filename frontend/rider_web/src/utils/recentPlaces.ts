import type { AddressResult } from "../types/ride";

const RECENT_PLACES_KEY = "rc_recent_places";
const MAX_RECENT_PLACES = 5;

export type RecentPlace = AddressResult & {
  saved_at: string;
};

export function readRecentPlaces(): RecentPlace[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_PLACES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as RecentPlace[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_PLACES) : [];
  } catch {
    return [];
  }
}

export function saveRecentPlace(place: AddressResult) {
  if (typeof window === "undefined") {
    return;
  }

  const nextItem: RecentPlace = {
    ...place,
    saved_at: new Date().toISOString(),
  };

  const next = [
    nextItem,
    ...readRecentPlaces().filter((item) => item.display_name !== place.display_name),
  ].slice(0, MAX_RECENT_PLACES);

  window.localStorage.setItem(RECENT_PLACES_KEY, JSON.stringify(next));
}
