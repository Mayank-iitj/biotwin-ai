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
  const [token, setToken] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check local storage on mount
    const storedToken = localStorage.getItem('biotwin_token')
    if (storedToken) {
      setToken(storedToken)
    }
    setIsInitialized(true)
  }, [])

  const login = (newToken: string) => {
    localStorage.setItem('biotwin_token', newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('biotwin_token')
    setToken(null)
    router.push('/login')
  }

  // Prevent flashing unauthenticated content if token check hasn't run
  if (!isInitialized) {
    return null
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
