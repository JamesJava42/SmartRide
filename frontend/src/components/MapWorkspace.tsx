import { useMemo } from "react";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";

import type { RouteData } from "../types/api";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { RouteOverlayCard } from "./RouteOverlayCard";

function makeIcon(background: string, border = "#ffffff") {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:18px;height:18px;border-radius:999px;background:${background};border:4px solid ${border};box-shadow:0 12px 18px rgba(23,33,27,.18)"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const pickupIcon = makeIcon("#17211b");
const currentLocationIcon = makeIcon("#2b7fff");
const destinationIcon = makeIcon("#3a8f5b");
const driverIcon = L.divIcon({
  className: "",
  html: `<span style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:999px;background:#17211b;color:#fff;border:3px solid #fff;box-shadow:0 12px 18px rgba(23,33,27,.18);font-size:14px">🚗</span>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function FitMap({
  route,
  currentLocation,
  driverPosition,
  draftPickup,
  draftDestination,
}: {
  route: RouteData | null;
  currentLocation?: [number, number] | null;
  driverPosition?: [number, number] | null;
  draftPickup?: [number, number] | null;
  draftDestination?: [number, number] | null;
}) {
  const map = useMap();

  useMemo(() => {
    const points: LatLngExpression[] = [];
    if (route) {
      points.push(...route.geometry.map(([lng, lat]) => [lat, lng] as LatLngExpression));
    }
    if (currentLocation) {
      points.push(currentLocation);
    }
    if (driverPosition) {
      points.push(driverPosition);
    }
    if (draftPickup) {
      points.push(draftPickup);
    }
    if (draftDestination) {
      points.push(draftDestination);
    }
    if (points.length === 1) {
      map.setView(points[0], 11, { animate: true });
      return;
    }
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
  }, [currentLocation, draftDestination, draftPickup, driverPosition, map, route]);

  return null;
}

function ClickHandler({ onMapClick }: { onMapClick?: (point: [number, number]) => void }) {
  useMapEvents({
    click(event) {
      onMapClick?.([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

export function MapWorkspace({
  routeLoading,
  routeData,
  fareValue,
  currentLocation,
  driverPosition,
  draftPickup,
  draftDestination,
  onMapClick,
  overlayTitle,
  overlayCaption,
  hideOverlay = false,
}: {
  routeLoading?: boolean;
  routeData: RouteData | null;
  fareValue?: string | null;
  currentLocation?: [number, number] | null;
  driverPosition?: [number, number] | null;
  draftPickup?: [number, number] | null;
  draftDestination?: [number, number] | null;
  onMapClick?: (point: [number, number]) => void;
  overlayTitle?: string;
  overlayCaption?: string;
  hideOverlay?: boolean;
}) {
  if (routeLoading) {
    return <LoadingSkeleton />;
  }

  const center: [number, number] = currentLocation ?? [33.7701, -118.1937];

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-[28px] border border-line bg-[#dfe8e1] xl:h-full xl:min-h-[calc(100vh-12rem)]">
      <MapContainer center={center} zoom={11} scrollWheelZoom className="h-[360px] w-full md:h-[460px] xl:h-full">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitMap
          route={routeData}
          currentLocation={currentLocation}
          driverPosition={driverPosition}
          draftPickup={draftPickup}
          draftDestination={draftDestination}
        />
        <ClickHandler onMapClick={onMapClick} />
        {currentLocation ? <Marker position={currentLocation} icon={currentLocationIcon} /> : null}
        {routeData ? (
          <>
            <Marker position={[routeData.pickup.latitude, routeData.pickup.longitude]} icon={pickupIcon}>
              <Tooltip direction="top" offset={[0, -8]} permanent>
                Pickup
              </Tooltip>
            </Marker>
            <Marker position={[routeData.destination.latitude, routeData.destination.longitude]} icon={destinationIcon}>
              <Tooltip direction="top" offset={[0, -8]} permanent>
                Drop-off
              </Tooltip>
            </Marker>
            <Polyline positions={routeData.geometry.map(([lng, lat]) => [lat, lng] as LatLngExpression)} pathOptions={{ color: "#535853", weight: 6 }} />
          </>
        ) : null}
        {!routeData && draftPickup ? (
          <Marker position={draftPickup} icon={pickupIcon}>
            <Tooltip direction="top" offset={[0, -8]} permanent>
              Pickup
            </Tooltip>
          </Marker>
        ) : null}
        {!routeData && draftDestination ? (
          <Marker position={draftDestination} icon={destinationIcon}>
            <Tooltip direction="top" offset={[0, -8]} permanent>
              Drop-off
            </Tooltip>
          </Marker>
        ) : null}
        {driverPosition ? (
          <Marker position={driverPosition} icon={driverIcon}>
            <Tooltip direction="top" offset={[0, -12]}>
              Driver
            </Tooltip>
          </Marker>
        ) : null}
      </MapContainer>
      {!hideOverlay ? (
        routeData ? (
          <RouteOverlayCard route={routeData} fareValue={fareValue} />
        ) : (
          <div className="absolute left-4 top-4 w-[min(92%,21rem)] rounded-[24px] border border-white/60 bg-surface/95 p-5 shadow-soft backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{overlayCaption ?? "Map Workspace"}</p>
            <h3 className="mt-2 text-2xl font-bold text-ink">{overlayTitle ?? "Start with your pickup and destination."}</h3>
          </div>
        )
      ) : null}
    </div>
  );
}
