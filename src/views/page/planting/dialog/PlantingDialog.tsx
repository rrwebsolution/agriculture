import React, { useEffect, useState } from 'react';
import axios from '../../../../plugin/axios';
import { 
  Shovel, X, Check, Loader2, User, MapPin, 
  Wheat, Calendar, Clock, BarChart, Plus, Trash2 
} from 'lucide-react';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from './../../../../components/ui/select';

interface Farmer {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
}

interface PlantingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  formData: {
    farmer: string;
    sector: string;
    crop: string;
    area: string;
    datePlanted: string;
    estHarvest: string;
    status: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  isSaving: boolean;
  isEdit: boolean;
}

const INITIAL_STATUSES = ["Seedling", "Vegetative", "Flowering", "Maturity"];
const CLUSTER_OPTIONS = ["Sector 1 (Anakan)", "Sector 2 (Odiongan)", "Sector 3 (Lunao)", "Sector 4 (Poblacion)", "Sector 5 (San Luis)"];
const LOCAL_STORAGE_KEY = 'planting_status_list';

const PlantingDialog: React.FC<PlantingDialogProps> = ({ 
  isOpen, onClose, onSave, formData, setFormData, isSaving, isEdit 
}) => {
  
  const [farmersList, setFarmersList] = useState<Farmer[]>([]);
  const [isLoadingFarmers, setIsLoadingFarmers] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [statuses, setStatuses] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_STATUSES;
    }
    return INITIAL_STATUSES;
  });

  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const [newStatusValue, setNewStatusValue] = useState("");

  // 🌟 FETCH WITH AUTHORIZATION
  useEffect(() => {
    const fetchFarmers = async () => {
      if (!isOpen) return;
      
      setIsLoadingFarmers(true);
      setFetchError(null);
      
      try {
        const token = localStorage.getItem('auth_token'); // Siguroha nga 'token' ang key sa imong storage
        const response = await axios.get('farmers', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        setFarmersList(response.data.data);
      } catch (error: any) {
        console.error("Axios Error:", error);
        if (error.response?.status === 401) {
          setFetchError("Unauthorized. Please login.");
        } else {
          setFetchError("Error loading farmers.");
        }
      } finally {
        setIsLoadingFarmers(false);
      }
    };

    fetchFarmers();
  }, [isOpen]);

  const formatFullName = (f: Farmer) => {
    const first = f.first_name || '';
    const middle = f.middle_name ? ` ${f.middle_name.charAt(0)}.` : '';
    const last = f.last_name || '';
    const suffix = f.suffix ? ` ${f.suffix}` : '';
    return `${first}${middle} ${last}${suffix}`.replace(/\s+/g, ' ').trim();
  };

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (!isEdit && !formData.status) {
        setFormData((prev: any) => ({ ...prev, status: 'Seedling', sector: CLUSTER_OPTIONS[0] }));
      }
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, isEdit, setFormData, formData.status]);

  const handleAddStatus = () => {
    const trimmed = newStatusValue.trim();
    if (trimmed === "" || statuses.includes(trimmed)) {
      setIsAddingStatus(false);
      return;
    }
    setStatuses([...statuses, trimmed]);
    setFormData({ ...formData, status: trimmed });
    setNewStatusValue("");
    setIsAddingStatus(false);
  };

  const handleDeleteStatus = (e: React.MouseEvent, s: string) => {
    e.preventDefault(); e.stopPropagation();
    const updated = statuses.filter(item => item !== s);
    setStatuses(updated);
    if (formData.status === s) setFormData({ ...formData, status: INITIAL_STATUSES[0] });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={isSaving ? undefined : onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="bg-primary p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><Shovel size={20} /></div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight leading-none">{isEdit ? 'Update Planting' : 'Log New Planting'}</h3>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Gingoog Geographical Unit</p>
            </div>
          </div>
          <button type="button" disabled={isSaving} onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none"><X size={20} /></button>
        </div>

        {/* FORM */}
        <form onSubmit={onSave} className="p-8 space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* FARMER NAME SELECTION */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <User size={12} className="text-primary" /> Farmer Name
              </label>
              <Select disabled={isSaving || isLoadingFarmers} value={formData.farmer} onValueChange={(val) => setFormData({...formData, farmer: val})}>
                <SelectTrigger className="w-full h-auto px-4 py-4 bg-gray-50 dark:bg-slate-800 border-transparent focus:border-primary/30 rounded-2xl text-sm font-bold shadow-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder={isLoadingFarmers ? "Loading..." : fetchError ? "Error loading" : "Select Farmer"} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-100 max-h-75">
                  {farmersList.map((f) => {
                    const fullName = formatFullName(f);
                    return <SelectItem key={f.id} value={fullName} className="text-xs font-bold py-3 px-4 rounded-xl cursor-pointer">{fullName}</SelectItem>
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* CLUSTER / LOCATION */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <MapPin size={12} className="text-primary" /> Cluster / Location
              </label>
              <Select disabled={isSaving} value={formData.sector} onValueChange={(val) => setFormData({...formData, sector: val})}>
                <SelectTrigger className="w-full h-auto px-4 py-4 bg-gray-50 dark:bg-slate-800 border-transparent rounded-2xl text-sm font-bold shadow-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-100">
                  {CLUSTER_OPTIONS.map((opt) => (<SelectItem key={opt} value={opt} className="text-xs font-bold py-3 px-4 rounded-xl">{opt}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {/* CROP DETAILS */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Wheat size={12} className="text-primary" /> Crop Details
              </label>
              <input type="text" required disabled={isSaving} className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border-transparent rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none text-slate-700 dark:text-slate-200" value={formData.crop} onChange={(e) => setFormData({...formData, crop: e.target.value})} />
            </div>

            {/* AREA SIZE */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <BarChart size={12} className="text-primary" /> Area Size (ha)
              </label>
              <input type="text" required disabled={isSaving} className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border-transparent rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none text-slate-700 dark:text-slate-200" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} />
            </div>

            {/* DATE PLANTED */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Calendar size={12} className="text-primary" /> Date Planted
              </label>
              <input type="date" required disabled={isSaving} className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border-transparent rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200" value={formData.datePlanted} onChange={(e) => setFormData({...formData, datePlanted: e.target.value})} />
            </div>

            {/* EST HARVEST */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Clock size={12} className="text-primary" /> Est. Harvest
              </label>
              <input type="date" required disabled={isSaving} className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border-transparent rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200" value={formData.estHarvest} onChange={(e) => setFormData({...formData, estHarvest: e.target.value})} />
            </div>

            {/* STATUS FIELD */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <BarChart size={12} className="text-primary" /> Status
              </label>
              <Select disabled={isSaving} value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                <SelectTrigger className="w-full h-auto px-4 py-4 bg-gray-50 dark:bg-slate-800 border-transparent rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-100 max-h-75">
                  {statuses.map((s) => (
                    <div key={s} className="relative group flex items-center">
                      <SelectItem value={s} className="w-full text-xs font-bold py-3 px-4 rounded-xl cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors">{s}</SelectItem>
                      {!INITIAL_STATUSES.includes(s) && (
                        <button type="button" onClick={(e) => handleDeleteStatus(e, s)} className="absolute right-2 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-50"><Trash2 size={12} /></button>
                      )}
                    </div>
                  ))}
                  <div className="px-2 py-2 mt-2 border-t border-gray-100 dark:border-slate-800">
                    {!isAddingStatus ? (
                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsAddingStatus(true); }} className="flex items-center gap-2 w-full px-2 py-2 text-xs font-black text-primary uppercase tracking-widest hover:bg-primary/10 rounded-lg transition-all"><Plus size={14} /> Add Status</button>
                    ) : (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input autoFocus type="text" value={newStatusValue} onChange={(e) => setNewStatusValue(e.target.value)} onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); handleAddStatus(); } }} className="flex-1 bg-gray-50 dark:bg-slate-800 text-xs font-bold px-3 py-2 rounded-lg outline-none border focus:border-primary/30 text-slate-700 dark:text-slate-200" />
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddStatus(); }} className="bg-primary text-white p-2 rounded-lg"><Plus size={14} /></button>
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsAddingStatus(false); }} className="p-2 text-gray-400 hover:text-red-500"><X size={14} /></button>
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>

          <button type="submit" disabled={isSaving} className="w-full px-6 py-4 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 disabled:opacity-70 transition-all">
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {isSaving ? 'Processing...' : isEdit ? 'Update Log' : 'Save Planting Log'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlantingDialog;