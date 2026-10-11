'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Activity, Heart, Brain, Shield, AlertTriangle,
  CheckCircle, XCircle, Clock, ChevronRight, Zap,
  TrendingUp, Pill, Eye, Info
} from 'lucide-react'
import { DiseaseData, BodyZone } from '@/lib/disease-data'

// ─── Animated Body Map SVG ───────────────────────────────────
function DiseaseBodyMap({ disease, selectedZone, onZoneClick }: {
  disease: DiseaseData
  selectedZone: BodyZone | null
  onZoneClick: (zone: BodyZone) => void
}) {
  const getSeverityColor = (severity: 'mild' | 'moderate' | 'severe') => {
    switch (severity) {
      case 'mild': return '#737373'
      case 'moderate': return '#a3a3a3'
      case 'severe': return '#ffffff'
    }
  }

  return (
    <div className="relative flex flex-col items-center">
      <svg
        viewBox="0 0 200 500"
        className="w-full max-w-[220px] mx-auto"
        style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.8))' }}
      >
        {/* Image bodymap */}
        <image href="/images/bodymap.png" x="-50" y="0" width="300" height="500" preserveAspectRatio="xMidYMid meet" style={{ filter: 'grayscale(1) opacity(0.8)' }} />


        {/* Disease Hotspots */}
        {disease.affectedBodyZones.map((zone) => {
          const color = getSeverityColor(zone.severity)
          const isSelected = selectedZone?.id === zone.id
          return (
            <g key={zone.id} onClick={() => onZoneClick(zone)} style={{ cursor: 'pointer' }}>
              {/* Outer glow ring */}
              <circle
                cx={zone.cx}
                cy={zone.cy}
                r={zone.r + 8}
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity="0.2"
              >
                <animate attributeName="r" values={`${zone.r + 6};${zone.r + 14};${zone.r + 6}`} dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2.5s" repeatCount="indefinite" />
              </circle>
              {/* Middle ring */}
              <circle
                cx={zone.cx}
                cy={zone.cy}
                r={zone.r + 3}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                opacity="0.4"
              >
                <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Core dot */}
              <circle
                cx={zone.cx}
                cy={zone.cy}
                r={isSelected ? zone.r + 2 : zone.r}
                fill={`${color}30`}
                stroke={color}
                strokeWidth={isSelected ? 2.5 : 1.5}
              />
              {/* Label line & text */}
              <line
                x1={zone.cx > 100 ? zone.cx + zone.r : zone.cx - zone.r}
                y1={zone.cy}
                x2={zone.cx > 100 ? zone.cx + zone.r + 12 : zone.cx - zone.r - 12}
                y2={zone.cy}
                stroke={color}
                strokeWidth="0.8"
                opacity="0.6"
              />
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs">
        {['mild', 'moderate', 'severe'].map(s => (
          <div key={s} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{
              backgroundColor: s === 'mild' ? '#737373' : s === 'moderate' ? '#a3a3a3' : '#ffffff'
            }} />
            <span className="text-white/40 capitalize">{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab definitions ─────────────────────────────────────────
type Tab = 'bodymap' | 'symptoms' | 'progression' | 'treatment' | 'precautions'
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'bodymap', label: 'Body Map', icon: <Activity className="w-4 h-4" /> },
  { id: 'symptoms', label: 'Symptoms', icon: <Eye className="w-4 h-4" /> },
  { id: 'progression', label: 'Progression', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'treatment', label: 'Treatment', icon: <Pill className="w-4 h-4" /> },
  { id: 'precautions', label: 'Precautions', icon: <Shield className="w-4 h-4" /> },
]

const STAGE_COLORS = {
  early: { bg: 'bg-white/5', border: 'border-neutral-700', text: 'text-neutral-300', dot: '#737373' },
  developing: { bg: 'bg-white/10', border: 'border-neutral-600', text: 'text-neutral-200', dot: '#a3a3a3' },
  advanced: { bg: 'bg-white/15', border: 'border-neutral-500', text: 'text-white', dot: '#d4d4d4' },
  severe: { bg: 'bg-white/20', border: 'border-white', text: 'text-white', dot: '#ffffff' },
}

const CATEGORY_COLORS = {
  lifestyle: { bg: 'bg-white/5', border: 'border-neutral-700', label: 'Lifestyle', color: '#a3a3a3' },
  medical: { bg: 'bg-white/5', border: 'border-neutral-700', label: 'Medical', color: '#d4d4d4' },
  dietary: { bg: 'bg-white/5', border: 'border-neutral-700', label: 'Dietary', color: '#737373' },
  monitoring: { bg: 'bg-white/5', border: 'border-neutral-700', label: 'Monitoring', color: '#ffffff' },
}

const SEVERITY_PILL = {
  mild: 'bg-neutral-900 text-neutral-400 border border-neutral-700',
  moderate: 'bg-neutral-900 text-neutral-200 border border-neutral-500',
  severe: 'bg-white text-black font-bold border border-white',
}

// ─── Main Component ──────────────────────────────────────────
interface DiseaseImpactViewerProps {
  disease: DiseaseData
  userRiskScore?: number  // 0–100, optional user's personal risk
  onClose: () => void
}

export default function DiseaseImpactViewer({ disease, userRiskScore, onClose }: DiseaseImpactViewerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('bodymap')
  const [selectedZone, setSelectedZone] = useState<BodyZone | null>(null)

  const slideVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: '#000000',
          border: '1px solid #262626',
          boxShadow: '0 25px 50px rgba(0,0,0,0.9)',
        }}
      >
        {/* Top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-white"
        />

        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 font-bold"
                style={{
                  background: '#171717',
                  border: '1px solid #404040',
                  color: '#ffffff',
                }}
              >
                {disease.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20"
                  >
                    {disease.name}
                  </span>
                  {userRiskScore !== undefined && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-900 text-white border border-neutral-700">
                      Your Risk: {userRiskScore}%
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white leading-tight">{disease.fullName}</h2>
                <p className="text-white/50 text-sm mt-0.5">{disease.tagline}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all flex-shrink-0 mt-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {disease.quickStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-3 text-center bg-neutral-900 border border-neutral-800"
              >
                <div className="text-sm font-bold text-white">{stat.value}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1 mt-4 bg-neutral-900 rounded-xl p-1 border border-neutral-800">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-lg font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#404040 transparent' }}>
          <AnimatePresence mode="wait">
            {/* ── BODY MAP TAB ── */}
            {activeTab === 'bodymap' && (
              <motion.div key="bodymap" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2"
              >
                {/* Left: SVG body */}
                <div className="flex flex-col items-center">
                  <p className="text-white/40 text-xs text-center mb-4">Click an organ to learn more about the damage</p>
                  <DiseaseBodyMap disease={disease} selectedZone={selectedZone} onZoneClick={setSelectedZone} />
                </div>

                {/* Right: Zone details + list */}
                <div className="flex flex-col gap-3">
                  <AnimatePresence mode="wait">
                    {selectedZone ? (
                      <motion.div key={selectedZone.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="rounded-xl p-4 bg-neutral-900 border border-neutral-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-white text-sm">{selectedZone.label}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_PILL[selectedZone.severity]}`}>
                            {selectedZone.severity}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed">{selectedZone.description}</p>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="rounded-xl p-4 border border-dashed border-neutral-800 text-center text-neutral-400 text-sm"
                      >
                        <Activity className="w-6 h-6 mx-auto mb-2 opacity-40 text-white" />
                        Select an organ hotspot to see details
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* All zones list */}
                  <div className="space-y-2">
                    <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Affected Areas</p>
                    {disease.affectedBodyZones.map((zone, i) => (
                      <motion.button
                        key={zone.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        onClick={() => setSelectedZone(zone)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                          selectedZone?.id === zone.id ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                        style={{ border: `1px solid ${selectedZone?.id === zone.id ? '#ffffff' : 'transparent'}` }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: zone.severity === 'mild' ? '#737373' : zone.severity === 'moderate' ? '#a3a3a3' : '#ffffff',
                              boxShadow: `0 0 6px ${zone.severity === 'severe' ? '#ffffff' : zone.severity === 'moderate' ? '#a3a3a3' : '#737373'}`,
                            }}
                          />
                          <span className="text-white/80 text-sm font-medium">{zone.label}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_PILL[zone.severity]}`}>{zone.severity}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Recovery outlook quick preview */}
                  <div className="mt-2 rounded-xl p-4 bg-neutral-900 border border-neutral-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-white/40" />
                      <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Key Fact</p>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{disease.recoveryOutlook.keyFact}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── SYMPTOMS TAB ── */}
            {activeTab === 'symptoms' && (
              <motion.div key="symptoms" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}
                className="mt-2"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* External / Visible */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="w-4 h-4 text-white" />
                      <h3 className="font-bold text-white">What You See</h3>
                      <span className="text-xs text-white/30 ml-1">Visible / External Symptoms</span>
                    </div>
                    <div className="space-y-3">
                      {disease.externalSymptoms.map((symptom, i) => (
                        <motion.div
                          key={symptom.name}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="rounded-xl p-4 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl flex-shrink-0">{symptom.icon}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-white text-sm font-semibold">{symptom.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_PILL[symptom.severity]}`}>
                                  {symptom.severity}
                                </span>
                              </div>
                              <p className="text-white/50 text-sm leading-relaxed">{symptom.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Internal */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-white" />
                      <h3 className="font-bold text-white">What&apos;s Happening Inside</h3>
                      <span className="text-xs text-white/30 ml-1">Internal / Organ-Level</span>
                    </div>
                    <div className="space-y-3">
                      {disease.internalSymptoms.map((symptom, i) => (
                        <motion.div
                          key={symptom.name}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.09 }}
                          className="rounded-xl p-4 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl flex-shrink-0">{symptom.icon}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-white text-sm font-semibold">{symptom.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_PILL[symptom.severity]}`}>
                                  {symptom.severity}
                                </span>
                              </div>
                              <p className="text-white/50 text-sm leading-relaxed">{symptom.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── PROGRESSION TAB ── */}
            {activeTab === 'progression' && (
              <motion.div key="progression" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}
                className="mt-2 space-y-4"
              >
                <p className="text-neutral-400 text-sm">Tap a stage to see detailed symptoms. Stages marked <span className="text-white font-semibold">reversible</span> can still be turned around with intervention.</p>

                {/* Timeline connector bar */}
                <div className="relative">
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-neutral-800 z-0" />
                  <div className="relative flex justify-between z-10 mb-6">
                    {disease.progressionStages.map((stage, i) => {
                      const c = STAGE_COLORS[stage.stage]
                      return (
                        <div key={stage.stage} className="flex flex-col items-center gap-2" style={{ width: '22%' }}>
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2"
                            style={{ borderColor: c.dot, background: '#171717', color: c.dot }}
                          >
                            {i + 1}
                          </div>
                          <span className={`text-xs font-semibold ${c.text} text-center leading-tight`}>{stage.label}</span>
                          <span className="text-[10px] text-neutral-400 text-center leading-tight">{stage.timeframe}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* User risk pin */}
                {userRiskScore !== undefined && (
                  <div className="flex items-center gap-3 rounded-xl p-3 bg-neutral-900 border border-neutral-700">
                    <div
                      className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0 bg-white"
                      style={{ boxShadow: '0 0 8px #ffffff' }}
                    />
                    <span className="text-neutral-300 text-sm">Your current risk score places you at approximately the <span className="text-white font-semibold">
                      {userRiskScore < 30 ? 'Early' : userRiskScore < 55 ? 'Developing' : userRiskScore < 75 ? 'Advanced' : 'Severe'}
                    </span> stage range</span>
                  </div>
                )}

                {/* Stage cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {disease.progressionStages.map((stage, i) => {
                    const c = STAGE_COLORS[stage.stage]
                    return (
                      <motion.div
                        key={stage.stage}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`rounded-xl p-4 border ${c.bg} ${c.border}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.dot }} />
                            <span className={`font-bold text-sm ${c.text}`}>{stage.label}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${stage.reversible ? 'bg-white/10 text-white border border-white/20' : 'bg-neutral-900 text-neutral-400 border border-neutral-700'}`}>
                            {stage.reversible ? '↩ Reversible' : '⚠ Not Reversible'}
                          </span>
                        </div>
                        <p className="text-white/50 text-xs mb-3 leading-relaxed">{stage.description}</p>
                        <div className="space-y-1.5">
                          {stage.symptoms.map(s => (
                            <div key={s} className="flex items-start gap-2">
                              <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-white" />
                              <span className="text-white/60 text-xs">{s}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Recovery comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="rounded-xl p-4 bg-neutral-900 border border-neutral-700">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-semibold">With Treatment</span>
                    </div>
                    <p className="text-neutral-300 text-sm leading-relaxed">{disease.recoveryOutlook.withIntervention}</p>
                  </div>
                  <div className="rounded-xl p-4 bg-neutral-900 border border-neutral-700">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-400 text-sm font-semibold">Without Treatment</span>
                    </div>
                    <p className="text-neutral-400 text-sm leading-relaxed">{disease.recoveryOutlook.withoutIntervention}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TREATMENT TAB ── */}
            {activeTab === 'treatment' && (
              <motion.div key="treatment" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}
                className="mt-2 space-y-3"
              >
                <p className="text-white/40 text-sm mb-4">Evidence-based treatments — always consult a licensed healthcare provider before starting any treatment.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {disease.treatments.map((treatment, i) => {
                    const cat = CATEGORY_COLORS[treatment.category]
                    return (
                      <motion.div
                        key={treatment.title}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`rounded-xl p-4 border ${cat.bg} ${cat.border}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl flex-shrink-0">{treatment.icon}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-white font-semibold text-sm">{treatment.title}</span>
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700"
                              >
                                {cat.label}
                              </span>
                            </div>
                            <p className="text-white/50 text-sm leading-relaxed">{treatment.description}</p>
                            <div className="mt-2 flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              <span className="text-white text-[11px] capitalize">{treatment.effectiveness}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* ── PRECAUTIONS TAB ── */}
            {activeTab === 'precautions' && (
              <motion.div key="precautions" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}
                className="mt-2 space-y-6"
              >
                {/* Do / Don't grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-white" />
                      <h3 className="font-bold text-white text-sm">Do&apos;s</h3>
                    </div>
                    <div className="space-y-2">
                      {disease.precautions.filter(p => p.type === 'do').map((p, i) => (
                        <motion.div
                          key={p.text}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-700"
                        >
                          <span className="text-lg flex-shrink-0">{p.icon}</span>
                          <span className="text-white text-sm leading-snug">{p.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-4 h-4 text-neutral-400" />
                      <h3 className="font-bold text-white text-sm">Don&apos;ts</h3>
                    </div>
                    <div className="space-y-2">
                      {disease.precautions.filter(p => p.type === 'dont').map((p, i) => (
                        <motion.div
                          key={p.text}
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-700"
                        >
                          <span className="text-lg flex-shrink-0">{p.icon}</span>
                          <span className="text-neutral-400 text-sm leading-snug">{p.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Emergency Signs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-xl p-5 bg-neutral-950 border border-white"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-white" />
                    <h3 className="font-bold text-white">Emergency Warning Signs</h3>
                    <span className="text-xs text-neutral-400">Seek immediate medical attention</span>
                  </div>
                  <div className="space-y-2.5">
                    {disease.emergencySigns.map((sign, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-white mt-2 flex-shrink-0" />
                        <span className="text-neutral-200 text-sm leading-snug">{sign}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-800 text-xs text-neutral-400 text-center">
                    ⚠️ BioTwin AI provides wellness insights, not medical advice. In an emergency, call 999/911 immediately.
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom bar */}
        <div className="flex-shrink-0 px-6 py-3 border-t border-neutral-800 flex items-center justify-between bg-black">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: activeTab === tab.id ? '#ffffff' : 'rgba(255,255,255,0.2)' }}
              />
            ))}
          </div>
          <p className="text-white/25 text-xs">
            BioTwin AI · {disease.fullName}
          </p>
          <button
            onClick={onClose}
            className="text-xs px-4 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 text-white/60 hover:text-white transition-all border border-white/10"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
