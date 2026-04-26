import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Edit3,
  Eye,
  Filter,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { MapContainer, Marker, Polygon, TileLayer, Tooltip } from 'react-leaflet';
import { divIcon } from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Swal from 'sweetalert2';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import axios from '../../../plugin/axios';
import { cn } from '../../../lib/utils';
import { getPageAccess } from '../../../lib/permissions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { deleteDangerZoneRecord, setDangerZoneData, updateDangerZoneRecord } from '../../../store/slices/dangerZoneSlice';

type DangerZoneStatus = 'Active' | 'Inactive';

interface DangerZonePosition {
  lat: number;
  lng: number;
}

interface DangerZoneRecord {
  id: number;
  name: string;
  zone_type: string;
  description?: string;
  status: DangerZoneStatus;
  color: string;
  fill_color: string;
  positions: DangerZonePosition[];
  created_at?: string;
  updated_at?: string;
}

interface DangerZoneFormState {
  name: string;
  zone_type: string;
  description: string;
  status: DangerZoneStatus;
  color: string;
  fill_color: string;
  positionsText: string;
}

const statusOptions = ['All Status', 'Active', 'Inactive'];

const defaultFormState: DangerZoneFormState = {
  name: '',
  zone_type: '',
  description: '',
  status: 'Active',
  color: '#dc2626',
  fill_color: '#f87171',
  positionsText: '',
};

const parsePositions = (positionsText: string): DangerZonePosition[] => {
  return positionsText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [lat, lng] = line.split(',').map((value) => Number(value.trim()));
      return { lat, lng };
    })
    .filter((position) => !Number.isNaN(position.lat) && !Number.isNaN(position.lng));
};

const parseGPXCoordinates = (content: string): DangerZonePosition[] => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(content, 'application/xml');

  const trackPoints = Array.from(xml.getElementsByTagName('trkpt'))
    .map((point) => ({
      lat: Number(point.getAttribute('lat')),
      lng: Number(point.getAttribute('lon')),
    }))
    .filter((point) => !Number.isNaN(point.lat) && !Number.isNaN(point.lng));

  if (trackPoints.length >= 3) return trackPoints;

  return Array.from(xml.getElementsByTagName('rtept'))
    .map((point) => ({
      lat: Number(point.getAttribute('lat')),
      lng: Number(point.getAttribute('lon')),
    }))
    .filter((point) => !Number.isNaN(point.lat) && !Number.isNaN(point.lng));
};

const serializePositions = (positions: DangerZonePosition[] = []) =>
  positions.map((position) => `${position.lat}, ${position.lng}`).join('\n');

const getMapCenter = (positions: DangerZonePosition[]): LatLngExpression => {
  if (!positions.length) return [8.822, 125.126];

  const total = positions.reduce(
    (acc, position) => ({
      lat: acc.lat + position.lat,
      lng: acc.lng + position.lng,
    }),
    { lat: 0, lng: 0 }
  );

  return [total.lat / positions.length, total.lng / positions.length];
};

const getZoneMarkerIcon = (color: string, fillColor: string) =>
  divIcon({
    className: 'danger-zone-marker',
    html: `
      <div class="danger-zone-marker-wrap">
        <div class="danger-zone-marker-ring" style="border-color:${color};"></div>
        <div class="danger-zone-marker-pin" style="background:${fillColor};border-color:${color};color:${color};">
          <div class="danger-zone-marker-glyph">!</div>
          <div class="danger-zone-marker-tail" style="background:${fillColor};border-right-color:${color};border-bottom-color:${color};"></div>
        </div>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 38],
    tooltipAnchor: [0, -34],
  });

const getEpicenterIcon = (color: string, fillColor: string) =>
  divIcon({
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

const getVertexHandleIcon = (color: string) =>
  divIcon({
    className: 'danger-zone-vertex-handle',
    html: `
      <div style="width:18px;height:18px;border-radius:9999px;background:#fff;border:3px solid ${color};box-shadow:0 6px 16px rgba(15,23,42,.18);"></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

const getEdgeHandleIcon = (color: string, fillColor: string) =>
  divIcon({
    className: 'danger-zone-edge-handle',
    html: `
      <div style="display:flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:9999px;background:${fillColor};border:2px solid ${color};box-shadow:0 4px 12px rgba(15,23,42,.14);color:${color};font-size:11px;font-weight:900;line-height:1;">+</div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

const getMidpoint = (first: DangerZonePosition, second: DangerZonePosition): DangerZonePosition => ({
  lat: (first.lat + second.lat) / 2,
  lng: (first.lng + second.lng) / 2,
});

const EditablePolygonOverlay = ({
  positions,
  borderColor,
  fillColor,
  title,
  subtitle,
  description,
  onChange,
}: {
  positions: DangerZonePosition[];
  borderColor: string;
  fillColor: string;
  title: string;
  subtitle: string;
  description: string;
  onChange: (positions: DangerZonePosition[]) => void;
}) => {
  const canRenderPolygon = positions.length >= 3;

  return (
    <>
      {canRenderPolygon && (
        <>
          <Polygon
            positions={positions.map((position) => [position.lat, position.lng]) as LatLngExpression[]}
            pathOptions={{
              color: borderColor,
              fillColor,
              fillOpacity: 0.25,
              weight: 2,
            }}
          />
          <Marker position={getMapCenter(positions)} icon={getZoneMarkerIcon(borderColor, fillColor)}>
            <Tooltip direction="top" offset={[0, -28]} opacity={1}>
              <div className="min-w-40">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{title}</p>
                <p className="mt-1 text-sm font-black text-gray-800">{subtitle}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-primary">{description}</p>
              </div>
            </Tooltip>
          </Marker>
        </>
      )}

      {positions.map((position, index) => (
        <Marker
          key={`vertex-${index}`}
          position={[position.lat, position.lng]}
          draggable
          icon={getVertexHandleIcon(borderColor)}
          eventHandlers={{
            dragend: (event) => {
              const latLng = event.target.getLatLng();
              const nextPositions = positions.map((item, itemIndex) =>
                itemIndex === index ? { lat: latLng.lat, lng: latLng.lng } : item
              );
              onChange(nextPositions);
            },
            dblclick: () => {
              if (positions.length <= 3) return;
              onChange(positions.filter((_, itemIndex) => itemIndex !== index));
            },
          }}
        >
          <Tooltip direction="top" offset={[0, -10]} opacity={1}>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-700">
              Point {index + 1}
            </div>
          </Tooltip>
        </Marker>
      ))}

      {positions.length >= 2 &&
        positions.map((position, index) => {
          const nextPoint = positions[(index + 1) % positions.length];
          if (!nextPoint) return null;

          const midpoint = getMidpoint(position, nextPoint);

          return (
            <Marker
              key={`edge-${index}`}
              position={[midpoint.lat, midpoint.lng]}
              draggable
              icon={getEdgeHandleIcon(borderColor, fillColor)}
              eventHandlers={{
                click: () => {
                  const nextPositions = [...positions];
                  nextPositions.splice(index + 1, 0, midpoint);
                  onChange(nextPositions);
                },
                dragend: (event) => {
                  const latLng = event.target.getLatLng();
                  const nextPositions = [...positions];
                  nextPositions.splice(index + 1, 0, { lat: latLng.lat, lng: latLng.lng });
                  onChange(nextPositions);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-700">
                  Stretch Edge
                </div>
              </Tooltip>
            </Marker>
          );
        })}
    </>
  );
};

const DangerZonesContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { canManage } = getPageAccess(location.pathname);
  const { records = [], isLoaded } = useAppSelector((state: any) => state.dangerZones || {}) as {
    records: DangerZoneRecord[];
    isLoaded: boolean;
  };
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DangerZoneRecord | null>(null);
  const [formData, setFormData] = useState<DangerZoneFormState>(defaultFormState);

  const fetchDangerZones = async (forceRefresh = false) => {
    if (!forceRefresh && isLoaded) return;
    setIsLoading(true);
    try {
      const response = await axios.get('danger-zones');
      dispatch(setDangerZoneData({ records: response.data.data || [] }));
    } catch {
      toast.error('Failed to load danger zones.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDangerZones(false);
  }, [isLoaded]);

  const filteredRecords = useMemo(() => {
    return records.filter((record: DangerZoneRecord) => {
      const matchesSearch = [record.name, record.zone_type, record.description]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = selectedStatus === 'All Status' || record.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [records, search, selectedStatus]);

  const parsedPreviewPositions = useMemo(() => parsePositions(formData.positionsText), [formData.positionsText]);
  const activeCount = records.filter((record: DangerZoneRecord) => record.status === 'Active').length;

  const openAddModal = () => {
    setSelectedRecord(null);
    setFormData(defaultFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (record: DangerZoneRecord) => {
    setSelectedRecord(record);
    setFormData({
      name: record.name,
      zone_type: record.zone_type,
      description: record.description || '',
      status: record.status,
      color: record.color || '#dc2626',
      fill_color: record.fill_color || '#f87171',
      positionsText: serializePositions(record.positions),
    });
    setIsModalOpen(true);
  };

  const openViewModal = (record: DangerZoneRecord) => {
    setSelectedRecord(record);
    setIsViewOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
    setFormData(defaultFormState);
  };

  const handleGPXUpload = async (file: File | null) => {
    if (!file) return;

    try {
      const content = await file.text();
      const parsed = parseGPXCoordinates(content);

      if (parsed.length < 3) {
        toast.error('GPX file needs at least 3 valid points.');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        positionsText: serializePositions(parsed),
      }));
      toast.success('GPX coordinates loaded successfully.');
    } catch {
      toast.error('Unable to read the GPX file.');
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    const positions = parsePositions(formData.positionsText);
    if (positions.length < 3) {
      toast.error('Add at least 3 valid coordinate points.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        zone_type: formData.zone_type,
        description: formData.description,
        status: formData.status,
        color: formData.color,
        fill_color: formData.fill_color,
        positions,
      };

      if (selectedRecord) {
        const response = await axios.put(`danger-zones/${selectedRecord.id}`, payload);
        const updated = response.data.data;
        dispatch(updateDangerZoneRecord({ data: updated, mode: 'edit' }));
        toast.success('Danger zone updated.');
      } else {
        const response = await axios.post('danger-zones', payload);
        dispatch(updateDangerZoneRecord({ data: response.data.data, mode: 'add' }));
        toast.success('Danger zone added.');
      }

      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save danger zone.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (record: DangerZoneRecord) => {
    const result = await Swal.fire({
      title: 'Delete danger zone?',
      text: `Remove ${record.name} from the farmer map?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`danger-zones/${record.id}`);
      dispatch(deleteDangerZoneRecord(record.id));
      toast.success('Danger zone deleted.');
    } catch {
      toast.error('Failed to delete danger zone.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
          animation: dangerZoneBob 1.8s ease-in-out infinite, dangerZoneSpin 7s linear infinite;
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
        @keyframes dangerZoneSpin {
          from { filter: drop-shadow(0 0 0 rgba(0,0,0,0)); }
          50% { filter: drop-shadow(0 0 10px rgba(248,113,113,.18)); }
          to { filter: drop-shadow(0 0 0 rgba(0,0,0,0)); }
        }
        @keyframes dangerZonePulse {
          0%, 100% { transform: scale(.88); opacity: .2; }
          50% { transform: scale(1.12); opacity: .5; }
        }
      `}</style>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Risk Mapping</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Danger Zone <span className="text-primary italic">Management</span>
          </h2>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Admin can set the actual map polygons that farmers will see as warning areas.
          </p>
        </div>
        {canManage && (
          <button onClick={openAddModal} className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer">
            <Plus size={18} /> Add Danger Zone
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard icon={<ShieldAlert />} title="Total Zones" value={records.length.toString()} tone="red" isLoading={isLoading} />
        <MetricCard icon={<AlertTriangle />} title="Active Zones" value={activeCount.toString()} tone="amber" isLoading={isLoading} />
        <MetricCard icon={<MapPin />} title="Map Polygons" value={records.reduce((sum: number, zone: DangerZoneRecord) => sum + (zone.positions?.length ? 1 : 0), 0).toString()} tone="blue" isLoading={isLoading} />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search danger zone name or type..."
            className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-red-300 hover:text-red-500 rounded-full transition-all cursor-pointer">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relative shrink-0 w-full md:w-56">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold cursor-pointer">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl p-1 z-10000">
              {statusOptions.map((option) => (
                <SelectItem key={option} value={option} className="text-xs font-bold uppercase py-3 cursor-pointer">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button onClick={() => fetchDangerZones(true)} disabled={isLoading} className="shrink-0 flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-30">
          <RefreshCw size={16} className={cn(isLoading && 'animate-spin text-primary')} />
          <span className={cn(isLoading && 'text-primary')}>{isLoading ? 'Refreshing...' : 'Refresh data'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Danger Zone Records</h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-slate-800 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-6 animate-pulse space-y-3">
                  <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-2/3" />
                  <div className="h-16 bg-gray-100 dark:bg-slate-800 rounded-2xl" />
                </div>
              ))
            ) : filteredRecords.length > 0 ? (
              filteredRecords.map((record: DangerZoneRecord) => (
                <div key={record.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight">{record.name}</p>
                        <span className={cn('px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border', record.status === 'Active' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-rose-500 border-rose-200 bg-rose-50')}>
                          {record.status}
                        </span>
                      </div>
                      <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary">{record.zone_type}</p>
                      <p className="mt-3 text-xs font-medium text-gray-600 dark:text-gray-400 line-clamp-2">
                        {record.description || 'No description provided.'}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        <span className="inline-flex items-center gap-1"><MapPin size={12} /> {record.positions?.length || 0} points</span>
                        <span className="inline-flex items-center gap-1"><Calendar size={12} /> {record.updated_at ? new Date(record.updated_at).toLocaleDateString() : 'No update date'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openViewModal(record)} className="p-2.5 bg-transparent text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all cursor-pointer">
                        <Eye size={16} />
                      </button>
                      {canManage && (
                        <button onClick={() => openEditModal(record)} className="p-2.5 bg-transparent text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer">
                          <Edit3 size={16} />
                        </button>
                      )}
                      {canManage && (
                        <button onClick={() => handleDelete(record)} className="p-2.5 bg-transparent text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 text-center text-gray-400 uppercase text-xs font-bold italic tracking-widest">No danger zones found</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Live Zone Preview</h3>
          </div>
          <div className="h-[48vh] min-h-84 relative z-0">
            <MapContainer className="z-0" center={getMapCenter(filteredRecords[0]?.positions || [])} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
              <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="&copy; Google Maps" />
              {filteredRecords.map((record: DangerZoneRecord) => (
                <React.Fragment key={record.id}>
                  <Polygon
                    positions={record.positions.map((position: DangerZonePosition) => [position.lat, position.lng]) as LatLngExpression[]}
                    pathOptions={{
                      color: record.color || '#dc2626',
                      fillColor: record.fill_color || '#f87171',
                      fillOpacity: record.status === 'Active' ? 0.28 : 0.12,
                      weight: 2,
                    }}
                  />
                  <Marker
                    position={getMapCenter(record.positions)}
                    icon={getEpicenterIcon(record.color || '#dc2626', record.fill_color || '#f87171')}
                  >
                    <Tooltip direction="top" offset={[0, -28]} opacity={1} permanent={false}>
                      <div className="min-w-40">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Danger Zone</p>
                        <p className="mt-1 text-sm font-black text-gray-800">{record.name}</p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-primary">{record.zone_type}</p>
                        <p className="mt-2 text-[11px] font-bold text-gray-600">
                          {record.description || 'No description provided.'}
                        </p>
                      </div>
                    </Tooltip>
                  </Marker>
                </React.Fragment>
              ))}
            </MapContainer>
          </div>
          <div className="border-t border-gray-100 dark:border-slate-800 p-4 sm:p-5 bg-gray-50/70 dark:bg-slate-900/60">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Map Legend</p>
                <p className="mt-1 text-[11px] font-bold text-gray-500 dark:text-slate-400">
                  Zone name, type, color, and description for quick identification.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-300">
                <MapPin size={12} /> {filteredRecords.length} zone{filteredRecords.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record: DangerZoneRecord) => (
                  <div
                    key={`legend-${record.id}`}
                    className="rounded-[1.5rem] border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 px-4 py-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
                        style={{
                          backgroundColor: `${record.fill_color || '#f87171'}40`,
                          borderColor: record.color || '#dc2626',
                          color: record.color || '#dc2626',
                        }}
                      >
                        <MapPin size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-black uppercase tracking-tight text-gray-800 dark:text-white">
                            {record.name}
                          </p>
                          <span
                            className={cn(
                              'rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest',
                              record.status === 'Active'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                                : 'border-rose-200 bg-rose-50 text-rose-500'
                            )}
                          >
                            {record.status}
                          </span>
                        </div>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-primary">
                          {record.zone_type}
                        </p>
                        <p className="mt-2 text-[11px] font-bold leading-relaxed text-gray-600 dark:text-slate-300">
                          {record.description || 'No description provided for this danger zone.'}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} /> {record.positions?.length || 0} points
                          </span>
                          <span
                            className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1"
                            style={{
                              borderColor: `${record.color || '#dc2626'}55`,
                              color: record.color || '#dc2626',
                            }}
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full border"
                              style={{
                                backgroundColor: record.fill_color || '#f87171',
                                borderColor: record.color || '#dc2626',
                              }}
                            />
                            Zone Colors
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-gray-200 dark:border-slate-700 px-4 py-8 text-center">
                  <MapPin size={20} className="mx-auto text-gray-300 dark:text-slate-600" />
                  <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    No zones to preview
                  </p>
                  <p className="mt-2 text-[11px] font-bold text-gray-500 dark:text-slate-400">
                    Add a new danger zone or adjust the search and status filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
          <div className="absolute inset-0 z-0 bg-slate-900/60 backdrop-blur-sm" onClick={isSaving ? undefined : closeModal} />
          <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-primary p-6 flex items-center justify-between text-white">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight">{selectedRecord ? 'Edit Danger Zone' : 'Add Danger Zone'}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mt-1">Set the polygon that farmers will see on the map.</p>
              </div>
              <button onClick={closeModal} disabled={isSaving} className="p-2 hover:bg-white/10 rounded-2xl transition-all disabled:opacity-50 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form id="danger-zone-form" onSubmit={handleSave} className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Zone Name" value={formData.name} onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))} placeholder="e.g. Coastal Danger Zone" />
                <InputField label="Zone Type" value={formData.zone_type} onChange={(value) => setFormData((prev) => ({ ...prev, zone_type: value }))} placeholder="e.g. Flood-Prone Zone" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                  <Select value={formData.status} onValueChange={(value: DangerZoneStatus) => setFormData((prev) => ({ ...prev, status: value }))}>
                    <SelectTrigger className="w-full h-13 px-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold cursor-pointer">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl p-1 z-10001">
                      {['Active', 'Inactive'].map((option) => (
                        <SelectItem key={option} value={option} className="text-xs font-bold uppercase py-3 cursor-pointer">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ColorField label="Border Color" value={formData.color} onChange={(value) => setFormData((prev) => ({ ...prev, color: value }))} />
                <ColorField label="Fill Color" value={formData.fill_color} onChange={(value) => setFormData((prev) => ({ ...prev, fill_color: value }))} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none resize-none"
                  placeholder="Explain why this area is dangerous for farmers."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Polygon Coordinates</label>
                <div className="rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/70 dark:bg-blue-900/10 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <Upload size={12} /> GPX Import
                    </p>
                    <p className="text-[11px] font-bold text-blue-700/80 dark:text-blue-300 mt-2 leading-relaxed">
                      Upload a `.gpx` boundary file to auto-generate the danger zone polygon coordinates.
                    </p>
                  </div>
                  <label className="shrink-0 inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-[10px] font-black uppercase tracking-widest text-blue-600 cursor-pointer">
                    <MapPin size={14} /> Upload GPX
                    <input
                      type="file"
                      accept=".gpx,application/gpx+xml,.xml"
                      className="hidden"
                      onChange={(e) => handleGPXUpload(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
                <textarea
                  rows={6}
                  value={formData.positionsText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, positionsText: e.target.value }))}
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-mono font-bold outline-none resize-none"
                  placeholder={`8.8224, 125.1201\n8.8249, 125.1247\n8.8215, 125.1299`}
                />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  One coordinate pair per line. Format: latitude, longitude.
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Zone Map Preview</label>
                <div className="rounded-[1.75rem] border border-gray-100 dark:border-slate-800 overflow-hidden">
                  <div className="h-[60vh] min-h-96 relative z-0">
                    <MapContainer className="z-0" center={getMapCenter(parsedPreviewPositions)} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                      <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="&copy; Google Maps" />
                      <EditablePolygonOverlay
                        positions={parsedPreviewPositions}
                        borderColor={formData.color}
                        fillColor={formData.fill_color}
                        title="Preview Zone"
                        subtitle={formData.name || 'Unnamed Zone'}
                        description={formData.zone_type || 'No zone type yet'}
                        onChange={(positions) =>
                          setFormData((prev) => ({
                            ...prev,
                            positionsText: serializePositions(positions),
                          }))
                        }
                      />
                    </MapContainer>
                  </div>
                </div>
                <div className="rounded-3xl border border-primary/10 bg-primary/5 px-5 py-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Preview Notes</p>
                  <p className="mt-2 text-[11px] font-bold text-gray-600 dark:text-gray-300">
                    Valid points detected: {parsedPreviewPositions.length}. You need at least 3 points to save a danger zone polygon.
                  </p>
                  <p className="mt-2 text-[11px] font-bold text-gray-600 dark:text-gray-300">
                    Drag white corner handles to move points. Drag or click the small `+` edge handles to stretch the polygon and add a new point.
                  </p>
                  <p className="mt-2 text-[11px] font-bold text-gray-600 dark:text-gray-300">
                    Double-click a corner point to remove it, as long as at least 3 points remain.
                  </p>
                </div>
              </div>
            </form>

            <div className="p-6 bg-gray-50/50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button type="button" disabled={isSaving} onClick={closeModal} className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
              </button>
              <button
                type="submit"
                form="danger-zone-form"
                disabled={isSaving}
                className={cn(
                  'px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all border shadow-sm',
                  isSaving
                    ? 'bg-amber-50 text-amber-700 border-amber-300 cursor-not-allowed'
                    : 'bg-primary text-white border-primary hover:opacity-90 cursor-pointer shadow-primary/20'
                )}
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {isSaving ? 'Saving Zone...' : selectedRecord ? 'Update Zone' : 'Save Zone'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isViewOpen && selectedRecord && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <div className="absolute inset-0 z-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsViewOpen(false)} />
          <div className="relative z-10 w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-primary p-6 flex items-center justify-between text-white">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight">{selectedRecord.name}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mt-1">{selectedRecord.zone_type}</p>
              </div>
              <button onClick={() => setIsViewOpen(false)} className="p-2 hover:bg-white/10 rounded-2xl transition-all cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ViewCard label="Status" value={selectedRecord.status} />
                <ViewCard label="Polygon Points" value={`${selectedRecord.positions?.length || 0}`} />
                <ViewCard label="Last Updated" value={selectedRecord.updated_at ? new Date(selectedRecord.updated_at).toLocaleString() : 'N/A'} />
              </div>
              <div className="rounded-[1.75rem] border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="h-88 relative z-0">
                  <MapContainer className="z-0" center={getMapCenter(selectedRecord.positions)} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                    <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="&copy; Google Maps" />
                    <Polygon
                      positions={selectedRecord.positions.map((position) => [position.lat, position.lng]) as LatLngExpression[]}
                      pathOptions={{
                        color: selectedRecord.color,
                        fillColor: selectedRecord.fill_color,
                        fillOpacity: 0.25,
                        weight: 2,
                      }}
                    />
                    <Marker
                      position={getMapCenter(selectedRecord.positions)}
                      icon={getZoneMarkerIcon(selectedRecord.color, selectedRecord.fill_color)}
                    >
                      <Tooltip direction="top" offset={[0, -28]} opacity={1}>
                        <div className="min-w-40">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Danger Zone</p>
                          <p className="mt-1 text-sm font-black text-gray-800">{selectedRecord.name}</p>
                          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-primary">{selectedRecord.zone_type}</p>
                          <p className="mt-2 text-[11px] font-bold text-gray-600">
                            {selectedRecord.description || 'No description provided.'}
                          </p>
                        </div>
                      </Tooltip>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
              <div className="rounded-3xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30 px-5 py-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</p>
                <p className="mt-2 text-sm font-bold text-gray-700 dark:text-slate-200">{selectedRecord.description || 'No description provided.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ icon, title, value, tone, isLoading }: any) => {
  const toneClasses: Record<string, string> = {
    red: 'bg-rose-500/10 text-rose-500',
    amber: 'bg-amber-500/10 text-amber-500',
    blue: 'bg-blue-500/10 text-blue-500',
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm relative overflow-hidden h-28 group">
      {isLoading ? (
        <>
          <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse shrink-0" />
          <div className="space-y-2 w-full">
            <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-24" />
            <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-16" />
          </div>
        </>
      ) : (
        <>
          <div className={cn('p-4 rounded-2xl transition-all duration-300', toneClasses[tone] || toneClasses.red)}>{icon}</div>
          <div className="flex-1 w-full animate-in fade-in zoom-in duration-300">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none truncate">{value}</h3>
          </div>
        </>
      )}
    </div>
  );
};

const InputField = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
    />
  </div>
);

const ColorField = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-14 rounded-lg border-0 bg-transparent cursor-pointer" />
      <span className="text-xs font-black uppercase tracking-widest text-gray-500">{value}</span>
    </div>
  </div>
);

const ViewCard = ({ label, value }: any) => (
  <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30 px-4 py-4">
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
    <p className="mt-2 text-sm font-bold text-gray-700 dark:text-slate-200">{value}</p>
  </div>
);

export default DangerZonesContainer;
