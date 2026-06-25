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
      case 'mild': return '#f59e0b'
      case 'moderate': return '#f97316'
      case 'severe': return '#ef4444'
    }
  }

  return (
    <div className="relative flex flex-col items-center">
      <svg
        viewBox="0 0 200 500"
        className="w-full max-w-[220px] mx-auto"
        style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}
      >
        {/* Body outline */}
        {/* Head */}
        <circle cx="100" cy="65" r="22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <circle cx="100" cy="65" r="15" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="2 2" />
        {/* Spine */}
        <line x1="100" y1="87" x2="100" y2="260" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        {/* Neck */}
        <path d="M85 92 Q100 100 115 92" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        {/* Torso */}
        <path d="M70 115 C70 115 50 125 50 145 C50 170 60 210 65 250 C68 270 75 280 80 300 L120 300 C125 280 132 270 135 250 C140 210 150 170 150 145 C150 125 130 115 130 115 Z"
          fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        {/* Ribcage */}
        <path d="M72 150 Q100 160 128 150" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <path d="M70 175 Q100 185 130 175" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <path d="M68 200 Q100 210 132 200" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        {/* Pelvis */}
        <path d="M78 300 Q100 315 122 300 L126 325 Q100 335 74 325 Z" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        {/* Left Arm */}
        <path d="M70 115 L45 200 L30 270" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <circle cx="45" cy="200" r="3" fill="rgba(255,255,255,0.15)" />
        <circle cx="30" cy="270" r="2" fill="rgba(255,255,255,0.15)" />
        {/* Right Arm */}
        <path d="M130 115 L155 200 L170 270" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <circle cx="155" cy="200" r="3" fill="rgba(255,255,255,0.15)" />
        <circle cx="170" cy="270" r="2" fill="rgba(255,255,255,0.15)" />
        {/* Left Leg */}
        <path d="M82 325 L78 400 L75 480" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <circle cx="78" cy="400" r="3.5" fill="rgba(255,255,255,0.15)" />
        {/* Right Leg */}
        <path d="M118 325 L122 400 L125 480" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <circle cx="122" cy="400" r="3.5" fill="rgba(255,255,255,0.15)" />

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
              backgroundColor: s === 'mild' ? '#f59e0b' : s === 'moderate' ? '#f97316' : '#ef4444'
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
  early: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: '#10b981' },
  developing: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', dot: '#f59e0b' },
  advanced: { bg: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-400', dot: '#f97316' },
  severe: { bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', dot: '#ef4444' },
}

const CATEGORY_COLORS = {
  lifestyle: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Lifestyle', color: '#10b981' },
  medical: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Medical', color: '#3b82f6' },
  dietary: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Dietary', color: '#f59e0b' },
  monitoring: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'Monitoring', color: '#8b5cf6' },
}

const SEVERITY_PILL = {
  mild: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
  moderate: 'bg-orange-500/15 text-orange-300 border border-orange-500/20',
  severe: 'bg-red-500/15 text-red-300 border border-red-500/20',
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
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: `1px solid ${disease.color}25`,
          boxShadow: `0 0 60px ${disease.glowColor}, 0 25px 50px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Glow top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, transparent, ${disease.color}, transparent)` }}
        />

        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 font-bold"
                style={{
                  background: `linear-gradient(135deg, ${disease.color}30, ${disease.color}10)`,
                  border: `1px solid ${disease.color}40`,
                  boxShadow: `0 0 20px ${disease.glowColor}`,
                  color: disease.color,
                }}
              >
                {disease.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ background: `${disease.color}20`, color: disease.color, border: `1px solid ${disease.color}30` }}
                  >
                    {disease.name}
                  </span>
                  {userRiskScore !== undefined && (
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      userRiskScore > 60 ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      userRiskScore > 30 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
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
                className="rounded-xl p-3 text-center"
                style={{ background: `${disease.color}08`, border: `1px solid ${disease.color}15` }}
              >
                <div className="text-sm font-bold text-white">{stat.value}</div>
                <div className="text-[11px] text-white/40 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1 mt-4 bg-white/5 rounded-xl p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-white shadow-lg'
                    : 'text-white/40 hover:text-white/70'
                }`}
                style={activeTab === tab.id ? {
                  background: `linear-gradient(135deg, ${disease.color}30, ${disease.color}15)`,
                  border: `1px solid ${disease.color}40`,
                } : {}}
              >
                <span style={{ color: activeTab === tab.id ? disease.color : 'inherit' }}>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ scrollbarWidth: 'thin', scrollbarColor: `${disease.color}30 transparent` }}>
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
                        className="rounded-xl p-4"
                        style={{
                          background: `${disease.color}10`,
                          border: `1px solid ${disease.color}30`,
                          boxShadow: `0 0 20px ${disease.glowColor}`
                        }}
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
                        className="rounded-xl p-4 border border-dashed border-white/10 text-center text-white/30 text-sm"
                      >
                        <Activity className="w-6 h-6 mx-auto mb-2 opacity-40" />
                        Select an organ hotspot to see details
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* All zones list */}
                  <div className="space-y-2">
                    <p className="text-white/30 text-xs font-semibold uppercase tracking-wider">Affected Areas</p>
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
                        style={{ border: `1px solid ${selectedZone?.id === zone.id ? `${disease.color}30` : 'transparent'}` }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: zone.severity === 'mild' ? '#f59e0b' : zone.severity === 'moderate' ? '#f97316' : '#ef4444',
                              boxShadow: `0 0 6px ${zone.severity === 'severe' ? '#ef4444' : zone.severity === 'moderate' ? '#f97316' : '#f59e0b'}`,
                            }}
                          />
                          <span className="text-white/80 text-sm font-medium">{zone.label}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_PILL[zone.severity]}`}>{zone.severity}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Recovery outlook quick preview */}
                  <div className="mt-2 rounded-xl p-4 bg-white/3 border border-white/8">
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
                      <Eye className="w-4 h-4" style={{ color: disease.color }} />
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
                          className="rounded-xl p-4 bg-white/3 border border-white/8 hover:bg-white/5 transition-all"
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
                      <Zap className="w-4 h-4 text-red-400" />
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
                          className="rounded-xl p-4 border hover:bg-white/5 transition-all"
                          style={{ background: `${disease.color}06`, borderColor: `${disease.color}15` }}
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
                <p className="text-white/40 text-sm">Tap a stage to see detailed symptoms. Stages marked <span className="text-emerald-400">reversible</span> can still be turned around with intervention.</p>

                {/* Timeline connector bar */}
                <div className="relative">
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/10 z-0" />
                  <div className="relative flex justify-between z-10 mb-6">
                    {disease.progressionStages.map((stage, i) => {
                      const c = STAGE_COLORS[stage.stage]
                      return (
                        <div key={stage.stage} className="flex flex-col items-center gap-2" style={{ width: '22%' }}>
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2"
                            style={{ borderColor: c.dot, background: `${c.dot}20`, color: c.dot }}
                          >
                            {i + 1}
                          </div>
                          <span className={`text-xs font-semibold ${c.text} text-center leading-tight`}>{stage.label}</span>
                          <span className="text-[10px] text-white/30 text-center leading-tight">{stage.timeframe}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* User risk pin */}
                {userRiskScore !== undefined && (
                  <div className="flex items-center gap-3 rounded-xl p-3 bg-white/5 border border-white/10">
                    <div
                      className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0"
                      style={{ backgroundColor: disease.color, boxShadow: `0 0 8px ${disease.color}` }}
                    />
                    <span className="text-white/70 text-sm">Your current risk score places you at approximately the <span className="text-white font-semibold">
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
                          <span className={`text-xs px-2 py-0.5 rounded-full ${stage.reversible ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
                            {stage.reversible ? '↩ Reversible' : '⚠ Not Reversible'}
                          </span>
                        </div>
                        <p className="text-white/50 text-xs mb-3 leading-relaxed">{stage.description}</p>
                        <div className="space-y-1.5">
                          {stage.symptoms.map(s => (
                            <div key={s} className="flex items-start gap-2">
                              <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: c.dot }} />
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
                  <div className="rounded-xl p-4 bg-emerald-500/8 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-sm font-semibold">With Treatment</span>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{disease.recoveryOutlook.withIntervention}</p>
                  </div>
                  <div className="rounded-xl p-4 bg-red-500/8 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-sm font-semibold">Without Treatment</span>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{disease.recoveryOutlook.withoutIntervention}</p>
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
                                className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                                style={{ background: `${cat.color}20`, color: cat.color }}
                              >
                                {cat.label}
                              </span>
                            </div>
                            <p className="text-white/50 text-sm leading-relaxed">{treatment.description}</p>
                            <div className="mt-2 flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span className="text-emerald-400 text-[11px] capitalize">{treatment.effectiveness}</span>
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
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <h3 className="font-bold text-white text-sm">Do&apos;s</h3>
                    </div>
                    <div className="space-y-2">
                      {disease.precautions.filter(p => p.type === 'do').map((p, i) => (
                        <motion.div
                          key={p.text}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/15"
                        >
                          <span className="text-lg flex-shrink-0">{p.icon}</span>
                          <span className="text-white/70 text-sm leading-snug">{p.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <h3 className="font-bold text-white text-sm">Don&apos;ts</h3>
                    </div>
                    <div className="space-y-2">
                      {disease.precautions.filter(p => p.type === 'dont').map((p, i) => (
                        <motion.div
                          key={p.text}
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-red-500/8 border border-red-500/15"
                        >
                          <span className="text-lg flex-shrink-0">{p.icon}</span>
                          <span className="text-white/70 text-sm leading-snug">{p.text}</span>
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
                  className="rounded-xl p-5 bg-red-500/10 border border-red-500/30"
                  style={{ boxShadow: '0 0 20px rgba(239,68,68,0.1)' }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h3 className="font-bold text-red-400">Emergency Warning Signs</h3>
                    <span className="text-xs text-red-300/60">Seek immediate medical attention</span>
                  </div>
                  <div className="space-y-2.5">
                    {disease.emergencySigns.map((sign, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                        <span className="text-red-200/80 text-sm leading-snug">{sign}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-red-500/20 text-xs text-red-300/50 text-center">
                    ⚠️ BioTwin AI provides wellness insights, not medical advice. In an emergency, call 999/911 immediately.
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom bar */}
        <div className="flex-shrink-0 px-6 py-3 border-t border-white/8 flex items-center justify-between bg-slate-950/50">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: activeTab === tab.id ? disease.color : 'rgba(255,255,255,0.15)' }}
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
