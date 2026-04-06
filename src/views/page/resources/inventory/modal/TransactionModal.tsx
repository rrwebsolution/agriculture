import { useState, useEffect } from 'react';
import { 
  ArrowUpNarrowWide, ArrowDownLeft, User, X, FileText, 
  Truck, LayoutGrid, Info, Loader2, Save
} from 'lucide-react';
import { cn } from '../../../../../lib/utils';
import SearchableSelect from '../SearchableSelect';

interface TransactionModalProps {
  isOpen: boolean; 
  onClose: () => void; 
  transactionType: "IN" | "OUT"; 
  selectedItem: any; 
  onSubmit: (formData: any) => void;
  farmerList: any[];
  fisherfolkList: any[];
  cooperativeList: any[];
}

export default function TransactionModal({ 
    isOpen, onClose, transactionType, selectedItem, onSubmit,
    farmerList, fisherfolkList, cooperativeList 
}: TransactionModalProps) {
  
  const [formData, setFormData] = useState({ 
    quantity: 0, source: "", recipient: "", rsbsa: "", 
    date: new Date().toISOString().split('T')[0] 
  });
  
  const [isSaving, setIsSaving] = useState(false); // Loader State
  const [beneficiaryType, setBeneficiaryType] = useState<string>(""); 
  const [activeBeneficiaryList, setActiveBeneficiaryList] = useState<{name: string, id_no: string}[]>([]);

  // 1. Reset states inig abli sa Modal
  useEffect(() => {
    if (isOpen) {
        setFormData({ 
            quantity: 0, source: "", recipient: "", rsbsa: "", 
            date: new Date().toISOString().split('T')[0] 
        });
        setBeneficiaryType("");
        setActiveBeneficiaryList([]);
        setIsSaving(false);
    }
  }, [isOpen]);

  // 2. Beneficiary Mapping Logic
  useEffect(() => {
    let list: {name: string, id_no: string}[] = [];
    if (beneficiaryType === "Farmer") {
        list = farmerList.map(f => ({ name: `${f.first_name} ${f.last_name}`.toUpperCase(), id_no: f.rsbsa_no || "" }));
    } else if (beneficiaryType === "Fisherfolk") {
        list = fisherfolkList.map(f => ({ name: `${f.first_name} ${f.last_name}`.toUpperCase(), id_no: f.fishr_no || "" }));
    } else if (beneficiaryType === "Cooperative") {
        list = cooperativeList.map(c => ({ name: c.name.toUpperCase(), id_no: c.registration_no || "" }));
    }
    setActiveBeneficiaryList(list);
    setFormData(prev => ({ ...prev, recipient: "", rsbsa: "" }));
  }, [beneficiaryType, farmerList, fisherfolkList, cooperativeList]);

  const handleBeneficiarySelect = (name: string) => {
      const selected = activeBeneficiaryList.find(b => b.name === name);
      setFormData(prev => ({ ...prev, recipient: name, rsbsa: selected ? selected.id_no : "" }));
  };

  // 3. SUBMIT LOGIC WITH LOADER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true); // Sugdan ang spinner
    
    try {
        // I-pasa ang data ngadto sa parent function (Axios request)
        await onSubmit({ 
            ...formData, 
            beneficiary_type: beneficiaryType 
        });
        // Note: Kon malampuson, ang parent ang mo-close sa modal
    } catch (error) {
        console.error("Submission failed:", error);
        // Kon naay error (ex: insufficient stock), hunongon ang spinner
        setIsSaving(false); 
    }
  };

  if (!isOpen) return null;

  const isIN = transactionType === "IN";
  const textColor = isIN ? "text-emerald-500" : "text-blue-600";
  const ringColor = isIN ? "focus:border-emerald-500/50 focus:ring-emerald-500/10" : "focus:border-blue-500/50 focus:ring-blue-500/10";

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={isSaving ? undefined : onClose} />
      
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
          
          {/* HEADER */}
          <div className={cn("p-6 flex items-center justify-between shrink-0 text-white transition-colors", isIN ? "bg-emerald-500" : "bg-blue-600")}>
              <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      {isIN ? <ArrowDownLeft size={20} /> : <ArrowUpNarrowWide size={20} />}
                  </div>
                  <div>
                      <h2 className="text-lg font-black uppercase tracking-tight leading-none">
                          {isIN ? "Receive Stock" : "Distribute Item"}
                      </h2>
                      <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Inventory Transaction</p>
                  </div>
              </div>
              <button type="button" disabled={isSaving} onClick={onClose} className="p-2 hover:bg-white/10 rounded-2xl cursor-pointer disabled:opacity-50"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                  
                  {/* SELECTED ASSET INFO */}
                  <div className="space-y-4">
                      <div className={cn("flex items-center gap-2", textColor)}>
                          <Info size={14}/> <span className="text-[11px] font-black uppercase tracking-widest">1. Selected Asset</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center justify-between">
                          <div>
                            <p className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight leading-none">{selectedItem?.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{selectedItem?.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available</p>
                            <p className={cn("text-xl font-black leading-none", textColor)}>{selectedItem?.stock} <span className="text-xs text-gray-500">{selectedItem?.unit}</span></p>
                          </div>
                      </div>
                  </div>

                  <div className="h-px bg-gray-100 dark:bg-slate-800" />

                  {/* FORM FIELDS */}
                  <div className="space-y-5">
                    <div className={cn("flex items-center gap-2", textColor)}>
                        <LayoutGrid size={14}/> <span className="text-[11px] font-black uppercase tracking-widest">2. Transaction Details</span>
                    </div>

                    {isIN ? (
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Source / Supplier <span className="text-red-500">*</span></label>
                            <div className="relative flex items-center">
                                <Truck className="absolute left-4 text-gray-400" size={16} />
                                <input required type="text" disabled={isSaving} className={cn("w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold outline-none uppercase transition-all", ringColor)} placeholder="e.g. Regional Office" value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 bg-amber-50 dark:bg-amber-500/5 rounded-2xl border border-amber-100 dark:border-amber-500/20 flex items-start gap-3">
                                <Info size={16} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">Beneficiary Note</p>
                                    <p className="text-[9px] font-medium text-amber-700/80 dark:text-amber-400/60 leading-relaxed uppercase">
                                        Both Beneficiary Type and Name are optional for walk-in distributions or recipients not yet in the database.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-end ml-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Beneficiary Type</label>
                                    <span className="text-[9px] font-bold text-gray-300 uppercase italic">(Optional)</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {["Farmer", "Fisherfolk", "Cooperative"].map((type) => (
                                        <button key={type} type="button" disabled={isSaving} onClick={() => setBeneficiaryType(type)} className={cn("py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer", beneficiaryType === type ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 hover:border-blue-500/50", isSaving && "opacity-50 cursor-not-allowed")}>
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-end ml-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Beneficiary Name</label>
                                    <span className="text-[9px] font-bold text-gray-300 uppercase italic">(Optional)</span>
                                </div>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 z-10 text-gray-400"><User size={16} /></div>
                                    <SearchableSelect 
                                        placeholder={beneficiaryType ? `Search ${beneficiaryType}...` : "Select Type or Type Name"}
                                        options={activeBeneficiaryList.map(b => b.name)}
                                        defaultOptions={activeBeneficiaryList.map(b => b.name)}
                                        value={formData.recipient}
                                        showAddButton={false}
                                        onAdd={() => {}} onDelete={() => {}}
                                        onChange={handleBeneficiarySelect}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">RSBSA / FishR No.</label>
                                <div className="relative flex items-center">
                                    <FileText className="absolute left-4 text-gray-400" size={16} />
                                    <input type="text" readOnly tabIndex={-1} className={cn("w-full pl-11 pr-4 py-4 bg-gray-100 dark:bg-slate-800/50 border border-gray-200 rounded-2xl text-sm font-bold outline-none cursor-not-allowed text-gray-500", ringColor)} placeholder="Auto-filled from database" value={formData.rsbsa} />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity <span className="text-red-500">*</span></label>
                            <input required type="number" min="1" max={!isIN ? selectedItem?.stock : undefined} disabled={isSaving} className={cn("w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold outline-none transition-all", ringColor)} value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date <span className="text-red-500">*</span></label>
                            <input required type="date" disabled={isSaving} className={cn("w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold outline-none transition-all", ringColor)} value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                        </div>
                    </div>
                  </div>
              </div>

              {/* FOOTER BUTTON WITH LOADER */}
              <div className="p-6 bg-gray-50/50 border-t flex items-center justify-end gap-3 shrink-0">
                  <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
                    Cancel
                  </button>
                  
                  <button 
                    type="submit" 
                    disabled={isSaving} 
                    className={cn(
                        "px-8 py-4 text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all active:scale-95 shadow-xl", 
                        isIN ? "bg-emerald-500 shadow-emerald-500/20" : "bg-blue-600 shadow-blue-500/20", 
                        isSaving ? "opacity-70 cursor-not-allowed" : "hover:opacity-90 cursor-pointer"
                    )}
                  >
                    {/* 🌟 KINI ANG SPINNER LOGIC */}
                    {isSaving ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            {isIN ? 'Processing Receipt...' : 'Processing Distribution...'}
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            Confirm Transaction
                        </>
                    )}
                  </button>
              </div>
          </form>
      </div>
    </div>
  );
}