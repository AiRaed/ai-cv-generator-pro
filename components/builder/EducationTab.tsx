'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCVStore } from '@/lib/cv-store'

export default function EducationTab() {
  const { cvData, addEducation } = useCVStore()
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    degree: '',
    institution: '',
    year: '',
  })

  const handleSubmit = () => {
    if (formData.degree && formData.institution && formData.year) {
      addEducation(formData)
      setFormData({ degree: '', institution: '', year: '' })
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold text-graphite dark:text-platinum">Education</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet text-white rounded-lg hover:bg-violet/90 transition"
        >
          <Plus size={20} />
          Add Education
        </button>
      </div>

      {isAdding && (
        <div className="border border-violet rounded-lg p-4 space-y-4 mb-6">
          <input
            type="text"
            placeholder="Degree (e.g., Bachelor of Science in Computer Science)"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            value={formData.degree}
            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
          />
          <input
            type="text"
            placeholder="Institution Name"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            value={formData.institution}
            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
          />
          <input
            type="text"
            placeholder="Year (e.g., 2020)"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
          />
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="px-4 py-2 bg-violet text-white rounded-lg">
              Add
            </button>
            <button onClick={() => {
              setIsAdding(false)
              setFormData({ degree: '', institution: '', year: '' })
            }} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {cvData.education.map((edu, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-bold text-graphite dark:text-platinum">{edu.degree}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{edu.institution}</p>
            <p className="text-sm text-violet">{edu.year}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

