import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Plus, X, Check, Trash2 } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface SearchableSelectProps {
  value: string; // Joined string (e.g., "Coop A, Coop B")
  onChange: (value: string) => void;
  options: string[];
  defaultOptions: string[];
  onAdd: (newOption: string) => void;
  onDelete: (optionToDelete: string) => void;
  placeholder: string;
  position?: "top" | "bottom"; 
  showAddButton?: boolean;
}

export default function SearchableSelect({ 
  showAddButton = true,
  value, 
  onChange, 
  options, 
  defaultOptions, 
  onAdd, 
  onDelete, 
  placeholder,
  position = "bottom" 
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemValue, setNewItemValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options base sa search term
  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Convert joined string balik ngadto sa Array para sa Checkmark logic
  const selectedArray = value ? value.split(", ").filter(i => i !== "") : [];

  useEffect(() => { 
    if (isAddDialogOpen && inputRef.current) {
        inputRef.current.focus();
    }
  }, [isAddDialogOpen]);

  const handleOpenAddDialog = (e: React.MouseEvent) => {
    e.preventDefault(); 
    setIsOpen(false); 
    setIsAddDialogOpen(true); 
    setNewItemValue(""); 
  };

  const handleConfirmAdd = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const trimmedVal = newItemValue.trim();
    
    if (trimmedVal !== "") {
      if (!options.some(opt => opt.toLowerCase() === trimmedVal.toLowerCase())) {
        onAdd(trimmedVal); 
      }
      onChange(trimmedVal); 
      setIsAddDialogOpen(false); 
      setSearchTerm(""); 
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      handleConfirmAdd();
    }
  };

  return (
    <>
      <div className="relative w-full">
        {/* --- TRIGGER BUTTON --- */}
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          className={cn(
            "w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold cursor-pointer transition-all flex items-center justify-between min-h-13.5", 
            isOpen && "bg-white dark:bg-slate-900 border-primary/50 ring-4 ring-primary/10"
          )}
        >
          <span className={cn(
            "uppercase truncate pr-2", 
            !value ? "text-gray-400/50" : "text-primary font-black"
          )}>
            {value || `Select ${placeholder}`}
          </span>
          <ChevronDown size={16} className={cn("transition-transform duration-200 shrink-0", isOpen ? "text-primary rotate-180" : "text-gray-400")} />
        </div>

        {/* --- DROPDOWN MENU --- */}
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            <div className={cn(
                "absolute left-0 w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl z-110 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200",
                position === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
            )}>
              {/* Search Box */}
              <div className="flex items-center px-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                <Search size={16} className="text-gray-400 shrink-0" />
                <input autoFocus type="text" placeholder="Search..." className="w-full bg-transparent p-4 text-xs font-bold outline-none text-gray-800 dark:text-white uppercase placeholder:text-gray-400/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              {/* Options List */}
              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt) => {
                    const isCustomAdded = !defaultOptions.includes(opt);
                    const isSelected = selectedArray.includes(opt);

                    return (
                      <div key={opt} className="flex items-center justify-between px-4 py-3 hover:bg-primary/10 group transition-colors border-b border-gray-50 dark:border-slate-800/50 last:border-0">
                          <div 
                            onClick={() => onChange(opt)} 
                            className={cn(
                                "flex-1 text-xs font-bold cursor-pointer uppercase truncate flex items-center gap-2",
                                isSelected ? "text-primary font-black" : "text-slate-600 dark:text-slate-300"
                            )}
                          >
                            {/* Checkmark indicator */}
                            {isSelected && <Check size={14} className="shrink-0 animate-in zoom-in-50" />}
                            {opt}
                          </div>
                          
                          {/* Delete Button for User-Added Items */}
                          {isCustomAdded && (
                            <button 
                                type="button" 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onDelete(opt); 
                                }} 
                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100" 
                                title={`Delete ${opt}`}
                            >
                                <Trash2 size={14} />
                            </button>
                          )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">No match found</div>
                )}
              </div>

              {/* Add New Section */}
              {showAddButton && (
                <div className="border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 p-2">
                    <button type="button" onClick={handleOpenAddDialog} className="w-full py-3 flex items-center justify-center gap-2 text-[10px] font-black text-primary bg-primary/10 hover:bg-primary/20 rounded-xl uppercase tracking-widest transition-all">
                      <Plus size={14} /> Add New {placeholder}
                    </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* --- ADD NEW DIALOG MODAL --- */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsAddDialogOpen(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-gray-100 dark:border-slate-800">
            <div className="bg-primary p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm"><Plus size={16} /></div>
                <h3 className="font-black uppercase tracking-widest text-sm">New {placeholder}</h3>
              </div>
              <button type="button" onClick={() => setIsAddDialogOpen(false)} className="hover:opacity-75 p-1.5"><X size={18} /></button>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Enter {placeholder} Name <span className="text-red-500">*</span></label>
                <input ref={inputRef} required type="text" className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 focus:border-primary/50 rounded-2xl text-sm font-bold outline-none transition-all uppercase placeholder:text-gray-400/50" placeholder={`e.g. New ${placeholder}`} value={newItemValue} onChange={(e) => setNewItemValue(e.target.value)} onKeyDown={handleKeyDown} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAddDialogOpen(false)} className="flex-1 py-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-colors">Cancel</button>
                <button type="button" onClick={handleConfirmAdd} className="flex-2 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"><Check size={16} /> Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}