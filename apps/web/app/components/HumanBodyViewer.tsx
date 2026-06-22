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
      className={`relative ${className}`}
    >
      {/* Sketchfab 3D Model Embed */}
      <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-med-dark/30 to-med-dark/80 border border-med-gray-green/15 rounded-xl overflow-hidden">
        {/* 3D Model Container */}
        <div className="absolute inset-0">
          <iframe
            title="Human Body Anatomy"
            src="https://sketchfab.com/models/9b0b079953b840bc9a13f524b60041e4/embed?autostart=1&ui_infos=0&ui_inspector=0&ui_watermark=0&ui_watermark_link=0"
            allow="autoplay; fullscreen; xr-spatial-tracking"
            className="w-full h-full"
            style={{ border: 'none' }}
          />
        </div>

        {/* Organ Hotspots Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {organRiskMap.map((organ) => (
            <motion.button
              key={organ.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="absolute pointer-events-auto"
              style={{
                // Position based on organ (simplified mapping)
                left: organ.id === 'brain' ? '50%' :
                      organ.id === 'heart' ? '45%' :
                      organ.id === 'liver' ? '55%' :
                      organ.id === 'kidneys' ? '48%' :
                      organ.id === 'pancreas' ? '52%' : '50%',
                top: organ.id === 'brain' ? '12%' :
                    organ.id === 'heart' ? '28%' :
                    organ.id === 'liver' ? '38%' :
                    organ.id === 'kidneys' ? '42%' :
                    organ.id === 'pancreas' ? '36%' : '60%',
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => handleOrganClick(organ)}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    `0 0 0 0 ${getRiskColor(organ.riskBand)}`,
                    `0 0 0 8px ${getRiskColor(organ.riskBand)}00`,
                    `0 0 0 0 ${getRiskColor(organ.riskBand)}`
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: `${getRiskColor(organ.riskBand)}20`,
                  border: `2px solid ${getRiskColor(organ.riskBand)}`
                }}
              >
                <span style={{ color: getRiskColor(organ.riskBand) }}>
                  {organ.icon}
                </span>
              </motion.div>
            </motion.button>
          ))}
        </div>

        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
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