'use client'

/**
 * Single source of truth for AI access and preview state
 * Uses localStorage with:
 * - preview_end_at: number (ms epoch) - end timestamp of 90s free preview
 * - ai_unlock_until: number (ms epoch) - expiry of 24h access after payment
 */

import { PREVIEW_SECONDS } from '@/lib/funnelConfig'

const PREVIEW_END_AT_KEY = 'preview_end_at'
const AI_UNLOCK_UNTIL_KEY = 'ai_unlock_until'
const PREVIEW_DURATION_MS = PREVIEW_SECONDS * 1000 // 90 seconds

/**
 * Get preview_end_at from localStorage
 * Returns null if not set
 */
export function getPreviewEndAt(): number | null {
  if (typeof window === 'undefined') return null

  try {
    const value = localStorage.getItem(PREVIEW_END_AT_KEY)
    if (!value) return null
    
    const timestamp = parseInt(value, 10)
    if (isNaN(timestamp)) {
      localStorage.removeItem(PREVIEW_END_AT_KEY)
      return null
    }
    
    return timestamp
  } catch (error) {
    console.error('[access] Error reading preview_end_at:', error)
    return null
  }
}

/**
 * Get ai_unlock_until from localStorage
 * Returns null if not set
 */
export function getAiUnlockUntil(): number | null {
  if (typeof window === 'undefined') return null

  try {
    const value = localStorage.getItem(AI_UNLOCK_UNTIL_KEY)
    if (!value) return null
    
    const timestamp = parseInt(value, 10)
    if (isNaN(timestamp)) {
      localStorage.removeItem(AI_UNLOCK_UNTIL_KEY)
      return null
    }
    
    return timestamp
  } catch (error) {
    console.error('[access] Error reading ai_unlock_until:', error)
    return null
  }
}

/**
 * Get aiPreviewStartAt from localStorage (for backwards compatibility)
 * Calculated from preview_end_at if it exists
 * Returns null if not set
 */
export function getAiPreviewStartAt(): number | null {
  const endAt = getPreviewEndAt()
  if (!endAt) return null
  return endAt - PREVIEW_DURATION_MS
}

/**
 * Get aiPreviewEndAt (for backwards compatibility)
 * Returns preview_end_at directly
 */
export function getAiPreviewEndAt(): number | null {
  return getPreviewEndAt()
}

/**
 * Check if user has paid access (24h unlock)
 * Returns true if ai_unlock_until > Date.now()
 */
export function hasAiAccess(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const unlockUntil = getAiUnlockUntil()
    if (!unlockUntil) return false

    const now = Date.now()
    return unlockUntil > now
  } catch (error) {
    console.error('[access] Error checking hasAiAccess:', error)
    return false
  }
}

/**
 * Set AI access after successful payment
 * Sets ai_unlock_until=Date.now()+24h and clears preview_end_at
 */
export function setAiAccess(): void {
  if (typeof window === 'undefined') return

  try {
    const now = Date.now()
    const unlockUntil = now + 24 * 60 * 60 * 1000 // 24 hours

    localStorage.setItem(AI_UNLOCK_UNTIL_KEY, unlockUntil.toString())
    
    // Clear preview_end_at
    localStorage.removeItem(PREVIEW_END_AT_KEY)

    // Trigger custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('localStorageChange', {
      detail: { key: AI_UNLOCK_UNTIL_KEY, newValue: unlockUntil.toString() }
    }))
    window.dispatchEvent(new CustomEvent('localStorageChange', {
      detail: { key: PREVIEW_END_AT_KEY, newValue: null }
    }))
  } catch (error) {
    console.error('[access] Error setting AI access:', error)
    throw new Error('Could not save 24h pass. Please disable strict privacy mode.')
  }
}

/**
 * Clear AI access (but keep preview state if active)
 */
export function clearAiAccess(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(AI_UNLOCK_UNTIL_KEY)

    // Trigger custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('localStorageChange', {
      detail: { key: AI_UNLOCK_UNTIL_KEY, newValue: null }
    }))
  } catch (error) {
    console.error('[access] Error clearing AI access:', error)
  }
}

/**
 * Start preview timer on first AI button click
 * Only sets preview_end_at if not paid and preview_end_at is not already set
 * Returns the preview end timestamp
 */
export function startPreview(): number {
  if (typeof window === 'undefined') return Date.now() + PREVIEW_DURATION_MS

  try {
    // Don't start if already paid
    if (hasAiAccess()) {
      return Date.now() + PREVIEW_DURATION_MS
    }

    // Don't start if already started - check if preview_end_at exists
    const existing = getPreviewEndAt()
    if (existing) {
      return existing
    }
    
    // Start new preview: set preview_end_at = now + 90 seconds
    const now = Date.now()
    const endAt = now + PREVIEW_DURATION_MS
    localStorage.setItem(PREVIEW_END_AT_KEY, endAt.toString())

    // Trigger custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('localStorageChange', {
      detail: { key: PREVIEW_END_AT_KEY, newValue: endAt.toString() }
    }))

    return endAt
  } catch (error) {
    console.error('[access] Error starting preview:', error)
    return Date.now() + PREVIEW_DURATION_MS
  }
}

/**
 * Clear preview state from localStorage
 */
export function clearPreviewEndAt(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(PREVIEW_END_AT_KEY)

    // Trigger custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('localStorageChange', {
      detail: { key: PREVIEW_END_AT_KEY, newValue: null }
    }))
  } catch (error) {
    console.error('[access] Error clearing preview:', error)
  }
}

/**
 * Check if preview has ended
 * Returns true if preview_end_at exists and Date.now() >= preview_end_at
 */
export function isPreviewEnded(): boolean {
  const endAt = getPreviewEndAt()
  if (!endAt) return false
  return Date.now() >= endAt
}

/**
 * Get preview state based on current time
 * Returns: 'not_started' | 'active' | 'ended'
 */
export function getPreviewState(): 'not_started' | 'active' | 'ended' {
  const endAt = getPreviewEndAt()
  if (!endAt) return 'not_started'
  
  const now = Date.now()
  if (now >= endAt) return 'ended'
  return 'active'
}

/**
 * Get remaining preview time in seconds
 * Returns 0 if ended or not started
 */
export function getPreviewRemainingSeconds(): number {
  const endAt = getPreviewEndAt()
  if (!endAt) return 0
  
  const now = Date.now()
  const remaining = Math.max(0, Math.floor((endAt - now) / 1000))
  return remaining
}

/**
 * Single source of truth for AI access check
 * Returns true if:
 * - User has paid access (ai_unlock_until > now), OR
 * - Preview hasn't started yet (preview_end_at is missing), OR
 * - User is within preview window (preview_end_at exists and now < preview_end_at)
 */
export function canUseAI(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const now = Date.now()
    
    // Check for paid access first
    const unlockUntil = getAiUnlockUntil()
    if (unlockUntil && unlockUntil > now) {
      return true // Paid access is active
    }

    // Check preview state
    const previewEndAt = getPreviewEndAt()
    
    // If preview_end_at doesn't exist, preview hasn't started yet - allow AI
    if (!previewEndAt) {
      return true // Preview not started, buttons should be enabled
    }

    // Preview has started - check if still active
    if (now < previewEndAt) {
      return true // Within preview window
    }

    // Preview ended and no paid access
    return false
  } catch (error) {
    console.error('[access] Error checking canUseAI:', error)
    return false
  }
}

/**
 * Check if user has paid access (helper for clarity)
 */
export function hasPaidAccess(): boolean {
  return hasAiAccess()
}

// Legacy functions for backwards compatibility
export function setAiAccessCookie(): void {
  setAiAccess()
}

export function clearAiAccessCookie(): void {
  clearAiAccess()
}

