import { useState } from 'react';
import { 
  Wallet, Plus, Search, Edit3, Trash2, Eye, 
  Filter, CreditCard, 
  TrendingDown, FileSpreadsheet, Calendar, PieChart, Banknote,
  Receipt
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';

// --- MOCK DATA ---
const INITIAL_EXPENSES = [
  { id: 1, refNo: "EXP-2026-001", category: "Materials", item: "Rice Seeds (RC-222)", amount: "₱45,000", date: "Feb 20, 2026", status: "Paid", project: "Seed Subsidy Program" },
  { id: 2, refNo: "EXP-2026-042", category: "Fuel", item: "Diesel for Tractor 01", amount: "₱8,200", date: "Feb 22, 2026", status: "Paid", project: "Land Preparation" },
  { id: 3, refNo: "EXP-2026-015", category: "Maintenance", item: "Irrigation Pump Parts", amount: "₱12,500", date: "Feb 23, 2026", status: "Pending", project: "Cluster 3 Repair" },
  { id: 4, refNo: "EXP-2026-088", category: "Labor", item: "Field Tech Allowance", amount: "₱25,000", date: "Feb 15, 2026", status: "Paid", project: "General Ops" },
];

const categoryOptions = ["All Categories", "Materials", "Fuel", "Maintenance", "Labor"];

function ExpensesContainer() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [expenses] = useState(INITIAL_EXPENSES);

  // Filter Logic
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.item.toLowerCase().includes(search.toLowerCase()) || 
                          exp.refNo.toLowerCase().includes(search.toLowerCase()) ||
                          exp.project.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- PAGE HEADER --- */}
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
            <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-600 dark:text-slate-300 px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-sm active:scale-95">
                <FileSpreadsheet size={18} /> Export CSV
            </button>
            <button className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95">
                <Plus size={18} /> Log New Expense
            </button>
        </div>
      </div>

      {/* --- MONTHLY COST BREAKDOWN (FULL WIDTH) --- */}
      <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
           <div className="p-2 bg-primary/10 rounded-xl text-primary"><TrendingDown size={20} /></div>
           <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Monthly Cost Breakdown</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           <CostMetric label="Seeds" value="₱65k" percent={45} />
           <CostMetric label="Fertilizer" value="₱32k" percent={22} />
           <CostMetric label="Fuel/Power" value="₱28k" percent={20} />
           <CostMetric label="Labor" value="₱18k" percent={13} />
        </div>
      </div>

      {/* --- SUMMARY METRICS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Banknote />} title="Monthly Expenses" value="₱142,500" color="text-primary" bgColor="bg-primary/10" />
        <MetricCard icon={<CreditCard />} title="Pending Payments" value="₱12,500" color="text-amber-500" bgColor="bg-amber-500/10" />
        <MetricCard icon={<TrendingDown />} title="Avg. Daily Cost" value="₱4,750" color="text-blue-500" bgColor="bg-blue-500/10" />
        <MetricCard icon={<PieChart />} title="Budget Utilization" value="68%" color="text-emerald-500" bgColor="bg-emerald-500/10" />
      </div>

      {/* --- CONTROLS: SEARCH & FILTER --- */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Item, Project, or Ref No..."
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

      {/* --- EXPENSES TABLE --- */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-250">
            <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Expense Details</th>
                <th className="px-8 py-5">Category & Project</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    
                    {/* DETAILS */}
                    <td className="px-8 py-6 align-top">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors border border-gray-100 dark:border-slate-700">
                          <Receipt size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight mb-1">{exp.item}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">REF: {exp.refNo}</p>
                        </div>
                      </div>
                    </td>

                    {/* CATEGORY & PROJECT */}
                    <td className="px-8 py-6 align-top pt-8">
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-primary uppercase tracking-tight bg-primary/5 px-2 py-0.5 rounded w-fit">
                            {exp.category}
                          </span>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{exp.project}</p>
                       </div>
                    </td>

                    {/* DATE */}
                    <td className="px-8 py-6 align-top pt-8">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Calendar size={14} className="text-gray-400"/>
                        <span>{exp.date}</span>
                      </div>
                    </td>

                    {/* AMOUNT */}
                    <td className="px-8 py-6 align-top pt-8">
                      <p className="text-sm font-black text-primary">{exp.amount}</p>
                    </td>

                    {/* STATUS */}
                    <td className="px-8 py-6 text-center align-top pt-8">
                      <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md ${
                        exp.status === 'Paid' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}>
                        {exp.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
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
                        <Wallet size={40} className="text-gray-300 dark:text-slate-600" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">No Expenses Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginator */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {filteredExpenses.length} Results</p>
            <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all">Prev</button>
                <button className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all">Next</button>
            </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---
const CostMetric = ({ label, value, percent }: { label: string, value: string, percent: number }) => (
   <div className="space-y-3">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-gray-800 dark:text-white leading-none tracking-tight">{value}</p>
      <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
         <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-[9px] font-bold text-gray-400 uppercase italic">{percent}% of total spending</p>
   </div>
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

export default ExpensesContainer;