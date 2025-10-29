'use client'

/**
 * Helper functions and hooks for 24h AI access management
 * Uses localStorage with ai_access_until (ISO timestamp) and ai_access_source
 */

const AI_ACCESS_UNTIL_KEY = 'ai_access_until'
const AI_ACCESS_SOURCE_KEY = 'ai_access_source'
const AI_TRIAL_USED_KEY = 'ai_trial_used'

export interface AiAccessInfo {
  valid: boolean
  expiresAt?: number
  remainingMs?: number
  source?: string
  trialAvailable?: boolean
  trialUsed?: boolean
}

/**
 * Get AI access status from localStorage
 * Returns: { valid: boolean, expiresAt?: number, remainingMs?: number, source?: string, trialAvailable?: boolean, trialUsed?: boolean }
 */
export function getAiAccess(): AiAccessInfo {
  if (typeof window === 'undefined') {
    return { valid: false, trialAvailable: false, trialUsed: false }
  }

  try {
    // First check if user has active paid access
    const untilStr = localStorage.getItem(AI_ACCESS_UNTIL_KEY)
    if (untilStr) {
      const expiresAt = Number.parseInt(untilStr, 10)
      if (!Number.isNaN(expiresAt)) {
        const now = Date.now()
        const remainingMs = expiresAt - now

        // Check if expired (account for clock skew: if less than 1 minute left, consider expired)
        if (remainingMs >= 60 * 1000) {
          const source = localStorage.getItem(AI_ACCESS_SOURCE_KEY) || undefined
          return {
            valid: true,
            expiresAt,
            remainingMs,
            source,
            trialAvailable: false,
            trialUsed: undefined,
          }
        } else {
          // Expired, clean up
          localStorage.removeItem(AI_ACCESS_UNTIL_KEY)
          localStorage.removeItem(AI_ACCESS_SOURCE_KEY)
        }
      } else {
        // Invalid format, clean up
        localStorage.removeItem(AI_ACCESS_UNTIL_KEY)
        localStorage.removeItem(AI_ACCESS_SOURCE_KEY)
      }
    }

    // No active paid access - check trial status
    const trialUsed = localStorage.getItem(AI_TRIAL_USED_KEY) === 'true'
    return {
      valid: false,
      trialAvailable: !trialUsed,
      trialUsed: trialUsed,
    }
  } catch (error) {
    console.error('[AI Access] Error reading from localStorage:', error)
    // If localStorage is blocked (private mode, etc.), return invalid
    return { valid: false, trialAvailable: false, trialUsed: false }
  }
}

/**
 * Set AI access for 24 hours from now
 */
export function setAiAccess(source: string = 'stripe'): void {
  if (typeof window === 'undefined') return

  try {
    const now = Date.now()
    const expiresAt = now + 24 * 60 * 60 * 1000 // 24 hours

    localStorage.setItem(AI_ACCESS_UNTIL_KEY, expiresAt.toString())
    localStorage.setItem(AI_ACCESS_SOURCE_KEY, source)

    // Trigger custom event for same-tab updates (storage event only fires cross-tab)
    window.dispatchEvent(new CustomEvent('localStorageChange', {
      detail: { key: AI_ACCESS_UNTIL_KEY, newValue: expiresAt.toString() }
    }))
  } catch (error) {
    console.error('[AI Access] Error writing to localStorage:', error)
    throw new Error('Could not save 24h pass. Please disable strict privacy mode.')
  }
}

/**
 * Clear AI access (but keep trial status)
 */
export function clearAiAccess(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(AI_ACCESS_UNTIL_KEY)
  localStorage.removeItem(AI_ACCESS_SOURCE_KEY)

  // Trigger custom event for same-tab updates
  window.dispatchEvent(new CustomEvent('localStorageChange', {
    detail: { key: AI_ACCESS_UNTIL_KEY, newValue: null }
  }))
}

/**
 * Check if trial is available (not used yet)
 */
export function isTrialAvailable(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(AI_TRIAL_USED_KEY) !== 'true'
  } catch {
    return false
  }
}

/**
 * Mark trial as used
 */
export function markTrialUsed(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(AI_TRIAL_USED_KEY, 'true')
    // Trigger custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('localStorageChange', {
      detail: { key: AI_TRIAL_USED_KEY, newValue: 'true' }
    }))
  } catch (error) {
    console.error('[AI Access] Error marking trial as used:', error)
  }
}

/**
 * Format remaining time as "HH:MM" or null if expired
 */
export function formatTimeRemaining(remainingMs?: number): string | null {
  if (!remainingMs || remainingMs < 0) return null

  const hours = Math.floor(remainingMs / (1000 * 60 * 60))
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

