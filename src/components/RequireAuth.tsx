import { type JSX } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getPermissionForPath } from '../lib/permissions'

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
  if (required) {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
    const userPermissions: string[] = userData.role?.permissions || []
    const isAdmin = userData.role?.name === 'Administrator'

    if (!isAdmin && !userPermissions.includes(required)) {
      return <Navigate to="/pageNotAvailable" replace />
    }
  }

  return children
}
