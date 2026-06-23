'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react'
import { biomarkerData, historicalHealthData } from '@/lib/mock-data'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

const SUGGESTED_QUESTIONS = [
  "What are my biggest health risks?",
  "How can I reduce my cardiovascular risk?",
  "What lifestyle changes would help most?",
  "Explain my risk assessment results"
]

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    setMessages([
      { id: 'welcome', role: 'assistant', content: "Hello! I'm your BioTwin AI Health Coach. I'm here to help you understand your health risks and provide personalized guidance based on your Digital Twin. How can I assist you today?" }
    ])
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    }
    
    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setLoading(true)

    const aiMessageId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: aiMessageId, role: 'assistant', content: '' }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          contextData: { biomarkerData, historicalHealthData }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (reader) {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') break;
              try {
                const data = JSON.parse(dataStr)
                if (data.choices?.[0]?.delta?.content) {
                  setMessages(prev => prev.map(m => 
                    m.id === aiMessageId ? { ...m, content: m.content + data.choices[0].delta.content } : m
                  ))
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => prev.map(m => 
        m.id === aiMessageId ? { ...m, content: "I'm sorry, I encountered an error processing your request." } : m
      ))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Bot className="w-8 h-8 text-biotech-400" />
            AI Health Coach
          </h1>
          <p className="text-white/60">Your personal health assistant, powered by AI</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3">
            <div className="glass-card h-[600px] flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.role === 'user' ? 'bg-primary-500' : 'bg-biotech-500'}`}>
                          {message.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                        </div>
                        <div className={`p-3 rounded-xl ${message.role === 'user' ? 'bg-primary-500/20 text-white' : 'bg-white/10 text-white'}`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {loading && (
                  <div className="flex items-center gap-2 text-white/40">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask your health coach..."
                    className="input-field flex-1"
                  />
                  <button onClick={sendMessage} disabled={loading || !input.trim()} className="btn-primary px-4">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="glass-card p-4">
              <h3 className="text-white font-medium mb-4">Suggested Questions</h3>
              <div className="space-y-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(q)
                      setTimeout(() => document.querySelector('input')?.focus(), 0)
                    }}
                    className="w-full text-left p-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-4 mt-4">
              <div className="flex items-start gap-2 text-warning">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-xs text-white/60">
                  This AI provides general wellness information. Not a substitute for professional medical advice.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}