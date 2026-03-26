import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, useMap, Marker, Tooltip, useMapEvents } from 'react-leaflet';
import L, { type LatLngExpression, type LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Plus, Trash2, MousePointer2 } from 'lucide-react';

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

// --- HELPER COMPONENTS ---

const getCentroid = (coords: Coordinate[], defaultCenter: LatLngTuple): LatLngExpression => {
  if (coords.length === 0) return defaultCenter;
  if (coords.length < 3) return [coords[0].lat, coords[0].lng];
  let minLat = coords[0].lat, maxLat = coords[0].lat;
  let minLng = coords[0].lng, maxLng = coords[0].lng;
  coords.forEach(c => {
    if (c.lat < minLat) minLat = c.lat; if (c.lat > maxLat) maxLat = c.lat;
    if (c.lng < minLng) minLng = c.lng; if (c.lng > maxLng) maxLng = c.lng;
  });
  return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
};

const MapUpdater: React.FC<{ coords: Coordinate[], center: LatLngExpression }> = ({ coords, center }) => {
  const map = useMap();
  const [hasCentered, setHasCentered] = React.useState(false);

  useEffect(() => {
    // Mo-zoom lang siya kung naay initial coordinates (gikan sa database) 
    // ug wala pa siya ka-center sukad pag-abli sa dialog.
    if (coords && coords.length > 0 && !hasCentered) {
      map.setView(center, 16);
      setHasCentered(true); // Markahan nga naka-zoom na, dili na balikon.
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

export default function FarmLocationMap({ coordinates, onChange }: Props) {
  const [localCoords, setLocalCoords] = useState<{lat: string, lng: string}[]>([]);

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      setLocalCoords(coordinates.map(c => ({ lat: c.lat.toString(), lng: c.lng.toString() })));
    } else if (localCoords.length === 0) {
      setLocalCoords([{ lat: '', lng: '' }, { lat: '', lng: '' }, { lat: '', lng: '' }]);
    }
  }, [coordinates]);

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
  const centerPoint = getCentroid(coordinates, defaultCenter);
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

      <div className="w-full md:w-[65%] h-87.5 md:h-125 min-h-125 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-inner z-0 relative">
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

  {/* Ang Polygon mo-follow ra gihapon automatiko inig update sa coordinates */}
  {coordinates.length >= 3 && (
    <Polygon 
      positions={coordinates.map(c => [c.lat, c.lng]) as any} 
      pathOptions={{ color: '#10b981', weight: 3, fillColor: '#10b981', fillOpacity: 0.4 }} 
    />
  )}
</MapContainer>
      </div>

    </div>
  );
}