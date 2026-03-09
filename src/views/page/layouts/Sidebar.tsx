import React, { useState, type JSX } from "react";
import { useLocation, Link } from "react-router-dom"; 
import { 
  FileText, LayoutDashboard, Settings, Shovel, Sprout, Wallet, Wheat, X, 
  ChevronLeft, ChevronRight, ChevronDown, ShieldCheck, UserCircle,
  Waves, Tractor, Box, ClipboardList, Map, Contact,
  Key, MapPin 
} from "lucide-react"; 

// --- TOOLTIP COMPONENT ---
const Tooltip = ({ children, text, isCollapsed }: { children: React.ReactNode; text: string; isCollapsed: boolean }) => {
  if (!isCollapsed) return <>{children}</>; // Dili ipakita kung dako ang sidebar

  return (
    <div className="group relative flex items-center">
      {children}
      {/* Tooltip Box */}
      <div className="fixed left-full ml-3 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-md 
                      opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none 
                      whitespace-nowrap z-50 shadow-xl border border-slate-700">
        {text}
        {/* Tooltip Arrow */}
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
      </div>
    </div>
  );
};

interface SidebarProps {
  isOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

interface SubMenuItem {
  name: string;
  icon: JSX.Element;
  path: string;
  permission: string; 
}

interface MenuItem {
  name: string;
  icon: JSX.Element;
  path?: string;
  subItems?: SubMenuItem[];
  permission?: string; 
}

interface MenuGroup {
  label: string;
  menus: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  { 
    label: "OVERVIEW", 
    menus: [
      { 
        name: "Dashboard", 
        icon: <LayoutDashboard size={20} />, 
        path: "/page/page-dashboard",
        permission: "Dashboard: View Overview Analytics" 
      }
    ] 
  },
  { 
    label: "REGISTRIES", 
    menus: [
      { 
        name: "Farmer Registry", 
        icon: <Contact size={20} />, 
        path: "/page/farmer-management", 
        permission: "Farmer Registry: Manage Registered Farmers" 
      },
      { 
        name: "Fisherfolk Registry", 
        icon: <Waves size={20} />, 
        path: "/page/fisherfolk-management", 
        permission: "Farmer Registry: Manage Registered Farmers" 
      },
      { 
        name: "Cooperatives", 
        icon: <Map size={16} />, 
        path: "/page/cooperatives-management", 
        permission: "Farmer Registry: Manage Cooperatives" 
      }
    ]
  },
  { 
    label: "LOCATIONS", 
    menus: [
      { name: "Barangay Profile", icon: <MapPin size={20} />, path: "/page/barangaylist-management", permission: "Locations: Manage Barangay List" },
      { name: "Cluster", icon: <MapPin size={20} />, path: "/page/cluster-management", permission: "Locations: Manage Clusters" }
    ] 
  },
  { 
    label: "SECTOR OPERATIONS", 
    menus: [
      { 
        name: "Crop Agriculture", 
        icon: <Sprout size={20} />, 
        subItems: [
          { name: "Crops", icon: <Wheat size={16} />, path: "/page/crop-management", permission: "Production: Manage Crops" },
          { name: "Planting Logs", icon: <Shovel size={16} />, path: "/page/planting-management", permission: "Production: Manage Planting Logs" },
          { name: "Harvest Records", icon: <ClipboardList size={16} />, path: "/page/harvest-management", permission: "Production: Manage Harvest Records" },
        ]
      },
      { 
        name: "Fishery", 
        icon: <Waves size={20} />, 
        path: "/page/fisheries-management", 
        permission: "Fishery: Manage Fisheries" 
      },
    ]
  },
  { 
    label: "MANAGEMENT", 
    menus: [
      { 
        name: "Resources", 
        icon: <Box size={20} />, 
        subItems: [
          { name: "Inventory", icon: <Box size={16} />, path: "/page/inventory-management", permission: "Resources: Manage Inventory" },
          { name: "Equipments", icon: <Tractor size={16} />, path: "/page/equipments-management", permission: "Resources: Manage Equipments" },
          { name: "Land Mapping", icon: <Map size={16} />, path: "/page/landmapping-management", permission: "Resources: Manage Land Mapping" },
        ]
      },
      { 
        name: "Finance", 
        icon: <Wallet size={20} />, 
        subItems: [
          { name: "Expenses", icon: <Wallet size={16} />, path: "/page/expenses-management", permission: "Finance: Manage Expenses" },
          { name: "Reports", icon: <FileText size={16} />, path: "/page/reports-management", permission: "Finance: View Financial Reports" },
        ]
      }
    ]
  },
  { 
    label: "ADMINISTRATION", 
    menus: [
      { 
        name: "Access Control",
        icon: <ShieldCheck size={20} />, 
        subItems: [
          { name: "Role Management", icon: <Key size={16} />, path: "/page/role-management", permission: "Access Control: Manage Roles" },
          { name: "User Management", icon: <UserCircle size={16} />, path: "/page/user-management", permission: "Access Control: Manage Users" },
        ]
      },
      { name: "Audit Logs", icon: <ClipboardList size={20} />, path: "/page/audit-logs", permission: "Audit Logs: View System Audit Logs" },
      { name: "System Settings", icon: <Settings size={20} />, path: "/page/settings-management", permission: "System Settings: Configure Global Settings" },
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setSidebarOpen, isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [openSubMenus, setOpenSubMenus] = useState<string[]>([]);

  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userPermissions: string[] = userData.role?.permissions || [];
  const ispage = userData.role?.name === "pageistrator";

  const hasPermission = (perm: string) => ispage || userPermissions.includes(perm);

  const getVisibleMenus = (menus: MenuItem[]) => {
    return menus.filter(menu => {
      if (menu.subItems) {
        const visibleSubs = menu.subItems.filter(sub => hasPermission(sub.permission));
        return visibleSubs.length > 0;
      }
      return menu.permission ? hasPermission(menu.permission) : true;
    });
  };

  const toggleSubMenu = (name: string) => {
    setOpenSubMenus(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        ${isCollapsed ? 'w-20' : 'w-64'}`}>
        
        <div className="h-full flex flex-col relative">
          
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex absolute -right-3 top-10 w-6 h-6 bg-primary text-white rounded-full items-center justify-center shadow-lg hover:scale-110 transition-transform z-50 cursor-pointer">
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

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
            
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <X className="text-red-400" size={24} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {menuGroups.map((group, idx) => {
              const visibleMenus = getVisibleMenus(group.menus);
              if (visibleMenus.length === 0) return null;

              return (
                <div key={idx}>
                  {!isCollapsed ? (
                    <h3 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{group.label}</h3>
                  ) : (
                    <div className="h-px bg-gray-100 dark:bg-slate-800 mb-4 mx-2" />
                  )}
                  
                  <ul className="space-y-1">
                    {visibleMenus.map((menu, i) => {
                      const hasSubItems = !!menu.subItems;
                      const isSubOpen = openSubMenus.includes(menu.name);
                      const isActive = currentPath === menu.path || (menu.subItems && menu.subItems.some(s => s.path === currentPath));

                      return (
                        <li key={i} className="relative group/menu">
                          {/* 🌟 TOOLTIP GIGAMIT DINHI 🌟 */}
                          <Tooltip text={menu.name} isCollapsed={isCollapsed}>
                            {hasSubItems ? (
                              <button 
                                onClick={() => !isCollapsed && toggleSubMenu(menu.name)} 
                                className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all cursor-pointer 
                                  ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} 
                                  ${isActive ? 'bg-primary/5 text-primary' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}
                              >
                                <span className={isActive ? 'text-primary' : 'text-gray-400'}>{menu.icon}</span>
                                {!isCollapsed && (
                                  <>
                                    <span className="flex-1 text-left truncate">{menu.name}</span>
                                    <ChevronDown size={16} className={`transition-transform ${isSubOpen ? 'rotate-180' : ''}`} />
                                  </>
                                )}
                              </button>
                            ) : (
                              <Link 
                                to={menu.path || "#"} 
                                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} 
                                className={`flex items-center rounded-xl text-sm font-semibold transition-all 
                                  ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} 
                                  ${currentPath === menu.path ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary'}`}
                              >
                                <span className={currentPath === menu.path ? 'text-white' : 'text-gray-400'}>{menu.icon}</span>
                                {!isCollapsed && <span className="truncate">{menu.name}</span>}
                              </Link>
                            )}
                          </Tooltip>

                          {/* Submenu logic - only shows if not collapsed */}
                          {!isCollapsed && hasSubItems && isSubOpen && (
                            <ul className="mt-1 ml-4 pl-4 border-l-2 border-gray-100 dark:border-slate-800 space-y-1 animate-in slide-in-from-top-2 duration-200">
                              {menu.subItems?.filter(sub => hasPermission(sub.permission)).map((sub, sIdx) => (
                                <li key={sIdx}>
                                  <Link to={sub.path} onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] ${currentPath === sub.path ? 'text-primary font-black bg-primary/5 shadow-sm' : 'text-gray-500 hover:text-primary hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}>
                                    <span className={currentPath === sub.path ? 'text-primary' : 'text-gray-400'}>{sub.icon}</span> 
                                    {sub.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;