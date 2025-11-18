'use client'

import { FUNNEL_STRINGS, detectFunnelLanguage } from '@/lib/funnelConfig'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'

interface AccessCountdownBarProps {
  remainingMs: number | undefined
}

export function AccessCountdownBar({ remainingMs }: AccessCountdownBarProps) {
  const [lang, setLang] = useState<'en' | 'ar'>('en')

  useEffect(() => {
    setLang(detectFunnelLanguage())
  }, [])

  const strings = FUNNEL_STRINGS[lang]

  const hhmmss = useMemo(() => {
    if (!remainingMs || remainingMs <= 0) return '00:00:00'
    const totalSeconds = Math.floor(remainingMs / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':')
  }, [remainingMs])

  const label = strings.accessCountdownLabel.replace('{{hh:mm:ss}}', hhmmss)
  const isRtl = lang === 'ar'

  return (
    <div
      className={cn(
        'fixed z-30 inset-x-0 md:top-16 md:bottom-auto bottom-0',
        'flex justify-center px-3 pointer-events-none'
      )}
      dir={isRtl ? 'rtl' : 'ltr'}
      aria-live="polite"
    >
      <div className="max-w-4xl w-full rounded-t-2xl md:rounded-2xl shadow bg-violet-600 text-white flex items-center justify-center px-4 py-2 text-sm font-medium pointer-events-auto">
        {label}
      </div>
    </div>
  )
}


