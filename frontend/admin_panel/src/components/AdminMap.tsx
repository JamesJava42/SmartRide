import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import styles from './AdminMap.module.css';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

interface MapMarker {
  id: string;
  position: [number, number];
  type: 'driver' | 'rider' | 'pickup' | 'dropoff';
  label?: string;
  popupContent?: string;
}

interface Props {
  center?: [number, number];
  zoom?: number;
  height?: string;
  markers?: MapMarker[];
  onMarkerClick?: (id: string) => void;
}

function createMarkerIcon(type: MapMarker['type']) {
  const colors: Record<MapMarker['type'], string> = {
    driver: '#1A6B45',
    rider: '#2563EB',
    pickup: '#059669',
    dropoff: '#374151',
  };
  const color = colors[type];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
    <circle cx="14" cy="14" r="10" fill="${color}" stroke="white" stroke-width="2.5"/>
  </svg>`;
  return L.divIcon({
    className: '',
    html: svg,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

export function AdminMap({ center = [33.8041, -118.1874], zoom = 12, height = '100%', markers = [], onMarkerClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { center, zoom, zoomControl: true, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const existingIds = new Set(markersRef.current.keys());
    const newIds = new Set(markers.map((m) => m.id));

    // Remove old markers
    existingIds.forEach((id) => {
      if (!newIds.has(id)) {
        markersRef.current.get(id)?.remove();
        markersRef.current.delete(id);
      }
    });

    // Add/update markers
    markers.forEach((m) => {
      let marker = markersRef.current.get(m.id);
      if (!marker) {
        marker = L.marker(m.position, { icon: createMarkerIcon(m.type) }).addTo(map);
        if (m.popupContent) marker.bindPopup(m.popupContent);
        if (onMarkerClick) marker.on('click', () => onMarkerClick(m.id));
        markersRef.current.set(m.id, marker);
      } else {
        marker.setLatLng(m.position);
        if (m.popupContent) marker.setPopupContent(m.popupContent);
      }
    });

    // Fit bounds if we have markers
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => m.position));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [markers, onMarkerClick]);

  return (
    <div className={styles.wrap} style={{ height }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
