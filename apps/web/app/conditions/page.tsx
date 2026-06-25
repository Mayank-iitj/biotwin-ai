'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Activity, Heart, Brain, Shield, TrendingUp, MessageCircle,
  Calendar, FileText, Settings, LogOut, Menu, X, Bell, BookOpen,
  Stethoscope, Pill, Dumbbell, Filter, Salad, ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { DISEASE_LIST, getDiseaseById, DiseaseData } from '@/lib/disease-data'
import { EXTENDED_DISEASE_LIST, EXTENDED_DISEASE_DATA, ExtendedDiseaseEntry } from '@/lib/extended-disease-data'
import DiseaseImpactViewer from '../components/DiseaseImpactViewer'
import ExtendedDiseasePanel from '../components/ExtendedDiseasePanel'
import SymptomChecker from '../components/SymptomChecker'
import { useAuth } from '@/lib/auth-context'

// ── Category filters ────────────────────────────────────────
const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'curated', label: '⭐ Curated' },
  { id: 'cardiovascular', label: '❤️ Heart' },
  { id: 'respiratory', label: '🫁 Respiratory' },
  { id: 'digestive', label: '🫃 Digestive' },
  { id: 'skin', label: '🩺 Skin' },
  { id: 'mental', label: '🧠 Mental' },
  { id: 'infectious', label: '🦠 Infectious' },
  { id: 'metabolic', label: '⚗️ Metabolic' },
]

function categorize(name: string): string[] {
  const n = name.toLowerCase()
  const cats: string[] = []
  if (n.includes('heart') || n.includes('cardiac') || n.includes('angina') || n.includes('coronary') || n.includes('hypert')) cats.push('cardiovascular')
  if (n.includes('asthma') || n.includes('bronch') || n.includes('copd') || n.includes('pneumonia') || n.includes('respiratory') || n.includes('lung') || n.includes('sinus') || n.includes('tubercul')) cats.push('respiratory')
  if (n.includes('gastro') || n.includes('liver') || n.includes('hepatit') || n.includes('pancre') || n.includes('bowel') || n.includes('stomach') || n.includes('gerd') || n.includes('ulcer') || n.includes('cholecyst') || n.includes('gallst') || n.includes('divert') || n.includes('appendic')) cats.push('digestive')
  if (n.includes('skin') || n.includes('rash') || n.includes('eczema') || n.includes('psoriasis') || n.includes('acne') || n.includes('fungal') || n.includes('dermat') || n.includes('impet')) cats.push('skin')
  if (n.includes('depress') || n.includes('anxiety') || n.includes('schizo') || n.includes('panic') || n.includes('mental') || n.includes('person') || n.includes('substance')) cats.push('mental')
  if (n.includes('malaria') || n.includes('dengue') || n.includes('typhoid') || n.includes('aids') || n.includes('hiv') || n.includes('tuberculosis') || n.includes('hepatit') || n.includes('chicken') || n.includes('infect') || n.includes('sepsis')) cats.push('infectious')
  if (n.includes('diabet') || n.includes('thyroid') || n.includes('metabol') || n.includes('obesity') || n.includes('hypoglycemia') || n.includes('hyperthyr') || n.includes('gout')) cats.push('metabolic')
  return cats
}

type PageMode = 'catalog' | 'symptom-checker'

// ── Extended Disease Card ───────────────────────────────────
function ExtDiseaseCard({ disease, onOpen }: { disease: ExtendedDiseaseEntry; onOpen: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="relative rounded-xl overflow-hidden cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
        border: '1px solid rgba(255,255,255,0.07)',
        transition: 'all 0.3s ease',
      }}
      onClick={onOpen}
    >
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${disease.color}, transparent)` }} />
      <div className="p-4">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: `${disease.color}15`, border: `1px solid ${disease.color}25`, color: disease.color }}
          >
            {disease.name[0]}
          </div>
          <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">{disease.name}</h3>
        </div>
        <p className="text-white/35 text-xs leading-relaxed line-clamp-2 mb-3">{disease.description.substring(0, 90)}...</p>
        <div className="flex gap-1.5 flex-wrap">
          {disease.medications.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/15">💊 {disease.medications.length} meds</span>
          )}
          {disease.diets.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">🥦 Diet</span>
          )}
          {disease.workouts.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/15">🏃 Workout</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Curated Disease Card ────────────────────────────────────
function CuratedCard({ disease, onOpen }: { disease: DiseaseData; onOpen: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="relative rounded-xl overflow-hidden cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        border: `1px solid ${disease.color}25`,
        boxShadow: `0 0 15px ${disease.glowColor}50`,
      }}
      onClick={onOpen}
    >
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${disease.color}, ${disease.color}40)` }} />
      <div className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/15 border border-yellow-500/20 text-yellow-400">⭐ Deep</div>
      <div className="p-4">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: `${disease.color}20`, border: `1px solid ${disease.color}35`, color: disease.color }}
          >
            {disease.name[0]}
          </div>
          <div>
            <h3 className="font-bold text-white text-sm leading-tight">{disease.fullName}</h3>
            <p className="text-white/35 text-[10px] mt-0.5">{disease.tagline}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {disease.affectedBodyZones.slice(0, 3).map(z => (
            <span key={z.id} className="text-[10px] px-1.5 py-0.5 rounded text-white/40 bg-white/5">{z.label}</span>
          ))}
        </div>
        <div
          className="w-full py-2 rounded-lg text-xs font-semibold text-center transition-all"
          style={{
            background: `${disease.color}12`,
            border: `1px solid ${disease.color}25`,
            color: disease.color,
          }}
        >
          View Body Impact →
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Page ────────────────────────────────────────────────
export default function ConditionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mode, setMode] = useState<PageMode>('catalog')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedCuratedDisease, setSelectedCuratedDisease] = useState<DiseaseData | null>(null)
  const [selectedExtDisease, setSelectedExtDisease] = useState<ExtendedDiseaseEntry | null>(null)
  const [matchedSymptoms, setMatchedSymptoms] = useState<string[]>([])
  const { logout } = useAuth()

  const q = search.toLowerCase().trim()

  const filteredCurated = useMemo(() => {
    const localQ = search.toLowerCase().trim()
    if (activeCategory === 'curated' || activeCategory === 'all') {
      return DISEASE_LIST.filter(d =>
        !localQ || d.name.toLowerCase().includes(localQ) || d.fullName.toLowerCase().includes(localQ) || d.tagline.toLowerCase().includes(localQ)
      )
    }
    return []
  }, [search, activeCategory])

  const filteredExtended = useMemo(() => {
    const localQ = search.toLowerCase().trim()
    if (activeCategory === 'curated') return []
    return EXTENDED_DISEASE_LIST.filter(d => {
      const matchesSearch = !localQ || d.name.toLowerCase().includes(localQ) || d.description.toLowerCase().includes(localQ)
      const cats = categorize(d.name)
      const matchesCat = activeCategory === 'all' || cats.includes(activeCategory)
      return matchesSearch && matchesCat
    })
  }, [search, activeCategory])

  const totalCount = filteredCurated.length + filteredExtended.length

  const handleSymptomDiseaseSelect = (disease: ExtendedDiseaseEntry) => {
    setSelectedExtDisease(disease)
    setMatchedSymptoms([]) // reset since symptom checker will pass them
  }

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
        <nav className="p-4 space-y-1.5">
          {[
            { href: '/dashboard', icon: <Activity className="w-5 h-5" />, label: 'Dashboard' },
            { href: '/twin', icon: <Heart className="w-5 h-5" />, label: 'My Twin' },
            { href: '/simulator', icon: <TrendingUp className="w-5 h-5" />, label: 'Simulator' },
            { href: '/coach', icon: <MessageCircle className="w-5 h-5" />, label: 'AI Coach' },
            { href: '/reports', icon: <FileText className="w-5 h-5" />, label: 'Reports' },
            { href: '/calendar', icon: <Calendar className="w-5 h-5" />, label: 'Calendar' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 hover:border hover:border-white/10 transition-all">
              {item.icon}<span className="font-medium">{item.label}</span>
            </Link>
          ))}
          <Link href="/conditions"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
            <BookOpen className="w-5 h-5" /><span className="font-medium">Conditions</span>
          </Link>
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all">
            <Settings className="w-5 h-5" /><span className="font-medium">Settings</span>
          </Link>
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all w-full text-left">
            <LogOut className="w-5 h-5" /><span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 h-screen overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-white/70 bg-white/5 rounded-lg">
              {sidebarOpen ? <X /> : <Menu />}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Health Conditions</h1>
              <p className="text-purple-300/80 text-sm font-medium">133+ diseases · Symptoms · Medications · Diet · Workout</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full text-white/60 hover:text-white bg-white/5 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-biotech-500 flex items-center justify-center text-white font-bold ring-2 ring-white/10">U</div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto space-y-6">

          {/* Hero Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden p-8"
            style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(59,130,246,0.08), rgba(16,185,129,0.05))', border: '1px solid rgba(168,85,247,0.18)' }}
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/8 rounded-full blur-3xl transform translate-x-16 -translate-y-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/8 rounded-full blur-3xl transform -translate-x-8 translate-y-8 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 font-semibold text-sm">Disease Intelligence Library</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">What Does a Disease Do to Your Body?</h2>
              <p className="text-white/45 max-w-2xl leading-relaxed text-sm">
                Powered by 3 medical datasets · 133+ conditions · 131 unique symptoms · Evidence-based medications, diets, workout plans, and precautions.
              </p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/35">
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-400" /> {DISEASE_LIST.length} Deep-Detail Profiles</span>
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> {EXTENDED_DISEASE_LIST.length} Extended Conditions</span>
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 131 Trackable Symptoms</span>
              </div>
            </div>
          </motion.div>

          {/* Mode Toggle */}
          <div className="flex rounded-xl bg-white/5 border border-white/8 p-1 w-full max-w-md">
            <button
              onClick={() => setMode('catalog')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'catalog' ? 'bg-purple-500/25 text-purple-300 border border-purple-500/30' : 'text-white/50 hover:text-white'}`}
            >
              <BookOpen className="w-4 h-4" /> Disease Catalog
            </button>
            <button
              onClick={() => setMode('symptom-checker')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'symptom-checker' ? 'bg-blue-500/25 text-blue-300 border border-blue-500/30' : 'text-white/50 hover:text-white'}`}
            >
              <Stethoscope className="w-4 h-4" /> Symptom Checker
            </button>
          </div>

          {/* ── CATALOG MODE ─────────────────────────────── */}
          <AnimatePresence mode="wait">
            {mode === 'catalog' && (
              <motion.div key="catalog" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search conditions, symptoms, or descriptions..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-500/40 transition-all" />
                    {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"><X className="w-4 h-4" /></button>}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map(cat => (
                      <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                          activeCategory === cat.id
                            ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40'
                            : 'bg-white/5 text-white/50 border border-white/10 hover:text-white hover:bg-white/10'
                        }`}
                      >{cat.label}</button>
                    ))}
                  </div>
                </div>

                <div className="text-white/30 text-xs">{totalCount} condition{totalCount !== 1 ? 's' : ''} found</div>

                {/* Curated Section */}
                {filteredCurated.length > 0 && (
                  <div>
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                      <span className="text-yellow-400">⭐</span> Deep-Detail Profiles
                      <span className="text-white/25 font-normal">Interactive body maps · Progression · 5-tab view</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredCurated.map((d, i) => (
                        <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                          <CuratedCard disease={d} onOpen={() => setSelectedCuratedDisease(d)} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extended Section */}
                {filteredExtended.length > 0 && (
                  <div>
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                      <span>🔬</span> Extended Conditions Library
                      <span className="text-white/25 font-normal">Medications · Diets · Workout · Precautions</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {filteredExtended.map((d, i) => (
                        <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.5) }}>
                          <ExtDiseaseCard disease={d} onOpen={() => { setSelectedExtDisease(d); setMatchedSymptoms([]) }} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {totalCount === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-white/30">
                    <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No conditions found for &quot;{search}&quot;</p>
                    <button onClick={() => { setSearch(''); setActiveCategory('all') }} className="mt-3 text-purple-400 text-sm hover:underline">Clear filters</button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── SYMPTOM CHECKER MODE ─────────────────── */}
            {mode === 'symptom-checker' && (
              <motion.div key="checker" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl border border-white/8 p-6"
                style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(139,92,246,0.05))' }}
              >
                <SymptomChecker
                  onDiseaseSelect={(d) => { setSelectedExtDisease(d); setMatchedSymptoms([]) }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disclaimer */}
          <div className="rounded-xl p-4 bg-white/3 border border-white/8 flex items-start gap-3">
            <Shield className="w-4 h-4 text-white/25 flex-shrink-0 mt-0.5" />
            <p className="text-white/25 text-xs leading-relaxed">
              <strong className="text-white/40">Medical Disclaimer:</strong> BioTwin AI provides wellness risk estimates and general health education for informational purposes only. This is NOT a diagnostic tool and does NOT replace professional medical advice. Always consult a licensed healthcare provider. In an emergency, call 999 or 911 immediately.
            </p>
          </div>
        </div>
      </main>

      {/* Curated Disease Impact Modal */}
      <AnimatePresence>
        {selectedCuratedDisease && (
          <DiseaseImpactViewer disease={selectedCuratedDisease} onClose={() => setSelectedCuratedDisease(null)} />
        )}
      </AnimatePresence>

      {/* Extended Disease Panel Modal */}
      <AnimatePresence>
        {selectedExtDisease && (
          <ExtendedDiseasePanel
            disease={selectedExtDisease}
            matchedSymptoms={matchedSymptoms}
            onClose={() => setSelectedExtDisease(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
