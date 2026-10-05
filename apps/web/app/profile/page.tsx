'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, User, Mail, Activity, LogOut, Heart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace('/login')
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center shadow-sm">
          <Link href="/dashboard" className="p-2 mr-4 text-white/70 hover:text-white bg-white/5 rounded-lg transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Your Profile</h1>
        </header>

        <div className="p-6 max-w-4xl mx-auto space-y-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 border border-white/10 relative overflow-hidden flex flex-col md:flex-row items-center gap-8"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -z-10"></div>
            
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-biotech-500 flex items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] ring-4 ring-white/10 overflow-hidden text-5xl">
              {user?.image ? (
                <img src={user.image} alt={user?.name || 'User'} className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">{user?.name || 'BioTwin User'}</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-white/60 mb-4">
                <Mail className="w-4 h-4" />
                <span>{user?.email || 'No email provided'}</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-risk-low/20 text-risk-low text-xs font-bold rounded-full border border-risk-low/30">
                <Shield className="w-3 h-3" />
                Verified Google Account
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 border border-white/10"
            >
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-primary-400" />
                Account Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1">Display Name</label>
                  <input type="text" disabled value={user?.name || ''} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white/50 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">Email Address</label>
                  <input type="email" disabled value={user?.email || ''} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white/50 cursor-not-allowed" />
                </div>
                <div className="pt-4">
                  <button onClick={logout} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-medium transition-all">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 border border-white/10 flex flex-col"
            >
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Heart className="w-5 h-5 text-risk-low" />
                Digital Twin Sync
              </h3>
              
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/20 rounded-xl bg-white/[0.02]">
                <Shield className="w-12 h-12 text-primary-500/50 mb-4" />
                <h4 className="font-semibold text-white mb-2">Connected Devices</h4>
                <p className="text-white/50 text-sm mb-6 max-w-[200px]">Apple Health and Fitbit are currently synchronized.</p>
                <Link href="/settings" className="btn-primary py-2 px-6 rounded-lg text-sm font-medium">
                  Manage Integrations
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
