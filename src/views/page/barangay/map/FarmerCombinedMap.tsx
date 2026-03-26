import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Tooltip, useMap } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon } from 'lucide-react';

const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const FarmerCombinedMap = ({ farms, farmerName }: { farms: any[], farmerName: string }) => {
  const mapData = useMemo(() => {
    const data: any[] = [];
    farms.forEach((farm, idx) => {
      if (farm.farm_coordinates && Array.isArray(farm.farm_coordinates) && farm.farm_coordinates.length >= 3) {
        const coords = farm.farm_coordinates.map((c: any) => ({ lat: Number(c.lat), lng: Number(c.lng) }));

        let minLat = coords[0].lat, maxLat = coords[0].lat, minLng = coords[0].lng, maxLng = coords[0].lng;
        coords.forEach((c: any) => {
          if (c.lat < minLat) minLat = c.lat;
          if (c.lat > maxLat) maxLat = c.lat;
          if (c.lng < minLng) minLng = c.lng;
          if (c.lng > maxLng) maxLng = c.lng;
        });
        const center: LatLngExpression = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];

        data.push({
          id: idx, sitio: farm.farm_sitio, area: farm.total_area,
          positions: coords.map((c: any) => [c.lat, c.lng] as LatLngExpression), center
        });
      }
    });
    return data;
  }, [farms]);

  const MapBoundsUpdater = ({ data }: { data: any[] }) => {
    const map = useMap();
    useEffect(() => {
      if (data.length > 0) {
        const bounds = L.latLngBounds(data[0].positions);
        data.forEach(d => d.positions.forEach((p: any) => bounds.extend(p)));
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 17 });
      }
    }, [data, map]);
    return null;
  };

  if (mapData.length === 0) {
    return (
      <div className="w-full h-48 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 flex flex-col items-center justify-center text-gray-400">
        <MapIcon size={24} className="mb-2 opacity-50" />
        <p className="text-[10px] font-black uppercase tracking-widest">No Coordinates Available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden border border-emerald-200 dark:border-emerald-800/50 relative z-0 shadow-inner">
       <MapContainer center={mapData[0].center} zoom={16} style={{ height: "100%", width: "100%", zIndex: 0 }}>
         <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="&copy; Google Maps" />
         <MapBoundsUpdater data={mapData} />
         {mapData.map((farm) => (
           <React.Fragment key={farm.id}>
             <Polygon positions={farm.positions} pathOptions={{ color: '#10b981', weight: 3, fillColor: '#10b981', fillOpacity: 0.4 }} />
             <Marker position={farm.center} icon={customIcon}>
                <Tooltip permanent direction="top" offset={[0, -35]} className="bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white border-0 shadow-lg font-black uppercase tracking-widest text-[9px] px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  {farmerName} <br/><span className="text-emerald-600 dark:text-emerald-400 text-[8px]">Parcel {farm.id + 1} ({Number(farm.area).toFixed(2)} HA)</span>
                </Tooltip>
             </Marker>
           </React.Fragment>
         ))}
       </MapContainer>
    </div>
  );
};