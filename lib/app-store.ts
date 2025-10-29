import { create } from 'zustand'

export type LayoutStyle = "minimal" | "modern" | "corporate" | "portfolio"

export interface CVData {
  fullName: string
  email?: string
  phone?: string
  cityState?: string
  linkedin?: string
  title?: string
  summary?: string
  experience?: Array<{
    role: string
    company: string
    period?: string
    bullets: string[]
  }>
  education?: Array<{
    school: string
    degree?: string
    period?: string
    details?: string
  }>
  skills?: string[]
  layout?: LayoutStyle
}

export interface BuilderUI {
  preview: string
  variants: Array<{ id: "A" | "B" | "C"; content: string }>
  atsMode: boolean
  loading: {
    gen: boolean
    rewrite: boolean
    compare: boolean
    export: boolean
  }
}

export interface CoverUI {
  preview: string
  variants: Array<{ id: "A" | "B" | "C"; content: string }>
  atsMode: boolean
  loading: {
    gen: boolean
    rewrite: boolean
    compare: boolean
    export: boolean
  }
}

interface AppStore {
  cvData: CVData
  builderUI: BuilderUI
  coverUI: CoverUI

  // CV Data setters
  setCVData: (data: Partial<CVData>) => void
  setCVField: <K extends keyof CVData>(field: K, value: CVData[K]) => void

  // Builder UI setters
  setBuilderPreview: (preview: string) => void
  setBuilderVariants: (variants: BuilderUI['variants']) => void
  setBuilderATSMode: (enabled: boolean) => void
  setBuilderLoading: (key: keyof BuilderUI['loading'], value: boolean) => void

  // Cover UI setters
  setCoverPreview: (preview: string) => void
  setCoverVariants: (variants: CoverUI['variants']) => void
  setCoverATSMode: (enabled: boolean) => void
  setCoverLoading: (key: keyof CoverUI['loading'], value: boolean) => void
}

const initialCVData: CVData = {
  fullName: '',
  email: '',
  phone: '',
  cityState: '',
  linkedin: '',
  title: '',
  summary: '',
  experience: [],
  education: [],
  skills: [],
  layout: 'modern',
}

const initialBuilderUI: BuilderUI = {
  preview: '',
  variants: [],
  atsMode: false,
  loading: {
    gen: false,
    rewrite: false,
    compare: false,
    export: false,
  },
}

const initialCoverUI: CoverUI = {
  preview: '',
  variants: [],
  atsMode: false,
  loading: {
    gen: false,
    rewrite: false,
    compare: false,
    export: false,
  },
}

export const useAppStore = create<AppStore>((set) => ({
  cvData: initialCVData,
  builderUI: initialBuilderUI,
  coverUI: initialCoverUI,

  // CV Data
  setCVData: (data) => set((state) => ({
    cvData: { ...state.cvData, ...data }
  })),
  setCVField: (field, value) => set((state) => ({
    cvData: { ...state.cvData, [field]: value }
  })),

  // Builder UI
  setBuilderPreview: (preview) => set((state) => ({
    builderUI: { ...state.builderUI, preview }
  })),
  setBuilderVariants: (variants) => set((state) => ({
    builderUI: { ...state.builderUI, variants }
  })),
  setBuilderATSMode: (enabled) => set((state) => ({
    builderUI: { ...state.builderUI, atsMode: enabled }
  })),
  setBuilderLoading: (key, value) => set((state) => ({
    builderUI: {
      ...state.builderUI,
      loading: { ...state.builderUI.loading, [key]: value }
    }
  })),

  // Cover UI
  setCoverPreview: (preview) => set((state) => ({
    coverUI: { ...state.coverUI, preview }
  })),
  setCoverVariants: (variants) => set((state) => ({
    coverUI: { ...state.coverUI, variants }
  })),
  setCoverATSMode: (enabled) => set((state) => ({
    coverUI: { ...state.coverUI, atsMode: enabled }
  })),
  setCoverLoading: (key, value) => set((state) => ({
    coverUI: {
      ...state.coverUI,
      loading: { ...state.coverUI.loading, [key]: value }
    }
  })),
}))

