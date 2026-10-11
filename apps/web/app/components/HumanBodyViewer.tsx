'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Heart,
  Brain,
  Activity,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  X
} from 'lucide-react'

export interface OrganData {
  id: string
  name: string
  category: 'metabolic' | 'cardiovascular' | 'renal' | 'neurological'
  icon: React.ReactNode
  x: number // SVG viewBox percentage (0 - 200)
  y: number // SVG viewBox percentage (0 - 500)
  riskScore?: number
  riskBand?: 'low' | 'moderate' | 'high'
  description: string
  clinicalDriver: string
  biomarkers: string[]
  relatedDiseases: string[]
}

interface HumanBodyViewerProps {
  riskData?: {
    diabetes?: number
    cvd?: number
    hypertension?: number
    ckd?: number
    obesity?: number
    type_2_diabetes?: number
    cardiovascular_disease?: number
  }
  onOrganClick?: (organ: OrganData) => void
  className?: string
}

const BASE_ORGANS: Omit<OrganData, 'riskScore' | 'riskBand'>[] = [
  {
    id: 'brain',
    name: 'Brain & Neurovascular',
    category: 'neurological',
    icon: <Brain className="w-4 h-4" />,
    x: 100,
    y: 72,
    description: 'Central cognitive & autonomic regulation. Evaluates cerebral perfusion and microvascular stroke risk.',
    clinicalDriver: 'Cognitive strain correlated with nocturnal hypoglycemia and glycemic variability.',
    biomarkers: ['Cognitive Index: 91/100', 'Sleep Efficiency: 84%'],
    relatedDiseases: ['stroke', 'dementia']
  },
  {
    id: 'heart',
    name: 'Heart & Coronary Arteries',
    category: 'cardiovascular',
    icon: <Heart className="w-4 h-4" />,
    x: 110,
    y: 165,
    description: 'Cardiovascular pump & arterial stiffness. Tracks hemodynamic workload, HRV, and coronary risk.',
    clinicalDriver: 'Elevated arterial stiffness exacerbated by postprandial glucose surges and sympathetic activation.',
    biomarkers: ['HRV: 34ms', 'Resting HR: 74 bpm', 'Arterial Load: Moderate'],
    relatedDiseases: ['cvd', 'hypertension']
  },
  {
    id: 'liver',
    name: 'Liver (Hepatic System)',
    category: 'metabolic',
    icon: <Activity className="w-4 h-4" />,
    x: 82,
    y: 205,
    description: 'Hepatic gluconeogenesis & lipid regulation. Models insulin clearance and fatty liver progression.',
    clinicalDriver: 'Excess hepatic glucose output during fasting windows increases baseline glycemic drift.',
    biomarkers: ['ALT/AST: Normal', 'Fasting Gluconeogenesis: +14%'],
    relatedDiseases: ['diabetes', 'obesity']
  },
  {
    id: 'pancreas',
    name: 'Pancreas (Beta-Cells)',
    category: 'metabolic',
    icon: <Activity className="w-4 h-4" />,
    x: 106,
    y: 228,
    description: 'Endocrine insulin & glucagon secretion. Primary engine for Type 2 Diabetes Digital Twin forecasting.',
    clinicalDriver: 'Beta-cell exhaustion driven by glycemic spikes >180 mg/dL and chronic insulin resistance.',
    biomarkers: ['HOMA2-IR: 2.8', 'Predicted 2h Glucose: 192 mg/dL', 'Time-in-Range: 68%'],
    relatedDiseases: ['diabetes', 'type_2_diabetes']
  },
  {
    id: 'kidneys',
    name: 'Kidneys (Renal Glomeruli)',
    category: 'renal',
    icon: <Activity className="w-4 h-4" />,
    x: 100,
    y: 252,
    description: 'Microvascular glomerular filtration. Models diabetic nephropathy risk and sodium retention.',
    clinicalDriver: 'Hyperfiltration strain exacerbated by sustained glycemic excursions above 180 mg/dL.',
    biomarkers: ['eGFR: >90 mL/min', 'Urine Albumin/Creatinine: Normal'],
    relatedDiseases: ['ckd', 'hypertension']
  }
]

export default function HumanBodyViewer({
  riskData = {},
  onOrganClick,
  className = ''
}: HumanBodyViewerProps) {
  const [selectedOrgan, setSelectedOrgan] = useState<OrganData | null>(null)
  const [hoveredOrgan, setHoveredOrgan] = useState<OrganData | null>(null)
  const [activeLayer, setActiveLayer] = useState<'all' | 'metabolic' | 'cardiovascular' | 'renal'>('all')
  const [viewMode, setViewMode] = useState<'hologram' | '3d'>('hologram')
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Map risk scores to organs dynamically
  const organRiskMap: OrganData[] = BASE_ORGANS.map(organ => {
    let score = 0.15
    if (organ.id === 'pancreas') {
      score = riskData.diabetes ?? riskData.type_2_diabetes ?? 0.72
    } else if (organ.id === 'heart') {
      score = riskData.cvd ?? riskData.cardiovascular_disease ?? riskData.hypertension ?? 0.35
    } else if (organ.id === 'liver') {
      score = riskData.obesity ?? 0.42
    } else if (organ.id === 'kidneys') {
      score = riskData.ckd ?? 0.18
    } else if (organ.id === 'brain') {
      score = 0.12
    }

    const band: 'low' | 'moderate' | 'high' = score >= 0.5 ? 'high' : score >= 0.25 ? 'moderate' : 'low'
    return {
      ...organ,
      riskScore: score,
      riskBand: band
    }
  })

  const filteredOrgans = organRiskMap.filter(organ => {
    if (activeLayer === 'all') return true
    if (activeLayer === 'metabolic') return organ.category === 'metabolic'
    if (activeLayer === 'cardiovascular') return organ.category === 'cardiovascular'
    if (activeLayer === 'renal') return organ.category === 'renal'
    return true
  })

  const getRiskColor = (band?: 'low' | 'moderate' | 'high') => {
    switch (band) {
      case 'high': return '#f43f5e' // Rose / High Alert
      case 'moderate': return '#f59e0b' // Amber / Warning
      case 'low': return '#10b981' // Emerald / Optimal
      default: return '#06b6d4'
    }
  }

  const getRiskBg = (band?: 'low' | 'moderate' | 'high') => {
    switch (band) {
      case 'high': return 'bg-rose-500/15 border-rose-500/30 text-rose-300'
      case 'moderate': return 'bg-amber-500/15 border-amber-500/30 text-amber-300'
      case 'low': return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
      default: return 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
    }
  }

  const handleSelectOrgan = (organ: OrganData) => {
    setSelectedOrgan(organ)
    onOrganClick?.(organ)
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[460px] rounded-2xl bg-neutral-950 border border-neutral-800/80 overflow-hidden flex flex-col ${className}`}
    >
      {/* Top HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
            <span>DIGITAL TWIN V4.2</span>
          </div>

          {/* Layer Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-neutral-800">
            {(['all', 'metabolic', 'cardiovascular', 'renal'] as const).map(layer => (
              <button
                key={layer}
                onClick={() => setActiveLayer(layer)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium capitalize transition-all ${
                  activeLayer === layer
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {layer}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setViewMode(v => v === 'hologram' ? '3d' : 'hologram')}
            className="px-3 py-1 rounded-lg bg-neutral-900/90 border border-neutral-700/80 text-white text-xs font-semibold hover:bg-neutral-800 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>{viewMode === 'hologram' ? 'Switch to 3D' : 'Hologram View'}</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center p-4 overflow-hidden select-none">
        {/* Background futuristic grid & radar lines */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-neutral-950 to-black pointer-events-none" />
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none" 
          style={{
            backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {viewMode === '3d' ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <iframe
              title="3D Anatomy Viewer"
              src="https://sketchfab.com/models/9b0b079953b840bc9a13f524b60041e4/embed?autostart=1&ui_infos=0&ui_inspector=0&ui_watermark=0&ui_watermark_link=0&ui_annotations=0&camera=0"
              allow="autoplay; fullscreen; xr-spatial-tracking"
              className={`w-full h-full rounded-xl transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ border: 'none' }}
              onLoad={() => setIframeLoaded(true)}
            />
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                <Activity className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
                <span className="text-white text-sm font-medium">Connecting 3D Rendering Engine...</span>
                <button
                  onClick={() => setViewMode('hologram')}
                  className="mt-3 text-xs text-neutral-400 underline hover:text-white"
                >
                  Return to Hologram Avatar
                </button>
              </div>
            )}
          </div>
        ) : (
          /* High-Fidelity Glowing Holographic Avatar */
          <motion.div
            style={{ scale: zoom, rotate: rotation }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative w-full h-full max-h-[520px] flex items-center justify-center"
          >
            <svg
              viewBox="0 0 200 500"
              className="w-full h-full max-h-[480px] drop-shadow-[0_0_25px_rgba(6,182,212,0.35)]"
            >
              <defs>
                {/* Hologram body gradients */}
                <linearGradient id="bodyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                </linearGradient>

                <linearGradient id="circulatoryGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                </linearGradient>

                {/* Laser scan line effect */}
                <linearGradient id="scanBeam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Scanning HUD Rings */}
              <circle cx="100" cy="250" r="190" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="6 6" opacity="0.25" />
              <circle cx="100" cy="250" r="140" fill="none" stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.2" />

              {/* Horizontal Medical Calibrations */}
              <line x1="20" y1="72" x2="180" y2="72" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.15" />
              <line x1="20" y1="165" x2="180" y2="165" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.15" />
              <line x1="20" y1="228" x2="180" y2="228" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.15" />

              {/* Holographic Silhouette Contours */}
              {/* Head */}
              <ellipse cx="100" cy="72" rx="22" ry="28" fill="url(#bodyGlow)" fillOpacity="0.2" stroke="#06b6d4" strokeWidth="1.6" />
              
              {/* Neck & Shoulders */}
              <path
                d="M 92 98 L 92 110 L 60 128 L 52 175 L 45 250 L 52 250 L 58 185 L 68 140 L 80 135 L 80 270 L 68 285 L 64 390 L 72 475 L 84 475 L 88 380 L 96 295 L 104 295 L 112 380 L 116 475 L 128 475 L 136 390 L 132 285 L 120 270 L 120 135 L 132 140 L 142 185 L 148 250 L 155 250 L 148 175 L 140 128 L 108 110 L 108 98 Z"
                fill="url(#bodyGlow)"
                fillOpacity="0.12"
                stroke="#06b6d4"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />

              {/* Internal Vascular Spine & Arteries */}
              <path
                d="M 100 105 L 100 280 M 100 165 C 108 175, 120 185, 124 230 M 100 165 C 92 175, 80 185, 76 230 M 100 275 L 84 390 M 100 275 L 116 390"
                fill="none"
                stroke="url(#circulatoryGlow)"
                strokeWidth="1.2"
                strokeDasharray="4 3"
                opacity="0.6"
              />

              {/* Real-Time Laser Scan Line Traveling Down Silhouette */}
              <rect x="30" y="40" width="140" height="18" fill="url(#scanBeam)">
                <animate
                  attributeName="y"
                  values="40;460;40"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </rect>

              {/* Interactive Organ Hotspots */}
              {filteredOrgans.map(organ => {
                const color = getRiskColor(organ.riskBand)
                const isSelected = selectedOrgan?.id === organ.id
                const isHovered = hoveredOrgan?.id === organ.id

                return (
                  <g
                    key={organ.id}
                    className="cursor-pointer transition-transform"
                    onClick={() => handleSelectOrgan(organ)}
                    onMouseEnter={() => setHoveredOrgan(organ)}
                    onMouseLeave={() => setHoveredOrgan(null)}
                  >
                    {/* Pulsing Radar Ring for Elevated Risk */}
                    {organ.riskBand === 'high' && (
                      <circle
                        cx={organ.x}
                        cy={organ.y}
                        r="18"
                        fill="none"
                        stroke={color}
                        strokeWidth="1.5"
                        opacity="0.7"
                      >
                        <animate
                          attributeName="r"
                          values="8;24;8"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.8;0;0.8"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Outer Node Halo */}
                    <circle
                      cx={organ.x}
                      cy={organ.y}
                      r={isSelected ? 14 : isHovered ? 12 : 9}
                      fill={color}
                      fillOpacity={isSelected ? 0.35 : 0.2}
                      stroke={color}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      className="transition-all duration-300"
                    />

                    {/* Inner Core */}
                    <circle
                      cx={organ.x}
                      cy={organ.y}
                      r={isSelected ? 6 : 4.5}
                      fill={color}
                      className="drop-shadow-[0_0_8px_currentColor]"
                    />

                    {/* Pointer Line & Label */}
                    <line
                      x1={organ.x + (organ.x > 100 ? 8 : -8)}
                      y1={organ.y}
                      x2={organ.x + (organ.x > 100 ? 26 : -26)}
                      y2={organ.y}
                      stroke={color}
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      opacity="0.8"
                    />

                    <text
                      x={organ.x + (organ.x > 100 ? 30 : -30)}
                      y={organ.y + 4}
                      textAnchor={organ.x > 100 ? 'start' : 'end'}
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      className="select-none"
                    >
                      {organ.name.split(' ')[0]}
                      <tspan
                        dx="4"
                        fill={color}
                        fontSize="8"
                      >
                        {Math.round((organ.riskScore || 0) * 100)}%
                      </tspan>
                    </text>
                  </g>
                )
              })}
            </svg>
          </motion.div>
        )}
      </div>

      {/* Floating Organ Inspector Drawer */}
      <AnimatePresence>
        {selectedOrgan && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-84 z-30 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/80 rounded-xl p-4 shadow-2xl text-white"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                  style={{
                    backgroundColor: `${getRiskColor(selectedOrgan.riskBand)}25`,
                    color: getRiskColor(selectedOrgan.riskBand)
                  }}
                >
                  {selectedOrgan.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{selectedOrgan.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRiskBg(selectedOrgan.riskBand)}`}>
                      {selectedOrgan.riskBand?.toUpperCase()} STRAIN
                    </span>
                    <span className="text-xs font-mono text-neutral-400">
                      Score: {Math.round((selectedOrgan.riskScore || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrgan(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2.5 space-y-2 text-xs">
              <p className="text-neutral-300 leading-relaxed">{selectedOrgan.description}</p>
              
              <div className="p-2.5 rounded-lg bg-black/50 border border-neutral-800 space-y-1">
                <div className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Clinical Driver</span>
                </div>
                <p className="text-neutral-400 text-[11px] leading-tight">{selectedOrgan.clinicalDriver}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Target Biomarkers</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {selectedOrgan.biomarkers.map((b, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 text-[11px] font-mono">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-xs">
              <span className="text-neutral-400 text-[11px]">Telemetry Synchronized</span>
              <button
                onClick={() => setSelectedOrgan(null)}
                className="px-3 py-1 bg-white text-black font-semibold rounded-lg text-xs hover:bg-neutral-200 transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Status Bar */}
      <div className="p-3 bg-neutral-900/80 border-t border-neutral-800/80 flex items-center justify-between text-xs z-10">
        <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Optimal (&lt;25%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Moderate (25-50%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" /> High (&gt;50%)
          </span>
        </div>

        <div className="flex items-center gap-1 text-neutral-400">
          <button
            onClick={() => setZoom(z => Math.min(z + 0.15, 1.8))}
            className="p-1 hover:text-white rounded hover:bg-neutral-800"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.15, 0.7))}
            className="p-1 hover:text-white rounded hover:bg-neutral-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setZoom(1); setRotation(0); }}
            className="p-1 hover:text-white rounded hover:bg-neutral-800"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function HumanBodyViewerSkeleton() {
  return (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-neutral-950/80 border border-neutral-800 rounded-xl animate-pulse">
      <div className="text-center text-xs text-neutral-500 font-mono">
        <div className="w-12 h-12 mx-auto mb-2 rounded-full border-2 border-neutral-700 border-t-white animate-spin" />
        <span>Rendering Anatomical Digital Twin...</span>
      </div>
    </div>
  )
}