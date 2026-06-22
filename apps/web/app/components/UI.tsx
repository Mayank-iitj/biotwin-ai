'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02 } : undefined}
      className={clsx(
        'glass-card p-4',
        hover && 'cursor-pointer hover:border-primary-500/30 transition-colors',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-400 text-primary-900',
    secondary: 'bg-white/10 hover:bg-white/20 text-white',
    danger: 'bg-risk-high hover:bg-risk-high/80 text-white',
    ghost: 'bg-transparent hover:bg-white/5 text-white/70 hover:text-white'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      className={clsx(
        'rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="text-white/60 text-sm block mb-1">{label}</label>
      )}
      <input
        className={clsx(
          'input-field w-full',
          error && 'border-risk-high',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-risk-high text-sm mt-1">{error}</p>
      )}
    </div>
  )
}

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-white/10 text-white/70',
    success: 'bg-risk-low/10 text-risk-low',
    warning: 'bg-risk-moderate/10 text-risk-moderate',
    danger: 'bg-risk-high/10 text-risk-high'
  }

  return (
    <span className={clsx(
      'px-2 py-0.5 rounded-full text-xs font-medium',
      variants[variant]
    )}>
      {children}
    </span>
  )
}

interface ProgressBarProps {
  value: number
  max?: number
  variant?: 'default' | 'success' | 'warning' | 'danger'
  showLabel?: boolean
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'default',
  showLabel = false
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const colors = {
    default: 'bg-primary-500',
    success: 'bg-risk-low',
    warning: 'bg-risk-moderate',
    danger: 'bg-risk-high'
  }

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-white/60">Progress</span>
          <span className="text-white">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className={clsx('h-full rounded-full', colors[variant])}
        />
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
}

export function StatCard({ label, value, unit, trend }: StatCardProps) {
  return (
    <div className="glass-card p-4">
      <p className="text-white/40 text-sm mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        {unit && <span className="text-white/60 text-sm">{unit}</span>}
      </div>
    </div>
  )
}