import type { AddressResult } from "../types/ride";

const DEFAULT_BBOX: [number, number, number, number] = [-118.5, 33.5, -117.8, 34.2];
const DEFAULT_LAT = 33.8041;
const DEFAULT_LNG = -118.1874;

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
  };
};

type PhotonResponse = {
  features?: PhotonFeature[];
};

function buildLabel(feature: PhotonFeature): string {
  const parts = [
    feature.properties?.name,
    feature.properties?.street,
    feature.properties?.city,
    feature.properties?.state,
  ].filter(Boolean);

  return parts.join(", ");
}

function normalizeFeature(feature: PhotonFeature): AddressResult | null {
  const coords = feature.geometry?.coordinates;
  if (!coords) {
    return null;
  }

  return {
    display_name: buildLabel(feature) || "Unnamed place",
    latitude: coords[1],
    longitude: coords[0],
  };
}

export async function searchAddress(
  query: string,
  options?: {
    biasLat?: number;
    biasLng?: number;
    bbox?: [number, number, number, number];
  },
): Promise<AddressResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const bbox = options?.bbox ?? DEFAULT_BBOX;
  const params = new URLSearchParams({
    q: trimmed,
    limit: "5",
    lat: String(options?.biasLat ?? DEFAULT_LAT),
    lon: String(options?.biasLng ?? DEFAULT_LNG),
    bbox: bbox.join(","),
  });

  const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Unable to search address");
  }

  const data = (await response.json()) as PhotonResponse;
  return (data.features ?? []).map(normalizeFeature).filter(Boolean) as AddressResult[];
}

export async function reverseGeocode(lat: number, lng: number): Promise<AddressResult> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
  });

  const response = await fetch(`https://photon.komoot.io/reverse?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Unable to reverse geocode location");
  }

  const data = (await response.json()) as PhotonResponse;
  const first = (data.features ?? []).map(normalizeFeature).find(Boolean);
  if (!first) {
    return {
      display_name: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      latitude: lat,
      longitude: lng,
    };
  }
  return first;
}
