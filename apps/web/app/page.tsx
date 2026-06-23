'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Activity, Brain, Shield, MessageCircle, TrendingUp, ChevronRight, Menu, X, Sparkles } from 'lucide-react'
import Link from 'next/link'
import HumanBodyViewer from './components/HumanBodyViewer'

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'vitals' | 'risks'>('vitals')

  const mockVitals = [
    { name: 'Heart Rate', value: '72 bpm', status: 'Optimal', change: 'Stable', color: 'text-med-lime' },
    { name: 'Blood Glucose', value: '94 mg/dL', status: 'Fasting Optimal', change: '-3%', color: 'text-med-lime' },
    { name: 'Sleep Score', value: '88/100', status: 'Good Recovery', change: '+5%', color: 'text-med-lime' },
    { name: 'Blood Pressure', value: '118/76', status: 'Normal', change: 'Stable', color: 'text-med-lime' }
  ]

  const mockRisks = [
    { disease: 'Cardiovascular Disease', risk: '12%', status: 'Low Risk', color: 'text-med-lime', bg: 'bg-med-lime/10 border-med-lime/25' },
    { disease: 'Diabetes Type II', risk: '18%', status: 'Low Risk', color: 'text-med-lime', bg: 'bg-med-lime/10 border-med-lime/25' },
    { disease: 'Hypertension', risk: '24%', status: 'Moderate Risk', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/25' },
    { disease: 'Chronic Kidney Disease', risk: '4%', status: 'Minimal Risk', color: 'text-med-lime', bg: 'bg-med-lime/10 border-med-lime/25' }
  ]

  return (
    <div className="min-h-screen bg-med-dark selection:bg-med-lime selection:text-med-dark font-sans overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-med-lime/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-med-lime/3 blur-[140px] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-med-dark/50 backdrop-blur-md border-b border-med-gray-green/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-med-lime flex items-center justify-center shadow-lg shadow-med-lime/10">
                <Shield className="w-5 h-5 text-med-dark" />
              </div>
              <span className="text-2xl font-display font-bold text-med-cream tracking-tight">BioTwin <span className="text-med-lime">AI</span></span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-10">
              <Link href="#features" className="text-med-gray-green/70 hover:text-med-lime transition-all duration-300 font-medium text-sm">Features</Link>
              <Link href="#interactive" className="text-med-gray-green/70 hover:text-med-lime transition-all duration-300 font-medium text-sm">Twin Showcase</Link>
              <Link href="#how-it-works" className="text-med-gray-green/70 hover:text-med-lime transition-all duration-300 font-medium text-sm">How it Works</Link>
              <Link href="#disclaimer" className="text-med-gray-green/70 hover:text-med-lime transition-all duration-300 font-medium text-sm">Disclaimer</Link>
            </div>

            <div className="hidden md:flex items-center">
              <Link href="/dashboard" className="px-6 py-2.5 bg-med-lime text-med-dark font-semibold text-sm rounded-full shadow-lg shadow-med-lime/15 hover:scale-105 hover:bg-med-lime/90 active:scale-95 transition-all duration-300">
                Go to Dashboard
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-med-cream p-2">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-med-gray-green/10 bg-med-dark px-4 py-6 space-y-4"
            >
              <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-med-gray-green/80 hover:text-med-lime py-2 text-base font-medium">Features</Link>
              <Link href="#interactive" onClick={() => setMobileMenuOpen(false)} className="block text-med-gray-green/80 hover:text-med-lime py-2 text-base font-medium">Twin Showcase</Link>
              <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-med-gray-green/80 hover:text-med-lime py-2 text-base font-medium">How it Works</Link>
              <Link href="#disclaimer" onClick={() => setMobileMenuOpen(false)} className="block text-med-gray-green/80 hover:text-med-lime py-2 text-base font-medium">Disclaimer</Link>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full block py-3 text-center bg-med-lime text-med-dark font-bold rounded-full">
                Go to Dashboard
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-med-gray-green/5 border border-med-gray-green/15 text-med-lime text-xs font-semibold uppercase tracking-wider mb-8"
          >
            <Sparkles className="w-4 h-4 text-med-lime" />
            Empowering Preventive Care
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-display font-bold text-med-cream leading-[1.05] tracking-tight mb-8"
          >
            Prevent Today.<br />
            <span className="text-med-lime">Protect Tomorrow.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl mx-auto text-med-gray-green/70 text-lg sm:text-xl leading-relaxed mb-12"
          >
            Construct your personalized &quot;Digital Human Twin&quot; mapping blood work, wearables, and lifestyle inputs. Predict multi-organ disease risks, simulate interventions, and discuss insights with a dedicated AI Health Coach.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-16"
          >
            <Link href="/signup" className="px-8 py-4 bg-med-lime text-med-dark font-bold rounded-full shadow-lg shadow-med-lime/20 hover:scale-105 hover:bg-med-lime/90 hover:shadow-med-lime/35 active:scale-95 transition-all duration-300 w-full sm:w-auto">
              Get Started Free
            </Link>
            <Link href="/login" className="px-8 py-4 bg-transparent text-med-cream border border-med-gray-green/30 font-bold rounded-full hover:bg-white/5 hover:border-med-cream/40 transition-all duration-300 w-full sm:w-auto">
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Interactive Twin Showcase */}
      <section id="interactive" className="py-20 border-t border-med-gray-green/10 bg-med-dark/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-med-cream mb-4">
              Your Personalized Digital Human Twin
            </h2>
            <p className="text-med-gray-green/75 max-w-2xl mx-auto">
              Interactive 3D representation that aggregates physiological metrics to estimate active organ health and disease indicators.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Visual Column */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Simulated twin avatar glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-96 rounded-full bg-med-lime/10 blur-3xl pointer-events-none" />
                <HumanBodyViewer
                  riskData={{
                    cvd: 0.12,
                    diabetes: 0.18,
                    hypertension: 0.24,
                    ckd: 0.04
                  }}
                  className="w-full shadow-2xl shadow-med-lime/5"
                />
              </div>
            </div>

            {/* Data Tabs Column */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="flex bg-med-dark p-1.5 border border-med-gray-green/10 rounded-full w-full">
                <button 
                  onClick={() => setActiveTab('vitals')}
                  className={`flex-1 py-3 text-sm font-semibold rounded-full transition-all duration-300 ${activeTab === 'vitals' ? 'bg-med-lime text-med-dark' : 'text-med-gray-green/70 hover:text-med-cream'}`}
                >
                  Vitals
                </button>
                <button 
                  onClick={() => setActiveTab('risks')}
                  className={`flex-1 py-3 text-sm font-semibold rounded-full transition-all duration-300 ${activeTab === 'risks' ? 'bg-med-lime text-med-dark' : 'text-med-gray-green/70 hover:text-med-cream'}`}
                >
                  Disease Risks
                </button>
              </div>

              <div className="glass-card p-6 min-h-[300px] flex flex-col justify-center">
                {activeTab === 'vitals' ? (
                  <div className="space-y-5">
                    <h3 className="text-lg font-display font-bold text-med-cream mb-4">Biometric Synced Telemetry</h3>
                    {mockVitals.map((vital, i) => (
                      <div key={i} className="flex justify-between items-center py-2.5 border-b border-med-gray-green/10 last:border-0">
                        <span className="text-med-gray-green/80 font-medium">{vital.name}</span>
                        <div className="text-right">
                          <span className={`block font-bold font-display ${vital.color}`}>{vital.value}</span>
                          <span className="text-xs text-med-gray-green/50">{vital.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-bold text-med-cream mb-4">ML Engine Assessment</h3>
                    {mockRisks.map((item, i) => (
                      <div key={i} className={`p-4 rounded-xl border flex justify-between items-center ${item.bg}`}>
                        <div>
                          <span className="block font-semibold text-med-cream text-sm">{item.disease}</span>
                          <span className={`text-xs ${item.color} font-medium`}>{item.status}</span>
                        </div>
                        <span className={`text-2xl font-bold font-display ${item.color}`}>{item.risk}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-med-gray-green/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-med-lime text-xs font-bold uppercase tracking-wider block mb-3">Key Features</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-med-cream">
              Innovative Healthcare Technology
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="glass-card p-8 border border-med-gray-green/15 hover:border-med-lime/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-med-lime/10 flex items-center justify-center text-med-lime mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-med-cream mb-3">Digital Human Twin</h3>
              <p className="text-med-gray-green/70 text-sm leading-relaxed">
                Interactive organ-level health display compiling your wearable biometrics and blood reports into a unified wellness twin.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="glass-card p-8 border border-med-gray-green/15 hover:border-med-lime/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-med-lime/10 flex items-center justify-center text-med-lime mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-med-cream mb-3">Disease Forecast Engine</h3>
              <p className="text-med-gray-green/70 text-sm leading-relaxed">
                Robust machine learning engine estimating future relative risks for diabetes, cardiovascular issues, hypertension, and ckd.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="glass-card p-8 border border-med-gray-green/15 hover:border-med-lime/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-med-lime/10 flex items-center justify-center text-med-lime mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-med-cream mb-3">What-If Simulator</h3>
              <p className="text-med-gray-green/70 text-sm leading-relaxed">
                Perturb key lifestyle inputs such as sleep hours, body mass index, or exercise duration to view prospective risk delta projections.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="glass-card p-8 border border-med-gray-green/15 hover:border-med-lime/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-med-lime/10 flex items-center justify-center text-med-lime mb-6">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-med-cream mb-3">AI Health Coach</h3>
              <p className="text-med-gray-green/70 text-sm leading-relaxed">
                Intelligent health conversation service driven by generative AI, strictly grounded on your twin data to guide and clarify results.
              </p>
            </motion.div>

            {/* Card 5 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="glass-card p-8 border border-med-gray-green/15 hover:border-med-lime/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-med-lime/10 flex items-center justify-center text-med-lime mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-med-cream mb-3">Blood Report Parsing</h3>
              <p className="text-med-gray-green/70 text-sm leading-relaxed">
                Upload physical lab reports directly. Our pipeline extracts biomarkers like LDL, HbA1c, and eGFR to feed risk forecasting.
              </p>
            </motion.div>

            {/* Card 6 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="glass-card p-8 border border-med-gray-green/15 hover:border-med-lime/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-med-lime/10 flex items-center justify-center text-med-lime mb-6">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-med-cream mb-3">Wearable Synced</h3>
              <p className="text-med-gray-green/70 text-sm leading-relaxed">
                Keep your Digital Twin updated continuously. Secure integrations automatically synchronize metrics from Fitbit and Apple Health.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-med-gray-green/10 bg-med-dark/20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-med-lime text-xs font-bold uppercase tracking-wider block mb-3">Process</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-med-cream">
              Three Simple Steps to Optimize Longevity
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-med-lime/10 text-med-lime border border-med-lime/25 flex items-center justify-center font-display font-bold text-xl mb-6">
                1
              </div>
              <h3 className="text-lg font-display font-bold text-med-cream mb-3">Sync &amp; Upload Data</h3>
              <p className="text-med-gray-green/70 text-sm leading-relaxed">
                Connect your wearable account and upload your latest blood work panels to instantiate the mapping database.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-med-lime/10 text-med-lime border border-med-lime/25 flex items-center justify-center font-display font-bold text-xl mb-6">
                2
              </div>
              <h3 className="text-lg font-display font-bold text-med-cream mb-3">AI Mapping</h3>
              <p className="text-med-gray-green/70 text-sm leading-relaxed">
                Our machine learning algorithms map biomarker and telemetry inputs to generate organ health scores and risk indicators.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-med-lime/10 text-med-lime border border-med-lime/25 flex items-center justify-center font-display font-bold text-xl mb-6">
                3
              </div>
              <h3 className="text-lg font-display font-bold text-med-cream mb-3">Manage &amp; Consult</h3>
              <p className="text-med-gray-green/70 text-sm leading-relaxed">
                Simulate prospective adjustments, follow customized action recommendations, and chat with your AI Coach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Empathy/Review Quote Section */}
      <section className="py-24 px-4 border-t border-med-gray-green/10 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold italic text-med-cream leading-relaxed mb-8">
            &quot;BioTwin AI helped me identify high metabolic risk indicators and make actionable shifts. Having an AI coach grounded in my data made it easy.&quot;
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-med-lime flex items-center justify-center font-bold text-med-dark text-lg">
              S
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-med-cream">Sarah Connor</p>
              <p className="text-xs text-med-gray-green/50">Early Platform Adopter</p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section id="disclaimer" className="py-20 px-4 border-t border-med-gray-green/10 bg-med-dark/30">
        <div className="max-w-3xl mx-auto">
          <div className="p-8 border border-yellow-400/25 bg-yellow-400/5 rounded-xl">
            <h3 className="text-lg font-display font-bold text-yellow-400 mb-4">⚠️ Important Wellness Notice</h3>
            <p className="text-med-gray-green/80 text-sm leading-relaxed">
              BioTwin AI provides wellness risk assessments and predictive health statistics based on input data. It is NOT a diagnostic tool and does NOT replace professional medical evaluation. Always consult a licensed healthcare provider for diagnosis, treatment, or any urgent symptoms. The AI Health Coach should not be used for medical emergencies.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-med-gray-green/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-med-lime flex items-center justify-center">
              <Shield className="w-4 h-4 text-med-dark" />
            </div>
            <span className="font-display font-semibold text-med-cream">BioTwin AI</span>
          </div>
          <p className="text-med-gray-green/40 text-xs">© 2026 BioTwin AI. All rights reserved. Prevent Today. Protect Tomorrow.</p>
        </div>
      </footer>
    </div>
  )
}