import React, { useState, useEffect } from 'react';
import { 
  X, Check, User, Landmark, MapPin, 
  ChevronsUpDown, Ship, Fish, Scale, Calendar, Waves, Phone, VenusAndMars
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../../components/ui/command';
import { cn } from '../../../../lib/utils';

const FisheryDialog = ({ isOpen, onClose, onUpdate, record, barangays }: any) => {
  const [formData, setFormData] = useState({
    fishr_id: '',
    name: '',
    gender: '',
    contact_no: '',
    boat_name: '',
    gear_type: '',
    location_id: '',
    catch_species: '',
    yield: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [openBrgyPicker, setOpenBrgyPicker] = useState(false);

  useEffect(() => {
    if (record && isOpen) {
      setFormData({ ...record });
    } else {
      const randomFishrId = 'FSH-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000).toString();
      setFormData({ fishr_id: randomFishrId, name: '', gender: '', contact_no: '', boat_name: '', gear_type: '', location_id: '', catch_species: '', yield: '', date: new Date().toISOString().split('T')[0] });
    }
  }, [record, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData, record ? 'edit' : 'add');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-primary p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><Waves size={22} /></div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight leading-none">{record ? 'Modify Catch Record' : 'Record New Catch'}</h3>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Fisheries Division</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full cursor-pointer"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <input type="hidden" value={formData.fishr_id} />

          <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
            
            {/* --- SECTION 1: PERSONAL INFO --- */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 border-b-2 border-gray-50 dark:border-slate-800 pb-3">
                  <div className="text-primary"><User size={18}/></div>
                  <h4 className="text-[11px] font-black text-gray-800 dark:text-slate-200 uppercase tracking-widest">Personal Information</h4>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput icon={<User size={12}/>} label="Full Name" placeholder="Enter Fisher's Name" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} required />
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 flex items-center gap-2"><VenusAndMars size={12} className="text-primary" /> Gender</label>
                    <Select value={formData.gender} onValueChange={(val: string) => setFormData({...formData, gender: val})}>
                      <SelectTrigger className="h-12 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold w-full"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                      <SelectContent className="z-130 bg-white dark:bg-slate-900 border-gray-100 rounded-xl">
                        <SelectItem value="Male" className="py-2 cursor-pointer uppercase text-xs font-bold">Male</SelectItem>
                        <SelectItem value="Female" className="py-2 cursor-pointer uppercase text-xs font-bold">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <FormInput icon={<Phone size={12}/>} label="Contact Number" placeholder="09XX-XXX-XXXX" value={formData.contact_no} onChange={(v: string) => setFormData({...formData, contact_no: v})} />
               </div>
            </div>

            {/* --- SECTION 2: CATCH & BOAT INFO --- */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 border-b-2 border-gray-50 dark:border-slate-800 pb-3">
                  <div className="text-primary"><Ship size={18}/></div>
                  <h4 className="text-[11px] font-black text-gray-800 dark:text-slate-200 uppercase tracking-widest">Catch & Vessel Details</h4>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput icon={<Ship size={12}/>} label="Boat Name" placeholder="e.g. MB Blue Wave" value={formData.boat_name} onChange={(v: string) => setFormData({...formData, boat_name: v})} />
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 flex items-center gap-2"><Waves size={12} className="text-primary"/> Gear Type</label>
                    <Select value={formData.gear_type} onValueChange={(val: string) => setFormData({...formData, gear_type: val})}>
                      <SelectTrigger className="h-12 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold w-full"><SelectValue placeholder="Select Gear" /></SelectTrigger>
                      <SelectContent className="z-130 bg-white dark:bg-slate-900 border-gray-100 rounded-xl">
                        {["Gill Net", "Hook & Line", "Net", "Traps"].map(g => <SelectItem key={g} value={g} className="py-2 cursor-pointer uppercase text-xs font-bold">{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <FormInput icon={<Fish size={12}/>} label="Species" placeholder="e.g. Tuna" value={formData.catch_species} onChange={(v: string) => setFormData({...formData, catch_species: v})} required />
                  <FormInput icon={<Scale size={12}/>} label="Yield (KG)" type="number" placeholder="0.00" value={formData.yield} onChange={(v: string) => setFormData({...formData, yield: v})} required />
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 flex items-center gap-2"><Landmark size={12} className="text-primary"/> Location</label>
                    <SearchablePicker value={formData.location_id} open={openBrgyPicker} setOpen={setOpenBrgyPicker} items={barangays} onSelect={(id: string) => setFormData({...formData, location_id: id})} placeholder="Select Barangay..." icon={<MapPin size={14}/>} />
                  </div>

                  <FormInput icon={<Calendar size={12}/>} label="Date" type="date" value={formData.date} onChange={(v: string) => setFormData({...formData, date: v})} required />
               </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50 dark:bg-slate-800/50 border-t shrink-0">
            <button type="submit" className="w-full bg-primary hover:opacity-90 text-white font-black uppercase text-xs py-5 rounded-[1.5rem] shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer">
              <Check size={20} /> Save Catch Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormInput = ({ icon, label, value, onChange, type = "text", required = false, placeholder = "" }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 flex items-center gap-2">{icon} {label}</label>
    <input type={type} required={required} placeholder={placeholder} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-700 dark:text-slate-200 shadow-sm" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

const SearchablePicker = ({ value, open, setOpen, items, onSelect, placeholder, icon }: any) => (
  <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <button type="button" className="w-full h-12 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 border-none outline-none cursor-pointer shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-primary/40">{icon}</span>
          <span className="uppercase text-slate-700 dark:text-slate-300">{value ? items.find((b: any) => b.id.toString() === value)?.name : placeholder}</span>
        </div>
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="p-0 z-140 bg-white dark:bg-slate-900 border-gray-100 rounded-2xl shadow-2xl" style={{ width: 'var(--radix-popover-trigger-width)' }} align="start">
      <Command className="bg-transparent">
        <CommandInput placeholder="Type to filter..." className="h-12 border-none focus:ring-0 text-xs font-bold uppercase" />
        <CommandList className="max-h-60 custom-scrollbar">
          <CommandEmpty className="py-6 text-center text-[10px] font-black uppercase text-gray-400">No matches found.</CommandEmpty>
          <CommandGroup>
            {items.map((b: any) => (
              <CommandItem key={b.id} value={b.name} onSelect={() => { onSelect(b.id.toString()); setOpen(false); }} className="text-xs font-bold uppercase py-3 px-4 cursor-pointer flex items-center justify-between aria-selected:bg-primary aria-selected:text-white transition-colors">
                {b.name}
                <Check className={cn("h-4 w-4", value === b.id.toString() ? "opacity-100" : "opacity-0")} />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
);

export default FisheryDialog;