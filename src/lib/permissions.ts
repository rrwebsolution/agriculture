export const EMPLOYEE_LOG_DETAILS_PERMISSION = 'Administration: View Employee Log Details';
export const VIEW_EMPLOYEE_LOGS_PERMISSION = 'Administration: View Employee Logs';
export const MANAGE_EMPLOYEE_LOGS_PERMISSION = 'Administration: Manage Employee Logs';

const PERMISSION_ALIASES: Record<string, string[]> = {
  [VIEW_EMPLOYEE_LOGS_PERMISSION]: ['Administration: View Technician Logs'],
  [MANAGE_EMPLOYEE_LOGS_PERMISSION]: ['Administration: Manage Technician Logs'],
  'Administration: View Technician Logs': [VIEW_EMPLOYEE_LOGS_PERMISSION],
  'Administration: Manage Technician Logs': [MANAGE_EMPLOYEE_LOGS_PERMISSION],
};

export function normalizePermissionLabel(permission?: string) {
  if (!permission) return permission;
  if (permission === 'Administration: View Technician Logs') return VIEW_EMPLOYEE_LOGS_PERMISSION;
  if (permission === 'Administration: Manage Technician Logs') return MANAGE_EMPLOYEE_LOGS_PERMISSION;
  return permission;
}

export function normalizePermissionsList(permissions: string[] = []) {
  return Array.from(new Set(permissions.map((permission) => normalizePermissionLabel(permission) || ''))).filter(Boolean);
}

export function permissionMatches(userPermissions: string[], requiredPermission?: string) {
  if (!requiredPermission) return true;

  const normalizedRequired = normalizePermissionLabel(requiredPermission);
  const normalizedPermissions = normalizePermissionsList(userPermissions);
  const aliases = PERMISSION_ALIASES[normalizedRequired || ''] || [];

  return normalizedPermissions.includes(normalizedRequired || '') || aliases.some((alias) => normalizedPermissions.includes(alias));
}

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

  // Administration
  '/page/employees-management': 'Administration: View Employees',
  '/page/technician-logs-management': VIEW_EMPLOYEE_LOGS_PERMISSION,
  
  // Admin
  '/page/role-management': 'Access Control: View Roles',
  '/page/user-management': 'Access Control: View Users',
  '/page/settings-management': 'System Settings: View Global Settings'
};

const ADMIN_ROLE_NAMES = ['Administrator', 'System Administrator', 'pageistrator'];

export function getPermissionForPath(pathname: string) {
  // exact match first
  if (pathPermissionMap[pathname]) return pathPermissionMap[pathname];

  // normalize trailing slashes
  const normalized = pathname.replace(/\/$/, '');
  return pathPermissionMap[normalized];
}

export function isAdminRoleName(roleName?: string) {
  return ADMIN_ROLE_NAMES.includes(roleName || '');
}

export function getUserPermissions() {
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  return {
    isAdmin: isAdminRoleName(userData.role?.name),
    permissions: normalizePermissionsList((userData.role?.permissions || []) as string[]),
  };
}

export function getManagePermission(viewPermission?: string) {
  const normalizedViewPermission = normalizePermissionLabel(viewPermission);
  if (!normalizedViewPermission) return undefined;
  const [category, action] = normalizedViewPermission.split(': ');
  if (!category || !action || !action.startsWith('View ')) return undefined;
  return `${category}: Manage ${action.replace(/^View\s+/, '')}`;
}

export function hasPermission(permission?: string) {
  const { isAdmin, permissions } = getUserPermissions();
  if (!permission) return true;
  return isAdmin || permissionMatches(permissions, permission);
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
