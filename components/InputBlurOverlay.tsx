'use client'

import { Sparkles, CreditCard, Lock } from 'lucide-react'
import { Button } from '@/components/button'
import { startCheckout } from '@/lib/checkout'
import { useState, useEffect, useRef } from 'react'

interface InputBlurOverlayProps {
  onUnlock: () => void
}

export function InputBlurOverlay({ onUnlock }: InputBlurOverlayProps) {
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const handlePayClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCheckoutLoading(true)
    try {
      await startCheckout()
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
      className="absolute inset-0 flex items-center justify-center bg-black/70 dark:bg-black/85 backdrop-blur-md rounded-lg z-20 pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Free preview ended. Unlock AI access."
      tabIndex={-1}
    >
      <div className="text-center p-6 space-y-4 max-w-sm mx-auto">
        <div className="flex items-center justify-center gap-2 text-white mb-2">
          <Sparkles className="w-6 h-6" />
          <span className="text-lg font-semibold">Free preview ended</span>
        </div>
        <p className="text-white/90 text-sm mb-4">
          Unlock AI for 24h — £1.99
        </p>
        <div className="space-y-2">
          <Button
            variant="primary"
            size="md"
            onClick={handlePayClick}
            disabled={checkoutLoading}
            isLoading={checkoutLoading}
            className="w-full"
            aria-label="Unlock AI for 24h — £1.99"
          >
            <Lock className="w-4 h-4 mr-2" />
            Pay with Stripe — £1.99
          </Button>
          <p className="text-white/70 text-xs">
            Secure checkout by Stripe
          </p>
        </div>
      </div>
    </div>
  )
}



