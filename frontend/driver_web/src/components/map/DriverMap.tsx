import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";

import type { ActiveTrip, Coordinate } from "../../types/ride";
import { TripRouteLayer } from "./TripRouteLayer";
import { VehicleMarker } from "./VehicleMarker";

function FitView({ currentLocation, trip }: { currentLocation: Coordinate | null; trip: ActiveTrip | null }) {
  const map = useMap();

  useEffect(() => {
    const points = [
      currentLocation,
      trip?.pickupLocation ?? null,
      trip?.dropoffLocation ?? null,
      ...(trip?.route ?? []),
    ].filter(Boolean) as Coordinate[];
    if (points.length === 0) {
      return;
    }
    if (points.length === 1) {
      map.setView([points[0].latitude, points[0].longitude], 14);
      return;
    }
    map.fitBounds(points.map((point) => [point.latitude, point.longitude] as [number, number]), { padding: [48, 48] });
  }, [currentLocation, map, trip]);

  return null;
}

export function DriverMap({ currentLocation, activeTrip }: { currentLocation: Coordinate | null; activeTrip: ActiveTrip | null }) {
  const fallbackCenter: [number, number] = currentLocation ? [currentLocation.latitude, currentLocation.longitude] : [33.7701, -118.1937];

  return (
    <div className="overflow-hidden rounded-[28px] border border-line bg-white shadow-sm">
      <div className="h-[300px] w-full sm:h-[360px] lg:h-[420px]">
        <MapContainer center={fallbackCenter} zoom={13} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitView currentLocation={currentLocation} trip={activeTrip} />
          {currentLocation ? <VehicleMarker position={currentLocation} label="Your vehicle" isActive /> : null}
          <TripRouteLayer pickup={activeTrip?.pickupLocation ?? null} dropoff={activeTrip?.dropoffLocation ?? null} route={activeTrip?.route ?? []} />
        </MapContainer>
      </div>
      <div className="border-t border-line bg-[#fbfaf7] px-4 py-3 text-sm text-muted">
        {activeTrip ? "Pickup and destination markers are live for the current trip." : "Your live vehicle location is centered on the map."}
      </div>
    </div>
  );
}
