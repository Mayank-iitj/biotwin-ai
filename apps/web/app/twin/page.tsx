'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Activity, Brain, Shield, TrendingUp, TrendingDown, AlertCircle, Droplets, Bone, Apple, Moon, Footprints } from 'lucide-react'
import HumanBodyViewer from '../components/HumanBodyViewer'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function TwinPage() {
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null)
  
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [twinData, setTwinData] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      if (!token) return
      try {
        const data = await api.getTwin(token)
        setTwinData(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load twin data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [token])

  const getStatusColor = (isAbnormal: boolean) => {
    if (isAbnormal) return 'text-risk-high bg-risk-high/10'
    return 'text-risk-low bg-risk-low/10'
  }

  // Transform risk data for body viewer
  const riskDataMap = twinData?.risk_assessments?.reduce((acc: any, curr: any) => {
    acc[curr.disease] = curr.risk_score
    return acc
  }, {}) || {}

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Digital Twin</h1>
          <p className="text-white/60">A comprehensive view of your health status</p>
        </motion.div>

        {loading ? (
           <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
           </div>
        ) : error ? (
           <div className="p-4 rounded-xl bg-risk-high/10 border border-risk-high/20 text-risk-high">
             {error}
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 3D Viewer */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
              <div className="glass-card p-4 h-full">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary-400" />
                  Interactive Body View
                </h2>
                <HumanBodyViewer
                  riskData={riskDataMap}
                  onOrganClick={(org) => setSelectedOrgan(org.id)}
                />
              </div>
            </motion.div>

            {/* Health Metrics */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Lifestyle Metrics Card */}
              <div className="glass-card p-5">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-primary-400" /> Lifestyle Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <Apple className="w-4 h-4 text-white/40" />
                    </div>
                    <p className="text-white font-bold text-lg">{twinData?.lifestyle?.weight_kg || '--'} <span className="text-xs font-normal text-white/40">kg</span></p>
                    <p className="text-white/40 text-xs">Weight</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <Moon className="w-4 h-4 text-white/40" />
                    </div>
                    <p className="text-white font-bold text-lg">{twinData?.lifestyle?.sleep_hours?.toFixed(1) || '--'} <span className="text-xs font-normal text-white/40">hrs</span></p>
                    <p className="text-white/40 text-xs">Sleep</p>
                  </div>
                </div>
              </div>

              {/* Blood Markers */}
              <div className="glass-card p-5">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-risk-high" /> Latest Blood Markers
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {twinData?.blood_markers?.length > 0 ? twinData.blood_markers.map((marker: any) => (
                    <div key={marker.marker} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <div>
                        <p className="text-white text-sm">{marker.marker}</p>
                        <p className="text-white/40 text-xs">Range: {marker.reference_range}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{typeof marker.value === 'number' ? marker.value.toFixed(1) : marker.value} {marker.unit}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(marker.is_abnormal)}`}>
                          {marker.is_abnormal ? 'abnormal' : 'normal'}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-white/40 text-sm">No blood markers available.</p>
                  )}
                </div>
              </div>

              {/* Family History */}
              <div className="glass-card p-5">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-biotech-400" /> Family History
                </h3>
                <div className="space-y-2">
                  {twinData?.family_history?.length > 0 ? twinData.family_history.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <div>
                        <p className="text-white text-sm capitalize">{item.condition.replace('_', ' ')}</p>
                        <p className="text-white/40 text-xs capitalize">{item.relationship}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-risk-moderate/10 text-risk-moderate">
                        increased
                      </span>
                    </div>
                  )) : (
                    <p className="text-white/40 text-sm">No family history recorded.</p>
                  )}
                </div>
              </div>

              {/* Risk Summary */}
              <div className="glass-card p-5">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary-400" /> Risk Summary
                </h3>
                <div className="space-y-3">
                  {twinData?.risk_assessments?.length > 0 ? twinData.risk_assessments.map((r: any) => {
                    const colors = { low: 'bg-risk-low', moderate: 'bg-risk-moderate', high: 'bg-risk-high' }
                    return (
                      <div key={r.disease}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white/70 capitalize">{r.disease.replace('_', ' ')}</span>
                          <span className="text-white">{(r.risk_score * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full ${colors[r.risk_band as keyof typeof colors] || 'bg-white/50'} rounded-full`} style={{ width: `${r.risk_score * 100}%` }} />
                        </div>
                      </div>
                    )
                  }) : (
                    <p className="text-white/40 text-sm">No risk assessments available.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 p-4 rounded-xl bg-warning/10 border border-warning/20">
          <p className="text-warning text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            This data is for informational purposes only. Always consult a healthcare provider for medical advice.
          </p>
        </div>
      </div>
    </div>
  )
}