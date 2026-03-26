import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, MapPin, Sprout, Wheat, Trees, LandPlot, ChevronRight, 
  User, Phone, AreaChart, MessageSquare, ChevronDown, Layers, LayoutGrid, Droplets,
  Search, Check, ChevronsUpDown, NotepadText, CreditCard, Box, X
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { FarmerCombinedMap } from '../barangay/map/FarmerCombinedMap';

import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../components/ui/command';

interface CropFarmerBreakdownProps {
  landData: any[];
}

const DetailItem = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex flex-col space-y-1 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
      {icon} {label}
    </p>
    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
      {value || 'N/A'}
    </p>
  </div>
);

const CropFarmerBreakdown: React.FC<CropFarmerBreakdownProps> = ({ landData }) => {
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null);
  const [expandedFarmerId, setExpandedFarmerId] = useState<number | null>(null);
  
  // 🌟 STATES PARA SA SEARCH UG FILTERS
  const [sidebarSearch, setSidebarSearch] = useState(""); // Search para sa Crops
  const [searchQuery, setSearchQuery] = useState("");     // Search para sa Farmers
  const [selectedBarangay, setSelectedBarangay] = useState("All");
  const [openBrgyFilter, setOpenBrgyFilter] = useState(false);

  useEffect(() => {
    if (landData && landData.length > 0 && selectedCropId === null) {
      setSelectedCropId(landData[0].id);
    }
  }, [landData, selectedCropId]);

  useEffect(() => {
    setExpandedFarmerId(null);
    setSearchQuery("");
    setSelectedBarangay("All");
  }, [selectedCropId]);

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('rice')) return <Sprout size={28} />;
    if (cat.includes('corn')) return <Wheat size={28} />;
    if (cat.includes('tree') || cat.includes('coconut')) return <Trees size={28} />;
    return <LandPlot size={28} />; 
  };

  const getSmallCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('rice')) return <Sprout size={16} />;
    if (cat.includes('corn')) return <Wheat size={16} />;
    if (cat.includes('tree') || cat.includes('coconut')) return <Trees size={16} />;
    return <LandPlot size={16} />; 
  };

  const selectedItem = landData?.find(c => c.id === selectedCropId);

  // 🌟 FILTERED SECTORS (SIDEBAR)
  const filteredSectors = useMemo(() => {
    return landData?.filter(crop => 
      crop.category.toLowerCase().includes(sidebarSearch.toLowerCase())
    );
  }, [landData, sidebarSearch]);

  const computeTopographySums = (farmers: any[] = []) => {
    return farmers.reduce((acc, f) => {
      const area = Number(f.total_area) || 0;
      const t = (f.topography || f.land_type || '').toLowerCase();
      if (t.includes('plain')) acc.plain += area;
      else if (t.includes('rolling')) acc.rolling += area;
      else if (t.includes('slop') || t.includes('hill') || t.includes('mountain')) acc.sloping += area;
      else acc.other += area;
      acc.total += area;
      return acc;
    }, { plain: 0, rolling: 0, sloping: 0, other: 0, total: 0 });
  };

  const selectedTopo = computeTopographySums(selectedItem?.registered_farmers || []);
  const totalLandArea = selectedTopo.total || 0;
  const getPercent = (val: number) => totalLandArea > 0 ? (val / totalLandArea) * 100 : 0;
  
  const plainPct = getPercent(selectedTopo.plain);
  const rollingPct = getPercent(selectedTopo.rolling);
  const slopingPct = getPercent(selectedTopo.sloping);

  const allFarmers = selectedItem?.registered_farmers || [];

  const uniqueBarangays = Array.from(
    new Set(allFarmers.map((f: any) => f.farm_location?.name || 'Unknown Location'))
  ).sort();

  const filteredFarmers = allFarmers.filter((f: any) => {
    const fullName = `${f.first_name || ''} ${f.last_name || ''}`.toLowerCase();
    const rsbsa = f.rsbsa_no?.toLowerCase() || '';
    const barangay = f.farm_location?.name || 'Unknown Location';

    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || rsbsa.includes(searchQuery.toLowerCase());
    const matchesBarangay = selectedBarangay === "All" || barangay === selectedBarangay;

    return matchesSearch && matchesBarangay;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500 h-[80vh] min-h-180 pb-6">
      
      {/* 🌟 LEFT SIDEBAR: Sector Select */}
      <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[2.5rem] overflow-hidden shadow-sm shrink-0">
        <div className="p-7 pb-4">
          <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
            <Layers size={14} className="text-primary" /> Sector Select
          </h3>

          {/* 🌟 NEW: SIDEBAR SEARCH INPUT */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="Search category..." 
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            />
            {sidebarSearch && (
              <button 
                onClick={() => setSidebarSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
          {filteredSectors && filteredSectors.length > 0 ? (
            filteredSectors.map((crop) => {
              const isSelected = selectedCropId === crop.id;
              return (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCropId(crop.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-[1.5rem] transition-all cursor-pointer group text-left outline-none",
                    isSelected 
                      ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" 
                      : "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2.5 rounded-2xl transition-colors",
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-primary"
                    )}>
                      {getSmallCategoryIcon(crop.category)}
                    </div>
                    <div>
                      <p className="text-sm font-black tracking-tight leading-none mb-1.5">{crop.category}</p>
                      <p className={cn(
                        "text-[10px] font-bold uppercase tracking-widest flex items-center gap-1",
                        isSelected ? "text-white/80" : "text-slate-400"
                      )}>
                        <Users size={10} /> {crop.farmers || 0} Members
                      </p>
                    </div>
                  </div>
                  {isSelected && <ChevronRight size={16} className="text-white" />}
                </button>
              );
            })
          ) : (
            <div className="py-10 text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Category Found</p>
            </div>
          )}
        </div>
      </div>

      {/* 🌟 RIGHT CONTENT: Details & Farmer List */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[2.5rem] overflow-hidden shadow-sm relative">
        
        {selectedItem ? (
          <div className="flex flex-col w-full h-full absolute inset-0">
            
            {/* SLEEK HEADER */}
            <div className="h-32 bg-primary relative flex flex-col justify-center px-12 shrink-0 overflow-hidden">
               <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none transform scale-150 text-white">
                  {getCategoryIcon(selectedItem.category)}
               </div>
               <div className="pl-16 relative z-10">
                 <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase drop-shadow-sm leading-none">
                   {selectedItem.category}
                 </h2>
                 <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em] mt-2">
                   Master Registry & Distribution
                 </p>
               </div>
               <div className="w-16 h-16 bg-white z-10 dark:bg-slate-900 rounded-[1.5rem] shadow-2xl flex items-center justify-center absolute -bottom-6 left-12 border-4 border-white dark:border-slate-900 text-primary">
                  {getCategoryIcon(selectedItem.category)}
               </div>
            </div>

            <div className="pt-12 p-8 space-y-10 overflow-y-auto flex-1">
              
              {/* Metrics & Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Notes/Remarks Section */}
                 <div className="lg:col-span-2 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-center relative overflow-hidden group text-left">
                    <NotepadText className="absolute -right-4 -bottom-4 text-slate-200 dark:text-slate-800 opacity-40 group-hover:scale-110 transition-transform" size={100} />
                    <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <MessageSquare size={14} /> Sector Remarks & Notes
                    </h5>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic relative z-10">
                      {selectedItem.remarks ? `"${selectedItem.remarks}"` : "No official remarks recorded for this category."}
                    </p>
                 </div>

                 <div className="p-6 bg-primary text-white rounded-[2rem] shadow-xl shadow-primary/20 flex flex-col justify-center text-left">
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-2">Total Area Coverage</p>
                    <p className="text-4xl font-black leading-none">{totalLandArea.toFixed(1)} <span className="text-sm opacity-60">HA</span></p>
                 </div>
              </div>

              {/* Topography Landscape */}
              <div className="space-y-5 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <AreaChart size={14} className="text-primary"/> Topography Landscape
                  </h4>
                </div>

                <div className="flex h-4 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                  <div style={{ width: `${plainPct}%` }} className="bg-primary h-full rounded-full transition-all duration-700" />
                  <div style={{ width: `${rollingPct}%` }} className="bg-amber-400 h-full rounded-full transition-all duration-700 mx-1" />
                  <div style={{ width: `${slopingPct}%` }} className="bg-rose-500 h-full rounded-full transition-all duration-700" />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary"/> Plain</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white">{(selectedTopo.plain || 0).toFixed(1)} <span className="text-[10px] opacity-40">HA</span></p>
                  </div>
                  <div className="flex flex-col gap-1 border-x border-slate-100 dark:border-slate-800 px-6">
                    <p className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"/> Rolling</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white">{(selectedTopo.rolling || 0).toFixed(1)} <span className="text-[10px] opacity-40">HA</span></p>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase flex items-center justify-end gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"/> Sloping</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white">{(selectedTopo.sloping || 0).toFixed(1)} <span className="text-[10px] opacity-40">HA</span></p>
                  </div>
                </div>
              </div>

              {/* REGISTERED FARMERS */}
              <div className="space-y-6 pt-4 text-left">
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
                  <div>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                      <Users size={16} className="text-primary" /> Farmer Masterlist
                    </h4>
                    <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none mt-2 uppercase">
                      {filteredFarmers.length} registered producers
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                    {/* SEARCH */}
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search name or RSBSA..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                      />
                    </div>
                    
                    {/* BARANGAY COMMAND SELECTOR */}
                    <Popover open={openBrgyFilter} onOpenChange={setOpenBrgyFilter}>
                      <PopoverTrigger asChild>
                        <button className="w-full sm:w-60 flex items-center justify-between px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black text-slate-700 dark:text-slate-300 hover:border-primary transition-all shadow-sm cursor-pointer uppercase tracking-wider">
                          <div className="flex items-center gap-2 truncate">
                            <MapPin size={14} className="text-primary" />
                            <span className="truncate">{selectedBarangay === "All" ? "Filter Barangay" : selectedBarangay}</span>
                          </div>
                          <ChevronsUpDown size={14} className="ml-2 text-slate-400 shrink-0" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl z-50 overflow-hidden">
                        <Command className="bg-transparent">
                          <CommandInput placeholder="Search location..." className="h-11 text-xs font-bold border-none" />
                          <CommandList className="max-h-64 p-1">
                            <CommandEmpty className="py-6 text-[10px] font-bold text-slate-400 uppercase text-center">No location found.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value="All"
                                onSelect={() => { setSelectedBarangay("All"); setOpenBrgyFilter(false); }}
                                className="text-xs font-bold uppercase py-3 px-4 cursor-pointer rounded-xl mb-1 hover:bg-primary/5 data-[selected=true]:bg-primary/10"
                              >
                                <Check className={cn("mr-2 h-4 w-4 text-primary", selectedBarangay === "All" ? "opacity-100" : "opacity-0")} />
                                All Barangays
                              </CommandItem>
                              {uniqueBarangays.map((b: any) => (
                                <CommandItem
                                  key={b}
                                  value={b}
                                  onSelect={() => { setSelectedBarangay(b); setOpenBrgyFilter(false); }}
                                  className="text-xs font-bold uppercase py-3 px-4 cursor-pointer rounded-xl mb-1 hover:bg-primary/5 data-[selected=true]:bg-primary/10"
                                >
                                  <Check className={cn("mr-2 h-4 w-4 text-primary", selectedBarangay === b ? "opacity-100" : "opacity-0")} />
                                  {b}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                {/* FARMER LIST RENDER */}
                {filteredFarmers.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredFarmers.map((f: any) => {
                      const isExpanded = expandedFarmerId === f.id;
                      const initials = ((f.first_name?.[0] || '') + (f.last_name?.[0] || '')).toUpperCase();
                      const farmMapData = f.farms_list?.length > 0 ? f.farms_list : [f];

                      return (
                        <div key={f.id} className={cn(
                          "group border rounded-[2rem] transition-all duration-300 overflow-hidden",
                          isExpanded 
                            ? "bg-slate-50 dark:bg-slate-800/40 border-primary/30 shadow-lg" 
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:shadow-md"
                        )}>
                          {/* Card Summary Line */}
                          <div 
                            onClick={() => setExpandedFarmerId(isExpanded ? null : f.id)} 
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:px-8 cursor-pointer gap-4"
                          >
                            <div className="flex items-center gap-5">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all shadow-inner",
                                isExpanded ? "bg-primary text-white scale-110" : "bg-slate-100 dark:bg-slate-800 text-primary group-hover:bg-primary/10"
                              )}>
                                {initials}
                              </div>
                              <div className="text-left">
                                <h5 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none mb-1.5 uppercase">
                                  {f.first_name} {f.last_name}
                                </h5>
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md">
                                    <MapPin size={10} /> {f.farm_location?.name || 'N/A'}
                                  </span>
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <CreditCard size={10} /> {f.rsbsa_no}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6">
                               <div className="text-right hidden md:block">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Asset Summary</p>
                                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    {Number(f.total_area || 0).toFixed(2)} HA • {farmMapData.length} Parcel(s)
                                  </p>
                               </div>
                               <div className={cn(
                                 "p-2.5 rounded-full transition-all duration-500",
                                 isExpanded ? "bg-primary text-white rotate-180" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                               )}>
                                 <ChevronDown size={18} />
                               </div>
                            </div>
                          </div>

                          {/* Expanded Detail Panel */}
                          {isExpanded && (
                            <div className="px-5 sm:px-8 pb-8 pt-2 animate-in slide-in-from-top-4 duration-500 text-left">
                              <div className="h-px bg-slate-200 dark:bg-slate-800 mb-8" />
                              
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <DetailItem icon={<User size={12} className="text-blue-500"/>} label="Sex" value={f.gender} />
                                <DetailItem icon={<Phone size={12} className="text-emerald-500"/>} label="Mobile" value={f.contact_no} />
                                <DetailItem icon={<Box size={12} className="text-amber-500"/>} label="Ownership" value={f.ownership_type} />
                                <DetailItem icon={<LandPlot size={12} className="text-primary"/>} label="Net Area" value={`${f.total_area} Hectares`} />
                              </div>

                              <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                  <LayoutGrid size={14} className="text-primary" /> Parcel Distribution & Geodata
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                  {farmMapData.map((parcel: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-[1.5rem] flex items-center justify-between">
                                      <div className="text-left">
                                        <p className="text-[9px] font-black text-primary uppercase mb-1">Parcel #{idx + 1}</p>
                                        <p className="text-sm font-black text-slate-700 dark:text-slate-200 truncate">
                                          {parcel.farm_sitio || 'Main Farm Location'}
                                        </p>
                                        <div className="flex gap-3 mt-1.5">
                                           <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase"><Layers size={10}/> {parcel.topography || 'N/A'}</span>
                                           <span className="flex items-center gap-1 text-[9px] font-bold text-blue-400 uppercase"><Droplets size={10}/> {parcel.irrigation_type || 'N/A'}</span>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                         <p className="text-lg font-black text-slate-800 dark:text-white leading-none">{Number(parcel.total_area || 0).toFixed(2)}</p>
                                         <p className="text-[8px] font-black text-slate-400 uppercase">HA</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="rounded-[1.5rem] overflow-hidden border border-slate-200 dark:border-slate-800">
                                   <FarmerCombinedMap farms={farmMapData} farmerName={`${f.first_name} ${f.last_name}`} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-24 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                       <Users className="text-slate-200 dark:text-slate-800" size={40} />
                    </div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching records found</p>
                    <p className="text-[10px] font-medium text-slate-300 uppercase tracking-widest mt-1">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
            <div className="text-center">
               <Sprout size={48} className="mx-auto mb-4 opacity-20" />
               <p className="text-[11px] font-black uppercase tracking-[0.3em] animate-pulse">Select a category to begin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropFarmerBreakdown;