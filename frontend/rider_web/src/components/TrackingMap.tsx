import type { RouteData } from "../types/api";
import { MapWorkspace } from "./MapWorkspace";

export function TrackingMap({
  routeData,
  driverPosition,
  fareValue,
  currentLocation,
  draftPickup,
  draftDestination,
  onMapClick,
  hideOverlay = false,
  edgeToEdge = false,
  showLocateButton = false,
}: {
  routeData: RouteData | null;
  driverPosition?: [number, number] | null;
  fareValue?: string | null;
  currentLocation?: [number, number] | null;
  draftPickup?: [number, number] | null;
  draftDestination?: [number, number] | null;
  onMapClick?: (point: [number, number]) => void;
  hideOverlay?: boolean;
  edgeToEdge?: boolean;
  showLocateButton?: boolean;
}) {
  return (
    <MapWorkspace
      routeData={routeData}
      driverPosition={driverPosition}
      fareValue={fareValue}
      currentLocation={currentLocation}
      draftPickup={draftPickup}
      draftDestination={draftDestination}
      onMapClick={onMapClick}
      overlayCaption="Tracking"
      overlayTitle="Follow your ride live."
      hideOverlay={hideOverlay}
      edgeToEdge={edgeToEdge}
      showLocateButton={showLocateButton}
    />
  );
}
