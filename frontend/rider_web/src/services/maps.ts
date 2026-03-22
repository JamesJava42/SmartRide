import type { CurrentLocation, RouteData, RouteLocation } from "../types/api";

interface FetchRouteOptions {
  pickupQuery?: string;
  destinationQuery?: string;
  pickupCurrentLocation?: CurrentLocation | null;
  pickupPinnedLocation?: CurrentLocation | null;
  destinationPinnedLocation?: CurrentLocation | null;
}

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    postcode?: string;
    state?: string;
  };
};

const KNOWN_PLACE_OVERRIDES: Record<string, RouteLocation> = {
  "lax": {
    label: "Los Angeles International Airport, Los Angeles, CA",
    latitude: 33.9422,
    longitude: -118.4036,
  },
  "lax airport": {
    label: "Los Angeles International Airport, Los Angeles, CA",
    latitude: 33.9422,
    longitude: -118.4036,
  },
  "los angeles international airport": {
    label: "Los Angeles International Airport, Los Angeles, CA",
    latitude: 33.9422,
    longitude: -118.4036,
  },
  "los angeles airport": {
    label: "Los Angeles International Airport, Los Angeles, CA",
    latitude: 33.9422,
    longitude: -118.4036,
  },
  "downtown la": {
    label: "Downtown Los Angeles, Los Angeles, CA",
    latitude: 34.0407,
    longitude: -118.2468,
  },
  "downtown los angeles": {
    label: "Downtown Los Angeles, Los Angeles, CA",
    latitude: 34.0407,
    longitude: -118.2468,
  },
};

const LOCATION_ALIASES: Record<string, string[]> = {
  "los angeles international airport": ["LAX", "LAX Airport", "Los Angeles airport", "LAX, Los Angeles, CA"],
  lax: ["Los Angeles International Airport", "LAX Airport, Los Angeles, CA"],
  "downtown la": ["Downtown Los Angeles, CA", "Downtown Los Angeles"],
};

function buildGeocodeCandidates(query: string) {
  const normalized = query.trim().toLowerCase();
  const candidates = new Set<string>([query.trim()]);

  for (const alias of LOCATION_ALIASES[normalized] ?? []) {
    candidates.add(alias);
  }

  if (!normalized.includes("california") && !normalized.includes(", ca")) {
    candidates.add(`${query.trim()}, California`);
    candidates.add(`${query.trim()}, CA`);
  }

  if (normalized.includes("international airport")) {
    candidates.add(query.replace(/international airport/i, "airport").trim());
  }

  if (normalized.includes("airport") && !normalized.includes("los angeles")) {
    candidates.add(`${query.trim()}, Los Angeles, CA`);
  }

  return [...candidates].filter(Boolean);
}

function scoreResult(query: string, result: NominatimResult) {
  const normalizedQuery = query.trim().toLowerCase();
  const display = result.display_name.toLowerCase();
  let score = 0;
  const houseNumberMatch = normalizedQuery.match(/\b(\d{2,6})\b/);
  const zipMatch = normalizedQuery.match(/\b(9\d{4})\b/);

  if (display.includes(normalizedQuery)) {
    score += 5;
  }
  if (houseNumberMatch && result.address?.house_number === houseNumberMatch[1]) {
    score += 8;
  }
  if (zipMatch && result.address?.postcode === zipMatch[1]) {
    score += 6;
  }
  if (display.includes("airport")) {
    score += 3;
  }
  if (display.includes("los angeles")) {
    score += 2;
  }
  if (display.includes("long beach")) {
    score += 2;
  }
  if (display.includes("hotel") || display.includes("hilton") || display.includes("sheraton") || display.includes("super 8")) {
    score -= 6;
  }
  if (display.includes("georgia") || display.includes("coffee county")) {
    score -= 10;
  }

  return score;
}

async function searchLocation(query: string): Promise<NominatimResult | null> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=us&q=${encodeURIComponent(query)}`,
    {
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error("Unable to geocode address");
  }

  const results = (await response.json()) as NominatimResult[];
  if (!results.length) {
    return null;
  }

  return [...results].sort((left, right) => scoreResult(query, right) - scoreResult(query, left))[0] ?? null;
}

function normalizeSuggestion(result: NominatimResult): RouteLocation {
  return {
    label: result.display_name,
    latitude: Number(result.lat),
    longitude: Number(result.lon),
  };
}

async function geocode(query: string): Promise<RouteLocation> {
  const normalized = query.trim().toLowerCase();
  const knownPlace = KNOWN_PLACE_OVERRIDES[normalized];
  if (knownPlace) {
    return knownPlace;
  }

  const candidates = buildGeocodeCandidates(query);

  for (const candidate of candidates) {
    const candidateOverride = KNOWN_PLACE_OVERRIDES[candidate.trim().toLowerCase()];
    if (candidateOverride) {
      return candidateOverride;
    }

    const match = await searchLocation(candidate);
    if (!match) {
      continue;
    }

    return {
      ...normalizeSuggestion(match),
    };
  }

  throw new Error(`No result found for "${query}"`);
}

export async function reverseGeocodeLocation(lat: number, lon: number): Promise<RouteLocation> {
  const response = await fetch(`https://photon.komoot.io/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`);
  if (!response.ok) {
    throw new Error("Unable to reverse geocode current location");
  }

  const data = (await response.json()) as {
    features?: Array<{
      properties?: {
        name?: string;
        street?: string;
        housenumber?: string;
        city?: string;
        state?: string;
        country?: string;
      };
    }>;
  };

  const feature = data.features?.[0];
  const props = feature?.properties;
  const label = [props?.name, [props?.housenumber, props?.street].filter(Boolean).join(" ").trim(), props?.city, props?.state]
    .filter(Boolean)
    .join(", ")
    .trim();

  return {
    label: label || `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
    latitude: lat,
    longitude: lon,
  };
}

export async function searchAddressSuggestions(query: string): Promise<RouteLocation[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) {
    return [];
  }

  const normalized = trimmed.toLowerCase();
  const override = KNOWN_PLACE_OVERRIDES[normalized];
  const suggestionMap = new Map<string, RouteLocation>();

  if (override) {
    suggestionMap.set(override.label, override);
  }

  const candidates = buildGeocodeCandidates(trimmed).slice(0, 4);
  for (const candidate of candidates) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=us&q=${encodeURIComponent(candidate)}`,
      { headers: { Accept: "application/json" } },
    );
    if (!response.ok) {
      continue;
    }
    const results = (await response.json()) as NominatimResult[];
    const ranked = [...results].sort((left, right) => scoreResult(trimmed, right) - scoreResult(trimmed, left));
    for (const result of ranked.slice(0, 5)) {
      const suggestion = normalizeSuggestion(result);
      suggestionMap.set(suggestion.label, suggestion);
    }
    if (suggestionMap.size >= 6) {
      break;
    }
  }

  return [...suggestionMap.values()].slice(0, 6);
}

async function routeBetween(pickup: RouteLocation, destination: RouteLocation): Promise<RouteData> {
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${pickup.longitude},${pickup.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`,
  );

  if (!response.ok) {
    throw new Error("Unable to fetch route");
  }

  const data = (await response.json()) as {
    routes?: Array<{
      distance: number;
      duration: number;
      geometry: {
        coordinates: [number, number][];
      };
    }>;
  };

  const route = data.routes?.[0];
  if (!route) {
    throw new Error("No route available");
  }

  return {
    pickup,
    destination,
    geometry: route.geometry.coordinates,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  };
}

export async function fetchRoute({
  pickupQuery,
  destinationQuery,
  pickupCurrentLocation,
  pickupPinnedLocation,
  destinationPinnedLocation,
}: FetchRouteOptions): Promise<RouteData> {
  const pickup = pickupCurrentLocation ?? pickupPinnedLocation ?? (pickupQuery ? await geocode(pickupQuery) : null);
  const destination = destinationPinnedLocation ?? (destinationQuery ? await geocode(destinationQuery) : null);

  if (!pickup || !destination) {
    throw new Error("Pickup and destination are required");
  }

  return routeBetween(pickup, destination);
}
