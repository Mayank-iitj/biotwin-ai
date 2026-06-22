'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Pill, Activity, Heart, User, Plus, AlertCircle } from 'lucide-react'

const MOCK_EVENTS = [
  { id: '1', title: 'Annual Physical', date: '2026-06-28', time: '10:00', type: 'appointment', color: 'primary' },
  { id: '2', title: 'Blood Work Fast', date: '2026-06-28', time: '08:00', type: 'reminder', color: 'warning' },
  { id: '3', title: 'Medication Reminder', date: '2026-06-22', time: '09:00', type: 'medication', color: 'biotech' },
  { id: '4', title: 'Exercise Goal', date: '2026-06-22', time: '18:00', type: 'goal', color: 'risk-low' },
  { id: '5', title: 'Follow-up Check', date: '2026-07-15', time: '14:00', type: 'appointment', color: 'primary' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 22)) // June 2026
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-22')
  const [events] = useState(MOCK_EVENTS)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const formatDate = (day: number) => {
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return `${currentDate.getFullYear()}-${month}-${dayStr}`
  }

  const getEventsForDate = (dateStr: string) => {
    return events.filter(e => e.date === dateStr)
  }

  const getEventColor = (color: string) => {
    switch(color) {
      case 'primary': return 'bg-primary-500'
      case 'warning': return 'bg-risk-moderate'
      case 'biotech': return 'bg-biotech-500'
      case 'risk-low': return 'bg-risk-low'
      default: return 'bg-white/40'
    }
  }

  const days = getDaysInMonth(currentDate)

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Health Calendar</h1>
          <p className="text-white/60">Track appointments, reminders, and health goals</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date(2026, 5, 22))}
                    className="px-3 py-1 rounded-lg hover:bg-white/10 text-white/60 text-sm"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Days header */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="text-center text-white/40 text-sm font-medium py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dateStr = day ? formatDate(day) : null
                  const dayEvents = day ? getEventsForDate(dateStr) : []
                  const isSelected = day && dateStr === selectedDate
                  const isToday = day && dateStr === '2026-06-22'

                  return (
                    <button
                      key={index}
                      onClick={() => day && setSelectedDate(dateStr)}
                      disabled={!day}
                      className={`aspect-square p-1 rounded-lg transition-colors ${isSelected ? 'bg-primary-500/30' : isToday ? 'bg-white/10' : 'hover:bg-white/5'} ${!day && 'invisible'}`}
                    >
                      <span className={`text-sm ${isSelected ? 'text-white font-bold' : isToday ? 'text-primary-400' : 'text-white/70'}`}>
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <div className="flex gap-0.5 mt-1 justify-center">
                          {dayEvents.slice(0, 3).map(e => (
                            <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${getEventColor(e.color)}`} />
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Events sidebar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">
                  {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
                </h3>
                <button className="p-2 rounded-lg hover:bg-white/10 text-primary-400">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {getEventsForDate(selectedDate).map(event => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-3 flex items-start gap-3"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${getEventColor(event.color)}`} />
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{event.title}</p>
                      <p className="text-white/40 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {event.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {selectedDate && getEventsForDate(selectedDate).length === 0 && (
                  <p className="text-white/40 text-sm text-center py-4">No events scheduled</p>
                )}
              </div>
            </div>

            {/* Upcoming */}
            <div className="glass-card p-4 mt-4">
              <h3 className="text-white font-medium mb-4">Upcoming Events</h3>
              <div className="space-y-2">
                {events.slice(0, 4).map(event => (
                  <div key={event.id} className="flex items-center justify-between text-sm">
                    <span className="text-white/70">{event.title}</span>
                    <span className="text-white/40">{new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-warning/10 border border-warning/20">
          <p className="text-warning text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            This calendar is for informational purposes only. Always confirm appointments with your healthcare provider.
          </p>
        </div>
      </div>
    </div>
  )
}