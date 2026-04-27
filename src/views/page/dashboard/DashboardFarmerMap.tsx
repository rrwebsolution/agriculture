import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Tooltip, Popup, useMap } from 'react-leaflet';
import L, { type LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, Sprout, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../../lib/utils';

const farmerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33],
});

const parseCoord = (v: any): number => {
  if (v == null) return NaN;
  const n = parseFloat(String(v));
  return isFinite(n) ? n : NaN;
};

const getPolygonCenter = (positions: LatLngTuple[]): LatLngTuple => {
  if (!positions.length) return [8.8222485, 125.1158747];
  const lats = positions.map((p) => p[0]);
  const lngs = positions.map((p) => p[1]);
  return [
    (Math.min(...lats) + Math.max(...lats)) / 2,
    (Math.min(...lngs) + Math.max(...lngs)) / 2,
  ];
};

const MapFocusController = ({ target }: { target: { center: LatLngTuple; zoom: number; token: number } | null }) => {
  const map = useMap();
  React.useEffect(() => {
    if (!target) return;
    map.flyTo(target.center, target.zoom, { animate: true, duration: 1.1 });
  }, [map, target]);
  return null;
};

const dangerZoneIcon = (color: string, fill: string) =>
  L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:36px;height:42px;display:flex;flex-direction:column;align-items:center;">
        <!-- Pulsing glow ring -->
        <div style="
          position:absolute;top:0;left:0;width:36px;height:36px;border-radius:10px;
          background:${fill};opacity:0.25;
          animation:hz-pulse 2s ease-in-out infinite;
        "></div>
        <!-- Badge -->
        <div style="
          position:relative;width:36px;height:36px;border-radius:10px;
          background:${fill};border:2.5px solid ${color};
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 12px ${color}55;
          animation:hz-bob 2.4s ease-in-out infinite;
        ">
          <span style="font-size:18px;font-weight:900;color:${color};line-height:1;margin-top:-1px;">!</span>
        </div>
        <!-- Tail -->
        <div style="
          width:0;height:0;
          border-left:6px solid transparent;
          border-right:6px solid transparent;
          border-top:7px solid ${color};
          margin-top:-1px;
        "></div>
        <style>
          @keyframes hz-pulse {
            0%,100%{transform:scale(1);opacity:.25}
            50%{transform:scale(1.35);opacity:.08}
          }
          @keyframes hz-bob {
            0%,100%{transform:translateY(0)}
            50%{transform:translateY(-4px)}
          }
        </style>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    tooltipAnchor: [0, -38],
  });

interface Props {
  farmers: any[];
  dangerZones: any[];
  loading?: boolean;
}

export default function DashboardFarmerMap({ farmers, dangerZones, loading }: Props) {
  const [showFarms, setShowFarms] = useState(true);
  const [cityBoundary, setCityBoundary] = useState<LatLngTuple[][]>([]);

  useEffect(() => {
    fetch(
      'https://nominatim.openstreetmap.org/search?q=Gingoog+City,+Misamis+Oriental,+Philippines&format=geojson&limit=1&polygon_geojson=1',
      { headers: { 'Accept-Language': 'en' } }
    )
      .then(r => r.json())
      .then(data => {
        const geom = data?.features?.[0]?.geometry;
        if (!geom) return;

        if (geom.type === 'Polygon') {
          setCityBoundary([geom.coordinates[0].map(([lng, lat]: [number, number]) => [lat, lng] as LatLngTuple)]);
        } else if (geom.type === 'MultiPolygon') {
          setCityBoundary(
            geom.coordinates.map((poly: [number, number][][]) =>
              poly[0].map(([lng, lat]: [number, number]) => [lat, lng] as LatLngTuple)
            )
          );
        }
      })
      .catch(() => {});
  }, []);
  const [showDangerZones, setShowDangerZones] = useState(true);
  const [focusTarget, setFocusTarget] = useState<{ center: LatLngTuple; zoom: number; token: number } | null>(null);

  const farmPlots = useMemo(() => {
    const plots: { farmerId: number; farmerName: string; crop: string; barangay: string; positions: LatLngTuple[]; center: LatLngTuple }[] = [];
    farmers.forEach((farmer: any) => {
      const name = `${farmer.first_name || ''} ${farmer.last_name || ''}`.trim() || farmer.name || '—';
      const crop = typeof farmer.crop === 'string' ? farmer.crop : farmer.crop?.category ?? farmer.crop_name ?? '—';
      const barangay = typeof farmer.barangay === 'string' ? farmer.barangay : farmer.barangay?.name ?? farmer.farm_location?.name ?? '—';

      (farmer.farms_list || []).forEach((farm: any) => {
        const rawCoords: { lat: any; lng: any }[] = farm.farm_coordinates || [];
        const positions: LatLngTuple[] = rawCoords
          .filter((c) => c != null)
          .map((c) => [parseCoord(c.lat), parseCoord(c.lng)] as LatLngTuple)
          .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng));

        if (positions.length >= 3) {
          plots.push({ farmerId: farmer.id, farmerName: name, crop, barangay, positions, center: getPolygonCenter(positions) });
        }
      });
    });
    return plots;
  }, [farmers]);

  const hazardZones = useMemo(() => {
    return (dangerZones || [])
      .filter((z: any) => String(z.status || '').toLowerCase() === 'active')
      .map((z: any) => ({
        id: z.id,
        name: z.name,
        zone_type: z.zone_type || 'Hazard',
        color: z.color || '#dc2626',
        fillColor: z.fill_color || z.fillColor || '#f87171',
        positions: (z.positions || [])
          .filter((p: any) => p != null)
          .map((p: any) => [parseCoord(p.lat), parseCoord(p.lng)] as LatLngTuple)
          .filter(([lat, lng]: LatLngTuple) => !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)),
      }))
      .filter((z: any) => z.positions.length >= 3);
  }, [dangerZones]);

  const farmersWithPlots = useMemo(() => new Set(farmPlots.map((p) => p.farmerId)).size, [farmPlots]);

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
          <div className="h-full bg-primary w-[40%] animate-progress-loop" />
        </div>
      )}

      <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-white">Agricultural Land Map</h3>
          <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">
            {farmPlots.length} farm {farmPlots.length === 1 ? 'plot' : 'plots'} · {farmersWithPlots} {farmersWithPlots === 1 ? 'farmer' : 'farmers'} · {hazardZones.length} danger {hazardZones.length === 1 ? 'zone' : 'zones'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFarms((v) => !v)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer',
              showFarms
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30'
                : 'bg-gray-50 dark:bg-slate-800 text-gray-400 border-gray-200 dark:border-slate-700'
            )}
          >
            {showFarms ? <Eye size={13} /> : <EyeOff size={13} />}
            <Sprout size={13} />
            Farm Plots
          </button>
          <button
            onClick={() => setShowDangerZones((v) => !v)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer',
              showDangerZones
                ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30'
                : 'bg-gray-50 dark:bg-slate-800 text-gray-400 border-gray-200 dark:border-slate-700'
            )}
          >
            {showDangerZones ? <Eye size={13} /> : <EyeOff size={13} />}
            <AlertTriangle size={13} />
            Danger Zones
          </button>
        </div>
      </div>

      <div className="h-120 w-full relative z-0">
        {loading && farmPlots.length === 0 ? (
          <div className="h-full bg-gray-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading map data…</p>
          </div>
        ) : (
          <MapContainer
            center={[8.8222485, 125.1158747]}
            zoom={12}
            scrollWheelZoom
            style={{ height: '100%', width: '100%', zIndex: 0 }}
          >
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              attribution="&copy; Google Maps"
              maxNativeZoom={20}
              maxZoom={22}
            />

            <MapFocusController target={focusTarget} />

            {/* Gingoog City boundary */}
            {cityBoundary.map((ring, i) => (
              <Polygon
                key={`city-boundary-${i}`}
                positions={ring}
                pathOptions={{
                  color: '#3b82f6',
                  weight: 2.5,
                  dashArray: '8 5',
                  fillOpacity: 0,
                  opacity: 0.8,
                }}
              />
            ))}

            {showFarms && farmPlots.map((plot, idx) => (
              <React.Fragment key={`farm-${plot.farmerId}-${idx}`}>
                <Polygon
                  positions={plot.positions}
                  pathOptions={{ color: '#10b981', weight: 2, fillColor: '#10b981', fillOpacity: 0.3 }}
                />
                <Marker position={plot.center} icon={farmerIcon}>
                  <Tooltip direction="top" offset={[0, -28]} opacity={1}>
                    <div className="min-w-32">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Farmer</p>
                      <p className="text-sm font-black text-slate-800 mt-0.5">{plot.farmerName}</p>
                      <p className="text-[10px] font-bold text-emerald-600 mt-0.5">{plot.crop}</p>
                      <p className="text-[10px] font-bold text-slate-500">{plot.barangay}</p>
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="space-y-1 p-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Farmer</p>
                      <p className="text-sm font-black text-slate-800">{plot.farmerName}</p>
                      <p className="text-[10px] font-bold text-emerald-600">Crop: {plot.crop}</p>
                      <p className="text-[10px] font-bold text-slate-500">Barangay: {plot.barangay}</p>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}

            {showDangerZones && hazardZones.map((zone) => (
              <React.Fragment key={`zone-${zone.id}`}>
                <Polygon
                  positions={zone.positions}
                  pathOptions={{ color: zone.color, weight: 2, fillColor: zone.fillColor, fillOpacity: 0.2 }}
                />
                <Marker
                  position={getPolygonCenter(zone.positions)}
                  icon={dangerZoneIcon(zone.color, zone.fillColor)}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <div className="min-w-32">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Danger Zone</p>
                      <p className="text-sm font-black text-slate-800 mt-0.5">{zone.name}</p>
                      <p className="text-[10px] font-bold mt-0.5" style={{ color: zone.color }}>{zone.zone_type}</p>
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="space-y-1 p-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Danger Zone</p>
                      <p className="text-sm font-black text-slate-800">{zone.name}</p>
                      <p className="text-[10px] font-bold" style={{ color: zone.color }}>{zone.zone_type}</p>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
          </MapContainer>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-400/60 border-2 border-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Farm Plots</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-300/50 border-2 border-rose-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Danger Zones</span>
        </div>
        {cityBoundary.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-1.5 rounded border-2 border-dashed border-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Gingoog City</span>
          </div>
        )}
        {hazardZones.length > 0 && (
          <div className="flex flex-wrap gap-2 ml-auto">
            {hazardZones.map((zone) => (
              <button
                key={zone.id}
                type="button"
                onClick={() => setFocusTarget({ center: getPolygonCenter(zone.positions), zoom: 16, token: Date.now() })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-sm"
                style={{ color: zone.color, borderColor: zone.color, backgroundColor: `${zone.fillColor}22` }}
              >
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: zone.color }} />
                {zone.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
