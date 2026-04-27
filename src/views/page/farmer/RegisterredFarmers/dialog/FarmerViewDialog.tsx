import React, { useEffect, useState } from 'react';
import {
  X, MapPin, Fingerprint, LandPlot, Sprout,
  Building2, User, Waves, HandCoins, Package,
  ClipboardCheck, Ban, Map as MapIcon, Compass, Calendar, Ruler,
  AlertTriangle, ShieldCheck
} from 'lucide-react';
import { cn } from '../../../../../lib/utils';
import { useAppSelector } from '../../../../../store/hooks'; 

import { MapContainer, TileLayer, Polygon, Marker, useMap, Tooltip } from 'react-leaflet';
import L, { type LatLngExpression, type LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 🌟 FIX LEAFLET MARKER ICON
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 🌟 CUSTOM RED MARKER ICON
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 🌟 FUNCTION PARA MAKUHA ANG PINAKA-TUNGA SA YUTA (CENTROID)
const getCentroid = (coords: {lat: number, lng: number}[], defaultCenter: LatLngTuple): LatLngExpression => {
  if (!coords || coords.length === 0) return defaultCenter;
  if (coords.length < 3) return [coords[0].lat, coords[0].lng];

  let minLat = coords[0].lat, maxLat = coords[0].lat;
  let minLng = coords[0].lng, maxLng = coords[0].lng;

  coords.forEach(c => {
    if (c.lat < minLat) minLat = c.lat;
    if (c.lat > maxLat) maxLat = c.lat;
    if (c.lng < minLng) minLng = c.lng;
    if (c.lng > maxLng) maxLng = c.lng;
  });

  return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
};

const getPolygonCenter = (positions: LatLngTuple[], defaultCenter: LatLngTuple): LatLngExpression => {
  if (!positions || positions.length === 0) return defaultCenter;

  let minLat = positions[0][0], maxLat = positions[0][0];
  let minLng = positions[0][1], maxLng = positions[0][1];

  positions.forEach(([lat, lng]) => {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  });

  return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
};

const getDangerZoneMarkerIcon = (color: string, fillColor: string) =>
  L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:36px;height:42px;display:flex;flex-direction:column;align-items:center;">
        <div style="position:absolute;top:0;left:0;width:36px;height:36px;border-radius:10px;background:${fillColor};opacity:0.25;animation:hz-pulse 2s ease-in-out infinite;"></div>
        <div style="position:relative;width:36px;height:36px;border-radius:10px;background:${fillColor};border:2.5px solid ${color};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px ${color}55;animation:hz-bob 2.4s ease-in-out infinite;">
          <span style="font-size:18px;font-weight:900;color:${color};line-height:1;margin-top:-1px;">!</span>
        </div>
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid ${color};margin-top:-1px;"></div>
        <style>
          @keyframes hz-pulse{0%,100%{transform:scale(1);opacity:.25}50%{transform:scale(1.35);opacity:.08}}
          @keyframes hz-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        </style>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    tooltipAnchor: [0, -38],
  });

const isPointInPolygon = (point: LatLngTuple, polygon: LatLngTuple[]) => {
  const [lat, lng] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i];
    const [latJ, lngJ] = polygon[j];
    const intersect = (lngI > lng) !== (lngJ > lng) &&
      lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI + Number.EPSILON) + latI;
    if (intersect) inside = !inside;
  }
  return inside;
};

const toXY = (lat: number, lng: number, latRef: number) => {
  const R = 6371000;
  return {
    x: ((lng * Math.PI) / 180) * R * Math.cos((latRef * Math.PI) / 180),
    y: ((lat * Math.PI) / 180) * R,
  };
};

const distancePointToPolygonMeters = (point: LatLngTuple, polygon: LatLngTuple[]) => {
  if (!polygon || polygon.length < 3) return Number.POSITIVE_INFINITY;
  if (isPointInPolygon(point, polygon)) return 0;
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const latRef = point[0];
    const P = toXY(point[0], point[1], latRef);
    const A = toXY(a[0], a[1], latRef);
    const B = toXY(b[0], b[1], latRef);
    const ABx = B.x - A.x, ABy = B.y - A.y;
    const ab2 = ABx * ABx + ABy * ABy;
    const t = ab2 === 0 ? 0 : Math.max(0, Math.min(1, ((P.x - A.x) * ABx + (P.y - A.y) * ABy) / ab2));
    const dx = P.x - (A.x + ABx * t), dy = P.y - (A.y + ABy * t);
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < min) min = d;
  }
  return min;
};

const computeFarmHazard = (
  coords: { lat: number; lng: number }[],
  zones: HazardZoneRecord[]
) => {
  if (!coords || coords.length === 0 || zones.length === 0)
    return { state: 'safe' as const, zone: null as HazardZoneRecord | null, distance: null as number | null };

  let insideZone: HazardZoneRecord | null = null;
  let nearestZone: HazardZoneRecord | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const zone of zones) {
    for (const coord of coords) {
      const point: LatLngTuple = [coord.lat, coord.lng];
      if (isPointInPolygon(point, zone.positions)) { insideZone = zone; break; }
      const d = distancePointToPolygonMeters(point, zone.positions);
      if (d < nearestDistance) { nearestDistance = d; nearestZone = zone; }
    }
    if (insideZone) break;
  }

  if (insideZone) return { state: 'danger' as const, zone: insideZone, distance: 0 };
  if (nearestZone && nearestDistance <= 120)
    return { state: 'near' as const, zone: nearestZone, distance: nearestDistance };
  return { state: 'safe' as const, zone: nearestZone, distance: nearestDistance === Number.POSITIVE_INFINITY ? null : nearestDistance };
};

const MapFocusController = ({ target }: { target: { center: LatLngExpression; zoom: number; token: number } | null }) => {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    map.flyTo(target.center, target.zoom, { animate: true, duration: 1.1 });
  }, [map, target]);

  return null;
};

const MapUpdater: React.FC<{ coords: any[], center: LatLngExpression }> = ({ coords, center }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      map.setView(center, 16);
    }
  }, [coords, center, map]);
  return null;
};

// 🌟 AUTO-ZOOM PARA MA-IGO TANANG PARCELS SA MASTER MAP
const GlobalMapBoundsUpdater = ({ farms }: { farms: any[] }) => {
  const map = useMap();
  useEffect(() => {
    const allCoords = farms.flatMap(f => f.farm_coordinates || []);
    if (allCoords.length >= 3) {
      const bounds = L.latLngBounds(allCoords.map((c: any) => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
    }
  }, [farms, map]);
  return null;
};

interface FarmerViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  farmer: any;
}

interface HazardZoneRecord {
  id: string | number;
  name: string;
  zone_type?: string;
  description?: string;
  color: string;
  fillColor: string;
  positions: LatLngTuple[];
}

const FarmerViewDialog: React.FC<FarmerViewDialogProps> = ({ isOpen, onClose, farmer }) => {
  const barangays = useAppSelector((state) => state.farmer.barangays || []);
  const crops = useAppSelector((state) => state.farmer.crops || []);
  const cooperatives = useAppSelector((state) => state.farmer.cooperatives || []); // 🌟 ADDED COOPERATIVES GIKAN REDUX
  const dangerZoneRecords = useAppSelector((state: any) => state.farmer.dangerZones || []);
  const hazardZones = React.useMemo<HazardZoneRecord[]>(
    () =>
      (dangerZoneRecords || [])
        .filter((zone: any) => String(zone.status || '').toLowerCase() === 'active')
        .map((zone: any) => ({
          ...zone,
          color: zone.color || '#dc2626',
          fillColor: zone.fill_color || zone.fillColor || '#f87171',
          positions: (zone.positions || [])
            .map((position: any) => [Number(position.lat), Number(position.lng)] as LatLngTuple)
            .filter((position: LatLngTuple) => !Number.isNaN(position[0]) && !Number.isNaN(position[1])),
        }))
        .filter((zone: HazardZoneRecord) => zone.positions.length >= 3),
    [dangerZoneRecords]
  );
  const [parcelZoneTargets, setParcelZoneTargets] = useState<Record<number, { center: LatLngExpression; zoom: number; token: number } | null>>({});
  const [expandedCoords, setExpandedCoords] = useState<Record<number, boolean>>({});
  const COORDS_LIMIT = 8;
  const [globalZoneTarget, setGlobalZoneTarget] = useState<{ center: LatLngExpression; zoom: number; token: number } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setParcelZoneTargets({});
      setGlobalZoneTarget(null);
    }
  }, [isOpen]);

  if (!isOpen || !farmer) return null;

  const formatCurrency = (amount: string | number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(amount));

  const isCoopMember = Number(farmer.is_coop_member) === 1;

  // 🌟 PARSE FARMS
  let parsedFarms: any[] = [];
  if (farmer.farms_list) {
    parsedFarms = typeof farmer.farms_list === 'string' ? JSON.parse(farmer.farms_list) : farmer.farms_list;
  } else if (farmer.farm_barangay_id) {
    parsedFarms = [{
      farm_barangay_id: farmer.farm_barangay_id, farm_sitio: farmer.farm_sitio, crop_id: farmer.crop_id,
      ownership_type: farmer.ownership_type, total_area: farmer.total_area, topography: farmer.topography,
      irrigation_type: farmer.irrigation_type,
      soil_type: farmer.soil_type,
      gpx_file_name: farmer.gpx_file_path,
      farm_coordinates: farmer.farm_coordinates ? (typeof farmer.farm_coordinates === 'string' ? JSON.parse(farmer.farm_coordinates) : farmer.farm_coordinates) : []
    }];
  }

  // 🌟 PARSE ASSISTANCE
  let parsedAssistances: any[] = [];
  if (farmer.assistances_list) {
    parsedAssistances = typeof farmer.assistances_list === 'string' ? JSON.parse(farmer.assistances_list) : farmer.assistances_list;
  } else if (farmer.program_name) {
    parsedAssistances = [{
      program_name: farmer.program_name, assistance_type: farmer.assistance_type,
      date_released: farmer.date_released, quantity: farmer.quantity,
      total_cost: farmer.total_cost, funding_source: farmer.funding_source
    }];
  }

  // 🌟 PARSE MULTIPLE COOPERATIVES
  let parsedCoopIds: string[] = [];
  try {
    if (Array.isArray(farmer.cooperative_id)) {
        parsedCoopIds = farmer.cooperative_id.map((id:any) => id.toString());
    } else if (typeof farmer.cooperative_id === 'string' && farmer.cooperative_id.startsWith('[')) {
        parsedCoopIds = JSON.parse(farmer.cooperative_id).map((id:any) => id.toString());
    } else if (farmer.cooperative_id) {
        parsedCoopIds = farmer.cooperative_id.toString().split(',').map((id: string) => id.trim());
    }
  } catch(e){}

  // 🌟 I-MAP ANG IDs PADULONG SA ACTUAL COOPERATIVE DATA
  const farmerCoops = cooperatives.filter((c: any) => parsedCoopIds.includes(c.id.toString()));

  const getBrgyName = (id: any) => barangays.find((b:any) => b.id.toString() === id?.toString())?.name || 'N/A';
  const getCropName = (id: any) => crops.find((c:any) => c.id.toString() === id?.toString())?.category || 'N/A';
  
  const defaultCenter: LatLngTuple = [8.8220, 125.1260];
  const showMasterMap = parsedFarms.length >= 2;
  const farmsWithMapData = parsedFarms.filter(f => f.farm_coordinates && f.farm_coordinates.length >= 3);

  const farmerFullName = [farmer.first_name, farmer.middle_name, farmer.last_name]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <style>{`
        .danger-zone-marker-wrap {
          position: relative;
          width: 34px;
          height: 42px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        .danger-zone-marker-ring {
          position: absolute;
          top: 3px;
          width: 34px;
          height: 34px;
          border-radius: 9999px;
          border: 2px solid;
          opacity: .35;
          animation: dangerZonePulse 1.8s ease-in-out infinite;
        }
        .danger-zone-marker-pin {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 9999px;
          border: 3px solid;
          box-shadow: 0 8px 24px rgba(15, 23, 42, .2);
          animation: dangerZoneBob 1.8s ease-in-out infinite, dangerZoneGlow 7s linear infinite;
          transform-origin: center center;
        }
        .danger-zone-marker-glyph {
          font-size: 16px;
          line-height: 1;
          font-weight: 900;
        }
        .danger-zone-marker-tail {
          position: absolute;
          bottom: -7px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 12px;
          height: 12px;
          border-right: 3px solid;
          border-bottom: 3px solid;
        }
        @keyframes dangerZoneBob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(8deg); }
        }
        @keyframes dangerZoneGlow {
          from { filter: drop-shadow(0 0 0 rgba(0,0,0,0)); }
          50% { filter: drop-shadow(0 0 10px rgba(248,113,113,.18)); }
          to { filter: drop-shadow(0 0 0 rgba(0,0,0,0)); }
        }
        @keyframes dangerZonePulse {
          0%, 100% { transform: scale(.88); opacity: .2; }
          50% { transform: scale(1.12); opacity: .5; }
        }
      `}</style>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        
        <div className="bg-primary p-8 text-white relative shrink-0">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
            <X size={20}/>
          </button>
          
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center font-black text-2xl border border-white/30 shadow-sm uppercase">
              {farmer.last_name?.[0]}{farmer.first_name?.[0]}
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight leading-none">
                {farmer.first_name} {farmer.middle_name} {farmer.last_name}
              </h3>
              <div className="flex items-center gap-3 mt-3">
                <span className="flex items-center gap-1.5 text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  <Fingerprint size={12}/> RSBSA: {farmer.rsbsa_no}
                </span>
                <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20", 
                  farmer.status === 'active' ? "bg-white/20" : "bg-rose-500")}>
                  {farmer.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1 space-y-12">
          
          <section>
            <SectionTitle icon={<User size={16}/>} title="Personal Details" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoItem label="System ID" value={farmer.system_id} />
              <InfoItem label="Date of Birth" value={farmer.dob} />
              <InfoItem label="Sex" value={farmer.gender} />
              <InfoItem label="Contact No." value={farmer.contact_no} />
              <div className="col-span-2 md:col-span-4">
                <InfoItem label="Residential Address" value={`${farmer.address_details}, ${getBrgyName(farmer.barangay_id)}`} />
              </div>
            </div>
          </section>

          <section>
            <SectionTitle icon={<LandPlot size={16}/>} title={`Farm Specifications (${parsedFarms.length} Parcel${parsedFarms.length !== 1 ? 's' : ''})`} />
            
            <div className="space-y-8">
              {parsedFarms.length === 0 ? (
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No farm records found.</p>
              ) : (
                parsedFarms.map((farm, idx) => {
                  const hasMapData = farm.farm_coordinates && farm.farm_coordinates.length > 0;
                  const coordsList = hasMapData ? farm.farm_coordinates : [];
                  const centerPoint = getCentroid(coordsList, defaultCenter);
                  const polygonPositions: LatLngExpression[] = coordsList.map((c:any) => [c.lat, c.lng]);
                  const farmHazard = computeFarmHazard(coordsList, hazardZones);

                  return (
                    <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-800/20 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
                      <h4 className="text-xs font-black uppercase text-primary mb-4 flex items-center gap-2">
                        <MapPin size={14}/> Farm Parcel #{idx + 1}
                      </h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <InfoItem icon={<MapPin size={12}/>} label="Location" value={`SITIO ${farm.farm_sitio || 'N/A'}, ${getBrgyName(farm.farm_barangay_id)}`} />
                        <InfoItem icon={<Sprout size={12}/>} label="Crop" value={getCropName(farm.crop_id)} />
                        <InfoItem icon={<Ruler size={12}/>} label="Area" value={`${farm.total_area || 0} HA`} />
                        <InfoItem icon={<Waves size={12}/>} label="Irrigation" value={farm.irrigation_type} />
                        <InfoItem icon={<Sprout size={12}/>} label="Soil Type" value={farm.soil_type || 'N/A'} />
                      </div>

                      {/* GPS Coordinates — compact chip row above the map */}
                      <div className="mb-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-3">
                          <Compass size={13} className="text-primary"/>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">GPS Coordinates</p>
                          <span className="text-[9px] font-bold text-slate-400 ml-1">({coordsList.length} pts)</span>
                        </div>
                        {hasMapData ? (
                          <>
                            <div className="flex flex-wrap gap-2">
                              {(expandedCoords[idx] ? coordsList : coordsList.slice(0, COORDS_LIMIT)).map((coord: any, cIdx: number) => (
                                <div key={cIdx} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                  <span className="text-[9px] font-black text-primary">P{cIdx + 1}</span>
                                  <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300">
                                    {Number(coord.lat).toFixed(6)}, {Number(coord.lng).toFixed(6)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {coordsList.length > COORDS_LIMIT && (
                              <button
                                type="button"
                                onClick={() => setExpandedCoords(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline cursor-pointer"
                              >
                                {expandedCoords[idx]
                                  ? 'See Less'
                                  : `See More (${coordsList.length - COORDS_LIMIT} more pts)`}
                              </button>
                            )}
                          </>
                        ) : (
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60">No Coordinates Encoded</p>
                        )}
                      </div>

                      {/* Hazard status note */}
                      {coordsList.length >= 3 && (
                        <div className={`mb-4 flex items-start gap-3 px-5 py-4 rounded-2xl border text-[11px] font-bold leading-relaxed ${
                          farmHazard.state === 'danger'
                            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
                            : farmHazard.state === 'near'
                            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                            : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          {farmHazard.state === 'safe'
                            ? <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                            : <AlertTriangle size={16} className="shrink-0 mt-0.5" />}
                          <span>
                            {farmHazard.state === 'danger' && farmHazard.zone
                              ? `This farm is located INSIDE the "${farmHazard.zone.name}" danger zone. Immediate review of farm location is recommended.`
                              : farmHazard.state === 'near' && farmHazard.zone
                              ? `This farm is approximately ${Math.round(farmHazard.distance!)}m from the "${farmHazard.zone.name}" danger zone. Exercise caution.`
                              : 'Farm location is safely away from all recorded danger zones.'}
                          </span>
                        </div>
                      )}

                      {/* Map — full width, taller */}
                      <div className="w-full h-125 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-100 dark:bg-slate-800 relative z-0">
                        {/* On-map overlay badge */}
                        {hasMapData && farmHazard.state !== 'safe' && (
                          <div className={`absolute top-3 left-3 z-500 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur pointer-events-none ${
                            farmHazard.state === 'danger'
                              ? 'bg-rose-50/95 text-rose-600 border-rose-200'
                              : 'bg-amber-50/95 text-amber-700 border-amber-200'
                          }`}>
                            {farmHazard.state === 'danger' ? 'Inside Danger Zone' : 'Near Danger Zone'}
                            {farmHazard.zone ? `: ${farmHazard.zone.name}` : ''}
                          </div>
                        )}
                        {hasMapData ? (
                          <MapContainer center={centerPoint as any} zoom={16} style={{ height: "100%", width: "100%", zIndex: 0 }}>
                            <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="&copy; Google Maps" />
                            <MapUpdater coords={coordsList} center={centerPoint} />
                            <MapFocusController target={parcelZoneTargets[idx] || null} />

                            <Marker position={centerPoint as any} icon={redIcon}>
                              <Tooltip permanent direction="top" offset={[0, -35]} className="bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white border-0 shadow-lg font-black uppercase tracking-widest text-[9px] px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                {farmerFullName ? `${farmerFullName} - Area ${idx + 1}` : `Farm Parcel ${idx + 1}`}
                              </Tooltip>
                            </Marker>

                            {coordsList.length >= 3 && (
                              <Polygon positions={polygonPositions as any} pathOptions={{ color: '#10b981', weight: 3, fillColor: '#10b981', fillOpacity: 0.4 }} />
                            )}
                            {hazardZones.map((zone) => (
                              <React.Fragment key={zone.id}>
                                <Polygon positions={zone.positions as any} pathOptions={{ color: zone.color, weight: 2, fillColor: zone.fillColor, fillOpacity: 0.18 }} />
                                <Marker
                                  position={getPolygonCenter(zone.positions as LatLngTuple[], defaultCenter) as any}
                                  icon={getDangerZoneMarkerIcon(zone.color || '#dc2626', zone.fillColor || '#f87171')}
                                >
                                  <Tooltip direction="top" offset={[0, -28]} opacity={1}>
                                    <div className="min-w-40">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Danger Zone</p>
                                      <p className="mt-1 text-sm font-black text-slate-800">{zone.name}</p>
                                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-primary">{zone.zone_type || 'Hazard Zone'}</p>
                                      <p className="mt-2 text-[11px] font-bold text-slate-600">{zone.description || 'Warning area for farmers.'}</p>
                                    </div>
                                  </Tooltip>
                                </Marker>
                              </React.Fragment>
                            ))}
                          </MapContainer>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                            <MapIcon size={40} className="mb-2 opacity-50" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No Map Coordinates Available</p>
                          </div>
                        )}
                      </div>
                      {(coordsList.length >= 3 || hazardZones.length > 0) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {coordsList.length >= 3 && (
                            <button
                              type="button"
                              onClick={() => setParcelZoneTargets((prev) => ({
                                ...prev,
                                [idx]: {
                                  center: getCentroid(coordsList, defaultCenter),
                                  zoom: 17,
                                  token: Date.now() + Math.random(),
                                },
                              }))}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-sm"
                              style={{ color: '#10b981', borderColor: '#10b981', backgroundColor: '#10b98120' }}
                            >
                              <MapPin size={11} /> Farm Area
                            </button>
                          )}
                          {hazardZones.map((zone) => (
                            <button
                              key={zone.id}
                              type="button"
                              onClick={() => setParcelZoneTargets((prev) => ({
                                ...prev,
                                [idx]: {
                                  center: getPolygonCenter(zone.positions, defaultCenter),
                                  zoom: 16,
                                  token: Date.now() + Math.random(),
                                },
                              }))}
                              className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-sm"
                              style={{ color: zone.color, borderColor: zone.color, backgroundColor: `${zone.fillColor}22` }}
                            >
                              {zone.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* 🌟 GLOBAL MAP */}
              {showMasterMap && farmsWithMapData.length > 0 && (
                 <div className="mt-12 p-6 bg-slate-100 dark:bg-slate-800/50 rounded-[2rem] border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-500">
                    <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
                       <div className="p-2 bg-emerald-500/10 rounded-xl"><MapIcon size={20}/></div>
                       <div>
                         <h3 className="text-sm font-black uppercase tracking-tight">Global Farm Map</h3>
                         <p className="text-[10px] text-slate-500">Overview of all encoded farm parcels for this farmer.</p>
                       </div>
                    </div>
                    
                    <div className="w-full h-125 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-600 shadow-inner z-0 relative">
                       <MapContainer center={defaultCenter} zoom={13} style={{ height: "100%", width: "100%", zIndex: 0 }}>
                         <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="&copy; Google Maps" />
                         <GlobalMapBoundsUpdater farms={farmsWithMapData} />
                         <MapFocusController target={globalZoneTarget} />
                         
                         {farmsWithMapData.map((farm, idx) => {
                            const coords = farm.farm_coordinates;
                            const center = getCentroid(coords, defaultCenter);
                            const polyPositions: LatLngExpression[] = coords.map((c:any) => [c.lat, c.lng]);
                            
                            return (
                              <React.Fragment key={idx}>
                                <Marker position={center as any} icon={redIcon}>
                                   <Tooltip permanent direction="top" offset={[0, -35]} className="bg-white/95 text-slate-800 border-0 shadow-lg font-black uppercase tracking-widest text-[9px] px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                     Area #{parsedFarms.indexOf(farm) + 1}
                                   </Tooltip>
                                </Marker>
                                <Polygon positions={polyPositions as any} pathOptions={{ color: '#10b981', weight: 3, fillColor: '#10b981', fillOpacity: 0.4 }} />
                              </React.Fragment>
                            );
                         })}
                         {hazardZones.map((zone) => (
                           <React.Fragment key={zone.id}>
                             <Polygon positions={zone.positions as any} pathOptions={{ color: zone.color, weight: 2, fillColor: zone.fillColor, fillOpacity: 0.15 }} />
                             <Marker
                               position={getPolygonCenter(zone.positions as LatLngTuple[], defaultCenter) as any}
                               icon={getDangerZoneMarkerIcon(zone.color || '#dc2626', zone.fillColor || '#f87171')}
                             >
                               <Tooltip direction="top" offset={[0, -28]} opacity={1}>
                                 <div className="min-w-40">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Danger Zone</p>
                                   <p className="mt-1 text-sm font-black text-slate-800">{zone.name}</p>
                                   <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-primary">{zone.zone_type || 'Hazard Zone'}</p>
                                   <p className="mt-2 text-[11px] font-bold text-slate-600">
                                     {zone.description || 'Warning area for farmers.'}
                                   </p>
                                 </div>
                               </Tooltip>
                             </Marker>
                           </React.Fragment>
                         ))}
                       </MapContainer>
                    </div>
                    {(farmsWithMapData.length > 0 || hazardZones.length > 0) && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {farmsWithMapData.map((farm, fIdx) => {
                          const allCoords: {lat: number, lng: number}[] = farm.farm_coordinates || [];
                          if (allCoords.length < 3) return null;
                          return (
                            <button
                              key={fIdx}
                              type="button"
                              onClick={() => setGlobalZoneTarget({
                                center: getCentroid(allCoords, defaultCenter),
                                zoom: 17,
                                token: Date.now() + Math.random(),
                              })}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-sm"
                              style={{ color: '#10b981', borderColor: '#10b981', backgroundColor: '#10b98120' }}
                            >
                              <MapPin size={11} /> Area #{parsedFarms.indexOf(farm) + 1}
                            </button>
                          );
                        })}
                        {hazardZones.map((zone) => (
                          <button
                            key={zone.id}
                            type="button"
                            onClick={() => setGlobalZoneTarget({
                              center: getPolygonCenter(zone.positions, defaultCenter),
                              zoom: 15,
                              token: Date.now() + Math.random(),
                            })}
                            className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-sm"
                            style={{ color: zone.color, borderColor: zone.color, backgroundColor: `${zone.fillColor}22` }}
                          >
                            {zone.name}
                          </button>
                        ))}
                      </div>
                    )}
                 </div>
              )}
            </div>
          </section>

          {/* 🌟 UPDATED COOPERATIVE SECTION FOR MULTIPLE COOPS */}
          <section>
            {isCoopMember && farmerCoops.length > 0 ? (
              <div className="space-y-4">
                <SectionTitle icon={<Building2 className="text-primary"/>} title={`Cooperative Membership (${farmerCoops.length})`} color="text-primary" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {farmerCoops.map((coop, idx) => (
                    <div key={idx} className="bg-primary/5 p-5 rounded-2xl border border-primary/20 hover:border-primary/40 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Building2 size={16}/>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-black text-xs text-slate-800 dark:text-slate-100 uppercase leading-tight truncate">{coop.name}</p>
                          <p className="text-[9px] font-bold text-primary uppercase tracking-widest truncate">{coop.type || 'Agricultural Cooperative'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[9px] text-primary/60 font-black uppercase">CDA No.</p>
                          <p className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{coop.cda_no || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] text-primary/60 font-black uppercase">Chairman</p>
                          <p className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{coop.chairman || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Ban className="text-slate-400" size={20} />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Farmer is not affiliated with any Cooperative</p>
              </div>
            )}
          </section>

          <section>
            <SectionTitle icon={<ClipboardCheck size={16}/>} title={`Program Assistance History (${parsedAssistances.length})`} />
            
            {parsedAssistances.length === 0 ? (
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No record of LGU assistance found.</p>
            ) : (
               <div className="space-y-4">
                 {parsedAssistances.map((assist, idx) => (
                   <div key={idx} className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm text-primary">
                           <Package size={20}/>
                        </div>
                        <div>
                           <p className="text-sm font-black uppercase text-slate-800 dark:text-slate-100">{assist.program_name || 'Unnamed Program'}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                             {assist.assistance_type} • {assist.quantity} • {assist.funding_source}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-6 md:text-right">
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1 mb-1"><Calendar size={10}/> Date Released</p>
                           <p className="text-xs font-bold uppercase">{assist.date_released || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1 mb-1"><HandCoins size={10}/> Total Value</p>
                           <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(assist.total_cost || 0)}</p>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

const SectionTitle = ({ icon, title, color = "text-slate-400" }: any) => (
  <div className="flex items-center gap-2 mb-5">
    <div className="text-slate-400">{icon}</div>
    <h4 className={cn("text-[10px] font-black uppercase tracking-[0.2em]", color)}>{title}</h4>
    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800 ml-2"></div>
  </div>
);

const InfoItem = ({ icon, label, value }: any) => (
  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
    <div className="flex items-center gap-1.5 mb-1.5 text-slate-400">
      {icon && <span className="opacity-70">{icon}</span>}
      <p className="text-[9px] font-black uppercase tracking-wider">{label}</p>
    </div>
    <p className="text-xs font-bold uppercase text-slate-700 dark:text-slate-200 truncate">{value || 'N/A'}</p>
  </div>
);

export default FarmerViewDialog;
