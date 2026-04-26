import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, useMap, Marker, Tooltip, useMapEvents } from 'react-leaflet';
import L, { type LatLngExpression, type LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Plus, Trash2, MousePointer2 } from 'lucide-react';
import { useAppSelector } from '../../../../store/hooks';

// Icon for the markers
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Coordinate {
  lat: number;
  lng: number;
}

interface Props {
  coordinates: Coordinate[];
  onChange: (coords: Coordinate[]) => void;
  farmerName?: string;
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

interface MapFocusTarget {
  center: LatLngExpression;
  zoom: number;
  token: number;
}


// --- HELPER COMPONENTS ---

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

const isPointInPolygon = (point: LatLngTuple, polygon: LatLngTuple[]) => {
  const [lat, lng] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i];
    const [latJ, lngJ] = polygon[j];

    const intersect =
      (lngI > lng) !== (lngJ > lng) &&
      lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI + Number.EPSILON) + latI;

    if (intersect) inside = !inside;
  }

  return inside;
};

const toXY = (lat: number, lng: number, latRef: number) => {
  const R = 6371000;
  const x = ((lng * Math.PI) / 180) * R * Math.cos((latRef * Math.PI) / 180);
  const y = ((lat * Math.PI) / 180) * R;
  return { x, y };
};

const distancePointToSegmentMeters = (p: LatLngTuple, a: LatLngTuple, b: LatLngTuple) => {
  const latRef = p[0];
  const P = toXY(p[0], p[1], latRef);
  const A = toXY(a[0], a[1], latRef);
  const B = toXY(b[0], b[1], latRef);

  const ABx = B.x - A.x;
  const ABy = B.y - A.y;
  const APx = P.x - A.x;
  const APy = P.y - A.y;
  const ab2 = ABx * ABx + ABy * ABy;
  const t = ab2 === 0 ? 0 : Math.max(0, Math.min(1, (APx * ABx + APy * ABy) / ab2));
  const Cx = A.x + ABx * t;
  const Cy = A.y + ABy * t;
  const dx = P.x - Cx;
  const dy = P.y - Cy;
  return Math.sqrt(dx * dx + dy * dy);
};

const distancePointToPolygonMeters = (point: LatLngTuple, polygon: LatLngTuple[]) => {
  if (!polygon || polygon.length < 3) return Number.POSITIVE_INFINITY;
  if (isPointInPolygon(point, polygon)) return 0;

  let minDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const d = distancePointToSegmentMeters(point, a, b);
    if (d < minDistance) minDistance = d;
  }
  return minDistance;
};

const getDangerZoneMarkerIcon = (color: string, fillColor: string) =>
  L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
        <div class="epicenter-ring" style="border:2px solid ${color};width:44px;height:44px;"></div>
        <div class="epicenter-ring epicenter-ring-2" style="border:2px solid ${color};width:44px;height:44px;"></div>
        <div class="epicenter-ring epicenter-ring-3" style="border:2px solid ${color};width:44px;height:44px;"></div>
        <div style="position:relative;z-index:1;width:12px;height:12px;border-radius:50%;background:${fillColor};border:2px solid ${color};box-shadow:0 0 8px 2px ${color}88;"></div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    tooltipAnchor: [0, -14],
  });

const MapUpdater: React.FC<{ coords: Coordinate[], center: LatLngExpression }> = ({ coords, center }) => {
  const map = useMap();
  const [hasCentered, setHasCentered] = React.useState(false);

  useEffect(() => {
    // Keep map focused on Gingoog default center.
    if (!hasCentered) {
      map.setView(center, 13);
      setHasCentered(true);
    }
  }, [coords, center, map, hasCentered]);

  return null;
};

// 🌟 BAG-ONG COMPONENT: Mao ni ang tig-paminaw sa CLICK sa MAP
const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const MapFocusController = ({ target }: { target: MapFocusTarget | null }) => {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    map.flyTo(target.center, target.zoom, { animate: true, duration: 1.1 });
  }, [map, target]);

  return null;
};

export default function FarmLocationMap({ coordinates, onChange }: Props) {
  const dangerZoneRecords = useAppSelector((state: any) => state.farmer.dangerZones || []);
  const [localCoords, setLocalCoords] = useState<{lat: string, lng: string}[]>([]);
  const [zoneTarget, setZoneTarget] = useState<MapFocusTarget | null>(null);

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      setLocalCoords(coordinates.map(c => ({ lat: c.lat.toString(), lng: c.lng.toString() })));
    } else if (localCoords.length === 0) {
      setLocalCoords([{ lat: '', lng: '' }, { lat: '', lng: '' }, { lat: '', lng: '' }]);
    }
  }, [coordinates]);

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

  const pushToParent = (data: {lat: string, lng: string}[]) => {
    const validCoords = data
      .filter(c => c.lat.trim() !== '' && c.lng.trim() !== '')
      .map(c => ({ lat: parseFloat(c.lat), lng: parseFloat(c.lng) }))
      .filter(c => !isNaN(c.lat) && !isNaN(c.lng));

    if (validCoords.length >= 3) onChange(validCoords);
    else onChange([]); 
  };

  const handleChange = (index: number, field: 'lat'|'lng', value: string) => {
    const newData = [...localCoords];
    newData[index][field] = value;
    setLocalCoords(newData);
    pushToParent(newData);
  };

  // 🌟 FUNCTION PARA SA CLICK SA MAP
  const handleMapClick = (lat: number, lng: number) => {
    setLocalCoords(prev => {
      let newData = [...prev];
      // Pangitaon ang unang box nga walay sulod
      const emptyIndex = newData.findIndex(c => c.lat === '' || c.lng === '');
      
      if (emptyIndex !== -1) {
        newData[emptyIndex] = { lat: lat.toFixed(6), lng: lng.toFixed(6) };
      } else {
        // Kung puno na tanan box, mag-add og bag-ong row
        newData.push({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
      }
      
      pushToParent(newData);
      return newData;
    });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    const paste = e.clipboardData.getData('text');
    if (paste.includes(',')) {
      e.preventDefault();
      const [pLat, pLng] = paste.split(',').map(s => s.trim());
      if (pLat && pLng) {
        const newData = [...localCoords];
        newData[index] = { lat: pLat, lng: pLng };
        setLocalCoords(newData);
        pushToParent(newData);
      }
    }
  };

  const handleMarkerDrag = (index: number, lat: number, lng: number) => {
    const newData = [...localCoords];
    // I-update ang specific index sa drag point
    newData[index] = { lat: lat.toFixed(6), lng: lng.toFixed(6) };
    setLocalCoords(newData);
    pushToParent(newData);
  };

  const addRow = () => setLocalCoords([...localCoords, { lat: '', lng: '' }]);
  const removeRow = (index: number) => {
    const newData = localCoords.filter((_, i) => i !== index);
    setLocalCoords(newData);
    pushToParent(newData);
  };

  const defaultCenter: LatLngTuple = [8.8220, 125.1260]; 
  const centerPoint = defaultCenter;
  const hazardAssessment = React.useMemo(() => {
    if (!coordinates || coordinates.length === 0 || hazardZones.length === 0) {
      return { state: 'safe' as 'safe' | 'near' | 'danger', zone: null as HazardZoneRecord | null, distance: null as number | null };
    }

    let insideZone: HazardZoneRecord | null = null;
    let nearestZone: HazardZoneRecord | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const zone of hazardZones) {
      for (const coord of coordinates) {
        const point: LatLngTuple = [coord.lat, coord.lng];

        if (isPointInPolygon(point, zone.positions)) {
          insideZone = zone;
          break;
        }

        const edgeDistance = distancePointToPolygonMeters(point, zone.positions);
        if (edgeDistance < nearestDistance) {
          nearestDistance = edgeDistance;
          nearestZone = zone;
        }
      }
      if (insideZone) break;
    }

    if (insideZone) return { state: 'danger' as const, zone: insideZone, distance: 0 };

    // 120m threshold for "near danger zone"
    if (nearestZone && nearestDistance <= 120) {
      return { state: 'near' as const, zone: nearestZone, distance: nearestDistance };
    }

    return { state: 'safe' as const, zone: nearestZone, distance: nearestDistance === Number.POSITIVE_INFINITY ? null : nearestDistance };
  }, [coordinates, hazardZones]);
  // const polygonPositions: LatLngExpression[] = coordinates.map(c => [c.lat, c.lng]);

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
      
      <div className="w-full md:w-[35%] flex flex-col h-87.5 md:h-125">
        <div className="mb-3">
           <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2">
             <MapPin size={14} className="text-primary"/> Boundary Coordinates
           </label>
           <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
             <span className="text-emerald-500 font-bold flex items-center gap-1"><MousePointer2 size={10}/> Click on the map</span> to drop a point or type manually.<br/>
             <span className="text-primary font-bold">Minimum 3 points</span> required.
           </p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 pb-2">
          {localCoords.map((coord, index) => (
            <div key={index} className="flex items-center gap-2">
               <div className="w-6 text-[9px] font-black text-slate-400 shrink-0">P{index + 1}</div>
               <input 
                 type="text" placeholder="Latitude" value={coord.lat}
                 onChange={(e) => handleChange(index, 'lat', e.target.value)} onPaste={(e) => handlePaste(e, index)}
                 className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono outline-none focus:border-primary shadow-sm"
               />
               <input 
                 type="text" placeholder="Longitude" value={coord.lng}
                 onChange={(e) => handleChange(index, 'lng', e.target.value)} onPaste={(e) => handlePaste(e, index)}
                 className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono outline-none focus:border-primary shadow-sm"
               />
               <button 
                 type="button" onClick={() => removeRow(index)} disabled={localCoords.length <= 3}
                 className="p-2 text-slate-300 hover:text-rose-500 disabled:opacity-30 transition-colors cursor-pointer shrink-0"
               >
                 <Trash2 size={14} />
               </button>
            </div>
          ))}
        </div>

        <button 
          type="button" onClick={addRow}
          className="mt-3 flex items-center justify-center gap-2 w-full py-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-primary hover:border-primary/50 transition-colors cursor-pointer bg-white dark:bg-slate-900"
        >
          <Plus size={14} /> Add Point
        </button>
      </div>

      <div className="w-full md:w-[65%] flex flex-col gap-2">
        <div className="h-87.5 md:h-125 min-h-125 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-inner z-0 relative">
          {hazardAssessment.state !== 'safe' && (
            <div
              className={`
                absolute top-3 left-3 z-500 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur
                ${hazardAssessment.state === 'danger'
                  ? 'bg-rose-50/95 text-rose-600 border-rose-200'
                  : 'bg-amber-50/95 text-amber-700 border-amber-200'
                }
              `}
            >
              {hazardAssessment.state === 'danger' ? 'Danger Zone' : 'Near Danger Zone'}
              {hazardAssessment.zone ? `: ${hazardAssessment.zone.name}` : ''}
            </div>
          )}
          <MapContainer 
  center={centerPoint as any} 
  zoom={16} 
  style={{ height: "100%", width: "100%", zIndex: 0 }}
>
  <style>
    {`
      .leaflet-container { cursor: crosshair !important; }
      /* I-allow ang grab cursor para lang sa markers para kabalo ang user nga ma-drag sila */
      .leaflet-marker-icon { cursor: move !important; }
      .danger-zone-dot-marker { background: transparent !important; border: 0 !important; }
    `}
  </style>

  <TileLayer 
    url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" 
    attribution="&copy; Google Maps"
    // 🌟 2. IMPORTANTE: maxNativeZoom mao ang limit sa Google (usually 20 o 21)
    // 🌟 3. maxZoom mao ang limit sa user (i-match sa MapContainer)
    maxNativeZoom={20} 
    maxZoom={25} 
  />
  
  <MapUpdater coords={coordinates} center={centerPoint} />
  <MapClickHandler onMapClick={handleMapClick} />
  <MapFocusController target={zoneTarget} />
  
  {/* 🌟 DRAGGABLE MARKERS LOOP */}
  {coordinates.map((c, idx) => (
     <Marker 
        key={idx} 
        position={[c.lat, c.lng]} 
        icon={redIcon}
        draggable={true} // 👈 Himoon natong draggable
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            handleMarkerDrag(idx, position.lat, position.lng);
          },
        }}
     >
        <Tooltip direction="top" offset={[0, -35]} className="text-[8px] font-bold bg-white/90">
          P{idx + 1}: Drag to adjust
        </Tooltip>
     </Marker>
  ))}

  {hazardZones.map((zone) => (
    <React.Fragment key={zone.id}>
      <Polygon
        positions={zone.positions as any}
        pathOptions={{ color: zone.color, weight: 2, fillColor: zone.fillColor, fillOpacity: 0.16 }}
      />
      <Marker
        position={getPolygonCenter(zone.positions as LatLngTuple[], defaultCenter) as any}
        icon={getDangerZoneMarkerIcon(zone.color || '#dc2626', zone.fillColor || '#f87171')}
      >
        <Tooltip direction="top" offset={[0, -12]} opacity={1}>
          <div className="min-w-36">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Danger Zone</p>
            <p className="mt-1 text-sm font-black text-slate-800">{zone.name}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-rose-600">{zone.zone_type || 'Hazard Zone'}</p>
          </div>
        </Tooltip>
      </Marker>
    </React.Fragment>
  ))}

  {/* Ang Polygon mo-follow ra gihapon automatiko inig update sa coordinates */}
  {coordinates.length >= 3 && (
    <Polygon 
      positions={coordinates.map(c => [c.lat, c.lng]) as any} 
      pathOptions={{ color: '#10b981', weight: 3, fillColor: '#10b981', fillOpacity: 0.4 }} 
    />
  )}
          </MapContainer>
        </div>

        {hazardZones.length > 0 && (
          <div className="w-full">
            <div className="flex flex-wrap gap-2">
              {hazardZones.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() =>
                    setZoneTarget({
                      center: getPolygonCenter(zone.positions, defaultCenter),
                      zoom: 16,
                      token: Date.now() + Math.random(),
                    })
                  }
                  className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-sm"
                  style={{ color: zone.color, borderColor: zone.color, backgroundColor: `${zone.fillColor}22` }}
                >
                  {zone.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
