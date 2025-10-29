'use client'

import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/button'
import { AIPreviewText } from '@/components/AIPreviewText'

interface VariantCardProps {
  id: 'A' | 'B' | 'C'
  content: string
  onUse: () => void
  paragraph?: boolean // If true, render content as continuous paragraph (no bullets)
}

export function VariantCard({ id, content, onUse, paragraph = false }: VariantCardProps) {
  // All cards use the same color scheme - no A/B/C distinction
  const headerGradient = 'from-violet-600 via-purple-600 to-indigo-600'
  const cardBg = 'bg-violet-500/10 border-violet-500/30'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-2xl border-2 shadow-md overflow-hidden ${cardBg}`}
    >
      {/* Header */}
      <div className={`px-6 py-4 bg-gradient-to-r ${headerGradient} relative`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-heading font-semibold">AI Generated</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            <AIPreviewText text={content} paragraph={paragraph} />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            onClick={onUse}
            className="flex-1 gradient-ring"
            size="sm"
          >
            <Check className="w-4 h-4 mr-2" />
            Use This
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
