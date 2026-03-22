type RouteLocation = {
  label: string;
  latitude: number;
  longitude: number;
};

type RouteData = {
  pickup: RouteLocation;
  destination: RouteLocation;
  geometry: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
};

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

interface FetchRouteOptions {
  pickupPinnedLocation: RouteLocation;
  destinationPinnedLocation: RouteLocation;
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

export async function fetchRoute({ pickupPinnedLocation, destinationPinnedLocation }: FetchRouteOptions): Promise<RouteData> {
  return routeBetween(pickupPinnedLocation, destinationPinnedLocation);
}

export async function geocode(query: string): Promise<RouteLocation> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
    {
      headers: { Accept: "application/json" },
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
