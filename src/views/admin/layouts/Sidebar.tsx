import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom"; 
import { FileText, LayoutDashboard, Settings, Shovel, Sprout, Users, Wallet, Wheat, X, ChevronLeft, ChevronRight, ChevronDown, ShieldCheck, UserCircle } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

const menuGroups = [
  { title: "MAIN", items: [{ name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin/admin-dashboard" }] },
  { title: "FARM MANAGEMENT", items: [
    { name: "Crops", icon: <Sprout size={20} />, path: "/crops" },
    { name: "Planting", icon: <Shovel size={20} />, path: "/planting" },
    { name: "Harvest", icon: <Wheat size={20} />, path: "/harvest" },
  ]},
  { title: "FINANCE", items: [
    { name: "Expenses", icon: <Wallet size={20} />, path: "/expenses" },
    { name: "Reports", icon: <FileText size={20} />, path: "/reports" },
  ]},
  { title: "SYSTEM", items: [
    { name: "Access Control", icon: <Users size={20} />, subItems: [
      { name: "Role Management", icon: <ShieldCheck size={18} />, path: "/admin/role-management" },
      { name: "User Management", icon: <UserCircle size={18} />, path: "/admin/user-management" },
    ]},
    { name: "Settings", icon: <Settings size={20} />, path: "/settings" },
  ]}
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setSidebarOpen, isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [openSubMenus, setOpenSubMenus] = useState<string[]>([]);

  const toggleSubMenu = (name: string) => {
    setOpenSubMenus(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div className={`fixed inset-0 bg-black/50 z-55 transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`fixed inset-y-0 left-0 z-60 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        ${isCollapsed ? 'w-20' : 'w-64'}`}>
        
        <div className="h-full flex flex-col relative">
          {/* Desktop Toggle Button */}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex absolute -right-3 top-10 w-6 h-6 bg-primary text-white rounded-full items-center justify-center shadow-lg hover:scale-110 transition-transform z-10">
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <div className={`flex items-center gap-3 ${isCollapsed ? 'mx-auto' : ''}`}>
              <div className="bg-primary p-2 rounded-lg shrink-0 text-white"><Sprout size={24} /></div>
              {!isCollapsed && (
                <div className="animate-in fade-in duration-300">
                  <h1 className="text-lg font-black text-primary dark:text-white leading-none">AgriCulture</h1>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">LGU Gingoog</p>
                </div>
              )}
            </div>
            {isOpen && <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500"><X size={24} /></button>}
          </div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {menuGroups.map((group, idx) => (
              <div key={idx}>
                {!isCollapsed ? (
                  <h3 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{group.title}</h3>
                ) : (
                  <div className="h-px bg-gray-100 dark:bg-slate-800 mb-4 mx-2" />
                )}
                <ul className="space-y-1">
                  {group.items.map((item, i) => {
                    const hasSubItems = !!item.subItems;
                    const isSubOpen = openSubMenus.includes(item.name);
                    const isActive = currentPath === item.path || item.subItems?.some(s => s.path === currentPath);

                    return (
                      <li key={i} className="relative group">
                        {hasSubItems ? (
                          <>
                            <button onClick={() => !isCollapsed && toggleSubMenu(item.name)} className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all cursor-pointer ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} ${isActive ? 'bg-primary/5 text-primary' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}>
                              <span className={isActive ? 'text-primary' : 'text-gray-400'}>{item.icon}</span>
                              {!isCollapsed && (
                                <>
                                  <span className="flex-1 text-left truncate">{item.name}</span>
                                  <ChevronDown size={16} className={`transition-transform ${isSubOpen ? 'rotate-180' : ''}`} />
                                </>
                              )}
                            </button>
                            {!isCollapsed && isSubOpen && (
                              <ul className="mt-1 ml-4 pl-4 border-l-2 border-gray-100 dark:border-slate-800 space-y-1">
                                {item.subItems?.map((sub, sIdx) => (
                                  <li key={sIdx}>
                                    <Link to={sub.path} onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs ${currentPath === sub.path ? 'text-primary font-bold bg-primary/5' : 'text-gray-500 hover:text-primary'}`}>
                                      {sub.icon} {sub.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </>
                        ) : (
                          <Link to={item.path || "#"} onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} className={`flex items-center rounded-xl text-sm font-semibold transition-all ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} ${currentPath === item.path ? 'bg-primary text-white shadow-lg' : 'text-gray-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary'}`}>
                            <span className={currentPath === item.path ? 'text-white' : 'text-gray-400'}>{item.icon}</span>
                            {!isCollapsed && <span className="truncate">{item.name}</span>}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;