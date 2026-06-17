import React, { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

const barangayMapPinIcon = L.divIcon({
  html: `
    <div class="relative flex h-9 w-9 items-center justify-center">
      <svg viewBox="0 0 24 24" class="h-9 w-9 drop-shadow-xl" fill="#ef4444" stroke="#991b1b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" fill="#ffffff" stroke="#991b1b" stroke-width="1.5" />
      </svg>
    </div>
  `,
  className: 'barangay-map-pin-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const MapController = ({ lat, lng }: { lat?: number | null; lng?: number | null }) => {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 15, { animate: true, duration: 1.5 });
    }
  }, [lat, lng, map]);

  return null;
};

interface GingoogGlobalMapProps {
  barangays: any[];
  centerLat?: number | null;
  centerLng?: number | null;
}

export const GingoogGlobalMap: React.FC<GingoogGlobalMapProps> = ({
  barangays,
  centerLat,
  centerLng,
}) => {
  const gingoogCenter: [number, number] = [8.8234, 125.1234];
  const barangaysWithCoordinates = barangays.filter((barangay: any) => {
    const lat = Number(barangay?.latitude);
    const lng = Number(barangay?.longitude);
    return !Number.isNaN(lat) && !Number.isNaN(lng) && barangay?.latitude && barangay?.longitude;
  });

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative z-0">
      <div className="absolute top-4 left-4 z-400 pointer-events-none">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-primary/20 flex items-center gap-2">
          <MapPin size={14} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white">
            {barangays.length === 1 ? `${barangays[0].name} Map View` : 'Gingoog City Master Map'}
          </span>
        </div>
      </div>

      <MapContainer
        center={gingoogCenter}
        zoom={11}
        scrollWheelZoom
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <MapController lat={centerLat} lng={centerLng} />
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          attribution="&copy; Google Maps"
        />
        {barangaysWithCoordinates.map((barangay: any) => {
          const lat = Number(barangay.latitude);
          const lng = Number(barangay.longitude);

          return (
            <Marker key={barangay.id || `${barangay.name}-${lat}-${lng}`} position={[lat, lng]} icon={barangayMapPinIcon}>
              <Tooltip direction="top" offset={[0, -38]} permanent={barangaysWithCoordinates.length === 1} className="font-black uppercase text-[10px] text-slate-900">
                {barangay.name}
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
