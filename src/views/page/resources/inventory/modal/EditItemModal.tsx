import { useState, useEffect } from 'react';
import { 
  Edit3, Package, Hash, X, LayoutGrid, 
  Database, Loader2, Save, Tractor, FileText 
} from 'lucide-react';
import { cn } from '../../../../../lib/utils';
import SearchableSelect from '../SearchableSelect';

interface EditItemModalProps {
  isOpen: boolean; 
  onClose: () => void; 
  selectedItem: any; 
  onSubmit: (formData: any) => void;
  categoryOptions: string[]; 
  defaultCategories: string[]; 
  onAddCategory: (val: string) => void; 
  onDeleteCategory: (val: string) => void;
  commodityOptions: string[]; 
  defaultCommodities: string[]; 
  onAddCommodity: (val: string) => void; 
  onDeleteCommodity: (val: string) => void;
  equipmentList: string[]; 
  onAddEquipment: (val: string) => void; 
  onDeleteEquipment: (val: string) => void;
  unitOptions: string[];
  onAddUnit: (val: string) => void;
  onDeleteUnit: (val: string) => void;
}

const PROGRAM_OPTIONS_MAP: Record<string, string[]> = {
  "Seed distribution": ["Backyard garden", "Communal Garden", "School garden", "EGC Cares (Package)", "Walk In"],
  "Fertilizer distribution(Inorganic)": ["46-0-0", "21-0-0-24", "18-46-0", "16-20-0", "14-14-14", "16-16-16", "0-0-60"],
  "Fertilizer distribution(Organic)": ["Chicken Dung", "Vermicast", "Well-grow"],
};

export default function EditItemModal({ 
    isOpen, onClose, selectedItem, onSubmit, 
    unitOptions, onAddUnit, onDeleteUnit,
    categoryOptions, defaultCategories, onAddCategory, onDeleteCategory, 
    commodityOptions, defaultCommodities, onAddCommodity, onDeleteCommodity, 
    equipmentList, onAddEquipment, onDeleteEquipment 
}: EditItemModalProps) {
    
  // 1. TANANG HOOKS DAPAT NAA SA PINAKATAAS
  const [formData, setFormData] = useState({ 
    name: "", sku: "", batch: "", commodity: "", category: "", 
    stock: 0, unit: "", threshold: 10,
    recipients: 0, year: "", remarks: "" 
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // GI-MERGE NGA EFFECT (Dapat naa ni sa taas sa conditional return)
  useEffect(() => {
    if (isOpen) {
        setIsSaving(false); // Reset loader inig abli
        if (selectedItem) {
            setFormData({ 
                ...selectedItem,
                recipients: selectedItem.recipients || 0,
                year: selectedItem.year || new Date().getFullYear().toString(),
                remarks: selectedItem.remarks || ""
            });
        }
        setErrors({});
    }
  }, [isOpen, selectedItem]);

  // 2. MGA LOGIC HELPERS
  const getDynamicProgramOptions = () => {
    if (PROGRAM_OPTIONS_MAP[formData.category]) return PROGRAM_OPTIONS_MAP[formData.category];
    if (formData.category === "Commodity based(Package)") return commodityOptions;
    return [];
  };

  const getProtectedOptions = () => {
    if (PROGRAM_OPTIONS_MAP[formData.category]) return PROGRAM_OPTIONS_MAP[formData.category];
    if (formData.category === "Commodity based(Package)") return defaultCommodities;
    return [];
  };

  const showProgramSelect = [
    "Seed distribution", "Fertilizer distribution(Inorganic)", 
    "Fertilizer distribution(Organic)", "Commodity based(Package)"
  ].includes(formData.category);

  const getPlaceholderText = (category: string) => {
    switch (category) {
        case "Seed distribution": return "e.g. RC-222 (Inbred)";
        case "Fertilizer distribution(Inorganic)": return "e.g. Urea (46-0-0)";
        case "Tools and equipments": return "Search Equipment Database...";
        default: return "e.g. Enter Item Name";
    }
  };

  const isToolsAndEquipments = formData.category === "Tools and equipments";

  const validateForm = () => {
      let newErrors: Record<string, string> = {};
      if (!formData.name) newErrors.name = "Item name is required.";
      if (showProgramSelect && !formData.commodity) newErrors.commodity = "Program is required.";
      if (!formData.unit) newErrors.unit = "Unit is required.";
      if (!formData.year) newErrors.year = "Year is required.";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;
      setIsSaving(true); 
      try {
          await onSubmit(formData); 
          setIsSaving(false); 
      } catch (error) {
          console.error("Modal Submit Error:", error);
          setIsSaving(false); 
      }
  };

  // 3. CONDITIONAL RETURN (Dapat naa ni sa ubos sa tanang Hooks)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={isSaving ? undefined : onClose} />
        
        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            
            {/* HEADER */}
            <div className="bg-slate-800 p-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4 text-white">
                    <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"><Edit3 size={20} /></div>
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-tight leading-none">Update Asset</h2>
                        <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Editing: {selectedItem?.sku}</p>
                    </div>
                </div>
                <button type="button" disabled={isSaving} onClick={onClose} className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer transition-colors disabled:opacity-50"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden" noValidate>
                <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    
                    {/* 1. CATEGORIZATION */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <LayoutGrid size={14}/> <span className="text-[11px] font-black uppercase tracking-widest">1. Categorization</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                <SearchableSelect 
                                    placeholder="Category" options={categoryOptions} defaultOptions={defaultCategories} 
                                    value={formData.category} onAdd={onAddCategory} onDelete={onDeleteCategory} 
                                    onChange={(val) => setFormData({...formData, category: val, name: "", commodity: ""})} 
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Name <span className="text-red-500">*</span></label>
                                <div className="relative flex items-center">
                                    {isToolsAndEquipments ? (
                                        <>
                                            <div className="absolute left-4 text-gray-400 z-10"><Tractor size={16} /></div>
                                            <SearchableSelect 
                                                placeholder={getPlaceholderText(formData.category)} 
                                                options={equipmentList} defaultOptions={equipmentList} 
                                                value={formData.name} showAddButton={false} 
                                                onAdd={onAddEquipment} onDelete={onDeleteEquipment} 
                                                onChange={(val) => setFormData({...formData, name: val})} 
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <div className="absolute left-4 text-gray-400 z-10"><Package size={16} /></div>
                                            <input type="text" className={cn("w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold outline-none uppercase", errors.name ? "border-red-500" : "border-gray-300 dark:border-slate-700")} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                        </>
                                    )}
                                </div>
                                {errors.name && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.name}</p>}
                            </div>

                            {showProgramSelect && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Commodity Program <span className="text-red-500">*</span></label>
                                    <SearchableSelect 
                                        placeholder="Select Program" options={getDynamicProgramOptions()} defaultOptions={getProtectedOptions()} 
                                        value={formData.commodity} showAddButton={true} onAdd={onAddCommodity} onDelete={onDeleteCommodity} 
                                        onChange={(val) => setFormData({...formData, commodity: val})} 
                                    />
                                    {errors.commodity && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.commodity}</p>}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SKU / Code</label>
                                <div className="relative flex items-center">
                                    <Hash className="absolute left-4 text-gray-400" size={16} />
                                    <input required type="text" className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none uppercase" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-slate-800" />

                    {/* 2. STOCK METRICS */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <Database size={14}/> <span className="text-[11px] font-black uppercase tracking-widest">2. Stock Metrics</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {/* Stock Level - Read Only */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Current Stock Level
                                </label>
                                <input 
                                    type="number" 
                                    readOnly // <--- Gihimo kining Read Only
                                    className="w-full px-4 py-4 bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none cursor-not-allowed text-gray-500 opacity-70" 
                                    value={formData.stock} 
                                    tabIndex={-1} // <--- Dili ma-focus gamit ang Tab key
                                />
                                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter ml-1">
                                    * Use transactions to update stock count
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unit</label>
                                <SearchableSelect 
                                    placeholder="Unit" options={unitOptions} defaultOptions={["Sacks", "Packs", "Pieces"]} 
                                    value={formData.unit} showAddButton={true} onAdd={onAddUnit} onDelete={onDeleteUnit} 
                                    onChange={(val) => setFormData({...formData, unit: val})} 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Batch</label>
                                <input type="text" className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 rounded-2xl text-sm font-bold outline-none uppercase" value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Threshold</label>
                                <input type="number" className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 rounded-2xl text-sm font-bold outline-none" value={formData.threshold} onChange={(e) => setFormData({...formData, threshold: parseInt(e.target.value) || 0})} />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-slate-800" />

                    {/* 3. ADDITIONAL DETAILS */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <FileText size={14}/> <span className="text-[11px] font-black uppercase tracking-widest">3. Additional Details</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">No. of Recipient</label>
                                <input type="number" className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 rounded-2xl text-sm font-bold outline-none" value={formData.recipients} onChange={(e) => setFormData({...formData, recipients: parseInt(e.target.value) || 0})} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Year <span className="text-red-500">*</span></label>
                                <input type="number" className={cn("w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold outline-none", errors.year ? "border-red-500" : "border-gray-300")} value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} />
                                {errors.year && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.year}</p>}
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Remarks</label>
                                <textarea className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 rounded-2xl text-sm font-bold outline-none resize-none h-24" value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={isSaving} 
                        className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    
                    <button 
                        type="submit" 
                        disabled={isSaving} 
                        className={cn(
                            "px-8 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-slate-800/20 active:scale-95",
                            isSaving ? "opacity-70 cursor-not-allowed" : "hover:opacity-90 cursor-pointer"
                        )}
                    >
                        {isSaving ? (
                            <Loader2 size={16} className="animate-spin" /> 
                        ) : (
                            <Save size={16} />
                        )} 
                        {isSaving ? 'Updating Asset...' : 'Update Details'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}