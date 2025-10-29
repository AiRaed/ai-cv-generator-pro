'use client'

import { useState } from 'react'
import { Sparkles, Wand2, GitCompare, Loader2 } from 'lucide-react'
import { useCVStore } from '@/lib/cv-store'

export default function AIEnginePanel() {
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'generate' | 'rewrite' | 'compare'>('generate')
  const [rewriteStyle, setRewriteStyle] = useState<'enhance' | 'executive' | 'creative' | 'academic'>('enhance')
  const [keywords, setKeywords] = useState('')
  const { setGeneratedCV } = useCVStore()

  const handleGenerate = async () => {
    if (!keywords.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords }),
      })
      const data = await response.json()
      setGeneratedCV(data.generatedCV)
    } catch (error) {
      console.error('Error generating CV:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRewrite = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style: rewriteStyle }),
      })
      const data = await response.json()
      setGeneratedCV(data.rewrittenCV)
    } catch (error) {
      console.error('Error rewriting CV:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompare = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      setGeneratedCV(data.comparison)
    } catch (error) {
      console.error('Error comparing CV:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-display font-bold mb-6 text-graphite dark:text-platinum">AI Engine</h2>
      
      {/* Mode Selection */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('generate')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
            mode === 'generate' ? 'bg-violet text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Sparkles size={16} className="inline mr-2" />
          Generate
        </button>
        <button
          onClick={() => setMode('rewrite')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
            mode === 'rewrite' ? 'bg-violet text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Wand2 size={16} className="inline mr-2" />
          Rewrite
        </button>
        <button
          onClick={() => setMode('compare')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
            mode === 'compare' ? 'bg-violet text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <GitCompare size={16} className="inline mr-2" />
          Compare
        </button>
      </div>

      {/* Generate Mode */}
      {mode === 'generate' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Keywords</label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., Senior Software Engineer, React, TypeScript, 5 years experience..."
            />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              💡 Type a few keywords (e.g., graphic design, leadership, problem solving) and AI will create a brand-new summary.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !keywords.trim()}
            className="w-full px-6 py-3 bg-violet text-white rounded-lg hover:bg-violet/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            Generate Summary from Keywords
          </button>
        </div>
      )}

      {/* Rewrite Mode */}
      {mode === 'rewrite' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rewriting Style</label>
            <select
              value={rewriteStyle}
              onChange={(e) => setRewriteStyle(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="enhance">Enhance (Professional)</option>
              <option value="executive">Executive Tone</option>
              <option value="creative">Creative Portfolio</option>
              <option value="academic">Academic Formal</option>
            </select>
          </div>
          <button
            onClick={handleRewrite}
            disabled={loading}
            className="w-full px-6 py-3 bg-violet text-white rounded-lg hover:bg-violet/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Wand2 />}
            AI Rewrite
          </button>
        </div>
      )}

      {/* Compare Mode */}
      {mode === 'compare' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generate 3 distinct CV variations and see them side-by-side for comparison.
          </p>
          <button
            onClick={handleCompare}
            disabled={loading}
            className="w-full px-6 py-3 bg-violet text-white rounded-lg hover:bg-violet/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <GitCompare />}
            Generate Comparison
          </button>
        </div>
      )}

      {/* Pro Badge */}
      <div className="mt-6 p-4 bg-violet/10 border border-violet/30 rounded-lg">
        <p className="text-sm font-medium text-violet">✨ Pro Feature</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Unlimited AI generations</p>
      </div>
    </div>
  )
}

