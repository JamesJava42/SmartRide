import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";

import type { AddressResult, RideDriver, RideStatus } from "../../types/ride";
import styles from "./TrackingMap.module.css";

const pickupIcon = L.divIcon({
  className: "",
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#1A6B45;border:2px solid #fff;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const dropoffIcon = L.divIcon({
  className: "",
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#141A13;border:2px solid #fff;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const driverIcon = L.divIcon({
  className: "",
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#1A6B45;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.2);"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  map.fitBounds(points, { padding: [30, 30] });
  return null;
}

function ZoomControls() {
  const map = useMap();

  return (
    <div className={styles.zoomStack}>
      <button type="button" className={styles.zoomBtn} onClick={() => map.zoomIn()}>
        +
      </button>
      <button type="button" className={`${styles.zoomBtn} ${styles.zoomBtnBottom}`} onClick={() => map.zoomOut()}>
        −
      </button>
    </div>
  );
}

export function TrackingMap({
  pickup,
  dropoff,
  driver,
  geometry,
  status,
}: {
  pickup: AddressResult;
  dropoff: AddressResult;
  driver: RideDriver | null;
  geometry: [number, number][];
  status: RideStatus;
}) {
  const driverPoint =
    driver?.current_latitude != null && driver.current_longitude != null
      ? ([driver.current_latitude, driver.current_longitude] as [number, number])
      : null;
  const route = geometry.length > 1 ? geometry : [[pickup.latitude, pickup.longitude] as [number, number], [dropoff.latitude, dropoff.longitude] as [number, number]];
  const completedRoute = driverPoint ? [[pickup.latitude, pickup.longitude] as [number, number], driverPoint] : [];
  const remainingRoute = driverPoint ? [driverPoint, [dropoff.latitude, dropoff.longitude] as [number, number]] : route;

  return (
    <div className={styles.map}>
      <MapContainer center={[pickup.latitude, pickup.longitude]} zoom={13} zoomControl={false} style={{ width: "100%", height: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <ZoomControls />
        <Marker position={[pickup.latitude, pickup.longitude]} icon={pickupIcon}>
          <Tooltip permanent direction="top" offset={[0, -10]}>
            Pickup
          </Tooltip>
        </Marker>
        <Marker position={[dropoff.latitude, dropoff.longitude]} icon={dropoffIcon}>
          <Tooltip permanent direction="top" offset={[0, -10]}>
            Drop-off
          </Tooltip>
        </Marker>
        {completedRoute.length > 1 ? (
          <Polyline positions={completedRoute} pathOptions={{ color: "#1A6B45", weight: 2.5, opacity: 0.5, dashArray: "5, 4", lineCap: "round" }} />
        ) : null}
        <Polyline positions={remainingRoute} pathOptions={{ color: "#141A13", weight: 3, opacity: 0.72, lineCap: "round" }} />
        {driverPoint ? <Marker position={driverPoint} icon={driverIcon} /> : null}
        <FitBounds points={driverPoint ? [[pickup.latitude, pickup.longitude], [dropoff.latitude, dropoff.longitude], driverPoint] : [[pickup.latitude, pickup.longitude], [dropoff.latitude, dropoff.longitude]]} />
      </MapContainer>
    </div>
  );
}
