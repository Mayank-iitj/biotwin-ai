'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Upload, Download, Eye, Trash2, Search, Calendar, AlertCircle, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function ReportsPage() {
  const { token } = useAuth()
  const [reports, setReports] = useState<any[]>([])
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      if (!token) return
      try {
        const data = await api.getBloodReports(token)
        setReports(data)
        if (data.length > 0) {
          setSelectedReport(data[0])
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load blood reports')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [token])

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'parsed': return 'text-risk-low bg-risk-low/10'
      case 'processing': return 'text-risk-moderate bg-risk-moderate/10'
      case 'failed': return 'text-risk-high bg-risk-high/10'
      default: return 'text-white/40 bg-white/10'
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Blood Reports</h1>
          <p className="text-white/60">Upload and analyze your blood work results</p>
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
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
              <div className="glass-card p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Your Reports</h2>
                  <button className="btn-primary text-sm py-2 px-3 flex items-center gap-1">
                    <Upload className="w-4 h-4" /> Upload
                  </button>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input type="text" placeholder="Search reports..." className="input-field w-full pl-10" />
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {reports.length > 0 ? reports.map((report) => (
                    <motion.button
                      key={report.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedReport(report)}
                      className={`w-full p-3 rounded-xl text-left transition-colors ${selectedReport?.id === report.id ? 'bg-primary-500/20 border border-primary-500/30' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-medium text-sm">Blood Report</p>
                          <p className="text-white/40 text-xs">{report.report_date}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                    </motion.button>
                  )) : (
                    <p className="text-white/40 text-sm text-center py-4">No reports uploaded yet.</p>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
              <div className="glass-card p-6 h-full">
                {selectedReport ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-white">Blood Report Details</h2>
                        <p className="text-white/40 text-sm flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {selectedReport.report_date}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {selectedReport.file_url && (
                          <a href={selectedReport.file_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-white/10 text-white/60">
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                        <button className="p-2 rounded-lg hover:bg-white/10 text-risk-high">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-white font-medium mb-4">Extracted Markers</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedReport.markers && selectedReport.markers.length > 0 ? (
                        selectedReport.markers.map((marker: any) => (
                          <div key={marker.id} className="glass-card p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white/60 text-sm">{marker.marker}</span>
                              {marker.is_abnormal ? <AlertCircle className="w-4 h-4 text-risk-high" /> : <Activity className="w-4 h-4 text-risk-low" />}
                            </div>
                            <p className="text-white font-bold text-2xl">{typeof marker.value === 'number' ? marker.value.toFixed(1) : marker.value} <span className="text-sm font-normal text-white/40">{marker.unit}</span></p>
                            <div className="mt-2 text-xs text-white/40 flex justify-between">
                              <span>Ref: {marker.reference_range}</span>
                              <span className={marker.is_abnormal ? 'text-risk-high' : 'text-risk-low'}>
                                {marker.is_abnormal ? 'Abnormal' : 'Normal'}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-white/40 text-center py-8">
                          No markers found for this report.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-white/40">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a report to view details</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        <div className="mt-6 p-4 rounded-xl bg-warning/10 border border-warning/20">
          <p className="text-warning text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Blood test results should be interpreted by a qualified healthcare provider. Reference ranges may vary by laboratory.
          </p>
        </div>
      </div>
    </div>
  )
}