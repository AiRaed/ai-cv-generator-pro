'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { VariantCard } from './VariantCard'

interface Variant {
  id: 'A' | 'B' | 'C'
  content: string
}

interface ComparePanelProps {
  variants: Variant[]
  isOpen: boolean
  onClose: () => void
  onSelect: (variant: Variant) => void
  paragraph?: boolean // If true, render content as continuous paragraph (no bullets)
}

export function ComparePanel({ variants, isOpen, onClose, onSelect, paragraph = false }: ComparePanelProps) {
  if (!isOpen || variants.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-surface rounded-3xl shadow-large max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-zinc-800 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-heading font-bold text-white">
                Compare AI Variants
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Choose the best version for your CV
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {variants.map((variant) => (
                <VariantCard
                  key={variant.id}
                  id={variant.id}
                  content={variant.content}
                  onUse={() => {
                    onSelect(variant)
                    onClose()
                  }}
                  paragraph={paragraph}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
