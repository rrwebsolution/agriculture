import { useState } from 'react';
import { 
  ClipboardList, Search, History, 
  Clock, ShieldAlert, Database, 
  Terminal, Trash2, Edit3, PlusCircle, LogIn,
  Filter, Info
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';

// --- MOCK DATA ---
const INITIAL_LOGS = [
  { id: 1, user: "Admin Sarah", action: "Deleted", module: "User Management", details: "Deleted user 'Farmer_John22'", timestamp: "Feb 24, 2026 • 10:45 AM", status: "Critical", ip: "192.168.1.12" },
  { id: 2, user: "Encoder Dave", action: "Created", module: "Planting Logs", details: "Added new Rice planting for Cluster 3", timestamp: "Feb 24, 2026 • 09:12 AM", status: "Success", ip: "192.168.1.45" },
  { id: 3, user: "Supervisor Mark", action: "Updated", module: "Fisheries", details: "Modified boat permit for MB-Gingoog-1", timestamp: "Feb 23, 2026 • 04:30 PM", status: "Success", ip: "10.0.0.8" },
  { id: 4, user: "System", action: "Login", module: "Security", details: "Failed login attempt detected", timestamp: "Feb 23, 2026 • 02:15 PM", status: "Warning", ip: "45.12.88.3" },
  { id: 5, user: "Admin Sarah", action: "Updated", module: "Role Management", details: "Changed permissions for 'Field Officer'", timestamp: "Feb 23, 2026 • 11:00 AM", status: "Success", ip: "192.168.1.12" },
];

const actionOptions = ["All Actions", "Created", "Updated", "Deleted", "Login"];

function AuditLogsContainer() {
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState("All Actions");
  const [logs] = useState(INITIAL_LOGS);

  // Filter Logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(search.toLowerCase()) || 
                          log.details.toLowerCase().includes(search.toLowerCase()) ||
                          log.module.toLowerCase().includes(search.toLowerCase());
    
    const matchesAction = selectedAction === "All Actions" || log.action === selectedAction;
    
    return matchesSearch && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Deleted': return <Trash2 size={14} />;
      case 'Updated': return <Edit3 size={14} />;
      case 'Created': return <PlusCircle size={14} />;
      case 'Login': return <LogIn size={14} />;
      default: return <Terminal size={14} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary dark:text-green-400 uppercase tracking-[0.3em]">Security Audit</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Audit <span className="text-primary italic">Logs</span>
          </h2>
        </div>
        <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-800 text-gray-600 dark:text-slate-300 px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-sm active:scale-95">
          <History size={18} /> Export History
        </button>
      </div>

      {/* --- SUMMARY METRICS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<ClipboardList />} title="Total Activities" value="8,240" color="text-primary" bgColor="bg-primary/10" />
        <MetricCard icon={<Trash2 />} title="Critical Actions" value="12" color="text-red-500" bgColor="bg-red-500/10" />
        <MetricCard icon={<ShieldAlert />} title="Failed Logins" value="5" color="text-amber-500" bgColor="bg-amber-500/10" />
        <MetricCard icon={<History />} title="Active Sessions" value="42" color="text-blue-500" bgColor="bg-blue-500/10" />
      </div>

      {/* --- CONTROLS --- */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Logs or Details..."
            className="w-full pl-12 pr-4 py-4 h-13 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="relative shrink-0 w-full sm:w-60">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
          <Select value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:outline-none transition-all shadow-sm cursor-pointer">
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl p-1 z-50">
              {actionOptions.map((opt) => (
                <SelectItem key={opt} value={opt} className="text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer py-3 px-4 rounded-xl focus:bg-primary/10 focus:text-primary transition-colors outline-none">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- AUDIT TABLE --- */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-250">
            <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">User Info</th>
                <th className="px-8 py-5 text-center">Action</th>
                <th className="px-8 py-5">Module / Detail</th>
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    
                    {/* USER INFO */}
                    <td className="px-8 py-6 align-top">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black shadow-sm ${
                            log.user === 'System' ? 'bg-slate-500' : 'bg-primary'
                        }`}>
                          {log.user.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight">{log.user}</p>
                          <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase italic">{log.ip}</p>
                        </div>
                      </div>
                    </td>

                    {/* ACTION TYPE */}
                    <td className="px-8 py-6 text-center align-top pt-8">
                       <div className="flex flex-col items-center gap-1">
                          <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase rounded-md border ${
                             log.action === 'Deleted' ? 'bg-red-50 text-red-600 border-red-100' :
                             log.action === 'Updated' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                             'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                             {getActionIcon(log.action)}
                             {log.action}
                          </span>
                       </div>
                    </td>

                    {/* MODULE & DETAILS */}
                    <td className="px-8 py-6 align-top pt-8">
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase">
                            <Database size={12} />
                            <span>{log.module}</span>
                          </div>
                          <p className="text-xs font-bold text-gray-500 dark:text-slate-400 max-w-xs truncate">
                            {log.details}
                          </p>
                       </div>
                    </td>

                    {/* TIMESTAMP */}
                    <td className="px-8 py-6 align-top pt-8">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        <Clock size={12} className="text-primary/70" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-8 py-6 text-right align-top pt-6">
                       <button title="Full Info" className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                          <Info size={16} />
                       </button>
                    </td>

                  </tr>
                ))
              ) : (
                /* EMPTY STATE */
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-full border border-gray-100 dark:border-slate-800">
                        <History size={40} className="text-gray-300 dark:text-slate-600" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">No Logs Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginator */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {filteredLogs.length} Results</p>
            <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all">Prev</button>
                <button className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all">Next</button>
            </div>
        </div>
      </div>

    </div>
  );
}

const MetricCard = ({ icon, title, value, color, bgColor }: { icon: any, title: string, value: string, color: string, bgColor: string }) => (
  <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
    <div className={`p-4 rounded-2xl ${bgColor} ${color}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none">{value}</h3>
    </div>
  </div>
);

export default AuditLogsContainer;