'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, X, Activity, CheckCircle, AlertTriangle,
  ChevronRight, Stethoscope, Info, Zap, RotateCcw
} from 'lucide-react'
import { SYMPTOM_TO_DISEASES, SYMPTOM_SEVERITY, EXTENDED_DISEASE_DATA, ExtendedDiseaseEntry } from '@/lib/extended-disease-data'

// ── Format symptom display ──────────────────────────────────
function formatSymptom(s: string) {
  return s.replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/^\w/, c => c.toUpperCase())
}

// ── Get severity label ──────────────────────────────────────
function getSeverityInfo(weight: number) {
  if (weight <= 2) return { label: 'Mild', color: '#10b981', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20', text: 'text-emerald-400' }
  if (weight <= 4) return { label: 'Moderate', color: '#f59e0b', bg: 'bg-amber-500/15', border: 'border-amber-500/20', text: 'text-amber-400' }
  if (weight <= 6) return { label: 'Notable', color: '#f97316', bg: 'bg-orange-500/15', border: 'border-orange-500/20', text: 'text-orange-400' }
  return { label: 'Serious', color: '#ef4444', bg: 'bg-red-500/15', border: 'border-red-500/20', text: 'text-red-400' }
}

// ── All unique symptoms list ────────────────────────────────
const ALL_SYMPTOMS = Object.keys(SYMPTOM_TO_DISEASES).sort()

interface MatchedDisease {
  disease: ExtendedDiseaseEntry
  matchCount: number
  totalSymptoms: number
  matchedSymptoms: string[]
  confidence: number
  totalSeverityScore: number
}

interface SymptomCheckerProps {
  onDiseaseSelect?: (disease: ExtendedDiseaseEntry) => void
}

export default function SymptomChecker({ onDiseaseSelect }: SymptomCheckerProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)

  // Filter symptoms by search
  const filteredSymptoms = useMemo(() => {
    if (!searchQuery.trim()) return ALL_SYMPTOMS
    const q = searchQuery.toLowerCase().replace(/\s+/g, '_')
    return ALL_SYMPTOMS.filter(s =>
      s.includes(q) || formatSymptom(s).toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Compute matched diseases
  const matchedDiseases = useMemo((): MatchedDisease[] => {
    if (selectedSymptoms.length === 0) return []

    const diseaseScores: Record<string, { count: number; matched: string[]; sevScore: number }> = {}

    for (const sym of selectedSymptoms) {
      const diseases = SYMPTOM_TO_DISEASES[sym] || []
      const sevWeight = SYMPTOM_SEVERITY[sym] ?? 3
      for (const d of diseases) {
        if (!diseaseScores[d]) diseaseScores[d] = { count: 0, matched: [], sevScore: 0 }
        diseaseScores[d].count++
        diseaseScores[d].matched.push(sym)
        diseaseScores[d].sevScore += sevWeight
      }
    }

    // Build a robust lookup: try direct, then prefix match, then substring
    const extKeys = Object.keys(EXTENDED_DISEASE_DATA)

    function findDisease(rawId: string): ExtendedDiseaseEntry | undefined {
      // 1. Direct match
      if (EXTENDED_DISEASE_DATA[rawId]) return EXTENDED_DISEASE_DATA[rawId]
      // 2. Clean both sides the same way and compare
      const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
      const cleanId = clean(rawId)
      // 3. Find best matching key
      const found = extKeys.find(k => clean(k) === cleanId)
      if (found) return EXTENDED_DISEASE_DATA[found]
      // 4. Substring match (the rawId contains the key prefix)
      const partial = extKeys.find(k => {
        const ck = clean(k)
        return ck.startsWith(cleanId.substring(0, Math.min(8, cleanId.length))) ||
               cleanId.startsWith(ck.substring(0, Math.min(8, ck.length)))
      })
      if (partial) return EXTENDED_DISEASE_DATA[partial]
      return undefined
    }

    const results: MatchedDisease[] = []
    for (const [diseaseId, score] of Object.entries(diseaseScores)) {
      const disease = findDisease(diseaseId)
      if (!disease) continue

      const totalSymptoms = disease.symptoms.length || 1
      const confidence = Math.min(100, Math.round((score.count / Math.max(selectedSymptoms.length, 1)) * 100))

      results.push({
        disease,
        matchCount: score.count,
        totalSymptoms,
        matchedSymptoms: score.matched,
        confidence,
        totalSeverityScore: score.sevScore,
      })
    }

    return results
      .sort((a, b) => b.confidence - a.confidence || b.totalSeverityScore - a.totalSeverityScore)
      .slice(0, 8)
  }, [selectedSymptoms])

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    )
    setShowResults(false)
  }

  const clearAll = () => {
    setSelectedSymptoms([])
    setShowResults(false)
  }

  const totalSeverityScore = selectedSymptoms.reduce((sum, s) => sum + (SYMPTOM_SEVERITY[s] ?? 3), 0)
  const avgSeverity = selectedSymptoms.length > 0 ? totalSeverityScore / selectedSymptoms.length : 0

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Symptom Checker</h2>
            <p className="text-white/40 text-xs">Select your symptoms to identify possible conditions</p>
          </div>
        </div>
        {selectedSymptoms.length > 0 && (
          <button onClick={clearAll} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>

      {/* Selected Symptoms */}
      {selectedSymptoms.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 bg-white/3 border border-white/8"
        >
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-white/70 text-sm font-semibold">{selectedSymptoms.length} Symptom{selectedSymptoms.length > 1 ? 's' : ''} Selected</span>
            {avgSeverity > 5 && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/20 text-red-400">
                ⚠ High severity pattern
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSymptoms.map(sym => {
              const sev = getSeverityInfo(SYMPTOM_SEVERITY[sym] ?? 3)
              return (
                <motion.button
                  key={sym}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={() => toggleSymptom(sym)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:opacity-80 ${sev.bg} ${sev.border} ${sev.text}`}
                >
                  {formatSymptom(sym)}
                  <X className="w-3 h-3" />
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search symptoms (e.g. fever, chest pain, fatigue...)"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-500/40 focus:bg-white/8 transition-all"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Symptom Grid */}
      <div className="max-h-56 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,0.3) transparent' }}>
        <div className="flex flex-wrap gap-2">
          {filteredSymptoms.slice(0, 80).map(sym => {
            const isSelected = selectedSymptoms.includes(sym)
            const sev = getSeverityInfo(SYMPTOM_SEVERITY[sym] ?? 3)
            return (
              <motion.button
                key={sym}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleSymptom(sym)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isSelected
                    ? `${sev.bg} ${sev.border} ${sev.text}`
                    : 'bg-white/4 border-white/10 text-white/50 hover:text-white/80 hover:bg-white/8'
                }`}
              >
                {isSelected && <span className="mr-1">✓</span>}
                {formatSymptom(sym)}
              </motion.button>
            )
          })}
          {filteredSymptoms.length > 80 && (
            <span className="px-3 py-1.5 text-xs text-white/30">+{filteredSymptoms.length - 80} more (refine search)</span>
          )}
        </div>
      </div>

      {/* Analyze Button */}
      {selectedSymptoms.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowResults(true)}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.2))',
            border: '1px solid rgba(139,92,246,0.4)',
            color: '#c4b5fd',
            boxShadow: '0 0 20px rgba(139,92,246,0.15)',
          }}
        >
          <Zap className="w-4 h-4" />
          Analyze {selectedSymptoms.length} Symptom{selectedSymptoms.length > 1 ? 's' : ''}
        </motion.button>
      )}

      {/* Results */}
      <AnimatePresence>
        {showResults && matchedDiseases.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Disclaimer */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 mb-4">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-200/70 text-xs leading-relaxed">
                <strong>Not a diagnosis.</strong> These are possible conditions based on your symptoms. Always consult a qualified healthcare professional for accurate diagnosis and treatment.
              </p>
            </div>

            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              {matchedDiseases.length} Possible Condition{matchedDiseases.length > 1 ? 's' : ''} Found
            </h3>

            <div className="space-y-3">
              {matchedDiseases.map((match, i) => (
                <motion.div
                  key={match.disease.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl p-4 border transition-all cursor-pointer hover:bg-white/5"
                  style={{
                    background: `${match.disease.color}06`,
                    borderColor: `${match.disease.color}25`,
                  }}
                  onClick={() => onDiseaseSelect?.(match.disease)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: `${match.disease.color}20`, color: match.disease.color, border: `1px solid ${match.disease.color}30` }}
                      >
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-white font-semibold text-sm">{match.disease.name}</h4>
                        <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{match.disease.description.substring(0, 80)}...</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <div
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: `${match.disease.color}20`, color: match.disease.color, border: `1px solid ${match.disease.color}30` }}
                      >
                        {match.confidence}% match
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="mt-3 w-full h-1 bg-white/8 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${match.confidence}%` }}
                      transition={{ delay: i * 0.05 + 0.2, duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ background: match.disease.color }}
                    />
                  </div>

                  {/* Matched symptoms */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {match.matchedSymptoms.slice(0, 4).map(sym => (
                      <span key={sym} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50">
                        {formatSymptom(sym)}
                      </span>
                    ))}
                    {match.matchedSymptoms.length > 4 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30">
                        +{match.matchedSymptoms.length - 4}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Emergency warning for high severity */}
            {avgSeverity > 5 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 rounded-xl p-4 bg-red-500/10 border border-red-500/30"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-semibold text-sm">Your symptom pattern appears serious</p>
                    <p className="text-red-200/60 text-xs mt-1">If you are experiencing severe symptoms, please seek immediate medical attention or call emergency services (999/911).</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
        {showResults && matchedDiseases.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-8 text-white/30"
          >
            <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No matching conditions found for this symptom combination.</p>
            <p className="text-xs mt-1">Try selecting different or more symptoms.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
