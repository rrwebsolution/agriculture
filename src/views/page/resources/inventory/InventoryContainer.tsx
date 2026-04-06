import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Package, AlertTriangle, Archive, Sprout, RefreshCw, X, LayoutList, History 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { toast } from 'react-toastify';
import { cn } from '../../../../lib/utils'; 
import axios from '../../../../plugin/axios';

// 🌟 REDUX IMPORTS
import { useSelector, useDispatch } from 'react-redux';

// COMPONENTS
import InventoryMetricCard from './InventoryMetricCard'; 
import InventoryCharts from './charts/InventoryCharts';
import InventoryTable from './table/InventoryTable';
import TransactionModal from './modal/TransactionModal';
import ViewTransactionModal from './modal/ViewTransactionModal';
import NewItemModal from './modal/NewItemModal';
import EditItemModal from './modal/EditItemModal';
import InventoryTransactionLogs from './table/InventoryTransactionLogs';
import Swal from 'sweetalert2';
import type { RootState } from '../../../../store/store';
import { setInventoryData, syncInventoryItem, updateInventoryRecord } from '../../../../store/slices/inventorySlice';

const DEFAULT_CATEGORIES = [ "Seed distribution", "Fertilizer distribution(Inorganic)", "Fertilizer distribution(Organic)", "Commodity based(Package)", "Tools and equipments" ];
const DEFAULT_COMMODITIES = ["Rice Program", "Corn Program", "Cacao Program", "Vegetable Program", "Fishery Program", "HVCDP"];
const DEFAULT_UNITS = ["Sacks", "Packs", "Pieces", "Bottles", "Kilos"];

const loadFromStorage = (key: string, defaultList: any) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultList;
};

export default function InventoryContainer() {
  // 🌟 REDUX STATES
  const dispatch = useDispatch();
  const { 
    records: inventory, 
    farmers, 
    fisherfolks, 
    cooperatives, 
    isLoaded 
  } = useSelector((state: RootState) => state.inventory);

  const { records: dbEquipmentList } = useSelector((state: RootState) => state.equipment);

  // --- LOCAL STATES ---
  const [equipmentList, setEquipmentList] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(() => loadFromStorage('inv_categories', DEFAULT_CATEGORIES));
  const [commodityOptions, setCommodityOptions] = useState<string[]>(() => loadFromStorage('inv_commodities', DEFAULT_COMMODITIES));
  const [unitOptions, setUnitOptions] = useState<string[]>(() => loadFromStorage('inv_units', DEFAULT_UNITS));

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedCommodity, setSelectedCommodity] = useState("All Commodities");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"IN" | "OUT">("OUT");
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // 🌟 STATE PARA SA TABS
  const [activeTab, setActiveTab] = useState<'registry' | 'logs'>('registry');

  // --- TAB DEFINITIONS ---
  const inventoryTabs = [
    { id: 'registry', label: 'Inventory Registry', icon: <LayoutList size={16} /> },
    { id: 'logs', label: 'Transaction Logs', icon: <History size={16} /> },
  ];

  // --- EFFECTS ---
  useEffect(() => { localStorage.setItem('inv_categories', JSON.stringify(categoryOptions)); }, [categoryOptions]);
  useEffect(() => { localStorage.setItem('inv_commodities', JSON.stringify(commodityOptions)); }, [commodityOptions]);
  useEffect(() => { localStorage.setItem('inv_equipments', JSON.stringify(equipmentList)); }, [equipmentList]);
  useEffect(() => { localStorage.setItem('inv_units', JSON.stringify(unitOptions)); }, [unitOptions]);

  useEffect(() => {
    if (dbEquipmentList && dbEquipmentList.length > 0) {
      setEquipmentList(dbEquipmentList.map((eq: any) => eq.name));
    }
  }, [dbEquipmentList]);

  const fetchData = async (forceRefresh = false) => {
    if (isLoaded && !forceRefresh) return;

    setIsLoading(true);
    try {
        const res = await axios.get('/inventory');
        dispatch(setInventoryData({
            inventories: res.data.inventories || [],
            farmers: res.data.farmers || [],
            fisherfolks: res.data.fisherfolks || [],
            cooperatives: res.data.cooperatives || []
        }));
        
        // if (forceRefresh) toast.success("Data refreshed successfully");
    } catch (error) {
        toast.error("Failed to load inventory data");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [isLoaded]);

  // --- FILTERING & PAGINATION ---
  const filteredInventory = inventory.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory;
    const matchesCommodity = selectedCommodity === "All Commodities" || item.commodity === selectedCommodity;
    return matchesSearch && matchesCategory && matchesCommodity;
  });

  useEffect(() => { setCurrentPage(1); }, [search, selectedCategory, selectedCommodity]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  // --- HANDLERS ---
  const handleAddCategory = (val: string) => setCategoryOptions([...categoryOptions, val]);
  const handleAddCommodity = (val: string) => setCommodityOptions([...commodityOptions, val]);
  const handleAddEquipment = (val: string) => setEquipmentList([...equipmentList, val]);
  const handleAddUnit = (val: string) => setUnitOptions([...unitOptions, val]);
  const handleDeleteCategory = (val: string) => setCategoryOptions(categoryOptions.filter(i => i !== val));
  const handleDeleteCommodity = (val: string) => setCommodityOptions(commodityOptions.filter(i => i !== val));
  const handleDeleteEquipment = (val: string) => setEquipmentList(equipmentList.filter(i => i !== val));
  const handleDeleteUnit = (val: string) => setUnitOptions(unitOptions.filter(i => i !== val));

  const handleView = (item: any) => { setSelectedItem(item); setIsViewModalOpen(true); };
  const handleAddStock = (item: any) => { setSelectedItem(item); setTransactionType("IN"); setIsModalOpen(true); };
  const handleDistribute = (item: any) => { setSelectedItem(item); setTransactionType("OUT"); setIsModalOpen(true); };
  const handleEdit = (item: any) => { setSelectedItem(item); setIsEditItemOpen(true); };

  const handleTransactionSubmit = async (formData: any) => {
    try {
        const res = await axios.patch(`/inventory/${selectedItem.id}/stock`, {
            type: transactionType, quantity: formData.quantity, date: formData.date,
            source: formData.source || null, beneficiary_type: formData.beneficiary_type || null,
            recipient: formData.recipient || null, rsbsa: formData.rsbsa || null
        });
        
        dispatch(syncInventoryItem(res.data)); 
        toast.success("Transaction successful!");
        setIsModalOpen(false);
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Transaction failed");
        throw error;
    }
  };

  const handleAddNewSubmit = async (formData: any) => {
    try {
      const res = await axios.post('/inventory', formData);
      dispatch(updateInventoryRecord({ data: res.data, mode: 'add' })); 
      toast.success(`${formData.name} successfully registered!`);
      setIsNewItemOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to register asset.");
      throw error;
    }
  };

  const handleEditSubmit = async (formData: any) => {
    try {
      const res = await axios.put(`/inventory/${formData.id}`, formData);
      dispatch(updateInventoryRecord({ data: res.data, mode: 'edit' }));
      toast.success(`${formData.name} updated successfully!`);
      setIsEditItemOpen(false); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update asset.");
      throw error; 
    }
  };

  const handleRevertTransaction = async (transactionId: number) => {
    try {
        const res = await axios.post(`/inventory/transactions/${transactionId}/revert`);
        dispatch(syncInventoryItem(res.data)); 
        Swal.fire({
            title: "Reverted!", text: "A compensating transaction has been recorded.", icon: "success", timer: 2000, showConfirmButton: false,
        });
    } catch (error: any) {
        Swal.fire("Error", error.response?.data?.message || "Failed to revert transaction", "error");
        throw error;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 🌟 HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sprout className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Agri & Fishery</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Commodity <span className="text-primary italic">Inventory</span>
          </h2>
        </div>
        
        {/* ADD NEW BUTTON (Gi-move sa taas parehas sa CropsContainer) */}
        <div className="flex items-center gap-3">
          <button onClick={() => setIsNewItemOpen(true)} className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95 cursor-pointer">
            <Plus size={18} /> New Item
          </button>
        </div>
      </div>

      {/* 🌟 METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InventoryMetricCard isLoading={isLoading} icon={<Package />} title="Total Commodities" value={inventory.length.toString()} color="text-primary" bgColor="bg-primary/10" />
        <InventoryMetricCard isLoading={isLoading} icon={<AlertTriangle />} title="Low Stock Alerts" value={inventory.filter((i:any) => i.status === "Low Stock").length.toString()} color="text-amber-500" bgColor="bg-amber-500/10" />
        <InventoryMetricCard isLoading={isLoading} icon={<Archive />} title="Out of Stock" value={inventory.filter((i:any) => i.status === "Out of Stock").length.toString()} color="text-red-500" bgColor="bg-red-500/10" />
        <InventoryMetricCard isLoading={isLoading} icon={<Sprout />} title="Programs Active" value={commodityOptions.length.toString()} color="text-emerald-500" bgColor="bg-emerald-500/10" />
      </div>

      {/* 🌟 UNDERLINED TAB NAVIGATION */}
      <div className="relative border-b border-gray-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-8 px-2 min-w-max">
          {inventoryTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "relative flex items-center gap-2.5 py-4 text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer outline-none group",
                  isActive ? "text-primary" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                )}
              >
                <span className={cn("p-1.5 rounded-lg transition-all", isActive ? "bg-primary/10 text-primary" : "bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-slate-800")}>
                  {tab.icon}
                </span>
                {tab.label}
                {isActive ? (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-1 duration-300" />
                ) : (
                  <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-0.5 bg-gray-200 dark:bg-slate-700 transition-all duration-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🌟 FILTERS WRAPPER (Makita lang sa Registry Tab) */}
      {activeTab === 'registry' && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row items-center gap-4">
            
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search Item Name or SKU..." className="w-full pl-12 pr-12 h-13 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all text-gray-700 dark:text-white" value={search} onChange={(e) => setSearch(e.target.value)} />
              {search && <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-red-300 hover:text-red-500 rounded-full transition-all cursor-pointer"><X size={14} /></button>}
            </div>

            {/* Commodity Filter */}
            <div className="relative shrink-0 w-full md:w-48 lg:w-56">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
              <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
                <SelectTrigger className="w-full h-13 pl-12 pr-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold cursor-pointer outline-none focus:ring-2 focus:ring-primary"><SelectValue placeholder="Commodity" /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 rounded-2xl shadow-xl p-1 z-50">
                    <SelectItem value="All Commodities" className="text-xs font-bold uppercase py-3 cursor-pointer">All Commodities</SelectItem>
                    {commodityOptions.map(c => <SelectItem key={c} value={c} className="text-xs font-bold uppercase py-3 cursor-pointer">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="relative shrink-0 w-full md:w-48 lg:w-56">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full h-13 pl-12 pr-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold cursor-pointer outline-none focus:ring-2 focus:ring-primary"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 rounded-2xl shadow-xl p-1 z-50">
                    <SelectItem value="All Categories" className="text-xs font-bold uppercase py-3 cursor-pointer">All Categories</SelectItem>
                    {categoryOptions.map(c => <SelectItem key={c} value={c} className="text-xs font-bold uppercase py-3 cursor-pointer">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Refresh Button */}
            <button onClick={() => fetchData(true)} disabled={isLoading} className="shrink-0 flex items-center justify-center gap-2 px-6 h-13 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-30 w-full md:w-auto">
              <RefreshCw size={16} className={cn(isLoading && "animate-spin text-primary ")} />
              <span className={cn(isLoading && "text-primary cursor-not-allowed")}>{isLoading ? "Refreshing..." : "Refresh data"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 🌟 RENDER CONTENT BASE SA TAB 🌟 */}
      {activeTab === 'registry' ? (
        <>
          <InventoryCharts inventory={inventory} isLoading={isLoading} />
          <InventoryTable 
            isLoading={isLoading} currentItems={currentItems} filteredLength={filteredInventory.length} 
            currentPage={currentPage} totalPages={totalPages} indexOfFirstItem={indexOfFirstItem} 
            indexOfLastItem={indexOfLastItem} onPageChange={setCurrentPage} onView={handleView} 
            onAddStock={handleAddStock} onDistribute={handleDistribute} onEdit={handleEdit} 
          />
        </>
      ) : (
        <InventoryTransactionLogs 
            inventory={inventory} isLoading={isLoading} onRevertTransaction={handleRevertTransaction}
        />
      )}

      {/* 🌟 MODALS */}
      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} transactionType={transactionType} selectedItem={selectedItem} onSubmit={handleTransactionSubmit} farmerList={farmers} fisherfolkList={fisherfolks} cooperativeList={cooperatives} />
      <ViewTransactionModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} selectedItem={selectedItem} />
      <NewItemModal isOpen={isNewItemOpen} onClose={() => setIsNewItemOpen(false)} onSubmit={handleAddNewSubmit} categoryOptions={categoryOptions} defaultCategories={DEFAULT_CATEGORIES} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} commodityOptions={commodityOptions} defaultCommodities={DEFAULT_COMMODITIES} onAddCommodity={handleAddCommodity} onDeleteCommodity={handleDeleteCommodity} equipmentList={equipmentList} onAddEquipment={handleAddEquipment} onDeleteEquipment={handleDeleteEquipment} unitOptions={unitOptions} onAddUnit={handleAddUnit} onDeleteUnit={handleDeleteUnit} />
      <EditItemModal isOpen={isEditItemOpen} onClose={() => setIsEditItemOpen(false)} selectedItem={selectedItem} onSubmit={handleEditSubmit} categoryOptions={categoryOptions} defaultCategories={DEFAULT_CATEGORIES} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} commodityOptions={commodityOptions} defaultCommodities={DEFAULT_COMMODITIES} onAddCommodity={handleAddCommodity} onDeleteCommodity={handleDeleteCommodity} equipmentList={equipmentList} onAddEquipment={handleAddEquipment} onDeleteEquipment={handleDeleteEquipment} unitOptions={unitOptions} onAddUnit={handleAddUnit} onDeleteUnit={handleDeleteUnit} />
      
    </div>
  );
}