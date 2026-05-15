import { useEffect, useMemo, useRef, useState } from 'react';
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
  inventoryItems: any[];
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

const CUSTOM_PROGRAM_TYPES_STORAGE_KEY = "inv_custom_program_types";
const SOURCE_SUPPLIERS_STORAGE_KEY = "inv_source_suppliers";

const normalizeOption = (value: string) => value.trim().replace(/\s+/g, " ");
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const mergeOptions = (defaults: string[], custom: string[] = []) => {
  return [...defaults, ...custom]
    .map(normalizeOption)
    .filter(Boolean)
    .reduce<string[]>((unique, option) => {
      if (!unique.some(item => item.toLowerCase() === option.toLowerCase())) {
        unique.push(option);
      }
      return unique;
    }, []);
};

const loadCustomProgramTypes = () => {
  if (typeof window === "undefined") return {};

  try {
    const saved = JSON.parse(localStorage.getItem(CUSTOM_PROGRAM_TYPES_STORAGE_KEY) || "{}");
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved as Record<string, string[]> : {};
  } catch {
    return {};
  }
};

const saveCustomProgramTypes = (value: Record<string, string[]>) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOM_PROGRAM_TYPES_STORAGE_KEY, JSON.stringify(value));
};

const loadSavedSourceSuppliers = () => {
  if (typeof window === "undefined") return [];

  try {
    const saved = JSON.parse(localStorage.getItem(SOURCE_SUPPLIERS_STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? mergeOptions([], saved) : [];
  } catch {
    return [];
  }
};

const saveSourceSuppliers = (value: string[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOURCE_SUPPLIERS_STORAGE_KEY, JSON.stringify(mergeOptions([], value)));
};

const CATEGORY_PREFIX_MAP: Record<string, string> = {
  "Seed distribution": "SEED",
  "Fertilizer distribution(Inorganic)": "FERT-INORG",
  "Fertilizer distribution(Organic)": "FERT-ORG",
  "Commodity based(Package)": "COMM",
  "Tools and equipments": "TOOL",
};

const createInitialFormData = () => ({
  name: "", sku: "", batch: "", commodity: "", category: "",
  stock: 0 as number | "", unit: "", threshold: 10 as number | "",
  source: "",
  expiration_date: "", year: new Date().getFullYear().toString(), remarks: ""
});

export default function NewItemModal({ 
    isOpen, onClose, onSubmit, 
    inventoryItems,
    unitOptions, onAddUnit, onDeleteUnit,
    categoryOptions, defaultCategories, onAddCategory, onDeleteCategory, 
    commodityOptions, onAddCommodity, onDeleteCommodity, 
    equipmentList, onAddEquipment, onDeleteEquipment, defaultCommodities,
}: NewItemModalProps) {
  const [formData, setFormData] = useState(createInitialFormData);
  
  // 2. State para sa Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [customProgramTypes, setCustomProgramTypes] = useState<Record<string, string[]>>(loadCustomProgramTypes);
  const [sourceSupplierOptions, setSourceSupplierOptions] = useState<string[]>(loadSavedSourceSuppliers);
  const previousGeneratedRef = useRef({ sku: "", batch: "" });

  const getCategoryPrefix = (category: string) => {
    if (CATEGORY_PREFIX_MAP[category]) return CATEGORY_PREFIX_MAP[category];

    const normalized = category
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return normalized || "ITEM";
  };

  const generatedPreview = useMemo(() => {
    const year = (formData.year || new Date().getFullYear().toString()).trim();
    const prefix = getCategoryPrefix(formData.category);
    const skuPrefix = `${prefix}-${year}-`;
    const batchPrefix = `B-${year}-`;

    const skuNumberPattern = new RegExp(`^${escapeRegExp(skuPrefix)}(\\d+)$`, "i");
    const batchNumberPattern = new RegExp(`^${escapeRegExp(batchPrefix)}(\\d+)$`, "i");

    const nextSkuSequence = inventoryItems.reduce((max, item) => {
      const sku = String(item?.sku || "").trim();
      const match = sku.match(skuNumberPattern);
      if (!match) return max;

      const current = Number.parseInt(match[1], 10);
      return Number.isFinite(current) ? Math.max(max, current) : max;
    }, 0) + 1;

    const nextBatchSequence = inventoryItems.reduce((max, item) => {
      const batch = String(item?.batch || "").trim();
      const match = batch.match(batchNumberPattern);
      if (!match) return max;

      const current = Number.parseInt(match[1], 10);
      return Number.isFinite(current) ? Math.max(max, current) : max;
    }, 0) + 1;

    return {
      sku: `${prefix}-${year}-${String(nextSkuSequence).padStart(3, "0")}`,
      batch: `B-${year}-${String(nextBatchSequence).padStart(3, "0")}`,
    };
  }, [formData.category, formData.year, inventoryItems]);

  const sourceSupplierSuggestions = useMemo(() => {
    const transactionSources = inventoryItems.flatMap((item: any) =>
      (item?.transactions || []).map((tx: any) => tx?.source_supplier)
    );

    return mergeOptions(sourceSupplierOptions, transactionSources);
  }, [inventoryItems, sourceSupplierOptions]);

  useEffect(() => {
    if (!isOpen) {
      setIsSaving(false);
      return;
    }

    setFormData(createInitialFormData());
    setErrors({});
    setIsSaving(false);
  }, [isOpen]);

  useEffect(() => {
    setFormData((prev) => {
      const shouldUpdateSku = !prev.sku || prev.sku === previousGeneratedRef.current.sku;
      const shouldUpdateBatch = !prev.batch || prev.batch === previousGeneratedRef.current.batch;

      return {
        ...prev,
        sku: shouldUpdateSku ? generatedPreview.sku : prev.sku,
        batch: shouldUpdateBatch ? generatedPreview.batch : prev.batch,
      };
    });
    previousGeneratedRef.current = generatedPreview;
  }, [generatedPreview]);

  if (!isOpen) return null;

  // 1. Full list nga makita sa dropdown base sa Category
const getDynamicProgramOptions = () => {
    // Kon Seeds o Fertilizer, kuhaon ang specific list (Backyard garden, 46-0-0, etc.)
    if (PROGRAM_OPTIONS_MAP[formData.category]) {
        return mergeOptions(PROGRAM_OPTIONS_MAP[formData.category], customProgramTypes[formData.category]);
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

const handleAddProgramType = (value: string) => {
    const option = normalizeOption(value);
    if (!option) return;

    if (formData.category === "Commodity based(Package)") {
        onAddCommodity(option);
        return;
    }

    if (!PROGRAM_OPTIONS_MAP[formData.category]) return;

    setCustomProgramTypes(prev => {
        const existingOptions = mergeOptions(PROGRAM_OPTIONS_MAP[formData.category], prev[formData.category]);
        if (existingOptions.some(item => item.toLowerCase() === option.toLowerCase())) return prev;

        const updated = {
            ...prev,
            [formData.category]: mergeOptions(prev[formData.category] || [], [option]),
        };
        saveCustomProgramTypes(updated);
        return updated;
    });
};

const handleDeleteProgramType = (value: string) => {
    const option = normalizeOption(value);
    if (!option) return;

    if (formData.category === "Commodity based(Package)") {
        onDeleteCommodity(option);
    } else if (PROGRAM_OPTIONS_MAP[formData.category]) {
        setCustomProgramTypes(prev => {
            const updated = {
                ...prev,
                [formData.category]: (prev[formData.category] || []).filter(item => item.toLowerCase() !== option.toLowerCase()),
            };
            saveCustomProgramTypes(updated);
            return updated;
        });
    }

    if (formData.commodity.toLowerCase() === option.toLowerCase()) {
        setFormData(prev => ({ ...prev, commodity: "" }));
    }
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
      if (!formData.unit) newErrors.unit = "Unit is required.";
      if (!formData.year) newErrors.year = "Year is required.";
      if (formData.stock !== "" && formData.stock < 0) newErrors.stock = "Stock cannot be negative.";
      if (formData.threshold !== "" && formData.threshold < 10) newErrors.threshold = "Alert threshold must be at least 10.";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);

    try {
      const normalizedSource = normalizeOption(formData.source);
      if (normalizedSource) {
        const nextSources = mergeOptions(sourceSupplierOptions, [normalizedSource]);
        setSourceSupplierOptions(nextSources);
        saveSourceSuppliers(nextSources);
      }

      await onSubmit({
        ...formData,
        source: normalizedSource,
        stock: formData.stock === "" ? 0 : formData.stock,
        threshold: formData.threshold === "" ? 10 : formData.threshold,
      });
      setFormData(createInitialFormData());
      setErrors({});
    } catch (error) {
      console.error("Failed to save inventory item:", error);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={isSaving ? undefined : onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            
            <div className="bg-primary p-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4 text-white">
                    <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"><Plus size={20} /></div>
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-tight leading-none">Register New Item</h2>
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset / Item Name / Variety <span className="text-red-500">*</span></label>
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
                onAdd={handleAddProgramType} 
                onDelete={handleDeleteProgramType} 
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
                                    <input
                                        type="text"
                                        className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none uppercase focus:border-primary/50"
                                        placeholder="Auto-generated after selecting category"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({...formData, sku: e.target.value})}
                                    />
                                </div>
                                <p className="text-[8px] text-gray-400 font-bold ml-1 uppercase tracking-tighter">Auto-generated from category and year, editable if needed</p>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Stock</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 rounded-2xl text-sm font-bold outline-none"
                                    placeholder="Enter initial stock"
                                    value={formData.stock}
                                    onFocus={() => {
                                        if (formData.stock === 0) {
                                            setFormData({...formData, stock: ""});
                                        }
                                    }}
                                    onBlur={() => {
                                        if (formData.stock === "") {
                                            setFormData({...formData, stock: 0});
                                        }
                                    }}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        stock: e.target.value === "" ? "" : Number.parseInt(e.target.value, 10),
                                    })}
                                />
                                {errors.stock && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.stock}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unit <span className="text-red-500">*</span></label>
                                <SearchableSelect 
                                    placeholder="Unit" options={unitOptions} defaultOptions={["Bags", "Sacks", "Packs", "Pieces", "Bottles", "Kilos"]} 
                                    value={formData.unit} showAddButton={true} onAdd={onAddUnit} onDelete={onDeleteUnit} 
                                    onChange={(val) => { setFormData({...formData, unit: val}); setErrors({...errors, unit: ""}); }} 
                                />
                                {errors.unit && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.unit}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Batch</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none uppercase focus:border-primary/50"
                                    placeholder="Auto-generated batch number"
                                    value={formData.batch}
                                    onChange={(e) => setFormData({...formData, batch: e.target.value})}
                                />
                                <p className="text-[8px] text-gray-400 font-bold ml-1 uppercase tracking-tighter">Auto-generated from year, editable if needed</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alert Threshold</label>
                                <input
                                    type="number"
                                    min="10"
                                    className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 rounded-2xl text-sm font-bold outline-none"
                                    placeholder="Minimum 10"
                                    value={formData.threshold}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        threshold: e.target.value === "" ? "" : Number.parseInt(e.target.value, 10),
                                    })}
                                />
                                {errors.threshold && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.threshold}</p>}
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expiration Date</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 rounded-2xl text-sm font-bold outline-none"
                                    value={formData.expiration_date}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        expiration_date: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Year Created <span className="text-red-500">*</span></label>
                                <input type="number" className={cn("w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold outline-none", errors.year ? "border-red-500 focus:border-red-500" : "border-gray-300 dark:border-slate-700")} placeholder="e.g. 2024" value={formData.year} onChange={(e) => { setFormData({...formData, year: e.target.value}); setErrors({...errors, year: ""}); }} />
                                {errors.year && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.year}</p>}
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Source / Supplier</label>
                                <input
                                    type="text"
                                    list="inventory-source-supplier-options"
                                    className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none uppercase focus:border-primary/50"
                                    placeholder="e.g. Department of Agriculture / Supplier Name"
                                    value={formData.source}
                                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                                />
                                <datalist id="inventory-source-supplier-options">
                                    {sourceSupplierSuggestions.map((source) => (
                                        <option key={source} value={source} />
                                    ))}
                                </datalist>
                                <p className="text-[8px] text-gray-400 font-bold ml-1 uppercase tracking-tighter">Used as the source/supplier for the initial stock transaction</p>
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
