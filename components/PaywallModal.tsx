'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Lock } from 'lucide-react'
import { Button } from '@/components/button'
import { redirectToCheckout } from '@/lib/stripe'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  onUnlock: () => void
}

export function PaywallModal({ isOpen, onClose, onUnlock }: PaywallModalProps) {
  const handleUnlock = async () => {
    const success = await redirectToCheckout()
    if (success) {
      onUnlock()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-accent to-purple-600 rounded-2xl flex items-center justify-center">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-heading font-bold mb-3 text-gray-900 dark:text-gray-100">
                  👀 Your AI CV is ready!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Unlock the full version for <span className="font-semibold text-violet-accent">£1.99</span>
                </p>
                
                {/* Features list */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <Sparkles className="w-4 h-4 text-violet-accent" />
                    <span>Unlimited AI generations</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <Sparkles className="w-4 h-4 text-violet-accent" />
                    <span>PDF & DOCX downloads</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <Sparkles className="w-4 h-4 text-violet-accent" />
                    <span>24-hour access</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleUnlock}
                  className="w-full bg-gradient-to-r from-violet-accent to-purple-600 hover:from-violet-accent/90 hover:to-purple-600/90 text-white font-semibold py-3 rounded-xl"
                >
                  Unlock Now – £1.99
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full"
                >
                  Maybe Later
                </Button>
              </div>

              {/* Footer note */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
                Secure payment powered by Stripe
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}


