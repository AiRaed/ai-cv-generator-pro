'use client'

import { useCVStore } from '@/lib/cv-store'

export default function LayoutTab() {
  const { cvData, setLayout } = useCVStore()

  const layouts = [
    { id: 'minimal' as const, name: 'Minimal', desc: 'Clean and simple' },
    { id: 'modern' as const, name: 'Modern', desc: 'Contemporary design' },
    { id: 'corporate' as const, name: 'Corporate', desc: 'Professional standard' },
    { id: 'portfolio' as const, name: 'Portfolio', desc: 'Creative showcase' },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-display font-bold mb-6 text-graphite dark:text-platinum">Layout Selection</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            onClick={() => setLayout(layout.id)}
            className={`p-6 border-2 rounded-2xl text-left transition-all ${
              cvData.selectedLayout === layout.id
                ? 'border-violet bg-violet/5'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <h3 className="font-bold text-lg mb-1 text-graphite dark:text-platinum">{layout.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{layout.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

