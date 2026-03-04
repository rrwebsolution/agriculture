import { useState } from 'react';
import { 
  FileText, Plus, Search, Download, Eye, 
  FileSpreadsheet, BarChart3, Calendar, User, 
  PieChart, ClipboardCheck, Trash2, Filter
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';

// --- MOCK DATA ---
const INITIAL_REPORTS = [
  { id: 1, title: "Q1 Rice Production Summary", type: "Production", date: "Feb 20, 2026", author: "Admin Sarah", format: "PDF", status: "Verified" },
  { id: 2, title: "Monthly Financial Audit (Jan)", type: "Financial", date: "Feb 05, 2026", author: "Accountant Dave", format: "XLSX", status: "Verified" },
  { id: 3, title: "Sector 3 Census - Rice Farmers", type: "Census", date: "Jan 25, 2026", author: "Field Lead Mark", format: "PDF", status: "Pending Audit" },
  { id: 4, title: "Equipment Inventory Status", type: "Inventory", date: "Jan 15, 2026", author: "Supply Officer", format: "PDF", status: "Verified" },
  { id: 5, title: "Fishery Yield Report - Odiongan", type: "Production", date: "Jan 10, 2026", author: "Fisheries Lead", format: "XLSX", status: "Draft" },
];

const typeOptions = ["All Classifications", "Production", "Financial", "Census", "Inventory"];

function ReportsContainer() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All Classifications");
  const [reports] = useState(INITIAL_REPORTS);

  // Filter Logic
  const filteredReports = reports.filter(rep => {
    const matchesSearch = rep.title.toLowerCase().includes(search.toLowerCase()) || 
                          rep.author.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === "All Classifications" || rep.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary dark:text-green-400 uppercase tracking-[0.3em]">Documentation & Analytics</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Report <span className="text-primary italic">Archive</span>
          </h2>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95">
          <Plus size={18} /> Generate New Report
        </button>
      </div>

      {/* --- REPORT DISTRIBUTION SUMMARY (FULL WIDTH) --- */}
      <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <BarChart3 className="absolute -top-10 -right-10 text-primary/5 rotate-12" size={250} />
        <div className="relative z-10">
           <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><PieChart size={20} /></div>
              <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Archive Composition</h3>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <ReportMetric label="Production" count="120" percent={45} />
              <ReportMetric label="Financial" count="85" percent={30} />
              <ReportMetric label="Census" count="45" percent={15} />
              <ReportMetric label="Inventory" count="32" percent={10} />
           </div>
        </div>
      </div>

      {/* --- SUMMARY METRICS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<FileText />} title="Total Reports" value="245" color="text-primary" bgColor="bg-primary/10" />
        <MetricCard icon={<ClipboardCheck />} title="Approved (Month)" value="18" color="text-emerald-500" bgColor="bg-emerald-500/10" />
        <MetricCard icon={<Eye />} title="Pending Review" value="5" color="text-amber-500" bgColor="bg-amber-500/10" />
        <MetricCard icon={<BarChart3 />} title="Data Accuracy" value="98.2%" color="text-blue-500" bgColor="bg-blue-500/10" />
      </div>

      {/* --- CONTROLS: SEARCH & FILTER --- */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Title or Author..."
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="relative shrink-0 w-full sm:w-55">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:outline-none transition-all shadow-sm cursor-pointer">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl p-1 z-50">
              {typeOptions.map((type) => (
                <SelectItem key={type} value={type} className="text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer py-3 px-4 rounded-xl focus:bg-primary/10 focus:text-primary transition-colors outline-none">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- REPORTS TABLE --- */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-250">
            <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Report Title</th>
                <th className="px-8 py-5">Classification</th>
                <th className="px-8 py-5">Generated By</th>
                <th className="px-8 py-5">Date / Format</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {filteredReports.length > 0 ? (
                filteredReports.map((rep) => (
                  <tr key={rep.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    
                    {/* TITLE */}
                    <td className="px-8 py-6 align-top">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all border border-gray-100 dark:border-slate-700">
                           <FileText size={18} />
                        </div>
                        <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight pt-1">{rep.title}</p>
                      </div>
                    </td>

                    {/* CLASSIFICATION */}
                    <td className="px-8 py-6 align-top pt-8">
                       <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase rounded-lg border border-primary/10">
                          {rep.type}
                       </span>
                    </td>

                    {/* AUTHOR */}
                    <td className="px-8 py-6 align-top pt-8">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-slate-400">
                         <User size={14} className="text-gray-400" /> {rep.author}
                      </div>
                    </td>

                    {/* DATE & FORMAT */}
                    <td className="px-8 py-6 align-top pt-8">
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            <Calendar size={12} /> {rep.date}
                          </div>
                          <div className="flex items-center gap-1">
                             {rep.format === 'PDF' ? <FileText size={12} className="text-red-500" /> : <FileSpreadsheet size={12} className="text-emerald-500" />}
                             <span className="text-[10px] font-black text-gray-500 uppercase">{rep.format}</span>
                          </div>
                       </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-8 py-6 text-center align-top pt-8">
                       <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border ${
                          rep.status === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                          rep.status === 'Pending Audit' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400' : 
                          'bg-gray-100 text-gray-400 border-gray-200 dark:bg-slate-800 dark:text-slate-500'
                       }`}>
                          {rep.status}
                       </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-8 py-6 text-right align-top pt-6">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Eye size={16} /></button>
                        <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"><Download size={16} /></button>
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
                        <FileText size={40} className="text-gray-300 dark:text-slate-600" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">No Reports Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginator */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {filteredReports.length} Results</p>
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
const ReportMetric = ({ label, count, percent }: { label: string, count: string, percent: number }) => (
   <div className="space-y-3">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-end gap-1">
         <p className="text-xl font-black text-gray-800 dark:text-white leading-none tracking-tight">{count}</p>
         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Reports</p>
      </div>
      <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
         <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-[9px] font-bold text-gray-400 uppercase italic">{percent}% of archive</p>
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

export default ReportsContainer;