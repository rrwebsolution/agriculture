import { type JSX } from 'react'
import { Navigate } from 'react-router-dom'

interface Props {
  children: JSX.Element
}

export default function GuestOnly({ children }: Props) {
  const token = localStorage.getItem('auth_token')

  if (token) {
    return <Navigate to="/page" replace />
  }

  return children
}
