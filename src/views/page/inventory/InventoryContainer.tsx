import { useState } from 'react';
import { 
  Box, Plus, Search, Edit3, Trash2, Eye, 
  Filter, Package, AlertTriangle, Archive, Tag,
  BarChart3, ArrowUpNarrowWide, ArrowDownWideNarrow, 
  ChevronRight, Info
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';

// --- MOCK DATA ---
const INITIAL_INVENTORY = [
  { id: 1, name: "RC-222 Rice Seeds", category: "Seeds", sku: "SED-001", stock: 450, unit: "Sacks", status: "In Stock", threshold: 100 },
  { id: 2, name: "Urea Fertilizer", category: "Fertilizer", sku: "FER-082", stock: 25, unit: "Bags", status: "Low Stock", threshold: 50 },
  { id: 3, name: "Complete (14-14-14)", category: "Fertilizer", sku: "FER-090", stock: 120, unit: "Bags", status: "In Stock", threshold: 40 },
  { id: 4, name: "Pioneer Yellow Corn", category: "Seeds", sku: "SED-005", stock: 0, unit: "Sacks", status: "Out of Stock", threshold: 20 },
  { id: 5, name: "Hand Sprayer", category: "Tools", sku: "TLS-012", stock: 15, unit: "Units", status: "In Stock", threshold: 5 },
];

const categoryOptions = ["All Categories", "Seeds", "Fertilizer", "Tools"];

// --- MOCK DATA PARA SA BREAKDOWN ---
const CATEGORY_BREAKDOWN: Record<string, any[]> = {
  "Rice Seeds": [
    { name: "RC-222 (Inbred)", distributed: "80 Sacks", recipient: "Cluster 3" },
    { name: "RC-216 (Inbred)", distributed: "40 Sacks", recipient: "Sector 1" },
  ],
  "Fertilizers": [
    { name: "Urea (46-0-0)", distributed: "50 Bags", recipient: "Sector 4" },
    { name: "Complete (14-14-14)", distributed: "35 Bags", recipient: "Sector 2" },
  ],
  "Corn Seeds": [
    { name: "Pioneer Yellow", distributed: "30 Sacks", recipient: "Sector 1" },
    { name: "White Corn", distributed: "15 Sacks", recipient: "Sector 3" },
  ]
};

function InventoryContainer() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [activeBreakdown, setActiveBreakdown] = useState<string | null>(null);
  const [inventory] = useState(INITIAL_INVENTORY);

  // Filter Logic
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Box className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary dark:text-green-400 uppercase tracking-[0.3em]">Resource Inventory</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Stock <span className="text-primary italic">Management</span>
          </h2>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-600 dark:text-slate-300 px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-sm active:scale-95">
                <ArrowDownWideNarrow size={18} /> Stock In
            </button>
            <button className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95">
                <Plus size={18} /> New Item
            </button>
        </div>
      </div>

      {/* --- DISTRIBUTION SUMMARY (WITH BREAKDOWN LOGIC) --- */}
      <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><BarChart3 size={20} /></div>
              <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Inventory Distribution</h3>
           </div>
           <p className="text-[10px] font-bold text-gray-400 uppercase italic">Click cards to view breakdown</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <DistributionCard 
              label="Rice Seeds Distributed" value="120 Sacks" trend="+5%" up 
              isActive={activeBreakdown === "Rice Seeds"}
              onClick={() => setActiveBreakdown(activeBreakdown === "Rice Seeds" ? null : "Rice Seeds")}
           />
           <DistributionCard 
              label="Fertilizers Released" value="85 Bags" trend="-2%" 
              isActive={activeBreakdown === "Fertilizers"}
              onClick={() => setActiveBreakdown(activeBreakdown === "Fertilizers" ? null : "Fertilizers")}
           />
           <DistributionCard 
              label="Corn Seeds Distributed" value="45 Sacks" trend="+12%" up 
              isActive={activeBreakdown === "Corn Seeds"}
              onClick={() => setActiveBreakdown(activeBreakdown === "Corn Seeds" ? null : "Corn Seeds")}
           />
        </div>

        {/* --- DYNAMIC BREAKDOWN DETAILS --- */}
        {activeBreakdown && (
          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800 animate-in slide-in-from-top-4 duration-500">
             <div className="flex items-center gap-2 mb-6">
                <Info size={16} className="text-primary" />
                <h4 className="text-[10px] font-black text-gray-800 dark:text-white uppercase tracking-widest">
                  Breakdown for {activeBreakdown}
                </h4>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CATEGORY_BREAKDOWN[activeBreakdown]?.map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                      <div>
                         <p className="text-xs font-black text-gray-700 dark:text-slate-200 uppercase">{item.name}</p>
                         <p className="text-[10px] font-bold text-gray-400 uppercase">{item.recipient}</p>
                      </div>
                      <p className="text-sm font-black text-primary">{item.distributed}</p>
                   </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* --- SUMMARY METRICS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Package />} title="Total Stock Items" value="1,240" color="text-primary" bgColor="bg-primary/10" />
        <MetricCard icon={<AlertTriangle />} title="Low Stock Alerts" value="8 Items" color="text-amber-500" bgColor="bg-amber-500/10" />
        <MetricCard icon={<Archive />} title="Out of Stock" value="3 Items" color="text-red-500" bgColor="bg-red-500/10" />
        <MetricCard icon={<Tag />} title="Total Categories" value="12" color="text-blue-500" bgColor="bg-blue-500/10" />
      </div>

      {/* --- CONTROLS: SEARCH & FILTER --- */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Item or SKU..."
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="relative shrink-0 w-full sm:w-55">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:outline-none transition-all shadow-sm cursor-pointer">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl p-1 z-50">
              {categoryOptions.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer py-3 px-4 rounded-xl focus:bg-primary/10 focus:text-primary transition-colors outline-none">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- INVENTORY TABLE --- */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-225">
            <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Item Information</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">SKU / Code</th>
                <th className="px-8 py-5">Stock Level</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    <td className="px-8 py-6 align-top">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors border border-gray-100 dark:border-slate-700">
                          <Package size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight mb-1">{item.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{item.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 align-top pt-8">
                       <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-[10px] font-black uppercase rounded-lg text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700">
                          {item.category}
                       </span>
                    </td>
                    <td className="px-8 py-6 align-top pt-8 text-xs font-bold text-gray-400 tracking-widest">
                      {item.sku}
                    </td>
                    <td className="px-8 py-6 align-top pt-7">
                      <div className="flex flex-col gap-1.5 min-w-32">
                         <p className="text-sm font-black text-gray-800 dark:text-white">{item.stock}</p>
                         <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full transition-all ${
                                item.stock === 0 ? 'bg-red-500' : 
                                item.stock <= item.threshold ? 'bg-amber-500' : 'bg-primary'
                            }`} style={{ width: `${Math.min((item.stock / (item.threshold * 2)) * 100, 100)}%` }} />
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center align-top pt-8">
                      <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md ${
                        item.status === 'In Stock' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        item.status === 'Low Stock' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                        'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right align-top pt-6">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Eye size={16} /></button>
                        <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"><Edit3 size={16} /></button>
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-full border border-gray-100 dark:border-slate-800">
                        <Box size={40} className="text-gray-300 dark:text-slate-600" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">No Items Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginator */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {filteredInventory.length} Results</p>
            <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all">Prev</button>
                <button className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all">Next</button>
            </div>
        </div>
      </div>

    </div>
  );
}

// --- DISTRIBUTION CARD AS A BUTTON ---
const DistributionCard = ({ label, value, trend, up = false, isActive, onClick }: any) => (
   <button 
      onClick={onClick}
      className={`p-6 rounded-2xl border transition-all flex flex-col justify-between text-left group active:scale-95 ${
        isActive 
        ? 'bg-primary border-primary shadow-xl shadow-primary/20' 
        : 'bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-800 hover:border-primary/50 hover:shadow-md'
      }`}
   >
      <div className="flex items-center justify-between w-full mb-4">
        <p className={`text-[9px] font-black uppercase tracking-[0.15em] leading-tight ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
          {label}
        </p>
        <ChevronRight size={14} className={`transition-transform ${isActive ? 'text-white rotate-90' : 'text-gray-300 group-hover:text-primary'}`} />
      </div>
      <div className="flex items-end justify-between">
         <h4 className={`text-xl font-black leading-none tracking-tight ${isActive ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
          {value}
         </h4>
         <div className={`flex items-center gap-1 text-[10px] font-black ${isActive ? 'text-white/80' : (up ? 'text-emerald-500' : 'text-red-400')}`}>
            {up ? <ArrowUpNarrowWide size={12} /> : <ArrowDownWideNarrow size={12} />} {trend}
         </div>
      </div>
   </button>
);

const MetricCard = ({ icon, title, value, color, bgColor }: { icon: any, title: string, value: string, color: string, bgColor: string }) => (
  <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
    <div className={`p-4 rounded-2xl ${bgColor} ${color}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none">{value}</h3>
    </div>
  </div>
);

export default InventoryContainer;