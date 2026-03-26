export const pathPermissionMap: Record<string, string> = {
  '/page/page-dashboard': 'Dashboard: View Overview Analytics',
  
  // Registries
  '/page/farmer-management': 'Farmer Registry: View Registered Farmers',
  '/page/fisherfolk-management': 'Fisherfolk Registry: View Registered Fisherfolks',
  '/page/cooperatives-management': 'Cooperatives: View Cooperatives',
  
  // Locations
  '/page/barangaylist-management': 'Locations: View Barangay List',
  '/page/cluster-management': 'Locations: View Clusters',
  
  // Production
  '/page/crop-management': 'Production: View Crops',
  '/page/planting-management': 'Production: View Planting Logs',
  '/page/harvest-management': 'Production: View Harvest Records',
  
  // Fishery
  '/page/fisheries-management': 'Fishery: View Fisheries',
  
  // Resources
  '/page/inventory-management': 'Resources: View Inventory',
  '/page/equipments-management': 'Resources: View Equipments',
  
  // Finance
  '/page/expenses-management': 'Finance: View Expenses',
  '/page/reports-management': 'Finance: View Financial Reports',
  
  // Admin
  '/page/role-management': 'Access Control: View Roles',
  '/page/user-management': 'Access Control: View Users',
  '/page/settings-management': 'System Settings: View Global Settings'
};

export function getPermissionForPath(pathname: string) {
  // exact match first
  if (pathPermissionMap[pathname]) return pathPermissionMap[pathname];

  // normalize trailing slashes
  const normalized = pathname.replace(/\/$/, '');
  return pathPermissionMap[normalized];
}
