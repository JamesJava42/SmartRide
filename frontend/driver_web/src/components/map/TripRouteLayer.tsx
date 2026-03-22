import { divIcon } from "leaflet";
import { Marker, Polyline, Tooltip } from "react-leaflet";

import type { Coordinate, RouteCoordinate } from "../../types/ride";

function pinIcon(label: string, background: string) {
  return divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:999px;background:${background};color:white;font-size:12px;font-weight:700;border:3px solid rgba(255,255,255,0.95);box-shadow:0 8px 20px rgba(15,23,42,0.14)">${label}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

export function TripRouteLayer({
  pickup,
  dropoff,
  route,
}: {
  pickup: Coordinate | null;
  dropoff: Coordinate | null;
  route: RouteCoordinate[];
}) {
  return (
    <>
      {pickup ? (
        <Marker position={[pickup.latitude, pickup.longitude]} icon={pinIcon("P", "#0f766e")}>
          <Tooltip>Pickup</Tooltip>
        </Marker>
      ) : null}
      {dropoff ? (
        <Marker position={[dropoff.latitude, dropoff.longitude]} icon={pinIcon("D", "#2563eb")}>
          <Tooltip>Destination</Tooltip>
        </Marker>
      ) : null}
      {route.length > 1 ? (
        <Polyline positions={route.map((point) => [point.latitude, point.longitude] as [number, number])} pathOptions={{ color: "#2563eb", weight: 5, opacity: 0.8 }} />
      ) : null}
    </>
  );
}
