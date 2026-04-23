import React, { useState, type JSX } from "react";
import { useLocation, Link } from "react-router-dom"; 
import { 
  FileText, LayoutDashboard, Shovel, Sprout, Wallet, Wheat, X,
  ChevronLeft, ChevronRight, ChevronDown, ShieldCheck, UserCircle,
  Waves, Tractor, Box, ClipboardList, Map, Contact, BriefcaseBusiness,
  Key, MapPin 
} from "lucide-react"; 
import { cn } from "../../../lib/utils"; 
import { isAdminRoleName } from "../../../lib/permissions";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../../../components/ui/tooltip";

interface SidebarProps {
  isOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

interface SubMenuItem { name: string; icon: JSX.Element; path: string; permission: string; }
interface MenuItem { name: string; icon: JSX.Element; path?: string; subItems?: SubMenuItem[]; permission?: string; }
interface MenuGroup { label: string; menus: MenuItem[]; }

const menuGroups: MenuGroup[] = [
  { 
    label: "OVERVIEW", 
    menus: [
      { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/page/page-dashboard", permission: "Dashboard: View Overview Analytics" }
    ] 
  },
  { 
    label: "REGISTRIES", 
    menus: [
      { name: "Farmer Registry", icon: <Contact size={20} />, path: "/page/farmer-management", permission: "Farmer Registry: View Registered Farmers" },
      { name: "Fisherfolk Registry", icon: <Waves size={20} />, path: "/page/fisherfolk-management", permission: "Fisherfolk Registry: View Registered Fisherfolks" },
      
      // 🌟 GIAYOS NGA LABEL PARA SA COOPERATIVES
      { name: "FFCA (Cooperatives)", icon: <Map size={20} />, path: "/page/cooperatives-management", permission: "Cooperatives: View Cooperatives" }
    ]
  },
  { 
    label: "LOCATIONS", 
    menus: [
      { name: "Barangay Profile", icon: <MapPin size={20} />, path: "/page/barangaylist-management", permission: "Locations: View Barangay List" },
      { name: "Cluster", icon: <MapPin size={20} />, path: "/page/cluster-management", permission: "Locations: View Clusters" }
    ] 
  },
  { 
    label: "SECTOR OPERATIONS", 
    menus: [
      { 
        name: "Crop Agriculture", 
        icon: <Sprout size={20} />, 
        subItems: [
          { name: "Crops", icon: <Wheat size={16} />, path: "/page/crop-management", permission: "Production: View Crops" },
          { name: "Planting Logs", icon: <Shovel size={16} />, path: "/page/planting-management", permission: "Production: View Planting Logs" },
          { name: "Harvest Records", icon: <ClipboardList size={16} />, path: "/page/harvest-management", permission: "Production: View Harvest Records" },
        ]
      },
      { name: "Fishery", icon: <Waves size={20} />, path: "/page/fisheries-management", permission: "Fishery: View Fisheries" },
    ]
  },
  { 
    label: "MANAGEMENT", 
    menus: [
      { 
        name: "Resources", 
        icon: <Box size={20} />, 
        subItems: [
          { name: "Inventory", icon: <Box size={16} />, path: "/page/inventory-management", permission: "Resources: View Inventory" },
          { name: "Equipments", icon: <Tractor size={16} />, path: "/page/equipments-management", permission: "Resources: View Equipments" },
        ]
      },
      { name: "Expense", icon: <Wallet size={20} />, path: "/page/expenses-management", permission: "Finance: View Expenses" },
      { name: "Reports", icon: <FileText size={20} />, path: "/page/reports-management", permission: "Finance: View Financial Reports" }
    ]
  },
  { 
    label: "EMPLOYEES", 
    menus: [
      { name: "Employee Information", icon: <BriefcaseBusiness size={20} />, path: "/page/employees-management", permission: "Administration: View Employees" },
      { name: "Employee Logs", icon: <ClipboardList size={20} />, path: "/page/technician-logs-management", permission: "Administration: View Technician Logs" }
    ]
  },
  { 
    label: "ADMINISTRATION", 
    menus: [
      { 
        name: "Access Control",
        icon: <ShieldCheck size={20} />, 
        subItems: [
          { name: "Role Management", icon: <Key size={16} />, path: "/page/role-management", permission: "Access Control: View Roles" },
          { name: "User Management", icon: <UserCircle size={16} />, path: "/page/user-management", permission: "Access Control: View Users" },
        ]
      },
    ]
  }
];

// 🌟 FIX: Gibuhatan og custom helper component para ma-handle ang hover tooltip kon isCollapsed kay true
const SidebarTooltip = ({ text, isCollapsed, children }: { text: string; isCollapsed: boolean; children: React.ReactNode }) => {
  if (!isCollapsed) return <>{children}</>;
  
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={15} className="font-bold text-[11px] tracking-wide uppercase shadow-lg border border-gray-100 dark:border-slate-800">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setSidebarOpen, isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const [openSubMenus, setOpenSubMenus] = useState<string[]>(() => {
    const activeGroups: string[] = [];
    menuGroups.forEach(group => {
      group.menus.forEach(menu => {
        if (menu.subItems?.some(sub => sub.path === currentPath)) {
          activeGroups.push(menu.name);
        }
      });
    });
    return activeGroups;
  });

  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userPermissions: string[] = userData.role?.permissions || [];
  const ispage = isAdminRoleName(userData.role?.name);

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
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-60 lg:hidden transition-all duration-300", 
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )} 
        onClick={() => setSidebarOpen(false)} 
      />

      <aside className={cn(
        "fixed inset-y-0 left-0 z-70 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 transform flex flex-col",
        isOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full lg:translate-x-0',
        isCollapsed ? 'w-20' : 'w-64'
      )}>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="hidden lg:flex absolute -right-3.5 top-8 w-7 h-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-400 hover:text-primary rounded-full items-center justify-center shadow-sm transition-all hover:scale-110 z-80"
        >
          {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
        </button>

        <div className="p-6 h-22 flex items-center justify-between shrink-0">
          <div className={cn("flex items-center gap-3 transition-all", isCollapsed && 'mx-auto')}>
            <div className="bg-linear-to-br from-primary to-primary/80 p-2.5 rounded-xl shadow-lg shadow-primary/20 text-white shrink-0">
              <Sprout size={22} />
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in duration-300 whitespace-nowrap">
                <h1 className="text-lg font-black text-gray-800 dark:text-white leading-none tracking-tight">AgriCulture</h1>
                <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] mt-1">LGU Gingoog</p>
              </div>
            )}
          </div>
          
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {menuGroups.map((group, idx) => {
            const visibleMenus = getVisibleMenus(group.menus);
            if (visibleMenus.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                
                {!isCollapsed ? (
                  <div className="flex items-center gap-3 px-4 mb-2">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{group.label}</h3>
                    <div className="h-px bg-gray-100 dark:bg-slate-800 flex-1" />
                  </div>
                ) : (
                  <div className="h-px bg-gray-100 dark:bg-slate-800 mb-4 mx-2" />
                )}
                
                <ul className="space-y-1.5">
                  {visibleMenus.map((menu, i) => {
                    const hasSubItems = !!menu.subItems;
                    const isSubOpen = openSubMenus.includes(menu.name);
                    const isActive = currentPath === menu.path || (menu.subItems && menu.subItems.some(s => s.path === currentPath));

                    return (
                      <li key={i} className="relative group/menu">
                        
                        {/* 🌟 GIGAMIT ANG CUSTOM SIDEBAR TOOLTIP */}
                        <SidebarTooltip text={menu.name} isCollapsed={isCollapsed}>
                          {hasSubItems ? (
                            <button 
                              onClick={() => !isCollapsed && toggleSubMenu(menu.name)} 
                              className={cn(
                                "w-full flex items-center rounded-xl text-[13px] font-bold transition-all outline-none",
                                isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3',
                                isActive 
                                  ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                                  : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-800 dark:hover:text-slate-200'
                              )}
                            >
                              <span className={cn("shrink-0 transition-colors", isActive ? 'text-primary' : 'text-gray-400 group-hover/menu:text-gray-600 dark:group-hover/menu:text-slate-300')}>{menu.icon}</span>
                              {!isCollapsed && (
                                <>
                                  <span className="flex-1 text-left truncate">{menu.name}</span>
                                  <ChevronDown size={14} className={cn("transition-transform duration-300 opacity-50", isSubOpen && 'rotate-180')} />
                                </>
                              )}
                            </button>
                          ) : (
                            <Link 
                              to={menu.path || "#"} 
                              onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} 
                              className={cn(
                                "w-full flex items-center rounded-xl text-[13px] font-bold transition-all outline-none",
                                isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3',
                                isActive 
                                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                  : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-800 dark:hover:text-slate-200'
                              )}
                            >
                              <span className={cn("shrink-0 transition-colors", isActive ? 'text-white' : 'text-gray-400 group-hover/menu:text-gray-600 dark:group-hover/menu:text-slate-300')}>{menu.icon}</span>
                              {!isCollapsed && <span className="truncate">{menu.name}</span>}
                            </Link>
                          )}
                        </SidebarTooltip>

                        {!isCollapsed && hasSubItems && isSubOpen && (
                          <ul className="mt-1.5 ml-6 relative space-y-1 before:absolute before:inset-y-2 before:-left-2.25 before:w-px before:bg-gray-200 dark:before:bg-slate-700 animate-in slide-in-from-top-2 duration-200">
                            {menu.subItems?.filter(sub => hasPermission(sub.permission)).map((sub, sIdx) => {
                              const isSubActive = currentPath === sub.path;
                              return (
                                <li key={sIdx} className="relative before:absolute before:w-3 before:h-px before:bg-gray-200 dark:before:bg-slate-700 before:top-1/2 before:-left-2.25 before:-translate-y-1/2">
                                  <Link 
                                    to={sub.path} 
                                    onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} 
                                    className={cn(
                                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ml-1",
                                      isSubActive 
                                        ? 'text-primary bg-primary/5' 
                                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                                    )}
                                  >
                                    <span className={cn("shrink-0", isSubActive ? 'text-primary' : 'text-gray-400')}>{sub.icon}</span> 
                                    {sub.name}
                                  </Link>
                                </li>
                              );
                            })}
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
      </aside>
    </>
  );
};

export default Sidebar;
