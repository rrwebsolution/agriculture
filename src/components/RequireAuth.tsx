import { type JSX } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getManagePermission, getPermissionForPath, getUserPermissions } from '../lib/permissions'

interface Props {
  children: JSX.Element
}

export default function RequireAuth({ children }: Props) {
  const token = localStorage.getItem('auth_token')
  const location = useLocation()

  if (!token) {
    return <Navigate to="/user-login" replace />
  }

  const required = getPermissionForPath(location.pathname)
  const managePermission = getManagePermission(required)
  if (required) {
    const { isAdmin, permissions: userPermissions } = getUserPermissions()
    const canAccess = userPermissions.includes(required) || (!!managePermission && userPermissions.includes(managePermission))

    if (!isAdmin && !canAccess) {
      return <Navigate to="/pageNotAvailable" replace />
    }
  }

  return children
}
