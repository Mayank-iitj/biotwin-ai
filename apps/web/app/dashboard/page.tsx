'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Activity, Brain, Shield, TrendingUp, MessageCircle, Calendar, FileText, Settings, LogOut, Menu, X, Bell } from 'lucide-react'
import HumanBodyViewer, { HumanBodyViewerSkeleton } from '../components/HumanBodyViewer'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

function getRiskColor(band: 'low' | 'moderate' | 'high' | string) {
  switch (band.toLowerCase()) {
    case 'low': return 'text-risk-low bg-risk-low/10 border-risk-low/20'
    case 'moderate': return 'text-risk-moderate bg-risk-moderate/10 border-risk-moderate/20'
    case 'high': return 'text-risk-high bg-risk-high/10 border-risk-high/20'
    default: return 'text-white/50 bg-white/10 border-white/20'
  }
}

function getRiskIcon(disease: string) {
  switch(disease.toLowerCase()) {
    case 'diabetes': return <Activity className="w-5 h-5" />
    case 'cvd': return <Heart className="w-5 h-5" />
    case 'hypertension': return <Activity className="w-5 h-5" />
    case 'ckd': return <Brain className="w-5 h-5" />
    case 'obesity': return <Activity className="w-5 h-5" />
    default: return <Activity className="w-5 h-5" />
  }
}

function getRiskTitle(disease: string) {
  switch(disease.toLowerCase()) {
    case 'cvd': return 'Cardiovascular'
    case 'ckd': return 'Kidney Disease'
    default: return disease.charAt(0).toUpperCase() + disease.slice(1)
  }
}

function getRiskDescription(disease: string) {
  switch(disease.toLowerCase()) {
    case 'diabetes': return 'Type 2 diabetes risk'
    case 'cvd': return 'Heart disease and stroke risk'
    case 'hypertension': return 'High blood pressure risk'
    case 'ckd': return 'Chronic kidney disease risk'
    case 'obesity': return 'Obesity risk based on lifestyle'
    default: return 'Risk assessment'
  }
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null)
  
  const { token, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      if (!token) return
      try {
        const data = await api.getDashboardSummary(token)
        setDashboardData(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [token])

  const handleOrganClick = (organ: any) => {
    setSelectedOrgan(organ.id)
  }

  // Convert risk summaries to the object format expected by HumanBodyViewer
  const riskDataMap = dashboardData?.risk_summaries.reduce((acc: any, curr: any) => {
    acc[curr.disease] = curr.risk_score
    return acc
  }, {}) || {}

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950/50 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="flex items-center gap-2 p-6 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-biotech-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">BioTwin</span>
        </div>

        <nav className="p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-500/20 text-primary-400">
            <Activity className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/twin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            <Heart className="w-5 h-5" />
            <span>My Twin</span>
          </Link>
          <Link href="/simulator" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            <TrendingUp className="w-5 h-5" />
            <span>Simulator</span>
          </Link>
          <Link href="/coach" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span>AI Coach</span>
          </Link>
          <Link href="/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            <FileText className="w-5 h-5" />
            <span>Reports</span>
          </Link>
          <Link href="/calendar" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            <Calendar className="w-5 h-5" />
            <span>Calendar</span>
          </Link>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors w-full">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 glass-card border-x-0 border-t-0 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 text-white"
              >
                {sidebarOpen ? <X /> : <Menu />}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Health Dashboard</h1>
                <p className="text-white/60 text-sm">Your Digital Twin at a glance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5">
                <Bell className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-biotech-500 flex items-center justify-center text-white font-bold">
                U
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {loading ? (
             <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
             </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-risk-high/10 border border-risk-high/20 text-risk-high">
              {error}
            </div>
          ) : (
            <>
              {/* 3D Twin + Risk Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* 3D Human Body Viewer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-1"
                >
                  <div className="glass-card p-4 h-full">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary-400" />
                      Your Digital Twin
                    </h2>
                    <HumanBodyViewer
                      riskData={riskDataMap}
                      onOrganClick={handleOrganClick}
                    />
                  </div>
                </motion.div>

                {/* Risk Assessment Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {dashboardData?.risk_summaries?.length > 0 ? dashboardData.risk_summaries.map((card: any, index: number) => (
                    <motion.div
                      key={card.disease}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className={`glass-card p-5 border ${getRiskColor(card.risk_band)}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={getRiskColor(card.risk_band).split(' ')[0]}>
                            {getRiskIcon(card.disease)}
                          </span>
                          <span className="font-medium text-white">{getRiskTitle(card.disease)}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(card.risk_band)}`}>
                          {card.risk_band.toUpperCase()}
                        </span>
                      </div>
                      <div className="mb-3">
                        <div className="text-3xl font-bold text-white">{(card.risk_score * 100).toFixed(0)}%</div>
                        <p className="text-white/50 text-sm">Risk Score</p>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${card.risk_score * 100}%` }}
                          transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                          className={`h-full rounded-full ${card.risk_band === 'low' ? 'bg-risk-low' : card.risk_band === 'moderate' ? 'bg-risk-moderate' : 'bg-risk-high'}`}
                        />
                      </div>
                      <p className="text-white/40 text-xs mt-3">{getRiskDescription(card.disease)}</p>
                    </motion.div>
                  )) : (
                    <div className="col-span-full glass-card p-8 flex flex-col items-center justify-center text-center">
                      <Activity className="w-12 h-12 text-white/20 mb-4" />
                      <h3 className="text-white font-medium mb-2">No Risk Data Available</h3>
                      <p className="text-white/50">Upload a blood report to generate your digital twin insights.</p>
                      <Link href="/reports" className="mt-4 btn-primary py-2 px-6">Upload Report</Link>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <Link href="/simulator" className="glass-card p-5 hover:border-primary-500/30 transition-colors cursor-pointer group">
                  <TrendingUp className="w-8 h-8 text-primary-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-white mb-1">What-If Simulator</h3>
                  <p className="text-white/50 text-sm">See how lifestyle changes affect your health</p>
                </Link>

                <Link href="/coach" className="glass-card p-5 hover:border-primary-500/30 transition-colors cursor-pointer group">
                  <MessageCircle className="w-8 h-8 text-biotech-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-white mb-1">AI Health Coach</h3>
                  <p className="text-white/50 text-sm">Chat with your personal health assistant</p>
                </Link>

                <Link href="/reports" className="glass-card p-5 hover:border-primary-500/30 transition-colors cursor-pointer group">
                  <FileText className="w-8 h-8 text-risk-moderate mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-white mb-1">Blood Reports</h3>
                  <p className="text-white/50 text-sm">Upload and analyze blood work results</p>
                </Link>

                <Link href="/calendar" className="glass-card p-5 hover:border-primary-500/30 transition-colors cursor-pointer group">
                  <Calendar className="w-8 h-8 text-risk-high mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-white mb-1">Health Calendar</h3>
                  <p className="text-white/50 text-sm">Track appointments and reminders</p>
                </Link>
              </motion.div>
            </>
          )}

          {/* Disclaimer Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 p-4 rounded-xl bg-warning/10 border border-warning/20"
          >
            <p className="text-warning text-sm">
              ⚠️ <strong>Disclaimer:</strong> BioTwin AI provides wellness risk estimates based on the data you provide. It is not a diagnostic tool and does not replace professional medical evaluation. Always consult a licensed healthcare provider for diagnosis, treatment, or any urgent symptoms.
            </p>
          </motion.div>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}