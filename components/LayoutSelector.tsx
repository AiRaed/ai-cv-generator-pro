'use client'

import { motion } from 'framer-motion'
import { Layout } from 'lucide-react'

interface LayoutSelectorProps {
  selectedLayout: 'minimal' | 'modern' | 'corporate' | 'portfolio'
  onSelect: (layout: 'minimal' | 'modern' | 'corporate' | 'portfolio') => void
}

const layouts = [
  { id: 'minimal' as const, label: 'Minimal', icon: '●' },
  { id: 'modern' as const, label: 'Modern', icon: '◆' },
  { id: 'corporate' as const, label: 'Corporate', icon: '◼' },
  { id: 'portfolio' as const, label: 'Portfolio', icon: '◯' },
]

export function LayoutSelector({ selectedLayout, onSelect }: LayoutSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Layout className="w-4 h-4" />
        Layout Style
      </h3>
      
      {/* Segmented Control */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            onClick={() => onSelect(layout.id)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedLayout === layout.id
                ? 'bg-white dark:bg-gray-900 text-violet-accent shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {layout.label}
          </button>
        ))}
      </div>

      {/* Preview hints */}
      <div className="grid grid-cols-4 gap-2">
        {layouts.map((layout) => (
          <motion.div
            key={layout.id}
            initial={false}
            animate={{
              scale: selectedLayout === layout.id ? 1.05 : 1,
              opacity: selectedLayout === layout.id ? 1 : 0.6,
            }}
            className={`relative aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${
              selectedLayout === layout.id
                ? 'border-violet-accent bg-violet-accent/10'
                : 'border-zinc-800 bg-gray-50 dark:bg-gray-900'
            }`}
          >
            <div className="text-2xl">{layout.icon}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
