import { useState } from 'react';
import { 
  Box, Plus, Search, Edit3,
  Filter, Package, AlertTriangle, Archive, Tag,
  ArrowUpNarrowWide, User,  X, Check
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';
import { toast } from 'react-toastify';

// --- MOCK DATA UPDATED WITH BATCH & SOURCE ---
const INITIAL_INVENTORY = [
  { id: 1, name: "RC-222 Rice Seeds", category: "Seeds", sku: "SED-001", batch: "B2024-01", source: "DA National", stock: 450, unit: "Sacks", status: "In Stock", threshold: 100 },
  { id: 2, name: "Urea Fertilizer", category: "Fertilizer", sku: "FER-082", batch: "B2024-09", source: "LGU Fund", stock: 25, unit: "Bags", status: "Low Stock", threshold: 50 },
  { id: 3, name: "Complete (14-14-14)", category: "Fertilizer", sku: "FER-090", batch: "B2024-05", source: "LGU Fund", stock: 120, unit: "Bags", status: "In Stock", threshold: 40 },
  { id: 4, name: "Pioneer Yellow Corn", category: "Seeds", sku: "SED-005", batch: "B2023-12", source: "NGO Aid", stock: 0, unit: "Sacks", status: "Out of Stock", threshold: 20 },
];

const categoryOptions = ["All Categories", "Seeds", "Fertilizer", "Tools"];

export default function InventoryContainer() {
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  
  // State para sa Stock Out Modal
  const [isReleaseOpen, setIsReleaseOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [releaseForm, setReleaseForm] = useState({ quantity: 0, recipient: "", date: new Date().toISOString().split('T')[0] });

  // Logic: Filter Items
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Logic: Handle Stock Out (Deduction)
  const handleReleaseStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (releaseForm.quantity > selectedItem.stock) {
        toast.error("Insufficient stock!");
        return;
    }

    setInventory(prev => prev.map(item => {
        if(item.id === selectedItem.id) {
            const newCount = item.stock - releaseForm.quantity;
            let newStatus = "In Stock";
            if (newCount === 0) newStatus = "Out of Stock";
            else if (newCount <= item.threshold) newStatus = "Low Stock";

            return { ...item, stock: newCount, status: newStatus };
        }
        return item;
    }));

    toast.success(`Successfully released ${releaseForm.quantity} ${selectedItem.unit} to ${releaseForm.recipient}`);
    setIsReleaseOpen(false);
    setReleaseForm({ quantity: 0, recipient: "", date: "" });
  };

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
            <button className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95">
                <Plus size={18} /> New Item
            </button>
        </div>
      </div>

      {/* --- SUMMARY METRICS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Package />} title="Total Stock Items" value={inventory.length.toString()} color="text-primary" bgColor="bg-primary/10" />
        <MetricCard icon={<AlertTriangle />} title="Low Stock Alerts" value={inventory.filter(i => i.status === "Low Stock").length.toString()} color="text-amber-500" bgColor="bg-amber-500/10" />
        <MetricCard icon={<Archive />} title="Out of Stock" value={inventory.filter(i => i.status === "Out of Stock").length.toString()} color="text-red-500" bgColor="bg-red-500/10" />
        <MetricCard icon={<Tag />} title="Total Categories" value="4" color="text-blue-500" bgColor="bg-blue-500/10" />
      </div>

      {/* --- CONTROLS: SEARCH & FILTER --- */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Item or SKU..."
            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="relative shrink-0 w-full sm:w-55">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border-transparent rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary shadow-sm cursor-pointer border-none outline-none">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-gray-100 rounded-2xl shadow-xl p-1 z-50 border-none outline-none">
              {categoryOptions.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs font-bold uppercase py-3 cursor-pointer">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- INVENTORY TABLE --- */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-225">
            <thead className="bg-gray-50/95 dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-800">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Item & Batch Info</th>
                <th className="px-8 py-5">Source</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Stock Level</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors border border-gray-100 dark:border-slate-700 shrink-0">
                        <Package size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight">{item.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">BATCH: {item.batch} | {item.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 pt-8 text-[10px] font-black uppercase text-gray-400 italic">
                    {item.source}
                  </td>
                  <td className="px-8 py-6 pt-8">
                     <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-[9px] font-black uppercase rounded-lg border border-blue-100 dark:border-blue-900/30 tracking-wider">
                        {item.category}
                     </span>
                  </td>
                  <td className="px-8 py-6 pt-7">
                    <div className="flex flex-col gap-1.5 min-w-32">
                       <div className="flex justify-between items-end"><p className="text-sm font-black text-gray-800 dark:text-white leading-none">{item.stock}</p><p className="text-[9px] font-bold text-gray-400 uppercase">Min: {item.threshold}</p></div>
                       <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full transition-all ${item.stock === 0 ? 'bg-red-500' : item.stock <= item.threshold ? 'bg-amber-500' : 'bg-primary'}`} 
                          style={{ width: `${Math.min((item.stock / (item.threshold * 2.5)) * 100, 100)}%` }} />
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center pt-8">
                    <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md ${
                      item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' :
                      item.status === 'Low Stock' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' : 'bg-red-50 text-red-600 dark:bg-red-500/10'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right pt-6">
                    <div className="flex items-center justify-end gap-1">
                      {/* STOCK OUT / RELEASE BUTTON */}
                      <button 
                        onClick={() => { setSelectedItem(item); setIsReleaseOpen(true); }}
                        disabled={item.stock === 0}
                        title="Release Stock"
                        className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-all disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUpNarrowWide size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer"><Edit3 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- RELEASE STOCK MODAL --- */}
      {isReleaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsReleaseOpen(false)} />
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-primary p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ArrowUpNarrowWide size={20} />
                        <h3 className="font-black uppercase tracking-widest text-sm">Release Resource</h3>
                    </div>
                    <button onClick={() => setIsReleaseOpen(false)}><X size={20} /></button>
                </div>
                <form onSubmit={handleReleaseStock} className="p-8 space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Item to Distribute</p>
                        <p className="text-lg font-black text-gray-800 dark:text-white uppercase">{selectedItem?.name}</p>
                        <p className="text-xs font-bold text-primary">Current Stock: {selectedItem?.stock} {selectedItem?.unit}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Recipient (Farmer/Barangay)</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input required type="text" className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800 rounded-2xl text-xs font-bold outline-none border-transparent focus:ring-2 focus:ring-primary transition-all" 
                                placeholder="Enter Name or Cluster..." value={releaseForm.recipient} onChange={(e) => setReleaseForm({...releaseForm, recipient: e.target.value})} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Quantity</label>
                                <input required type="number" min="1" max={selectedItem?.stock} className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 rounded-2xl text-xs font-bold outline-none border-transparent focus:ring-2 focus:ring-primary transition-all" 
                                value={releaseForm.quantity} onChange={(e) => setReleaseForm({...releaseForm, quantity: parseInt(e.target.value)})} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Date</label>
                                <input required type="date" className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 rounded-2xl text-xs font-bold outline-none border-transparent focus:ring-2 focus:ring-primary transition-all" 
                                value={releaseForm.date} onChange={(e) => setReleaseForm({...releaseForm, date: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2">
                        <Check size={18} /> Confirm Distribution
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

const MetricCard = ({ icon, title, value, color, bgColor }: any) => (
  <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
    <div className={`p-4 rounded-2xl ${bgColor} ${color}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none">{value}</h3>
    </div>
  </div>
);