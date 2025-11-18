'use client'

import { LAUNCH_PRICE_GBP, FUNNEL_STRINGS, detectFunnelLanguage } from '@/lib/funnelConfig'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface PreviewTopBarProps {
  remainingSeconds: number
  onPayClick: () => void
}

export function PreviewTopBar({ remainingSeconds, onPayClick }: PreviewTopBarProps) {
  const [lang, setLang] = useState<'en' | 'ar'>('en')

  useEffect(() => {
    setLang(detectFunnelLanguage())
  }, [])

  const strings = FUNNEL_STRINGS[lang]

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const mmss = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`

  const label = strings.previewBarLabel.replace('{{mm:ss}}', mmss)
  const cta = strings.previewCta.replace('{{price}}', LAUNCH_PRICE_GBP.toFixed(2))

  const isRtl = lang === 'ar'

  return (
    <div
      className={cn(
        'fixed z-40 inset-x-0 md:top-16 md:bottom-auto bottom-0',
        'flex justify-center px-3'
      )}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-4xl w-full rounded-t-2xl md:rounded-2xl shadow-md bg-white/95 dark:bg-gray-900/95 border border-violet-200 dark:border-violet-800 flex items-center justify-between gap-3 px-4 py-2">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
          {label}
        </span>
        <button
          type="button"
          onClick={onPayClick}
          className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-violet text-white text-sm font-semibold shadow-sm hover:bg-violet/90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-accent"
        >
          {cta}
        </button>
      </div>
    </div>
  )
}


