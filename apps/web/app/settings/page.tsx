'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Shield, Link2, Download, Trash2, LogOut, ChevronRight, AlertTriangle, Check, Camera, Heart } from 'lucide-react'

const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  { id: 'devices', label: 'Connected Devices', icon: Link2 },
  { id: 'data', label: 'Data Management', icon: Download },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/60">Manage your account and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="glass-card p-2">
              {SETTINGS_SECTIONS.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeSection === section.id ? 'bg-primary-500/20 text-primary-400' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                  <section.icon className="w-5 h-5" />
                  <span>{section.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
            <div className="glass-card p-6">
              {activeSection === 'profile' && (
                <>
                  <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-biotech-500 flex items-center justify-center text-white text-2xl font-bold">
                        JD
                      </div>
                      <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary-500 text-white">
                        <Camera className="w-3 h-3" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">John Doe</h3>
                      <p className="text-white/40 text-sm">john@example.com</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-white/60 text-sm">Full Name</label>
                      <input type="text" defaultValue="John Doe" className="input-field w-full mt-1" />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm">Email</label>
                      <input type="email" defaultValue="john@example.com" className="input-field w-full mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/60 text-sm">Date of Birth</label>
                        <input type="date" defaultValue="1990-06-15" className="input-field w-full mt-1" />
                      </div>
                      <div>
                        <label className="text-white/60 text-sm">Sex</label>
                        <select className="input-field w-full mt-1">
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/60 text-sm">Height (cm)</label>
                        <input type="number" defaultValue="175" className="input-field w-full mt-1" />
                      </div>
                      <div>
                        <label className="text-white/60 text-sm">Weight (kg)</label>
                        <input type="number" defaultValue="70" className="input-field w-full mt-1" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                      {saved ? <Check className="w-4 h-4" /> : null}
                      {saved ? 'Saved!' : 'Save Changes'}
                    </button>
                  </div>
                </>
              )}

              {activeSection === 'notifications' && (
                <>
                  <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>

                  <div className="space-y-4">
                    {[
                      { label: 'Risk Assessment Alerts', desc: 'Get notified when new risk assessments are available' },
                      { label: 'Health Goals Reminders', desc: 'Reminders for exercise, medication, and checkups' },
                      { label: 'Weekly Summary', desc: 'Receive a weekly health summary email' },
                      { label: 'AI Coach Messages', desc: 'Notifications for new AI Coach messages' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div>
                          <p className="text-white font-medium">{item.label}</p>
                          <p className="text-white/40 text-sm">{item.desc}</p>
                        </div>
                        <button className="w-12 h-6 rounded-full bg-primary-500 relative">
                          <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeSection === 'privacy' && (
                <>
                  <h2 className="text-xl font-semibold text-white mb-6">Privacy & Security</h2>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Two-Factor Authentication</p>
                          <p className="text-white/40 text-sm">Add an extra layer of security</p>
                        </div>
                        <button className="btn-primary text-sm">Enable</button>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Change Password</p>
                          <p className="text-white/40 text-sm">Update your account password</p>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/60">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Disclaimer Acknowledgment</p>
                          <p className="text-white/40 text-sm">You acknowledged the health disclaimer on June 15, 2026</p>
                        </div>
                        <Check className="w-5 h-5 text-risk-low" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'devices' && (
                <>
                  <h2 className="text-xl font-semibold text-white mb-6">Connected Devices</h2>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Fitbit</p>
                          <p className="text-white/40 text-sm">Last synced: 2 hours ago</p>
                        </div>
                      </div>
                      <button className="text-risk-high text-sm">Disconnect</button>
                    </div>
                    <button className="w-full p-4 rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2">
                      <Link2 className="w-4 h-4" /> Connect New Device
                    </button>
                  </div>
                </>
              )}

              {activeSection === 'data' && (
                <>
                  <h2 className="text-xl font-semibold text-white mb-6">Data Management</h2>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Export Your Data</p>
                          <p className="text-white/40 text-sm">Download all your health data</p>
                        </div>
                        <button className="btn-primary flex items-center gap-2">
                          <Download className="w-4 h-4" /> Export
                        </button>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Delete Account</p>
                          <p className="text-white/40 text-sm">Permanently delete all your data</p>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-white/10 text-risk-high">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'danger' && (
                <>
                  <h2 className="text-xl font-semibold text-risk-high mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Danger Zone
                  </h2>

                  <div className="p-4 rounded-xl bg-risk-high/10 border border-risk-high/20">
                    <p className="text-white/70 mb-4">
                      These actions are irreversible. Please proceed with caution.
                    </p>
                    <button className="px-4 py-2 rounded-lg bg-risk-high/20 text-risk-high hover:bg-risk-high/30 transition-colors flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete Account Permanently
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}