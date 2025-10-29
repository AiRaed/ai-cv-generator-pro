'use client'

import { useState, useEffect, useCallback } from 'react'

const TOKEN_KEY = 'ai_pass_token'
const TOKEN_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

interface PaywallState {
  isUnlocked: boolean
  isLoading: boolean
  showModal: boolean
  timeRemaining: number | null
}

export const usePaywall = () => {
  const [state, setState] = useState<PaywallState>({
    isUnlocked: false,
    isLoading: true,
    showModal: false,
    timeRemaining: null,
  })

  // Check if token is valid
  const validateToken = useCallback(() => {
    if (typeof window === 'undefined') return false

    try {
      const tokenData = localStorage.getItem(TOKEN_KEY)
      if (!tokenData) return false

      const { timestamp } = JSON.parse(tokenData)
      const now = Date.now()
      const isValid = now - timestamp < TOKEN_DURATION

      if (!isValid) {
        localStorage.removeItem(TOKEN_KEY)
        return false
      }

      // Calculate time remaining
      const timeRemaining = TOKEN_DURATION - (now - timestamp)
      return { isValid: true, timeRemaining }
    } catch (error) {
      console.error('Error validating token:', error)
      localStorage.removeItem(TOKEN_KEY)
      return false
    }
  }, [])

  // Initialize paywall state on mount
  useEffect(() => {
    const tokenValidation = validateToken()
    
    if (tokenValidation && typeof tokenValidation === 'object') {
      setState({
        isUnlocked: true,
        isLoading: false,
        showModal: false,
        timeRemaining: tokenValidation.timeRemaining,
      })
    } else {
      setState({
        isUnlocked: false,
        isLoading: false,
        showModal: false,
        timeRemaining: null,
      })
    }
  }, [validateToken])

  // Update time remaining every minute
  useEffect(() => {
    if (!state.isUnlocked || !state.timeRemaining) return

    const interval = setInterval(() => {
      const tokenValidation = validateToken()
      if (tokenValidation && typeof tokenValidation === 'object') {
        setState(prev => ({
          ...prev,
          timeRemaining: tokenValidation.timeRemaining,
        }))
      } else {
        setState(prev => ({
          ...prev,
          isUnlocked: false,
          timeRemaining: null,
        }))
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [state.isUnlocked, state.timeRemaining, validateToken])

  // Set token after successful payment
  const setToken = useCallback(() => {
    if (typeof window === 'undefined') return

    const tokenData = {
      timestamp: Date.now(),
    }

    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData))
    
    setState(prev => ({
      ...prev,
      isUnlocked: true,
      showModal: false,
      timeRemaining: TOKEN_DURATION,
    }))
  }, [])

  // Show paywall modal
  const showPaywallModal = useCallback(() => {
    if (state.isUnlocked) return false
    setState(prev => ({ ...prev, showModal: true }))
    return true
  }, [state.isUnlocked])

  // Hide paywall modal
  const hidePaywallModal = useCallback(() => {
    setState(prev => ({ ...prev, showModal: false }))
  }, [])

  // Check if action should be blocked
  const shouldBlockAction = useCallback(() => {
    if (state.isLoading) return true
    if (state.isUnlocked) return false
    return true
  }, [state.isLoading, state.isUnlocked])

  // Format time remaining for display
  const formatTimeRemaining = useCallback(() => {
    if (!state.timeRemaining) return null

    const hours = Math.floor(state.timeRemaining / (1000 * 60 * 60))
    const minutes = Math.floor((state.timeRemaining % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    } else {
      return `${minutes}m remaining`
    }
  }, [state.timeRemaining])

  return {
    ...state,
    setToken,
    showPaywallModal,
    hidePaywallModal,
    shouldBlockAction,
    formatTimeRemaining,
  }
}


