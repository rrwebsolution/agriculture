import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Custom Red Marker para sa tanang 79 ka barangay
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 🌟 GIDUGANG: Component nga mo-kontrol sa Map Camera para mo-follow sa coordinates
const MapController = ({ lat, lng }: { lat?: number | null, lng?: number | null }) => {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      // Mo-fly ang map sa saktong location with Zoom Level 15
      map.flyTo([lat, lng], 15, { animate: true, duration: 1.5 });
    }
  }, [lat, lng, map]);

  return null; // Wala ni syay UI, tig-kontrol ra ni sa camera
};

interface GingoogGlobalMapProps {
  barangays: any[];
  onBarangayClick: (id: number) => void;
  centerLat?: number | null; // 🌟 GIDUGANG
  centerLng?: number | null; // 🌟 GIDUGANG
}

export const GingoogGlobalMap: React.FC<GingoogGlobalMapProps> = ({ 
  barangays, 
  onBarangayClick,
  centerLat,
  centerLng
}) => {
  
  // Center of Gingoog City (approximate coordinates)
  const gingoogCenter: [number, number] = [8.8234, 125.1234];

  // 🌟 GENERATE STATIC MARKERS PARA SA 79 BARANGAYS
  const mapMarkers = useMemo(() => {
    return barangays.map((b: any, index: number) => {
      let lat = null;
      let lng = null;

      // 1. 🌟 GIDUGANG: Susiha UNA kung naa bay gi-edit nga latitude & longitude ang barangay
      if (b.latitude && b.longitude) {
        lat = Number(b.latitude);
        lng = Number(b.longitude);
      } 
      // 2. Kung wala, tistingan og pangita gikan sa mga farmers ani nga barangay
      else if (b.farmersList) {
        for (const f of b.farmersList) {
          if (f.farms_list && f.farms_list.length > 0 && f.farms_list[0].farm_coordinates && f.farms_list[0].farm_coordinates.length > 0) {
            lat = Number(f.farms_list[0].farm_coordinates[0].lat);
            lng = Number(f.farms_list[0].farm_coordinates[0].lng);
            break; 
          }
        }
      }

      // 3. KUNG WALA GYUD: Mag-generate tag approximate / fake location around Gingoog
      if (!lat || !lng) {
        const radius = 0.05; // 5km spread
        const angle = (index / barangays.length) * Math.PI * 2;
        lat = gingoogCenter[0] + Math.cos(angle) * radius * (Math.random() + 0.5);
        lng = gingoogCenter[1] + Math.sin(angle) * radius * (Math.random() + 0.5);
      }

      return {
        id: b.id,
        name: b.name,
        lat,
        lng,
        farmersCount: b.farmersList?.length || 0,
        type: b.type
      };
    });
  }, [barangays]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative z-0">
      
      {/* Overlay Instructions */}
      <div className="absolute top-4 left-4 z-400 pointer-events-none">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-red-500/20 flex items-center gap-2">
          <MapPin size={14} className="text-red-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white">
            {barangays.length === 1 ? `${barangays[0].name} Map View` : 'Gingoog City Master Map'}
          </span>
        </div>
      </div>

      <MapContainer 
        center={gingoogCenter} 
        zoom={11} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        {/* 🌟 GIDUGANG: Tawaga ang MapController para mo-follow ang camera sa map */}
        <MapController lat={centerLat} lng={centerLng} />

        {/* Google Maps Satellite Hybrid */}
        <TileLayer 
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" 
          attribution="&copy; Google Maps" 
        />

        {/* MO-DISPLAY ANG RED MARKERS */}
        {mapMarkers.map((marker) => (
          <Marker 
            key={marker.id} 
            position={[marker.lat, marker.lng]} 
            icon={redIcon}
            eventHandlers={{
              click: () => onBarangayClick(marker.id)
            }}
          >
            <Tooltip direction="top" offset={[0, -35]} className="font-black uppercase text-[10px]">
              {marker.name}
            </Tooltip>
            <Popup className="font-sans">
              <div className="text-center p-1">
                <h4 className="font-black uppercase text-slate-800 mb-1">{marker.name}</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{marker.type}</p>
                <div className="mt-2 inline-block px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {marker.farmersCount} Farmers
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
};