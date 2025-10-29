'use client'

import { useState } from 'react'
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import { useCvStore } from '@/lib/cv-state'
import type { Tone } from '@/lib/cv-state'

interface SmartFillResult {
  content: string
  status: 'pending' | 'success' | 'error'
}

export default function SummaryTab() {
  const { cvData, setSummary } = useCvStore()
  const [keywords, setKeywords] = useState('')
  const [tone, setTone] = useState<Tone>('executive')
  const [isGenerating, setIsGenerating] = useState(false)
  const [smartFillResult, setSmartFillResult] = useState<SmartFillResult | null>(null)

  const handleSmartFill = async () => {
    setIsGenerating(true)
    setSmartFillResult({ content: '', status: 'pending' })
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords,
          personalInfo: cvData.personalInfo,
          tone,
          type: 'summary'
        }),
      })

      const data = await response.json()
      
      if (!response.ok || !data.ok || !data.content) {
        setSmartFillResult({ content: '', status: 'error' })
        return
      }

      setSmartFillResult({ content: data.content, status: 'success' })
    } catch (error) {
      console.error('Smart fill error:', error)
      setSmartFillResult({ content: '', status: 'error' })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApply = () => {
    if (smartFillResult?.content) {
      setSummary(smartFillResult.content)
      setSmartFillResult(null)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-graphite dark:text-platinum">Professional Summary</h2>
      
      {/* Smart Fill Section */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-violet-200 dark:border-violet-800">
        <h3 className="text-sm font-semibold mb-3 text-violet-900 dark:text-violet-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          AI Smart Fill Summary
        </h3>
        
        <div className="space-y-3">
          <textarea
            placeholder="Enter keywords: e.g., Senior Engineer, React, AWS, 5 years..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
            rows={2}
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
          
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="executive">Executive</option>
            <option value="creative">Creative</option>
            <option value="academic">Academic</option>
            <option value="technical">Technical</option>
          </select>
          
          <button
            onClick={handleSmartFill}
            disabled={isGenerating || !keywords}
            className="w-full px-4 py-2 bg-violet text-white rounded-lg hover:bg-violet/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? 'Generating...' : 'Generate Summary'}
          </button>
        </div>

        {/* Smart Fill Result */}
        {smartFillResult && (
          <div className="mt-3 space-y-2">
            {smartFillResult.status === 'success' && smartFillResult.content && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-800">
                  <p className="text-sm leading-relaxed">{smartFillResult.content}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleApply}
                    className="flex-1 px-4 py-2 bg-violet text-white rounded-lg hover:bg-violet/90 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Apply
                  </button>
                  <button
                    onClick={() => setSmartFillResult(null)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
            {smartFillResult.status === 'error' && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                Failed to generate. Please try again.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Textarea */}
      <div>
        <label className="block text-sm font-medium mb-2">Summary</label>
        <textarea
          rows={8}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          value={cvData.summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Experienced software engineer with 5+ years specializing in full-stack development and cloud architecture..."
        />
        <p className="text-sm text-gray-500 mt-2">Write a brief professional summary highlighting your expertise and career goals.</p>
      </div>
    </div>
  )
}

