import { divIcon } from "leaflet";
import { Marker, Tooltip } from "react-leaflet";

import type { Coordinate } from "../../types/ride";

function createVehicleIcon(isActive: boolean) {
  return divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:999px;background:${
      isActive ? "#1f9d62" : "#334155"
    };box-shadow:0 10px 24px rgba(15,23,42,0.18);color:white;font-size:20px;border:3px solid rgba(255,255,255,0.95)">🚗</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

export function VehicleMarker({ position, label, isActive = true }: { position: Coordinate; label: string; isActive?: boolean }) {
  return (
    <Marker position={[position.latitude, position.longitude]} icon={createVehicleIcon(isActive)}>
      <Tooltip direction="top" offset={[0, -18]} opacity={1}>
        {label}
      </Tooltip>
    </Marker>
  );
}
