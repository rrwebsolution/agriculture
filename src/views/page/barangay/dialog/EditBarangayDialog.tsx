import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom'; 
import { X, Edit3, Loader2, Check, MapPin, Building2, Map, Info, Search } from 'lucide-react';
import { MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '../../../../components/ui/select';
import { cn } from '../../../../lib/utils';

const classifications = ["Urban (Poblacion)", "Rural", "Coastal"];
const gingoogCenter: [number, number] = [8.8234, 125.1234];
type MapSearchResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

const selectedMarkerIcon = L.divIcon({
  html: `
    <div class="relative flex h-9 w-9 items-center justify-center">
      <svg viewBox="0 0 24 24" class="h-9 w-9 drop-shadow-xl" fill="#ef4444" stroke="#991b1b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" fill="#ffffff" stroke="#991b1b" stroke-width="1.5" />
      </svg>
    </div>
  `,
  className: 'barangay-selected-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

interface EditBarangayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBrgy: any;
  formData: { name: string; type: string; latitude: string; longitude: string }; // 🌟 GIDUGANG ANG LAT & LNG
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSave: (e: React.FormEvent) => void;
  isSaving: boolean;
}

const EditBarangayDialog: React.FC<EditBarangayDialogProps> = ({ 
  isOpen, onClose, selectedBrgy, formData, setFormData, onSave, isSaving
}) => {
  
  if (!isOpen || !selectedBrgy) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={isSaving ? undefined : onClose} 
      />
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        
        {/* Header */}
        <div className="bg-primary p-6 md:p-8 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4 text-white">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
              <Edit3 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight leading-none">
                Edit Barangay Profile
              </h2>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                <MapPin size={12} /> {selectedBrgy.code || 'BRGY-CODE'}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            disabled={isSaving}
            onClick={onClose} 
            className="p-2 hover:bg-white/20 rounded-xl text-white cursor-pointer transition-colors focus:outline-none disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={onSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
            
            {/* General Info Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-primary border-b border-gray-100 dark:border-slate-800 pb-2">
                  <div className="p-1.5 bg-primary/10 rounded-xl"><Building2 size={14}/></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">1. General Information</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <MapPin size={12} className="text-primary"/> Barangay Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" required placeholder="e.g. San Juan" disabled={isSaving}
                  className="w-full h-13 px-5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-700 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-primary/50 shadow-sm" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Building2 size={12} className="text-blue-500"/> Classification <span className="text-rose-500">*</span>
                </label>
                <Select disabled={isSaving} value={formData.type} onValueChange={(val: string) => setFormData({...formData, type: val})}>
                  <SelectTrigger className="w-full h-13 px-5 bg-gray-50 dark:bg-slate-800/50 rounded-2xl text-sm font-bold cursor-pointer border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-primary/50 shadow-sm focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select Classification" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-10000">
                    {classifications.map((t) => (
                      <SelectItem key={t} value={t} className="text-xs font-bold uppercase py-3 px-4 cursor-pointer hover:bg-primary/10 rounded-xl transition-colors">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 🌟 COORDINATES SECTION 🌟 */}
            <div className="space-y-5 pt-2">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-emerald-500">
                    <div className="p-1.5 bg-emerald-500/10 rounded-xl"><Map size={14}/></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">2. Geographical Coordinates</span>
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase italic">Optional</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Latitude */}
                <div className="space-y-1.5 w-full">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Latitude</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">LAT</span>
                    <input 
                      type="number" step="any" placeholder="e.g. 8.8234000" disabled={isSaving}
                      className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-gray-700 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500/50 shadow-sm" 
                      value={formData.latitude || ''} onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    />
                  </div>
                </div>

                {/* Longitude */}
                <div className="space-y-1.5 w-full">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Longitude</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">LNG</span>
                    <input 
                      type="number" step="any" placeholder="e.g. 125.1234000" disabled={isSaving}
                      className="w-full h-12 pl-14 pr-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-gray-700 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500/50 shadow-sm" 
                      value={formData.longitude || ''} onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-start gap-3">
                 <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                 <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 leading-relaxed uppercase tracking-wide">
                   Adding coordinates will display this barangay as a marker on the interactive Global Map. You can type coordinates or click the map below.
                 </p>
              </div>

              <BarangayCoordinateMapPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                disabled={isSaving}
                onPick={(lat, lng) => setFormData((prev: any) => ({
                  ...prev,
                  latitude: lat.toFixed(7),
                  longitude: lng.toFixed(7),
                }))}
              />
            </div>

          </div>

          {/* FOOTER */}
          <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSaving} 
              className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer disabled:opacity-50 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving} 
              className={cn(
                "px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 cursor-pointer transition-all shadow-xl shadow-primary/20 active:scale-95", 
                isSaving && "opacity-50 pointer-events-none"
              )}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} 
              {isSaving ? 'Saving Changes...' : 'Commit Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body 
  );
};

const MapClickHandler = ({ disabled, onPick }: { disabled?: boolean; onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(event) {
      if (disabled) return;
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
};

const MapFocusController = ({ lat, lng }: { lat?: number | null; lng?: number | null }) => {
  const map = useMap();

  useEffect(() => {
    window.setTimeout(() => map.invalidateSize(), 120);
  }, [map]);

  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 14, { animate: true, duration: 0.8 });
    }
  }, [lat, lng, map]);

  return null;
};

const BarangayCoordinateMapPicker = ({
  latitude,
  longitude,
  disabled,
  onPick,
}: {
  latitude: string;
  longitude: string;
  disabled?: boolean;
  onPick: (lat: number, lng: number) => void;
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MapSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedSearchLabel, setSelectedSearchLabel] = useState('');
  const selectedLat = Number(latitude);
  const selectedLng = Number(longitude);
  const hasSelectedPoint = !Number.isNaN(selectedLat) && !Number.isNaN(selectedLng) && !!latitude && !!longitude;
  const mapCenter: [number, number] = hasSelectedPoint ? [selectedLat, selectedLng] : gingoogCenter;
  const showSelectedSummary = hasSelectedPoint && !isSearching && !searchError && results.length === 0 && (!query.trim() || !!selectedSearchLabel);

  const searchPlaces = async (term: string, signal?: AbortSignal) => {
    if (!term) return;

    setIsSearching(true);
    setSearchError('');
    setSelectedSearchLabel('');
    setResults([]);

    try {
      const locationQuery = `${term}, Gingoog City, Misamis Oriental, Philippines`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=1&q=${encodeURIComponent(locationQuery)}`, { signal });
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
      if (!Array.isArray(data) || data.length === 0) {
        setSearchError('No location found. Try a nearby landmark or barangay name.');
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') return;
      setSearchError('Map search is unavailable right now.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    const term = query.trim();
    searchPlaces(term);
  };

  useEffect(() => {
    const term = query.trim();
    setSearchError('');

    if (term.length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      searchPlaces(term, controller.signal);
    }, 450);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const handlePickSearchResult = (result: MapSearchResult) => {
    const lat = Number(result.lat);
    const lng = Number(result.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    onPick(lat, lng);
    setQuery(result.display_name.split(',')[0] || result.display_name);
    setSelectedSearchLabel(result.display_name);
    setResults([]);
    setSearchError('');
  };

  const handlePickMapPoint = (lat: number, lng: number) => {
    setSelectedSearchLabel('');
    onPick(lat, lng);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Global Map Picker</label>
        {hasSelectedPoint && (
          <span className="text-[9px] font-black uppercase text-emerald-500">
            Selected: {selectedLat.toFixed(5)}, {selectedLng.toFixed(5)}
          </span>
        )}
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                disabled={disabled}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchError('');
                  setSelectedSearchLabel('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="Search barangay or location..."
                className="h-11 w-full rounded-xl border border-gray-100 bg-gray-50 pl-9 pr-3 text-[11px] font-bold text-slate-700 outline-none transition-all focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
              />
            </div>
            <button
              type="button"
              disabled={disabled || isSearching || !query.trim()}
              onClick={handleSearch}
              className="flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSearching ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
            </button>
          </div>

          <div className="px-2 text-[9px] font-black uppercase tracking-widest text-gray-400">
            Search a place or click the map to set coordinates
          </div>

          {showSelectedSummary && (
            <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800/50 dark:bg-emerald-900/20">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
                <Check size={12} />
                Coordinates selected
              </div>
              {selectedSearchLabel && (
                <p className="mt-1 line-clamp-1 text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-200">
                  {selectedSearchLabel}
                </p>
              )}
              <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                LAT {selectedLat.toFixed(7)} / LNG {selectedLng.toFixed(7)}
              </p>
            </div>
          )}

          {(results.length > 0 || searchError) && (
            <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              {searchError && results.length === 0 ? (
                <div className="px-3 py-3 text-[10px] font-bold uppercase leading-relaxed text-rose-500">
                  {searchError}
                </div>
              ) : (
                <>
                  {results.map((result) => (
                    <button
                      key={result.place_id}
                      type="button"
                      onClick={() => handlePickSearchResult(result)}
                      className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-[10px] font-bold uppercase leading-relaxed text-slate-600 transition-all hover:bg-primary/5 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <MapPin size={13} className="mt-0.5 shrink-0 text-rose-500" />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2">{result.display_name}</span>
                        <span className="mt-1 block text-[9px] font-black text-rose-500">
                          Click to use: LAT {Number(result.lat).toFixed(7)} / LNG {Number(result.lon).toFixed(7)}
                        </span>
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative h-[360px] overflow-hidden rounded-3xl border border-gray-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950">
        <MapContainer center={mapCenter} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%', zIndex: 0 }}>
          <MapFocusController lat={hasSelectedPoint ? selectedLat : null} lng={hasSelectedPoint ? selectedLng : null} />
          <MapClickHandler disabled={disabled} onPick={handlePickMapPoint} />
          <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="&copy; Google Maps" />
          {hasSelectedPoint && (
            <Marker position={[selectedLat, selectedLng]} icon={selectedMarkerIcon}>
              <Tooltip direction="top" offset={[0, -38]} permanent className="font-black uppercase text-[10px] text-slate-900">
                Selected Coordinates
              </Tooltip>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default EditBarangayDialog;
