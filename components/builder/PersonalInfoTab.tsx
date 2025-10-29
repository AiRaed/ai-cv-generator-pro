'use client'

import { useCVStore } from '@/lib/cv-store'

export default function PersonalInfoTab() {
  const { cvData, updatePersonalInfo } = useCVStore()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-display font-bold mb-6 text-graphite dark:text-platinum">Personal Information</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">First Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            value={cvData.personalInfo.firstName}
            onChange={(e) => updatePersonalInfo({ firstName: e.target.value })}
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Last Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            value={cvData.personalInfo.lastName}
            onChange={(e) => updatePersonalInfo({ lastName: e.target.value })}
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          value={cvData.personalInfo.email}
          onChange={(e) => updatePersonalInfo({ email: e.target.value })}
          placeholder="john.doe@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Phone</label>
        <input
          type="tel"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          value={cvData.personalInfo.phone}
          onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
          placeholder="+1 234 567 8900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Location</label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          value={cvData.personalInfo.location}
          onChange={(e) => updatePersonalInfo({ location: e.target.value })}
          placeholder="New York, NY"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">LinkedIn (optional)</label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          value={cvData.personalInfo.linkedin || ''}
          onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
          placeholder="linkedin.com/in/johndoe"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Website (optional)</label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          value={cvData.personalInfo.website || ''}
          onChange={(e) => updatePersonalInfo({ website: e.target.value })}
          placeholder="johndoe.com"
        />
      </div>
    </div>
  )
}

