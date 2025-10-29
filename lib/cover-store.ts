import { create } from 'zustand'

export interface CoverLetterState {
  recipientName: string
  company: string
  cityState: string
  role: string
  keywords: string
  letterBody: string
  applicantName: string
  layout: 'minimal' | 'modern' | 'corporate' | 'portfolio'
  atsMode: boolean

  // Actions
  setRecipientInfo: (info: Partial<{ recipientName: string; company: string; cityState: string; role: string }>) => void
  setKeywords: (keywords: string) => void
  setLetterBody: (body: string) => void
  setApplicantName: (name: string) => void
  setLayout: (layout: CoverLetterState['layout']) => void
  setAtsMode: (enabled: boolean) => void
}

const defaultState = {
  recipientName: '',
  company: '',
  cityState: '',
  role: '',
  keywords: '',
  letterBody: '',
  applicantName: '',
  layout: 'minimal' as const,
  atsMode: false,
}

export const useCoverStore = create<CoverLetterState>((set) => ({
  ...defaultState,

  setRecipientInfo: (info) =>
    set((state) => ({
      recipientName: info.recipientName ?? state.recipientName,
      company: info.company ?? state.company,
      cityState: info.cityState ?? state.cityState,
      role: info.role ?? state.role,
    })),

  setKeywords: (keywords) => set({ keywords }),

  setLetterBody: (body) => set({ letterBody: body }),

  setApplicantName: (name) => set({ applicantName: name }),

  setLayout: (layout) => set({ layout }),

  setAtsMode: (enabled) => set({ atsMode: enabled }),
}))
