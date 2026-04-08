import { useState, useEffect } from 'react';
import { 
  Wallet, Plus, Search, Filter, CreditCard, 
  TrendingDown, PieChart, Banknote,
  RefreshCw, X, Calendar, LayoutList, Archive
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';
import { cn } from '../../../lib/utils';
import axios from '../../../plugin/axios'; 
import Swal from 'sweetalert2';
import { toast } from 'react-toastify'; 

// 🌟 REDUX IMPORTS
import { useSelector, useDispatch } from 'react-redux';

import ExpenseMetricCard from './card/ExpenseMetricCard';
import MonthlyCostBreakdown from './MonthlyCostBreakdown';
import ExpensesTable from './table/ExpensesTable';
import LogExpenseModal from './modals/LogExpenseModal';
import ViewExpenseModal from './modals/ViewExpenseModal';
import EditExpenseModal from './modals/EditExpenseModal';
import { addExpense, addLocalCategory, addLocalProject, archiveExpense, restoreExpense, setExpenseData, updateExpense } from '../../../store/slices/expenseSlice';
import type { RootState } from '../../../store/store';

export default function ExpensesContainer() {
  // 🌟 REDUX STATE
  const dispatch = useDispatch();
  const { 
    activeRecords: expenses, 
    archivedRecords: trashedExpenses, 
    categories: expenseCategories, 
    projects: projectOptions, 
    isLoaded 
  } = useSelector((state: RootState) => state.expenses);

  // 🌟 LOCAL UI STATES
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDate, setSelectedDate] = useState(""); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const [isLogExpenseOpen, setIsLogExpenseOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  // 🌟 FETCH DATA (Naay check kung isLoaded na aron dili mag cge'g refresh inig balhin og page)
  const fetchExpenses = async (forceRefresh = false) => {
    if (isLoaded && !forceRefresh) return; // Ayaw og load kung naa na, Gawas lang og gi-click ang Refresh button

    setIsLoading(true);
    try {
      const response = await axios.get('expenses');
      dispatch(setExpenseData({
          active: response.data.expenses,
          archived: response.data.trashed,
          categories: response.data.categories || [],
          projects: response.data.projects || []
      }));
    } catch (error) {
      toast.error("Failed to load expenses data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load Trigger
  useEffect(() => { fetchExpenses(); }, [isLoaded]);

  // 1. Pilia ang array base sa Tab nga gi-click
  const sourceData = activeTab === 'active' ? expenses : trashedExpenses;

  // 2. I-filter ang napili nga array
  const filteredExpenses = sourceData.filter((exp:any) => {
    const matchesSearch = exp.item.toLowerCase().includes(search.toLowerCase()) || 
                          (exp.ref_no && exp.ref_no.toLowerCase().includes(search.toLowerCase())) ||
                          (exp.project && exp.project.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All Categories" || exp.category === selectedCategory;
    
    const expDate = exp.date_incurred ? exp.date_incurred.split('T')[0] : "";
    const matchesDate = selectedDate === "" || expDate.startsWith(selectedDate);
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  useEffect(() => { setCurrentPage(1); }, [search, selectedCategory, selectedDate, activeTab]);

  const currentDisplayData = filteredExpenses; 

  const totalExpenses = currentDisplayData.reduce((sum:any, exp:any) => sum + parseFloat(exp.amount), 0);
  const pendingPayments = currentDisplayData.filter((exp:any) => exp.status === 'Pending').reduce((sum:any, exp:any) => sum + parseFloat(exp.amount), 0);
  const paidPayments = currentDisplayData.filter((exp:any) => exp.status === 'Paid').reduce((sum:any, exp:any) => sum + parseFloat(exp.amount), 0);
  
  const formatMoney = (val: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  const handleDelete = async (id: number) => {
    const isDark = document.documentElement.classList.contains('dark');
    Swal.fire({
      title: "Archive Record?",
      text: "This record will be moved to the Archived tab.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, Archive it!",
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#ffffff' : '#1e293b',
      customClass: {
        popup: 'rounded-[2.5rem] p-8 border-none shadow-2xl',
        confirmButton: 'rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest',
        cancelButton: 'rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`expenses/${id}`);
          
          // 🌟 IPASA SA REDUX ARON MO-UPDATE ANG STATE NGA DILI MAG-REFRESH
          dispatch(archiveExpense(id));

          Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 }).fire({ icon: 'success', title: 'Moved to Archived' });
        } catch (error) {
          toast.error("Failed to delete record.");
        }
      }
    });
  };

  const handleRestore = async (id: number) => {
    const isDark = document.documentElement.classList.contains('dark');
    Swal.fire({
      title: "Restore Record?",
      text: "This will move the record back to Active expenses.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, Restore it!",
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#ffffff' : '#1e293b',
      customClass: {
        popup: 'rounded-[2.5rem] p-8 border-none shadow-2xl',
        confirmButton: 'rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest',
        cancelButton: 'rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.post(`expenses/${id}/restore`);
          
          // 🌟 IPASA ANG NA-RESTORE NGA DATA SA REDUX
          dispatch(restoreExpense(res.data.data));

          Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 }).fire({ icon: 'success', title: 'Restored successfully' });
        } catch (error) {
          toast.error("Failed to restore record.");
        }
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary dark:text-green-400 uppercase tracking-[0.3em]">Financial Oversight</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Expense <span className="text-primary italic">Tracking</span>
          </h2>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setIsLogExpenseOpen(true)} className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95 cursor-pointer">
                <Plus size={18} /> Log New Expense
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ExpenseMetricCard isLoading={isLoading} icon={<Banknote />} title="Total Expenses" value={formatMoney(totalExpenses)} color="text-primary" bgColor="bg-primary/10" />
        <ExpenseMetricCard isLoading={isLoading} icon={<CreditCard />} title="Pending Payments" value={formatMoney(pendingPayments)} color="text-amber-500" bgColor="bg-amber-500/10" />
        <ExpenseMetricCard isLoading={isLoading} icon={<TrendingDown />} title="Paid Expenses" value={formatMoney(paidPayments)} color="text-blue-500" bgColor="bg-blue-500/10" />
        <ExpenseMetricCard isLoading={isLoading} icon={<PieChart />} title="Total Active Records" value={expenses.length.toString()} color="text-emerald-500" bgColor="bg-emerald-500/10" />
      </div>

      {/* TABS */}
      <div className="relative border-b border-gray-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-8 px-2 min-w-max">
          {[
              { id: 'active', label: 'Active Records', icon: <LayoutList size={16} /> },
              { id: 'archived', label: 'Archived', icon: <Archive size={16} /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "relative flex items-center gap-2.5 py-4 text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer outline-none group",
                  isActive ? (tab.id === 'active' ? "text-primary" : "text-red-500") : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                )}
              >
                <span className={cn("p-1.5 rounded-lg transition-all", isActive ? (tab.id === 'active' ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-500") : "bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-slate-800")}>
                  {tab.icon}
                </span>
                {tab.label}
                {isActive && <div className={cn("absolute bottom-0 left-0 w-full h-0.5 animate-in fade-in slide-in-from-bottom-1 duration-300", tab.id === 'active' ? "bg-primary" : "bg-red-500")} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search Item, Project, or Ref No..." className="w-full pl-12 pr-12 h-13 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none text-gray-700 dark:text-white" value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-red-300 hover:text-red-500 rounded-full cursor-pointer"><X size={14} /></button>}
          </div>

          <div className="relative shrink-0 w-full md:w-48 lg:w-56">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full h-13 pl-12 pr-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold cursor-pointer"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-1 z-50">
                {["All Categories", ...expenseCategories].map(cat => <SelectItem key={cat} value={cat} className="text-xs font-bold uppercase py-3 cursor-pointer">{cat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="relative shrink-0 w-full md:w-48 lg:w-48">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
            <input type="date" className={cn("w-full h-13 pl-12 pr-10 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary cursor-pointer text-gray-700 dark:text-white", !selectedDate && "text-gray-400")} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            {selectedDate && <button onClick={() => setSelectedDate("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-red-300 hover:text-red-500 rounded-full cursor-pointer bg-gray-50 dark:bg-slate-800 z-20"><X size={14} /></button>}
          </div>

          <button onClick={() => fetchExpenses(true)} disabled={isLoading} className="shrink-0 flex items-center justify-center gap-2 px-6 h-13 bg-gray-50 dark:bg-slate-800/50 rounded-2xl text-[10px] font-black uppercase hover:text-primary transition-all cursor-pointer">
            <RefreshCw size={16} className={cn(isLoading && "animate-spin text-primary")} />
            <span className={cn(isLoading && "text-primary cursor-not-allowed")}>{isLoading ? "Refreshing..." : "Refresh data"}</span>
          </button>
        </div>
      </div>

      {activeTab === 'active' && <MonthlyCostBreakdown expenses={filteredExpenses} isLoading={isLoading} globalDateActive={!!selectedDate} />}

      <ExpensesTable 
        expenses={filteredExpenses} 
        isLoading={isLoading} 
        isArchived={activeTab === 'archived'}
        onView={(e) => { setSelectedExpense(e); setIsViewOpen(true); }} 
        onEdit={(e) => { setSelectedExpense(e); setIsEditOpen(true); }} 
        onDelete={handleDelete} 
        onRestore={handleRestore}
        currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} 
        indexOfFirstItem={indexOfFirstItem} indexOfLastItem={indexOfLastItem} 
      />

      <LogExpenseModal 
        isOpen={isLogExpenseOpen} 
        onClose={() => setIsLogExpenseOpen(false)} 
        onSuccess={(newExpense) => dispatch(addExpense(newExpense))} // 🌟 REDUX DISPATCH
        categories={expenseCategories} 
        projects={projectOptions} 
        onAddCategory={(val) => dispatch(addLocalCategory(val))} // 🌟 REDUX DISPATCH
        onAddProject={(val) => dispatch(addLocalProject(val))}   // 🌟 REDUX DISPATCH
      />
      <ViewExpenseModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} expense={selectedExpense} />
      
      <EditExpenseModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        onSuccess={(updatedExpense) => dispatch(updateExpense(updatedExpense))} // 🌟 REDUX DISPATCH
        expense={selectedExpense} 
        categories={expenseCategories} 
        projects={projectOptions} 
        onAddCategory={(val) => dispatch(addLocalCategory(val))} 
        onAddProject={(val) => dispatch(addLocalProject(val))} 
      />
    </div>
  );
}