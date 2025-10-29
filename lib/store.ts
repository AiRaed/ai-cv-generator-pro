import { create } from 'zustand'
import { normalizeExperienceBullets, normalizeAIExperienceText, stripPlaceholders, normalizeBulletListSpacing, normalizeStableFormatting } from './normalize'

export type PersonalInfo = {
  fullName: string
  title?: string
  email: string
  phone?: string
  city?: string
  linkedin?: string
  website?: string
}

export type ExperienceItem = {
  role: string
  company: string
  period?: string
  description?: string
}

export type EducationItem = {
  degree: string
  school: string
  year?: string
  details?: string
}

export type CVState = {
  personal: PersonalInfo
  summaryMd: string
  summaryPreview: string | null
  experience: ExperienceItem[]
  experienceDescriptionPreviews: Record<number, string>
  previousExperienceDescriptions: Record<number, string | undefined> // Store previous values for undo
  education: EducationItem[]
  skills: string[]
  layout: 'modern' | 'minimal' | 'corporate'
  atsMode: boolean

  // Actions
  setPersonal: (p: Partial<PersonalInfo>) => void
  setSummary: (v: string) => void
  setSummaryPreview: (v: string | null) => void
  applySummaryPreview: () => void
  clearSummaryPreview: () => void
  addExperience: (x?: ExperienceItem) => void
  updateExperience: (i: number, x: Partial<ExperienceItem>) => void
  setExperienceDescriptionPreview: (i: number, v: string) => void
  applyExperienceDescriptionPreview: (i: number) => boolean // Returns true if successful, false if nothing to apply
  clearExperienceDescriptionPreview: (i: number) => void
  revertExperienceDescription: (i: number) => void // Revert to previous description
  removeExperience: (i: number) => void
  addEducation: (x?: EducationItem) => void
  updateEducation: (i: number, x: Partial<EducationItem>) => void
  removeEducation: (i: number) => void
  setSkills: (v: string | string[]) => void
  setLayout: (v: CVState['layout']) => void
  setAts: (v: boolean) => void
}

const defaultPersonalInfo: PersonalInfo = {
  fullName: '',
  email: '',
}

export const useCVStore = create<CVState>((set, get) => ({
  // State
  personal: defaultPersonalInfo,
  summaryMd: '',
  summaryPreview: null,
  experience: [],
  experienceDescriptionPreviews: {},
  previousExperienceDescriptions: {}, // Track previous values for undo
  education: [],
  skills: [],
  layout: 'modern',
  atsMode: false,

  // Actions
  setPersonal: (data) =>
    set((state) => ({
      personal: { ...state.personal, ...data },
    })),

  setSummary: (content) =>
    set(() => ({
      summaryMd: content,
    })),

  setSummaryPreview: (content) =>
    set(() => ({
      summaryPreview: content,
    })),

  applySummaryPreview: () =>
    set((state) => {
      if (!state.summaryPreview) return state
      return {
        summaryMd: state.summaryPreview,
        summaryPreview: null,
      }
    }),

  clearSummaryPreview: () =>
    set(() => ({
      summaryPreview: null,
    })),

  addExperience: (exp) =>
    set((state) => ({
      experience: [
        ...state.experience,
        exp || { role: '', company: '' },
      ],
    })),

  updateExperience: (index, updates) =>
    set((state) => ({
      experience: state.experience.map((exp, i) =>
        i === index ? { ...exp, ...updates } : exp
      ),
    })),

  removeExperience: (index) =>
    set((state) => ({
      experience: state.experience.filter((_, i) => i !== index),
    })),

  setExperienceDescriptionPreview: (index, content) =>
    set((state) => ({
      experienceDescriptionPreviews: {
        ...state.experienceDescriptionPreviews,
        [index]: content,
      },
    })),

  applyExperienceDescriptionPreview: (index) => {
    const state = get()
    const preview = state.experienceDescriptionPreviews[index]
    if (!preview) return false
    
    // Use Stable Formatting Mode normalization to match preview exactly
    // This ensures plain text 1:1 insertion (no markdown/HTML)
    const cleaned = normalizeStableFormatting(preview)
    
    if (!cleaned || cleaned.trim().length === 0) {
      return false // Nothing valid to apply
    }
    
    // Store current description as previous (for undo)
    const currentDescription = state.experience[index]?.description
    
    set((state) => {
      const updatedExperience = state.experience.map((exp, i) =>
        i === index ? { ...exp, description: cleaned } : exp
      )
      const { [index]: _, ...newPreviews } = state.experienceDescriptionPreviews
      return {
        experience: updatedExperience,
        experienceDescriptionPreviews: newPreviews,
        previousExperienceDescriptions: {
          ...state.previousExperienceDescriptions,
          [index]: currentDescription, // Store previous value for undo
        },
      }
    })
    
    return true // Successfully applied
  },

  clearExperienceDescriptionPreview: (index) =>
    set((state) => {
      const { [index]: _, ...newPreviews } = state.experienceDescriptionPreviews
      return {
        experienceDescriptionPreviews: newPreviews,
      }
    }),

  revertExperienceDescription: (index) =>
    set((state) => {
      const previous = state.previousExperienceDescriptions[index]
      const updatedExperience = state.experience.map((exp, i) =>
        i === index ? { ...exp, description: previous } : exp
      )
      const { [index]: _, ...newPrevious } = state.previousExperienceDescriptions
      return {
        experience: updatedExperience,
        previousExperienceDescriptions: newPrevious, // Clear undo history after revert
      }
    }),

  addEducation: (edu) =>
    set((state) => ({
      education: [
        ...state.education,
        edu || { degree: '', school: '' },
      ],
    })),

  updateEducation: (index, updates) =>
    set((state) => ({
      education: state.education.map((edu, i) =>
        i === index ? { ...edu, ...updates } : edu
      ),
    })),

  removeEducation: (index) =>
    set((state) => ({
      education: state.education.filter((_, i) => i !== index),
    })),

  setSkills: (value) =>
    set(() => ({
      skills: Array.isArray(value) ? value : value.split(',').map(s => s.trim()).filter(Boolean),
    })),

  setLayout: (layout) =>
    set(() => ({
      layout,
    })),

  setAts: (enabled) =>
    set(() => ({
      atsMode: enabled,
    })),
}))

