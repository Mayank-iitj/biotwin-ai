'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  token: string | null
  login: (token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>('bypass-token-for-dev')
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check local storage on mount
    let storedToken = localStorage.getItem('biotwin_token')
    if (!storedToken) {
      storedToken = 'bypass-token-for-dev'
      localStorage.setItem('biotwin_token', storedToken)
    }
    setToken(storedToken)
    setIsInitialized(true)
  }, [])

  const login = (newToken: string) => {
    localStorage.setItem('biotwin_token', newToken)
    setToken(newToken)
  }

  const logout = () => {
    // Since sign-in is removed, logout redirects back to dashboard/home
    router.push('/dashboard')
  }

  // Prevent flashing unauthenticated content if token check hasn't run
  if (!isInitialized) {
    return null
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
