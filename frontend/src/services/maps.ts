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
};

async function geocode(query: string): Promise<RouteLocation> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Unable to geocode address");
  }

  const results = (await response.json()) as NominatimResult[];
  const match = results[0];
  if (!match) {
    throw new Error(`No result found for "${query}"`);
  }

  return {
    label: match.display_name,
    latitude: Number(match.lat),
    longitude: Number(match.lon),
  };
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
  const pickup =
    pickupCurrentLocation ??
    pickupPinnedLocation ??
    (pickupQuery ? await geocode(pickupQuery) : null);
  const destination = destinationPinnedLocation ?? (destinationQuery ? await geocode(destinationQuery) : null);

  if (!pickup || !destination) {
    throw new Error("Pickup and destination are required");
  }

  return routeBetween(pickup, destination);
}
