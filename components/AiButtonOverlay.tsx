'use client'

import { Sparkles, CreditCard } from 'lucide-react'
import { Button } from '@/components/button'
import { startCheckout } from '@/lib/checkout'
import { useState, useEffect } from 'react'
import { useAiAccess } from '@/lib/use-ai-access'

interface AiButtonOverlayProps {
  children: React.ReactNode
  disabled?: boolean
  onClick?: () => void
}

export function AiButtonOverlay({ children, disabled, onClick }: AiButtonOverlayProps) {
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { valid: hasAiAccess, trialAvailable, trialUsed } = useAiAccess()

  // Prevent hydration mismatch by deferring browser-specific checks
  useEffect(() => {
    setMounted(true)
  }, [])

  // Allow clicks if user has access OR trial is available
  // Only show overlay if trial is used and no access (and mounted to prevent hydration issues)
  const shouldBlock = mounted && disabled && !hasAiAccess && !trialAvailable && trialUsed
  const shouldAllowClick = hasAiAccess || trialAvailable

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

  return (
    <div className="relative group">
      <div className={shouldBlock ? 'opacity-60 pointer-events-none' : ''}>
        {children}
      </div>
      {shouldBlock && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 dark:bg-black/80 rounded-lg backdrop-blur-sm z-10">
          <div className="text-center p-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-white mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Unlock AI for 24h — £1.99</span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePayClick}
              disabled={checkoutLoading}
              isLoading={checkoutLoading}
              className="w-full"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pay £1.99
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

