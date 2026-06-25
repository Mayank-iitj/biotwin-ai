'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Activity, Shield, Pill, Salad, Dumbbell, AlertTriangle,
  CheckCircle, XCircle, Info
} from 'lucide-react'
import { ExtendedDiseaseEntry } from '@/lib/extended-disease-data'

type Tab = 'overview' | 'medications' | 'diet' | 'workout' | 'precautions'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Info className="w-4 h-4" /> },
  { id: 'medications', label: 'Medications', icon: <Pill className="w-4 h-4" /> },
  { id: 'diet', label: 'Diet', icon: <Salad className="w-4 h-4" /> },
  { id: 'workout', label: 'Workout', icon: <Dumbbell className="w-4 h-4" /> },
  { id: 'precautions', label: 'Precautions', icon: <Shield className="w-4 h-4" /> },
]

function formatSymptom(s: string) {
  return s.replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/^\w/, c => c.toUpperCase())
}

interface ExtendedDiseasePanelProps {
  disease: ExtendedDiseaseEntry
  matchedSymptoms?: string[]
  onClose: () => void
}

export default function ExtendedDiseasePanel({ disease, matchedSymptoms = [], onClose }: ExtendedDiseasePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

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
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: `1px solid ${disease.color}25`,
          boxShadow: `0 0 60px ${disease.glowColor}, 0 25px 50px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, transparent, ${disease.color}, transparent)` }}
        />

        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
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
                <h2 className="text-xl font-bold text-white leading-tight">{disease.name}</h2>
                {matchedSymptoms.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    <span className="text-purple-400 text-xs font-medium">{matchedSymptoms.length} matching symptom{matchedSymptoms.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-white/5 rounded-xl p-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id ? 'text-white' : 'text-white/40 hover:text-white/70'
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ scrollbarWidth: 'thin', scrollbarColor: `${disease.color}30 transparent` }}>
          <AnimatePresence mode="wait">

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div key="overview" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}
                className="space-y-4 mt-2"
              >
                <div className="rounded-xl p-4 bg-white/3 border border-white/8">
                  <p className="text-white/70 text-sm leading-relaxed">{disease.description}</p>
                </div>

                {/* Matched Symptoms highlight */}
                {matchedSymptoms.length > 0 && (
                  <div className="rounded-xl p-4 border" style={{ background: `${disease.color}08`, borderColor: `${disease.color}20` }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: disease.color }}>Your matched symptoms:</p>
                    <div className="flex flex-wrap gap-2">
                      {matchedSymptoms.map(s => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: `${disease.color}15`, color: disease.color, border: `1px solid ${disease.color}25` }}>
                          {formatSymptom(s)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* All known symptoms */}
                {disease.symptoms.length > 0 && (
                  <div>
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Common Symptoms</p>
                    <div className="flex flex-wrap gap-1.5">
                      {disease.symptoms.map(s => (
                        <span key={s}
                          className={`text-xs px-2.5 py-1 rounded-full border ${
                            matchedSymptoms.includes(s)
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 font-medium'
                              : 'bg-white/4 text-white/50 border-white/8'
                          }`}
                        >
                          {matchedSymptoms.includes(s) && '✓ '}{formatSymptom(s)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* MEDICATIONS */}
            {activeTab === 'medications' && (
              <motion.div key="medications" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}
                className="space-y-3 mt-2"
              >
                <p className="text-white/40 text-xs">⚕️ Always consult a licensed healthcare provider before taking any medication.</p>
                {disease.medications.length > 0 ? disease.medications.map((med, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/8 border border-blue-500/15"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/25 flex items-center justify-center flex-shrink-0 text-blue-400 font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium leading-snug">{med}</p>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-10 text-white/30 text-sm">
                    <Pill className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Consult a healthcare professional for medication guidance
                  </div>
                )}
              </motion.div>
            )}

            {/* DIET */}
            {activeTab === 'diet' && (
              <motion.div key="diet" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}
                className="space-y-3 mt-2"
              >
                <p className="text-white/40 text-xs">🥗 Evidence-based dietary recommendations for managing this condition.</p>
                {disease.diets.length > 0 ? disease.diets.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/15"
                  >
                    <span className="text-xl flex-shrink-0">
                      {i === 0 ? '🥦' : i === 1 ? '🐟' : i === 2 ? '💧' : i === 3 ? '🫙' : '🍎'}
                    </span>
                    <p className="text-white/80 text-sm leading-snug">{item}</p>
                  </motion.div>
                )) : (
                  <div className="text-center py-10 text-white/30 text-sm">
                    <Salad className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    General balanced diet recommended — consult a nutritionist
                  </div>
                )}
              </motion.div>
            )}

            {/* WORKOUT */}
            {activeTab === 'workout' && (
              <motion.div key="workout" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}
                className="space-y-3 mt-2"
              >
                <p className="text-white/40 text-xs">🏃 Exercise recommendations tailored to your condition — always clear with your doctor first.</p>
                {disease.workouts.length > 0 ? disease.workouts.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-violet-500/8 border border-violet-500/15"
                  >
                    <span className="text-xl flex-shrink-0">
                      {i === 0 ? '🧘' : i === 1 ? '🚶' : i === 2 ? '🏊' : '💪'}
                    </span>
                    <p className="text-white/80 text-sm leading-snug">{item}</p>
                  </motion.div>
                )) : (
                  <div className="text-center py-10 text-white/30 text-sm">
                    <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Consult your doctor before starting any exercise program
                  </div>
                )}
              </motion.div>
            )}

            {/* PRECAUTIONS */}
            {activeTab === 'precautions' && (
              <motion.div key="precautions" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}
                className="space-y-3 mt-2"
              >
                {disease.precautions.length > 0 ? disease.precautions.map((prec, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/15"
                  >
                    <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-white/70 text-sm leading-snug capitalize">{prec}</p>
                  </motion.div>
                )) : (
                  <div className="text-center py-10 text-white/30 text-sm">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Follow general health precautions and doctor&apos;s advice
                  </div>
                )}

                <div className="rounded-xl p-4 bg-red-500/8 border border-red-500/20 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 font-semibold text-sm">Important</span>
                  </div>
                  <p className="text-red-200/60 text-xs leading-relaxed">
                    BioTwin AI is not a substitute for professional medical advice. If symptoms are severe or worsen, seek immediate care. Call 999 or 911 in an emergency.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom */}
        <div className="flex-shrink-0 px-6 py-3 border-t border-white/8 flex items-center justify-between bg-slate-950/50">
          <div className="flex gap-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: activeTab === tab.id ? disease.color : 'rgba(255,255,255,0.15)' }}
              />
            ))}
          </div>
          <p className="text-white/25 text-xs">BioTwin AI · {disease.name}</p>
          <button onClick={onClose} className="text-xs px-4 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 text-white/60 hover:text-white transition-all border border-white/10">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
