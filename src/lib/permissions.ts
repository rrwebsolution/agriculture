export const pathPermissionMap: Record<string, string> = {
  '/page/page-dashboard': 'Dashboard: View Overview Analytics',
  '/page/farmer-management': 'Farmer Registry: Manage Registered Farmers',
  '/page/cooperatives-management': 'Farmer Registry: Manage Cooperatives',
  '/page/crop-management': 'Production: Manage Crops',
  '/page/planting-management': 'Production: Manage Planting Logs',
  '/page/harvest-management': 'Production: Manage Harvest Records',
  '/page/fisheries-management': 'Livestock & Fish: Manage Fisheries',
  '/page/livestock-management': 'Livestock & Fish: Manage Livestock',
  '/page/poultry-management': 'Livestock & Fish: Manage Poultry',
  '/page/inventory-management': 'Resources: Manage Inventory',
  '/page/equipments-management': 'Resources: Manage Equipments',
  '/page/landmapping-management': 'Resources: Manage Land Mapping',
  '/page/expenses-management': 'Finance: Manage Expenses',
  '/page/reports-management': 'Finance: View Financial Reports',
  '/page/audit-logs': 'Audit Logs: View System Audit Logs',
  '/page/role-management': 'Access Control: Manage Roles',
  '/page/user-management': 'Access Control: Manage Users',
  '/page/settings-management': 'System Settings: Configure Global Settings',
  '/page/barangaylist-management': 'Locations: Manage Barangay List',
  '/page/clusters-management': 'Locations: Manage Clusters'
};

export function getPermissionForPath(pathname: string) {
  // exact match first
  if (pathPermissionMap[pathname]) return pathPermissionMap[pathname];

  // normalize trailing slashes
  const normalized = pathname.replace(/\/$/, '');
  return pathPermissionMap[normalized];
}
