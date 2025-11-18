'use client'

import { PREVIEW_SECONDS } from './funnelConfig'

// Single source of truth: preview start timestamp
const PREVIEW_START_TS_KEY = 'preview_start_ts'

export interface PreviewStatus {
  remainingSeconds: number
  isActive: boolean
  isEnded: boolean
}

export function getInitialPreviewStatus(now: number = Date.now()): PreviewStatus {
  if (typeof window === 'undefined') {
    // On the server we never start the timer – this will only be called on the client
    return { remainingSeconds: PREVIEW_SECONDS, isActive: false, isEnded: false }
  }

  try {
    let startTs = localStorage.getItem(PREVIEW_START_TS_KEY)

    // First successful AI render bootstraps the timer – idempotent afterwards
    if (!startTs) {
      startTs = String(now)
      localStorage.setItem(PREVIEW_START_TS_KEY, startTs)
    }

    const start = parseInt(startTs, 10)
    if (Number.isNaN(start)) {
      localStorage.removeItem(PREVIEW_START_TS_KEY)
      const resetStart = now
      localStorage.setItem(PREVIEW_START_TS_KEY, String(resetStart))
      return { remainingSeconds: PREVIEW_SECONDS, isActive: true, isEnded: false }
    }

    const elapsedSeconds = Math.floor((now - start) / 1000)
    const remainingSeconds = Math.max(0, PREVIEW_SECONDS - elapsedSeconds)

    if (remainingSeconds <= 0) {
      return { remainingSeconds: 0, isActive: false, isEnded: true }
    }

    return { remainingSeconds, isActive: true, isEnded: false }
  } catch (error) {
    console.error('[previewState] Failed to read preview start timestamp:', error)
    return { remainingSeconds: PREVIEW_SECONDS, isActive: true, isEnded: false }
  }
}

export function clearPreviewState() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(PREVIEW_START_TS_KEY)
  } catch (error) {
    console.error('[previewState] Failed to clear preview state:', error)
  }
}


