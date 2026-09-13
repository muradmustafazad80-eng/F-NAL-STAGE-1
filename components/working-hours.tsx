'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

type BusinessSettings = Record<string, string>

function getTodayHours(value: string) {
  const parts = value.split(';').map((part) => part.trim()).filter(Boolean)
  const isSunday = new Date().getDay() === 0
  const target = isSunday ? parts.find((part) => part.toLowerCase().startsWith('bazar')) : parts.find((part) => part.toLowerCase().startsWith('b.e'))
  return target?.split(': ').slice(1).join(': ') || '—'
}

function isCurrentlyOpen(value: string) {
  const hours = getTodayHours(value)
  const match = hours.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/)
  if (!match) return false
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const [openHour, openMinute] = match[1].split(':').map(Number)
  const [closeHour, closeMinute] = match[2].split(':').map(Number)
  return currentMinutes >= openHour * 60 + openMinute && currentMinutes < closeHour * 60 + closeMinute
}

export default function WorkingHours() {
  const [settings, setSettings] = useState<BusinessSettings>({})
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetch('/api/business-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object' && !Array.isArray(data) && !('success' in data)) {
          setSettings(data)
          setIsOpen(isCurrentlyOpen(data.working_hours || ''))
        }
      })
      .catch(() => setSettings({}))
  }, [])

  const hours = getTodayHours(settings.working_hours || '')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
      className="absolute top-24 right-4 md:top-28 md:right-8 z-50 hidden sm:block select-none pointer-events-auto group"
    >
      <div style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}>
        <div
          style={{ transform: 'rotateY(-20deg) rotateX(4deg)', transformStyle: 'preserve-3d', background: 'linear-gradient(135deg, rgba(15, 15, 15, 0.96) 0%, rgba(5, 5, 5, 0.98) 100%)' }}
          className="w-[220px] p-3.5 md:w-[280px] md:p-5 rounded-xl md:rounded-2xl border border-amber-500/10 flex items-center justify-start gap-3 md:gap-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] transition-all duration-500 group-hover:scale-105 group-hover:border-amber-500/30 relative overflow-hidden"
        >
          <div className="absolute -inset-[200%] bg-[conic-gradient(from_0deg,transparent_40%,#d97706_50%,#3b82f6_60%,transparent_70%)] animate-spin opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" style={{ animationDuration: '4s' }} />
          <div className="absolute inset-[1px] bg-neutral-950 rounded-[inherit] -z-10 transition-colors duration-300 group-hover:bg-neutral-900" />
          <div className="relative flex h-2.5 w-2.5 md:h-3 md:w-3 shrink-0 items-center justify-center">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${isOpen ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 ${isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          </div>
          <div className="flex flex-col text-left space-y-0.5 md:space-y-1">
            <span className="text-[8px] md:text-[10px] tracking-[0.25em] md:tracking-[0.35em] text-zinc-400 font-bold uppercase leading-none">
              {isOpen ? 'HAZIRDA AÇIQIQ' : 'HAZIRDA BAĞLIYIQ'}
            </span>
            <span className="text-[13px] md:text-[16px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-100 to-amber-500 font-mono tracking-wide leading-none mt-0.5">
              {hours}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
