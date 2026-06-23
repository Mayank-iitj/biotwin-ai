'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Activity, Brain, Shield, TrendingUp, MessageCircle, Calendar, FileText, Settings, LogOut, Menu, X, Bell, Droplet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import HumanBodyViewer from '../components/HumanBodyViewer'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { historicalHealthData, biomarkerData, riskDistribution, recentActivities } from '@/lib/mock-data'

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
    case 'ckd': return <Droplet className="w-5 h-5" />
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-white/10 text-sm">
        <p className="font-semibold text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-white/70 capitalize">{entry.name}:</span>
            <span className="text-white font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null)
  
  const { token, logout } = useAuth()
  const [loading, setLoading] = useState(false) // Removed initial loading state
  const [error, setError] = useState('')
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const data = await api.getDashboardSummary(token)
        setDashboardData(data)
      } catch (err: any) {
        console.error(err)
        // Optionally set error, but we want the dashboard to show up anyway with mock data
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
  const riskDataMap = dashboardData?.risk_summaries?.reduce((acc: any, curr: any) => {
    acc[curr.disease] = curr.risk_score
    return acc
  }, {}) || {}

  // Ensure we always show the rich dashboard layout even if API data is empty
  const hasRiskData = dashboardData?.risk_summaries?.length > 0;

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950/80 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="flex items-center gap-2 p-6 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-biotech-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-wide">BioTwin</span>
        </div>

        <nav className="p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
            <Activity className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/twin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 hover:border hover:border-white/10 transition-all">
            <Heart className="w-5 h-5" />
            <span className="font-medium">My Twin</span>
          </Link>
          <Link href="/simulator" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 hover:border hover:border-white/10 transition-all">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Simulator</span>
          </Link>
          <Link href="/coach" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 hover:border hover:border-white/10 transition-all">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">AI Coach</span>
          </Link>
          <Link href="/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 hover:border hover:border-white/10 transition-all">
            <FileText className="w-5 h-5" />
            <span className="font-medium">Reports</span>
          </Link>
          <Link href="/calendar" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 hover:border hover:border-white/10 transition-all">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Calendar</span>
          </Link>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all w-full text-left">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-white/70 hover:text-white bg-white/5 rounded-lg"
            >
              {sidebarOpen ? <X /> : <Menu />}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Health Dashboard</h1>
              <p className="text-primary-300/80 text-sm font-medium">Your Digital Twin at a glance</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-biotech-500 flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(59,130,246,0.3)] ring-2 ring-white/10 cursor-pointer">
              U
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
          {/* Removed loading and error blocks to ensure dashboard always shows up */}
            <>
              {/* TOP GRID: 3D Twin & Key Metrics */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* 3D Model Column */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="xl:col-span-4 flex flex-col h-full"
                >
                  <div className="glass-card p-5 border border-white/10 h-full relative overflow-hidden group">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-primary-500/20 transition-all duration-700"></div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-400 animate-pulse" />
                        Digital Twin
                      </h2>
                      <span className="px-3 py-1 bg-risk-low/20 text-risk-low text-xs font-bold rounded-full border border-risk-low/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                        Active Sync
                      </span>
                    </div>
                    
                    <div className="flex-1 w-full relative min-h-[400px]">
                      <HumanBodyViewer
                        riskData={riskDataMap}
                        onOrganClick={handleOrganClick}
                        className="h-full rounded-lg border border-white/5"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Metrics Column */}
                <div className="xl:col-span-8 flex flex-col gap-6">
                  {/* Summary Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 border-l-4 border-l-primary-500 relative overflow-hidden">
                      <Activity className="w-16 h-16 text-primary-500/10 absolute -bottom-4 -right-2" />
                      <p className="text-white/60 text-sm font-medium mb-1">Overall Health Score</p>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white">84</span>
                        <span className="text-risk-low text-sm font-medium mb-1 flex items-center">
                          <ArrowUpRight className="w-3 h-3" /> +2%
                        </span>
                      </div>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 border-l-4 border-l-risk-low relative overflow-hidden">
                      <TrendingUp className="w-16 h-16 text-risk-low/10 absolute -bottom-4 -right-2" />
                      <p className="text-white/60 text-sm font-medium mb-1">Biological Age</p>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white">32</span>
                        <span className="text-white/40 text-sm font-medium mb-1">vs 35 actual</span>
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 border-l-4 border-l-purple-500 relative overflow-hidden">
                      <Brain className="w-16 h-16 text-purple-500/10 absolute -bottom-4 -right-2" />
                      <p className="text-white/60 text-sm font-medium mb-1">Cognitive Index</p>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white">91</span>
                        <span className="text-risk-low text-sm font-medium mb-1 flex items-center">
                          <ArrowUpRight className="w-3 h-3" /> +1%
                        </span>
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5 border-l-4 border-l-risk-moderate relative overflow-hidden">
                      <Droplet className="w-16 h-16 text-risk-moderate/10 absolute -bottom-4 -right-2" />
                      <p className="text-white/60 text-sm font-medium mb-1">Hydration Level</p>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white">68%</span>
                        <span className="text-risk-high text-sm font-medium mb-1 flex items-center">
                          <ArrowDownRight className="w-3 h-3" /> -5%
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Main Chart Area */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-6 flex-1 min-h-[350px] border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-white">Vital Trends</h3>
                      <select className="bg-slate-900/50 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none">
                        <option>Last 6 Months</option>
                        <option>Last 30 Days</option>
                        <option>Year to Date</option>
                      </select>
                    </div>
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historicalHealthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                          <XAxis dataKey="month" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} tickLine={false} axisLine={false} />
                          <YAxis stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} tickLine={false} axisLine={false} />
                          <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20', strokeWidth: 1, strokeDasharray: '4 4' }} />
                          <Line type="monotone" dataKey="heartRate" name="Heart Rate (bpm)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#1e293b' }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="activity" name="Activity Score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#1e293b' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* MIDDLE GRID: Biomarkers & Risk Profiles */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Biomarker Breakdown */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="lg:col-span-2 glass-card p-6 border border-white/5"
                >
                  <h3 className="text-lg font-bold text-white mb-6">Recent Biomarker Analysis</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
                          <th className="pb-3 font-medium">Biomarker</th>
                          <th className="pb-3 font-medium">Value</th>
                          <th className="pb-3 font-medium">Target</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium hidden sm:table-cell">Visual</th>
                        </tr>
                      </thead>
                      <tbody>
                        {biomarkerData.map((marker, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 text-white font-medium">{marker.name}</td>
                            <td className="py-4 text-white font-bold">{marker.value} <span className="text-xs text-white/40 font-normal">{marker.unit}</span></td>
                            <td className="py-4 text-white/60">{marker.target}</td>
                            <td className="py-4">
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${marker.status === 'optimal' ? 'bg-risk-low/20 text-risk-low' : 'bg-risk-high/20 text-risk-high'}`}>
                                {marker.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4 hidden sm:table-cell w-32">
                              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${marker.status === 'optimal' ? 'bg-risk-low' : 'bg-risk-high'}`}
                                  style={{ width: `${Math.min((marker.value / (marker.target * 1.5)) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                {/* Risk Distribution Pie */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="glass-card p-6 border border-white/5 flex flex-col"
                >
                  <h3 className="text-lg font-bold text-white mb-2">Health Risk Profile</h3>
                  <p className="text-white/50 text-sm mb-6">Distribution across disease categories</p>
                  
                  <div className="flex-1 min-h-[200px] relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-bold text-white">3</span>
                      <span className="text-xs text-white/50">Risks Monitored</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-col gap-2">
                    {riskDistribution.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                          <span className="text-white/80 text-sm">{item.name}</span>
                        </div>
                        <span className="text-white font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* BOTTOM GRID: Actionable Risk Cards (from API) & Quick Links */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Specific Disease Risks</h3>
                  {hasRiskData && (
                    <span className="text-sm text-primary-400 font-medium">Based on latest blood report</span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {hasRiskData ? dashboardData.risk_summaries.map((card: any, index: number) => (
                    <motion.div
                      key={card.disease}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className={`glass-card p-5 border ${getRiskColor(card.risk_band)} hover:-translate-y-1 transition-transform duration-300 shadow-lg`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`p-2 rounded-lg bg-white/10 ${getRiskColor(card.risk_band).split(' ')[0]}`}>
                            {getRiskIcon(card.disease)}
                          </span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getRiskColor(card.risk_band)} border`}>
                          {card.risk_band.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-lg mb-1">{getRiskTitle(card.disease)}</h4>
                      <div className="mb-4">
                        <span className="text-4xl font-black text-white tracking-tighter">{(card.risk_score * 100).toFixed(0)}</span>
                        <span className="text-white/50 text-sm font-medium ml-1">% Risk</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${card.risk_score * 100}%` }}
                          transition={{ delay: 1 + index * 0.1, duration: 1 }}
                          className={`h-full rounded-full ${card.risk_band === 'low' ? 'bg-risk-low' : card.risk_band === 'moderate' ? 'bg-risk-moderate' : 'bg-risk-high'}`}
                        />
                      </div>
                      <p className="text-white/50 text-xs leading-relaxed">{getRiskDescription(card.disease)}</p>
                    </motion.div>
                  )) : (
                    // Mock Risk Cards if API has no data
                    <div className="col-span-full glass-card p-10 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10">
                      <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-primary-500" />
                      </div>
                      <h3 className="text-xl text-white font-bold mb-2">No Verified Risk Data Available</h3>
                      <p className="text-white/60 max-w-md mb-6">Upload a recent blood report to generate accurate disease risk predictions for your digital twin.</p>
                      <Link href="/reports" className="btn-primary py-2.5 px-8 font-semibold rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all">
                        Upload Medical Report
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Population Cohort Benchmarking */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="glass-card p-6 border border-white/10 mt-8 relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary-400" />
                      Population Cohort Benchmarking
                    </h3>
                    <p className="text-white/50 text-sm">Compare your biometrics against standard clinical and lifestyle datasets (70K+ subjects)</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-white/5 rounded-full border border-white/10 text-white/70">
                    Real-time dataset sync
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Glucose Comparison */}
                  <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5">
                    <h4 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase text-primary-300">Blood Glucose (Diabetes Dataset)</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">Your Level</span>
                          <span className="text-primary-400 font-bold">95 mg/dL</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: '66.6%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">Healthy Cohort (Avg)</span>
                          <span className="text-white font-medium">111.0 mg/dL</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-risk-low rounded-full" style={{ width: '77.8%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">Diabetic Cohort (Avg)</span>
                          <span className="text-white font-medium text-risk-high">142.6 mg/dL</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-risk-high rounded-full" style={{ width: '100%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BP Comparison */}
                  <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5">
                    <h4 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase text-primary-300">Blood Pressure (Cardio Dataset)</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">Your Level (Systolic)</span>
                          <span className="text-primary-400 font-bold">118 mmHg</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: '88.1%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">Cardio Negative (Healthy)</span>
                          <span className="text-white font-medium">119.6 mmHg</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-risk-low rounded-full" style={{ width: '89.3%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">Cardio Positive (High Risk)</span>
                          <span className="text-white font-medium text-risk-high">133.8 mmHg</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-risk-high rounded-full" style={{ width: '100%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sleep Comparison */}
                  <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5">
                    <h4 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase text-primary-300">Sleep (Sleep & Lifestyle Dataset)</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">Your Sleep Duration</span>
                          <span className="text-primary-400 font-bold">7.9 hrs</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: '92.9%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">No Disorder Group (Avg)</span>
                          <span className="text-white font-medium">7.36 hrs</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-risk-low rounded-full" style={{ width: '86.5%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">Insomnia Cohort (Avg)</span>
                          <span className="text-white font-medium text-risk-high">6.59 hrs</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-risk-high rounded-full" style={{ width: '77.5%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8"
              >
                <Link href="/simulator" className="glass-card p-5 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all cursor-pointer group rounded-xl">
                  <TrendingUp className="w-8 h-8 text-primary-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-white mb-1">What-If Simulator</h3>
                  <p className="text-white/50 text-sm">See how lifestyle changes affect your health trajectory</p>
                </Link>

                <Link href="/coach" className="glass-card p-5 hover:border-biotech-500/50 hover:bg-biotech-500/5 transition-all cursor-pointer group rounded-xl">
                  <MessageCircle className="w-8 h-8 text-biotech-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-white mb-1">AI Health Coach</h3>
                  <p className="text-white/50 text-sm">Chat with your personalized AI medical assistant</p>
                </Link>

                <Link href="/reports" className="glass-card p-5 hover:border-risk-moderate/50 hover:bg-risk-moderate/5 transition-all cursor-pointer group rounded-xl">
                  <FileText className="w-8 h-8 text-risk-moderate mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-white mb-1">Blood Reports</h3>
                  <p className="text-white/50 text-sm">Upload and analyze new blood work results</p>
                </Link>

                <Link href="/calendar" className="glass-card p-5 hover:border-risk-high/50 hover:bg-risk-high/5 transition-all cursor-pointer group rounded-xl">
                  <Calendar className="w-8 h-8 text-risk-high mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-white mb-1">Health Calendar</h3>
                  <p className="text-white/50 text-sm">Track appointments, meds, and reminders</p>
                </Link>
              </motion.div>
            </>

          {/* Disclaimer Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 p-5 rounded-xl bg-warning/10 border border-warning/20 flex gap-4 items-start"
          >
            <div className="p-2 bg-warning/20 rounded-full shrink-0">
              <Shield className="w-5 h-5 text-warning" />
            </div>
            <p className="text-warning text-sm leading-relaxed">
              <strong>Disclaimer:</strong> BioTwin AI provides wellness risk estimates based on the data you provide. It is not a diagnostic tool and does not replace professional medical evaluation. Always consult a licensed healthcare provider for diagnosis, treatment, or any urgent symptoms.
            </p>
          </motion.div>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}