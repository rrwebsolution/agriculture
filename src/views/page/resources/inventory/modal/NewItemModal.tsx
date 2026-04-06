import { useState } from 'react';
import { 
  Plus, Package, Hash, Layers, X, LayoutGrid, 
  Database, Loader2, Save, Tractor, FileText, 
} from 'lucide-react';
import { cn } from '../../../../../lib/utils';
import SearchableSelect from '../SearchableSelect';

interface NewItemModalProps {
  isOpen: boolean; 
  onClose: () => void; 
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

export default function NewItemModal({ 
    isOpen, onClose, onSubmit, 
    unitOptions, onAddUnit, onDeleteUnit,
    categoryOptions, defaultCategories, onAddCategory, onDeleteCategory, 
    commodityOptions, onAddCommodity, onDeleteCommodity, 
    equipmentList, onAddEquipment, onDeleteEquipment, defaultCommodities,
}: NewItemModalProps) {
    
  // 1. Gi-add ang recipients, year, ug remarks
  const [formData, setFormData] = useState({ 
    name: "", sku: "", batch: "", commodity: "", category: "", 
    stock: 0, unit: "", threshold: 10, 
    source: "",
    recipients: 0, year: new Date().getFullYear().toString(), remarks: "" 
  });
  
  // 2. State para sa Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  // 1. Full list nga makita sa dropdown base sa Category
const getDynamicProgramOptions = () => {
    // Kon Seeds o Fertilizer, kuhaon ang specific list (Backyard garden, 46-0-0, etc.)
    if (PROGRAM_OPTIONS_MAP[formData.category]) {
        return PROGRAM_OPTIONS_MAP[formData.category];
    }
    
    // Kon Commodity based(Package), ipakita ang Rice Program, Corn Program, etc.
    if (formData.category === "Commodity based(Package)") {
        return commodityOptions; // Kini ang listahan gikan sa parent (Rice, Corn, etc.)
    }

    return [];
};

// 2. Listahan sa mga PROTECTED options (WALAY delete button)
const getProtectedOptions = () => {
    // Kon Seeds o Fertilizer
    if (PROGRAM_OPTIONS_MAP[formData.category]) {
        return PROGRAM_OPTIONS_MAP[formData.category];
    }
    
    // Kon Commodity based(Package)
    if (formData.category === "Commodity based(Package)") {
        return defaultCommodities; // Ang system defaults (Rice, Corn, etc.)
    }

    return [];
};

// 3. Kanus-a ipakita ang Program Selection field
const showProgramSelect = [
    "Seed distribution", 
    "Fertilizer distribution(Inorganic)", 
    "Fertilizer distribution(Organic)", 
    "Commodity based(Package)"
].includes(formData.category);

  const getPlaceholderText = (category: string) => {
    switch (category) {
        case "Seed distribution": return "e.g. RC-222 (Inbred)";
        case "Fertilizer distribution(Inorganic)": return "e.g. Urea (46-0-0)";
        case "Fertilizer distribution(Organic)": return "e.g. Vermicast";
        case "Commodity based(Package)": return "e.g. Backyard Gardening Kit";
        case "Tools and equipments": return "Search Equipment Database...";
        default: return "e.g. Enter Item Name";
    }
  };

  const isToolsAndEquipments = formData.category === "Tools and equipments";

  // 3. Validation Logic
  const validateForm = () => {
      let newErrors: Record<string, string> = {};
      if (!formData.category) newErrors.category = "Category is required.";
      if (!formData.name) newErrors.name = "Item name is required.";
      if (showProgramSelect && !formData.commodity) newErrors.commodity = "Commodity program is required.";
      if (!formData.sku) newErrors.sku = "SKU/Code is required.";
      if (!formData.unit) newErrors.unit = "Unit is required.";
      if (!formData.year) newErrors.year = "Year is required.";
      if (formData.stock < 0) newErrors.stock = "Stock cannot be negative.";
      if (formData.recipients < 0) newErrors.recipients = "Recipients cannot be negative.";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={isSaving ? undefined : onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            
            <div className="bg-primary p-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4 text-white">
                    <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"><Plus size={20} /></div>
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-tight leading-none">Register New Asset</h2>
                        <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Inventory Management</p>
                    </div>
                </div>
                <button type="button" disabled={isSaving} onClick={onClose} className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer transition-colors disabled:opacity-50"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden" noValidate>
                <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    
                    {/* 1. CATEGORIZATION */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-primary">
                            <LayoutGrid size={14}/> <span className="text-[11px] font-black uppercase tracking-widest">1. Categorization</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category <span className="text-red-500">*</span></label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 text-gray-400 z-10"><Layers size={16} /></div>
                                    <SearchableSelect 
                                        placeholder="Category" 
                                        options={categoryOptions} defaultOptions={defaultCategories} 
                                        value={formData.category} onAdd={onAddCategory} onDelete={onDeleteCategory} 
                                        onChange={(val) => { setFormData({...formData, category: val, name: "", commodity: ""}); setErrors({...errors, category: ""}); }} 
                                    />
                                </div>
                                {errors.category && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.category}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset / Item Name <span className="text-red-500">*</span></label>
                                <div className="relative flex items-center">
                                    {isToolsAndEquipments ? (
                                        <>
                                            <div className="absolute left-4 text-gray-400 z-10"><Tractor size={16} /></div>
                                            <SearchableSelect 
                                                placeholder={getPlaceholderText(formData.category)} 
                                                options={equipmentList} defaultOptions={equipmentList} 
                                                value={formData.name} showAddButton={false} 
                                                onAdd={onAddEquipment} onDelete={onDeleteEquipment} 
                                                onChange={(val) => { setFormData({...formData, name: val}); setErrors({...errors, name: ""}); }} 
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <div className="absolute left-4 text-gray-400 z-10"><Package size={16} /></div>
                                            <input type="text" className={cn("w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold outline-none uppercase", errors.name ? "border-red-500 focus:border-red-500" : "border-gray-300 dark:border-slate-700")} placeholder={getPlaceholderText(formData.category)} value={formData.name} onChange={(e) => { setFormData({...formData, name: e.target.value}); setErrors({...errors, name: ""}); }} />
                                        </>
                                    )}
                                </div>
                                {errors.name && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.name}</p>}
                            </div>

                            {showProgramSelect && (
    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
        <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">
            Commodity Program / Type <span className="text-red-500">*</span>
        </label>
        <div className="relative flex items-center">
            <div className="absolute left-4 text-primary z-10">
                <LayoutGrid size={16} />
            </div>
            <SearchableSelect 
                placeholder="Select Program/Type"
                
                // Ipakita ang husto nga listahan base sa kategorya
                options={getDynamicProgramOptions()} 
                
                // Protektahan ang mga default items gikan sa pagka-delete
                defaultOptions={getProtectedOptions()} 
                
                value={formData.commodity} 
                showAddButton={true} // Naay "Add New" button sa tanan
                onAdd={onAddCommodity} 
                onDelete={onDeleteCommodity} 
                onChange={(val) => { 
                    setFormData({...formData, commodity: val}); 
                    setErrors({...errors, commodity: ""}); 
                }} 
            />
        </div>
        {errors.commodity && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.commodity}</p>}
    </div>
)}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SKU / Code <span className="text-red-500">*</span></label>
                                <div className="relative flex items-center">
                                    <Hash className="absolute left-4 text-gray-400" size={16} />
                                    <input type="text" className={cn("w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold outline-none uppercase", errors.sku ? "border-red-500 focus:border-red-500" : "border-gray-300 dark:border-slate-700")} placeholder="e.g. B2024-X" value={formData.sku} onChange={(e) => { setFormData({...formData, sku: e.target.value}); setErrors({...errors, sku: ""}); }} />
                                </div>
                                {errors.sku && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.sku}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-slate-800" />

                    {/* 2. STOCK METRICS */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-primary">
                            <div className="p-1.5 bg-primary/10 rounded-2xl"><Database size={14}/></div>
                            <span className="text-[11px] font-black uppercase tracking-widest">2. Stock Metrics</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Stock</label>
                                <input type="number" min="0" className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 rounded-2xl text-sm font-bold outline-none" value={formData.stock} onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unit <span className="text-red-500">*</span></label>
                                <SearchableSelect 
                                    placeholder="Unit" options={unitOptions} defaultOptions={["Sacks", "Packs", "Pieces", "Bottles", "Kilos"]} 
                                    value={formData.unit} showAddButton={true} onAdd={onAddUnit} onDelete={onDeleteUnit} 
                                    onChange={(val) => { setFormData({...formData, unit: val}); setErrors({...errors, unit: ""}); }} 
                                />
                                {errors.unit && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.unit}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Batch</label>
                                <input type="text" className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 rounded-2xl text-sm font-bold outline-none uppercase" placeholder="B2024" value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alert Threshold</label>
                                <input type="number" min="1" className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 rounded-2xl text-sm font-bold outline-none" value={formData.threshold} onChange={(e) => setFormData({...formData, threshold: parseInt(e.target.value) || 0})} />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-slate-800" />

                    {/* 3. ADDITIONAL DETAILS */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-primary">
                            <div className="p-1.5 bg-primary/10 rounded-2xl"><FileText size={14}/></div>
                            <span className="text-[11px] font-black uppercase tracking-widest">3. Additional Details</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">No. of Recipient</label>
                                <input type="number" min="0" className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 rounded-2xl text-sm font-bold outline-none" placeholder="0" value={formData.recipients} onChange={(e) => setFormData({...formData, recipients: parseInt(e.target.value) || 0})} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Year <span className="text-red-500">*</span></label>
                                <input type="number" className={cn("w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold outline-none", errors.year ? "border-red-500 focus:border-red-500" : "border-gray-300 dark:border-slate-700")} placeholder="e.g. 2024" value={formData.year} onChange={(e) => { setFormData({...formData, year: e.target.value}); setErrors({...errors, year: ""}); }} />
                                {errors.year && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.year}</p>}
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Remarks</label>
                                <textarea className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 rounded-2xl text-sm font-bold outline-none resize-none h-24" placeholder="Enter any additional notes..." value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} />
                            </div>
                        </div>
                    </div>

                </div>

                <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600">Cancel</button>
                    <button type="submit" disabled={isSaving} className={cn("px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-3", isSaving && "opacity-50")}>
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                        {isSaving ? 'Saving...' : 'Register Asset'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}