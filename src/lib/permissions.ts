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

export function getUserPermissions() {
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  return {
    isAdmin: userData.role?.name === 'Administrator' || userData.role?.name === 'pageistrator',
    permissions: (userData.role?.permissions || []) as string[],
  };
}

export function getManagePermission(viewPermission?: string) {
  if (!viewPermission) return undefined;
  const [category, action] = viewPermission.split(': ');
  if (!category || !action || !action.startsWith('View ')) return undefined;
  return `${category}: Manage ${action.replace(/^View\s+/, '')}`;
}

export function hasPermission(permission?: string) {
  const { isAdmin, permissions } = getUserPermissions();
  if (!permission) return true;
  return isAdmin || permissions.includes(permission);
}

export function getPageAccess(pathname: string) {
  const viewPermission = getPermissionForPath(pathname);
  const managePermission = getManagePermission(viewPermission);

  return {
    viewPermission,
    managePermission,
    canView: hasPermission(viewPermission),
    canManage: managePermission ? hasPermission(managePermission) : false,
  };
}
