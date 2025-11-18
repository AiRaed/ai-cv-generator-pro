'use client'

import { Sparkles, CreditCard, Lock } from 'lucide-react'
import { Button } from '@/components/button'
import { startCheckout } from '@/lib/checkout'
import { LAUNCH_PRICE_GBP } from '@/lib/funnelConfig'
import { useState, useEffect, useRef } from 'react'

interface InputBlurOverlayProps {
  onUnlock: () => void
  showButton?: boolean
}

export function InputBlurOverlay({ onUnlock, showButton = true }: InputBlurOverlayProps) {
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const priceLabel = `£${LAUNCH_PRICE_GBP.toFixed(2)}`

  const handlePayClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCheckoutLoading(true)
    try {
      const success = await startCheckout()
      // If checkout succeeded, redirect will happen in startCheckout
      // If it failed (returned false), reset loading state
      if (!success) {
        setCheckoutLoading(false)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setCheckoutLoading(false)
    }
  }

  // Trap focus for accessibility
  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    const focusableElements = overlay.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusable = focusableElements[0] as HTMLElement
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable?.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable?.focus()
        }
      }
    }

    overlay.addEventListener('keydown', handleTab)
    firstFocusable?.focus()

    return () => {
      overlay.removeEventListener('keydown', handleTab)
    }
  }, [])

  return (
    <div 
      ref={overlayRef}
      className="absolute inset-0 flex items-center justify-center bg-transparent rounded-lg z-20 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label="Free preview ended. Unlock AI access."
      tabIndex={-1}
    >
      {showButton && (
        <div className="text-center p-6 space-y-4 max-w-sm mx-auto">
          <div className="flex items-center justify-center gap-2 text-white mb-2">
            <Lock className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Free preview ended</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-xs mb-4">
            Unlock AI for 24h — {priceLabel}
          </p>
          <div className="space-y-2">
            <Button
              variant="primary"
              size="md"
              onClick={handlePayClick}
              disabled={checkoutLoading}
              isLoading={checkoutLoading}
              className="w-full pointer-events-auto"
              aria-label={`Unlock AI for 24h — ${priceLabel}`}
            >
              <Lock className="w-4 h-4 mr-2" />
              Pay with Stripe — {priceLabel}
            </Button>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              Secure checkout by Stripe
            </p>
          </div>
        </div>
      )}
    </div>
  )
}



