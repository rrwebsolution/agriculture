export const pathPermissionMap: Record<string, string> = {
  '/page/page-dashboard': 'Dashboard: View Overview Analytics',
  
  // Registries
  '/page/farmer-management': 'Farmer Registry: Manage Registered Farmers',
  '/page/fisherfolk-management': 'Farmer Registry: Manage Fisherfolk Registry',
  '/page/cooperatives-management': 'Farmer Registry: Manage Cooperatives',
  
  // Locations
  '/page/barangaylist-management': 'Locations: Manage Barangay List',
  '/page/cluster-management': 'Locations: Manage Clusters',
  
  // Production
  '/page/crop-management': 'Production: Manage Crops',
  '/page/planting-management': 'Production: Manage Planting Logs',
  '/page/harvest-management': 'Production: Manage Harvest Records',
  
  // Fishery
  '/page/fisheries-management': 'Fishery: Manage Fisheries',
  
  // Resources
  '/page/inventory-management': 'Resources: Manage Inventory',
  '/page/equipments-management': 'Resources: Manage Equipments',
  '/page/landmapping-management': 'Resources: Manage Land Mapping',
  
  // Finance
  '/page/expenses-management': 'Finance: Manage Expenses',
  '/page/reports-management': 'Finance: View Financial Reports',
  
  // Admin
  '/page/role-management': 'Access Control: Manage Roles',
  '/page/user-management': 'Access Control: Manage Users',
  '/page/audit-logs': 'Audit Logs: View System Audit Logs',
  '/page/settings-management': 'System Settings: Configure Global Settings'
};

export function getPermissionForPath(pathname: string) {
  // exact match first
  if (pathPermissionMap[pathname]) return pathPermissionMap[pathname];

  // normalize trailing slashes
  const normalized = pathname.replace(/\/$/, '');
  return pathPermissionMap[normalized];
}