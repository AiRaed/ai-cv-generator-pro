import { create } from 'zustand'

export interface PersonalInfo {
  name: string
  email: string
  phone: string
  linkedin: string
  portfolio: string
}

export interface Experience {
  id: string
  title: string
  company: string
  startDate: string
  endDate: string
  description: string
}

export interface Education {
  id: string
  degree: string
  school: string
  year: string
  description: string
}

export interface Skill {
  name: string
  level: number // 1-5
}

export interface PortfolioProject {
  id: string
  name: string
  description: string
  role: string
  link: string
}

export type Tone = 'executive' | 'creative' | 'academic' | 'technical'

export interface CVData {
  personalInfo: PersonalInfo
  summary: string
  experiences: Experience[]
  educations: Education[]
  skills: Skill[]
  portfolioProjects: PortfolioProject[]
  layout: 'minimal' | 'modern' | 'corporate' | 'portfolio'
  atsMode: boolean
}

interface CompareVariant {
  id: 'A' | 'B' | 'C'
  content: string
}

interface CVStore {
  cvData: CVData
  loading: boolean
  error: string | null
  // Compare variants
  compareVariants: CompareVariant[]
  selectedPreviewVariant: string | null // stores the selected variant content for preview
  // Methods
  setCvData: (data: CVData) => void
  setPersonalInfo: (info: PersonalInfo) => void
  setSummary: (summary: string) => void
  setExperiences: (experiences: Experience[]) => void
  setEducations: (educations: Education[]) => void
  setSkills: (skills: Skill[]) => void
  addSkill: (skill: { name: string; level: number }) => void
  updateSkill: (index: number, skill: { name: string; level: number }) => void
  removeSkill: (index: number) => void
  setPortfolioProjects: (projects: PortfolioProject[]) => void
  addPortfolioProject: (project: PortfolioProject) => void
  updatePortfolioProject: (index: number, project: PortfolioProject) => void
  removePortfolioProject: (index: number) => void
  setLayout: (layout: CVData['layout']) => void
  setATSMode: (enabled: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  // Compare methods
  setCompareVariants: (variants: CompareVariant[]) => void
  setSelectedPreviewVariant: (content: string | null) => void
  clearCompareVariants: () => void
}

const initialCvData: CVData = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
  },
  summary: '',
  experiences: [],
  educations: [],
  skills: [],
  portfolioProjects: [],
  layout: 'modern',
  atsMode: false,
}

export const useCvStore = create<CVStore>((set) => ({
  cvData: initialCvData,
  loading: false,
  error: null,
  compareVariants: [],
  selectedPreviewVariant: null,
  setCvData: (data) => set({ cvData: data }),
  setPersonalInfo: (info) => set((state) => ({
    cvData: { ...state.cvData, personalInfo: info }
  })),
  setSummary: (summary) => set((state) => ({
    cvData: { ...state.cvData, summary }
  })),
  setExperiences: (experiences) => set((state) => ({
    cvData: { ...state.cvData, experiences }
  })),
  setEducations: (educations) => set((state) => ({
    cvData: { ...state.cvData, educations }
  })),
  setSkills: (skills) => set((state) => ({
    cvData: { ...state.cvData, skills }
  })),
  addSkill: (skill) => set((state) => ({
    cvData: { ...state.cvData, skills: [...state.cvData.skills, skill] }
  })),
  updateSkill: (index, skill) => set((state) => ({
    cvData: {
      ...state.cvData,
      skills: state.cvData.skills.map((s, i) => i === index ? skill : s)
    }
  })),
  removeSkill: (index) => set((state) => ({
    cvData: {
      ...state.cvData,
      skills: state.cvData.skills.filter((_, i) => i !== index)
    }
  })),
  setPortfolioProjects: (projects) => set((state) => ({
    cvData: { ...state.cvData, portfolioProjects: projects }
  })),
  addPortfolioProject: (project) => set((state) => ({
    cvData: { ...state.cvData, portfolioProjects: [...state.cvData.portfolioProjects, project] }
  })),
  updatePortfolioProject: (index, project) => set((state) => ({
    cvData: {
      ...state.cvData,
      portfolioProjects: state.cvData.portfolioProjects.map((p, i) => i === index ? project : p)
    }
  })),
  removePortfolioProject: (index) => set((state) => ({
    cvData: {
      ...state.cvData,
      portfolioProjects: state.cvData.portfolioProjects.filter((_, i) => i !== index)
    }
  })),
  setLayout: (layout) => set((state) => ({
    cvData: { ...state.cvData, layout }
  })),
  setATSMode: (enabled) => set((state) => ({
    cvData: { ...state.cvData, atsMode: enabled }
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  // Compare methods
  setCompareVariants: (variants) => set({ compareVariants: variants }),
  setSelectedPreviewVariant: (content) => set({ selectedPreviewVariant: content }),
  clearCompareVariants: () => set({ compareVariants: [], selectedPreviewVariant: null }),
}))

