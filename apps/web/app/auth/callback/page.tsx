'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    // Check if error
    const urlError = searchParams.get('error')
    if (urlError) {
      setError(urlError)
      setTimeout(() => router.push('/login'), 3000)
      return
    }

    if (accessToken) {
      // In a real app, you might also store the refresh token
      // For now, our auth context only expects the access token
      login(accessToken)
      
      // Redirect to dashboard
      router.push('/dashboard')
    } else {
      setError('No token received from authentication provider.')
      setTimeout(() => router.push('/login'), 3000)
    }
  }, [searchParams, login, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        {error ? (
          <>
            <div className="h-12 w-12 text-red-500">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Authentication Failed</h2>
            <p className="text-zinc-400">{error}</p>
            <p className="text-sm text-zinc-500">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-500"></div>
            <h2 className="text-xl font-semibold text-white">Authenticating...</h2>
            <p className="text-zinc-400">Please wait while we complete your login.</p>
          </>
        )}
      </div>
    </div>
  )
}
