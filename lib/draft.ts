import { CVState } from './store'

const DRAFT_STORAGE_KEY = 'cv_draft'

export interface DraftData {
  personal: CVState['personal']
  summaryMd: string
  experience: CVState['experience']
  education: CVState['education']
  skills: string[]
  layout: CVState['layout']
  savedAt: string
}

/**
 * Save current CV data to localStorage as a draft
 */
export function saveDraft(state: CVState): void {
  if (typeof window === 'undefined') return

  try {
    const draft: DraftData = {
      personal: { ...state.personal },
      summaryMd: state.summaryMd,
      experience: state.experience.map(exp => ({ ...exp })),
      education: state.education.map(edu => ({ ...edu })),
      skills: [...state.skills],
      layout: state.layout,
      savedAt: new Date().toISOString(),
    }

    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
  } catch (error) {
    console.error('Failed to save draft:', error)
  }
}

/**
 * Load draft data from localStorage
 */
export function loadDraft(): DraftData | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!stored) return null

    const draft = JSON.parse(stored) as DraftData
    return draft
  } catch (error) {
    console.error('Failed to load draft:', error)
    return null
  }
}

/**
 * Clear draft data from localStorage
 */
export function clearDraft(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear draft:', error)
  }
}

/**
 * Check if a draft exists
 */
export function hasDraft(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(DRAFT_STORAGE_KEY) !== null
}
