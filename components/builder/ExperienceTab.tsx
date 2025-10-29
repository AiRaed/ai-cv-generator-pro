'use client'

import { useState } from 'react'
import { Plus, Trash2, BarChart3, CheckCircle2, AlertCircle } from 'lucide-react'
import { useCvStore } from '@/lib/cv-state'
import { DescriptionText } from '@/components/DescriptionText'
import { AIPreviewText } from '@/components/AIPreviewText'

interface QuantificationResult {
  original: string
  quantified: string
}

export default function ExperienceTab() {
  const { cvData, setExperiences } = useCvStore()
  const [isAdding, setIsAdding] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    description: '',
  })
  const [quantifying, setQuantifying] = useState<number | null>(null)
  const [quantificationResult, setQuantificationResult] = useState<{ expIndex: number; result: QuantificationResult } | null>(null)

  const handleQuantify = async (expIndex: number) => {
    setQuantifying(expIndex)
    
    try {
      const exp = cvData.experiences[expIndex]
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: exp.description,
          mode: 'quantify'
        }),
      })

      const data = await response.json()
      
      if (!response.ok || !data.ok || !data.content) {
        alert('Failed to quantify achievements')
        return
      }

      setQuantificationResult({
        expIndex,
        result: {
          original: exp.description,
          quantified: data.content
        }
      })
    } catch (error) {
      console.error('Quantify error:', error)
      alert('Failed to quantify achievements')
    } finally {
      setQuantifying(null)
    }
  }

  const handleApplyQuantification = () => {
    if (quantificationResult) {
      const updatedExp = [...cvData.experiences]
      updatedExp[quantificationResult.expIndex] = {
        ...updatedExp[quantificationResult.expIndex],
        description: quantificationResult.result.quantified
      }
      setExperiences(updatedExp)
      setQuantificationResult(null)
    }
  }

  const handleSubmit = () => {
    if (formData.title && formData.company) {
      const newExp = {
        id: `exp-${Date.now()}`,
        title: formData.title,
        company: formData.company,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description
      }
      const updated = [...cvData.experiences]
      if (editing !== null) {
        updated[editing] = newExp
      } else {
        updated.push(newExp)
      }
      setExperiences(updated)
      setFormData({ title: '', company: '', startDate: '', endDate: '', description: '' })
      setIsAdding(false)
      setEditing(null)
    }
  }

  const handleEdit = (index: number) => {
    const exp = cvData.experiences[index]
    setFormData({
      title: exp.title,
      company: exp.company,
      startDate: exp.startDate,
      endDate: exp.endDate,
      description: exp.description
    })
    setEditing(index)
    setIsAdding(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold text-graphite dark:text-platinum">Work Experience</h2>
            <button
              onClick={() => {
                setIsAdding(true)
                setEditing(null)
                setFormData({ title: '', company: '', startDate: '', endDate: '', description: '' })
              }}
          className="flex items-center gap-2 px-4 py-2 bg-violet text-white rounded-lg hover:bg-violet/90 transition"
        >
          <Plus size={20} />
          Add Experience
        </button>
      </div>

      {isAdding && (
        <div className="border border-violet rounded-lg p-4 space-y-4 mb-6">
          <input
            type="text"
            placeholder="Job Title"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Company Name"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
          <input
            type="text"
            placeholder="Start Date (e.g., Jan 2020)"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
          <input
            type="text"
            placeholder="End Date (e.g., Present)"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
          <textarea
            rows={3}
            placeholder="Job Description"
            className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 description-input ${
              (() => {
                // Detect if text contains bullets (check for lines starting with canonical "- " or other bullet markers)
                const text = formData.description || ''
                if (!text.trim()) return ''
                // Pattern matches: optional whitespace, then bullet marker (including normalized "-"), then required space
                const bulletPattern = /^\s*[•●·\-\*\u2022\u2023\u2043\u2219\u2013\u2014]\s+/m
                return bulletPattern.test(text) ? 'has-bullets' : ''
              })()
            }`}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="px-4 py-2 bg-violet text-white rounded-lg">
              {editing !== null ? 'Update' : 'Add'}
            </button>
            <button onClick={() => {
              setIsAdding(false)
              setEditing(null)
              setFormData({ title: '', company: '', startDate: '', endDate: '', description: '' })
            }} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {cvData.experiences.map((exp, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-graphite dark:text-platinum">{exp.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company}</p>
                <p className="text-sm text-violet">{exp.startDate} - {exp.endDate}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleQuantify(index)}
                  disabled={quantifying === index || quantifying !== null}
                  className="text-sm px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center gap-1 disabled:opacity-50"
                >
                  <BarChart3 className="w-3 h-3" />
                  {quantifying === index ? 'Quantifying...' : 'Quantify'}
                </button>
                <button onClick={() => handleEdit(index)} className="text-sm text-violet hover:underline">
                  Edit
                </button>
              </div>
            </div>
            
            {quantificationResult?.expIndex === index && quantificationResult.result && (
              <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800 space-y-3">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Before → After</div>
                
                <div className="space-y-2">
                  <div className="bg-white dark:bg-gray-800 rounded p-2 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 mb-1">Original:</div>
                    <DescriptionText 
                      text={quantificationResult.result.original}
                      className="text-sm line-through text-gray-400"
                    />
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded p-2 border border-green-200 dark:border-green-800">
                    <div className="text-xs text-green-700 dark:text-green-300 mb-1 font-semibold">Quantified:</div>
                    <AIPreviewText 
                      text={quantificationResult.result.quantified}
                      className="text-sm text-gray-700 dark:text-gray-300"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleApplyQuantification}
                    className="flex-1 px-3 py-2 bg-violet text-white rounded-lg hover:bg-violet/90 flex items-center justify-center gap-2 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Apply
                  </button>
                  <button
                    onClick={() => setQuantificationResult(null)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {quantificationResult?.expIndex !== index && exp.description && (
              <div className="mt-2">
                <DescriptionText 
                  text={exp.description} 
                  className="text-sm text-gray-600 dark:text-gray-400"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

