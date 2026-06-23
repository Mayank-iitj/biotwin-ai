'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
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
  Bone
} from 'lucide-react'

// Beautiful, futuristic glowing 2D Vector human body model fallback
function VectorBody() {
  return (
    <svg viewBox="0 0 200 500" className="w-full h-full max-h-[90%] mx-auto text-med-lime/40 drop-shadow-[0_0_12px_rgba(132,204,22,0.3)]">
      {/* Outer scanning circle/ring */}
      <circle cx="100" cy="250" r="220" className="fill-none stroke-med-lime/10" strokeWidth="1" strokeDasharray="5 5" />
      <circle cx="100" cy="250" r="180" className="fill-none stroke-med-lime/5" strokeWidth="1" />
      
      {/* Grid Lines */}
      <line x1="100" y1="20" x2="100" y2="480" className="stroke-med-lime/5" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="20" y1="250" x2="180" y2="250" className="stroke-med-lime/5" strokeWidth="1" strokeDasharray="3 3" />
      
      {/* Stylized Human Body Path */}
      {/* Head */}
      <circle cx="100" cy="65" r="22" className="fill-none stroke-current" strokeWidth="1.5" />
      <circle cx="100" cy="65" r="15" className="fill-none stroke-current/30" strokeWidth="1" strokeDasharray="2 2" />
      
      {/* Spine/Core */}
      <line x1="100" y1="87" x2="100" y2="260" className="stroke-current" strokeWidth="2" />
      
      {/* Neck/Collar */}
      <path d="M85 92 Q100 100 115 92" className="fill-none stroke-current" strokeWidth="1.5" />
      
      {/* Chest / Torso Outline */}
      <path d="M70 115 C70 115 50 125 50 145 C50 170 60 210 65 250 C68 270 75 280 80 300 L120 300 C125 280 132 270 135 250 C140 210 150 170 150 145 C150 125 130 115 130 115 Z" className="fill-none stroke-current" strokeWidth="1.5" />
      
      {/* Ribcage detail lines */}
      <path d="M72 150 Q100 160 128 150" className="fill-none stroke-current/40" strokeWidth="1" />
      <path d="M70 175 Q100 185 130 175" className="fill-none stroke-current/40" strokeWidth="1" />
      <path d="M68 200 Q100 210 132 200" className="fill-none stroke-current/40" strokeWidth="1" />
      <path d="M66 225 Q100 235 134 225" className="fill-none stroke-current/40" strokeWidth="1" />
      
      {/* Pelvis */}
      <path d="M78 300 Q100 315 122 300 L126 325 Q100 335 74 325 Z" className="fill-none stroke-current" strokeWidth="1.5" />
      
      {/* Left Arm */}
      <path d="M70 115 L45 200 L30 270" className="fill-none stroke-current" strokeWidth="1.5" />
      <circle cx="45" cy="200" r="3" className="fill-current" />
      <circle cx="30" cy="270" r="2" className="fill-current" />
      
      {/* Right Arm */}
      <path d="M130 115 L155 200 L170 270" className="fill-none stroke-current" strokeWidth="1.5" />
      <circle cx="155" cy="200" r="3" className="fill-current" />
      <circle cx="170" cy="270" r="2" className="fill-current" />
      
      {/* Left Leg */}
      <path d="M82 325 L78 400 L75 480" className="fill-none stroke-current" strokeWidth="1.5" />
      <circle cx="78" cy="400" r="3.5" className="fill-current" />
      
      {/* Right Leg */}
      <path d="M118 325 L122 400 L125 480" className="fill-none stroke-current" strokeWidth="1.5" />
      <circle cx="122" cy="400" r="3.5" className="fill-current" />

      {/* Brain details inside head */}
      <path d="M96 55 Q100 50 104 55 Q108 60 104 65 Q100 70 96 65 Q92 60 96 55" className="fill-none stroke-current/50" strokeWidth="1" />
      
      {/* Heart details in chest */}
      <path d="M95 132 C92 125 85 125 85 132 C85 140 95 148 95 148 C95 148 105 140 105 132 C105 125 98 125 95 132 Z" className="fill-current text-red-500/30" />
      <path d="M95 132 C92 125 85 125 85 132 C85 140 95 148 95 148 C95 148 105 140 105 132 C105 125 98 125 95 132 Z" className="fill-none stroke-red-500/80" strokeWidth="1" />
    </svg>
  )
}

interface OrganData {
  id: string
  name: string
  icon: React.ReactNode
  riskScore?: number
  riskBand?: 'low' | 'moderate' | 'high'
  description: string
  relatedDiseases: string[]
}

interface HumanBodyViewerProps {
  riskData?: {
    diabetes?: number
    cvd?: number
    hypertension?: number
    ckd?: number
    obesity?: number
  }
  onOrganClick?: (organ: OrganData) => void
  className?: string
}

// Organ definitions with body positions (normalized 0-1 coordinates)
const ORGANS: OrganData[] = [
  {
    id: 'heart',
    name: 'Heart',
    icon: <Heart className="w-4 h-4" />,
    description: 'Cardiovascular system - monitors heart health and blood flow',
    relatedDiseases: ['cvd', 'hypertension']
  },
  {
    id: 'brain',
    name: 'Brain',
    icon: <Brain className="w-4 h-4" />,
    description: 'Central nervous system - cognitive function and mental health',
    relatedDiseases: ['stroke', 'dementia']
  },
  {
    id: 'kidneys',
    name: 'Kidneys',
    icon: <Activity className="w-4 h-4" />,
    description: 'Renal system - filters blood and manages fluid balance',
    relatedDiseases: ['ckd', 'hypertension']
  },
  {
    id: 'liver',
    name: 'Liver',
    icon: <Activity className="w-4 h-4" />,
    description: 'Metabolic system - processes nutrients and filters toxins',
    relatedDiseases: ['diabetes', 'obesity']
  },
  {
    id: 'pancreas',
    name: 'Pancreas',
    icon: <Activity className="w-4 h-4" />,
    description: 'Endocrine system - produces insulin and regulates blood sugar',
    relatedDiseases: ['diabetes']
  },
  {
    id: 'bones',
    name: 'Skeleton',
    icon: <Bone className="w-4 h-4" />,
    description: 'Musculoskeletal system - provides structure and protection',
    relatedDiseases: ['osteoporosis']
  }
]

// Map disease to organ
const DISEASE_TO_ORGAN: Record<string, string> = {
  diabetes: 'pancreas',
  cvd: 'heart',
  hypertension: 'heart',
  ckd: 'kidneys',
  obesity: 'liver'
}

export default function HumanBodyViewer({
  riskData = {},
  onOrganClick,
  className = ''
}: HumanBodyViewerProps) {
  const [selectedOrgan, setSelectedOrgan] = useState<OrganData | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d')
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [loadTimedOut, setLoadTimedOut] = useState(false)

  useEffect(() => {
    // 2D fallback timeout removed to ensure 3D model is visible every time
  }, [iframeLoaded, viewMode])

  // Map risk data to organs
  const organRiskMap = ORGANS.map(organ => {
    const relatedDisease = organ.relatedDiseases[0]
    const riskScore = relatedDisease ? riskData[relatedDisease as keyof typeof riskData] : undefined

    let riskBand: 'low' | 'moderate' | 'high' = 'low'
    if (riskScore !== undefined) {
      if (riskScore < 0.2) riskBand = 'low'
      else if (riskScore < 0.5) riskBand = 'moderate'
      else riskBand = 'high'
    }

    return {
      ...organ,
      riskScore,
      riskBand
    }
  })

  const handleOrganClick = (organ: OrganData) => {
    setSelectedOrgan(organ)
    onOrganClick?.(organ)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const getRiskColor = (band?: 'low' | 'moderate' | 'high') => {
    switch (band) {
      case 'low': return '#22c55e'
      case 'moderate': return '#eab308'
      case 'high': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
    >
      {/* Sketchfab 3D Model Embed */}
      <div className="relative w-full h-full bg-gradient-to-b from-med-dark/30 to-med-dark/80 border border-med-gray-green/15 rounded-xl overflow-hidden">
        {/* Dynamic status badge when falling back to 2D */}
        {loadTimedOut && viewMode === '2d' && (
          <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-500 text-[10px] font-semibold flex items-center gap-1.5 backdrop-blur-sm">
            <Info className="w-3.5 h-3.5" />
            <span>3D Engine Offline - Loaded 2D Vector Backdrop</span>
          </div>
        )}

        {/* 3D Model Container */}
        <div className="absolute inset-0">
          {viewMode === '3d' && (
            <iframe
              title="Human Body Anatomy"
              src="https://sketchfab.com/models/9b0b079953b840bc9a13f524b60041e4/embed?autostart=1&ui_infos=0&ui_inspector=0&ui_watermark=0&ui_watermark_link=0&ui_annotations=0&camera=0"
              allow="autoplay; fullscreen; xr-spatial-tracking"
              className={`w-full h-full transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ border: 'none' }}
              onLoad={() => setIframeLoaded(true)}
            />
          )}

          {/* Show loading spinner while initializing 3D */}
          {viewMode === '3d' && !iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-med-dark/90 z-10">
              <Activity className="w-10 h-10 text-med-lime animate-pulse mb-3" />
              <div className="text-med-cream/70 text-sm font-semibold tracking-wide">Initializing 3D Engine...</div>
              <div className="text-med-gray-green/40 text-xs mt-1">Connecting to Sketchfab...</div>
            </div>
          )}

          {/* Show the interactive 2D Vector model as fallback */}
          {viewMode === '2d' && (
            <div className="absolute inset-0 flex items-center justify-center p-4 bg-med-dark/20">
              <VectorBody />
            </div>
          )}
        </div>


        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* Toggle between 3D and 2D */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setViewMode(v => v === '3d' ? '2d' : '3d')}
            className="p-2 rounded-lg bg-med-dark/75 border border-med-lime/30 backdrop-blur text-med-lime hover:bg-med-dark/90 transition-colors font-bold text-xs flex items-center justify-center"
            style={{ width: '36px', height: '36px' }}
            title={viewMode === '3d' ? "Switch to 2D Vector Model" : "Switch to 3D Model"}
          >
            {viewMode === '3d' ? '2D' : '3D'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
            className="p-2 rounded-lg bg-med-dark/70 border border-med-gray-green/10 backdrop-blur text-white hover:bg-med-dark/90 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
            className="p-2 rounded-lg bg-med-dark/70 border border-med-gray-green/10 backdrop-blur text-white hover:bg-med-dark/90 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setRotation(r => r + 45)}
            className="p-2 rounded-lg bg-med-dark/70 border border-med-gray-green/10 backdrop-blur text-white hover:bg-med-dark/90 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-med-dark/70 border border-med-gray-green/10 backdrop-blur text-white hover:bg-med-dark/90 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-risk-low" />
            <span className="text-white/60">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-risk-moderate" />
            <span className="text-white/60">Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-risk-high" />
            <span className="text-white/60">High</span>
          </div>
        </div>
      </div>

      {/* Organ Detail Panel */}
      <AnimatePresence>
        {selectedOrgan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 right-4 w-72 glass-card p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: `${getRiskColor(selectedOrgan.riskBand)}20`,
                  color: getRiskColor(selectedOrgan.riskBand)
                }}
              >
                {selectedOrgan.icon}
              </div>
              <div>
                <h3 className="font-semibold text-white">{selectedOrgan.name}</h3>
                {selectedOrgan.riskScore !== undefined && (
                  <p
                    className="text-sm"
                    style={{ color: getRiskColor(selectedOrgan.riskBand) }}
                  >
                    {selectedOrgan.riskScore > 0 ? `${(selectedOrgan.riskScore * 100).toFixed(0)}% risk` : 'No data'}
                  </p>
                )}
              </div>
            </div>
            <p className="text-white/60 text-sm mb-3">{selectedOrgan.description}</p>
            <div className="flex flex-wrap gap-1">
              {selectedOrgan.relatedDiseases.map(disease => (
                <span
                  key={disease}
                  className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/70 capitalize"
                >
                  {disease.replace('_', ' ')}
                </span>
              ))}
            </div>
            <button
              onClick={() => setSelectedOrgan(null)}
              className="mt-3 text-sm text-primary-400 hover:text-primary-300"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Loading fallback component
export function HumanBodyViewerSkeleton() {
  return (
    <div className="w-full aspect-[3/4] bg-slate-900/50 rounded-2xl animate-pulse">
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white/40">Loading 3D Model...</div>
      </div>
    </div>
  )
}