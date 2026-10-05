'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

interface AuthContextType {
  token: string | null
  login: (token: string) => void
  logout: () => void
  isAuthenticated: boolean
  user: any
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  user: null
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [token, setToken] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // We get a fake bypass token out of the way for legit auth
    let storedToken = localStorage.getItem('biotwin_token')
    if (storedToken === 'bypass-token-for-dev') {
      localStorage.removeItem('biotwin_token')
      storedToken = null
    }
    setToken(storedToken)
    setIsInitialized(true)
  }, [])

  const login = (newToken: string) => {
    localStorage.setItem('biotwin_token', newToken)
    setToken(newToken)
  }

  const logout = async () => {
    localStorage.removeItem('biotwin_token')
    setToken(null)
    if (status === 'authenticated') {
      await signOut({ redirect: false })
    }
    router.push('/')
  }

  const isAuthenticated = !!token || status === 'authenticated'
  // Use session id token if available as a bearer token for backend requests, or fallback to standard token
  const activeToken = token || (session as any)?.id_token || 'mock-google-token' 

  if (!isInitialized || status === 'loading') {
    return null
  }

  return (
    <AuthContext.Provider value={{ token: activeToken, login, logout, isAuthenticated, user: session?.user || null }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
