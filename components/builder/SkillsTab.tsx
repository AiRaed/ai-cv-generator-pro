'use client'

import { useState } from 'react'
import { Plus, Trash2, Minus, Plus as PlusIcon } from 'lucide-react'
import { useCvStore } from '@/lib/cv-state'

export default function SkillsTab() {
  const { cvData, addSkill, updateSkill, removeSkill } = useCvStore()
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState(3)

  const handleAddSkill = () => {
    if (newSkillName.trim()) {
      addSkill({ name: newSkillName.trim(), level: newSkillLevel })
      setNewSkillName('')
      setNewSkillLevel(3)
    }
  }

  const handleUpdateSkillLevel = (index: number, increment: boolean) => {
    const skill = cvData.skills[index]
    const newLevel = Math.max(1, Math.min(5, increment ? skill.level + 1 : skill.level - 1))
    updateSkill(index, { name: skill.name, level: newLevel })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-display font-bold mb-6 text-graphite dark:text-platinum">Skills Matrix</h2>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 mb-6">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Skill name..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Level:</span>
            <div className="flex-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setNewSkillLevel(level)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                    newSkillLevel === level
                      ? 'bg-violet text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleAddSkill}
            className="w-full px-4 py-2 bg-violet text-white rounded-lg hover:bg-violet/90 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Skill
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {cvData.skills.map((skill, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-semibold text-graphite dark:text-platinum mb-2">{skill.name}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateSkillLevel(index, false)}
                    disabled={skill.level <= 1}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 h-2 rounded ${
                          level <= skill.level
                            ? 'bg-violet'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => handleUpdateSkillLevel(index, true)}
                    disabled={skill.level >= 5}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-500 w-12 text-right">{skill.level}/5</span>
                </div>
              </div>
              <button
                onClick={() => removeSkill(index)}
                className="ml-4 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

