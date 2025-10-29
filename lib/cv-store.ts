import { create } from 'zustand'

export interface CVData {
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    location: string
    website?: string
    linkedin?: string
  }
  summary: string
  experience: Array<{
    title: string
    company: string
    duration: string
    description: string
  }>
  education: Array<{
    degree: string
    institution: string
    year: string
  }>
  skills: string[]
  selectedLayout: 'minimal' | 'modern' | 'corporate' | 'portfolio'
}

interface CVStore {
  cvData: CVData
  updatePersonalInfo: (data: Partial<CVData['personalInfo']>) => void
  updateSummary: (summary: string) => void
  addExperience: (exp: CVData['experience'][0]) => void
  updateExperience: (index: number, exp: CVData['experience'][0]) => void
  addEducation: (edu: CVData['education'][0]) => void
  addSkill: (skill: string) => void
  setLayout: (layout: CVData['selectedLayout']) => void
  setGeneratedCV: (cvText: string) => void
  generatedCV: string
  generatedCoverLetter: string
  setGeneratedCoverLetter: (letterText: string) => void
}

const defaultCVData: CVData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  selectedLayout: 'modern',
}

export const useCVStore = create<CVStore>((set) => ({
  cvData: defaultCVData,
  generatedCV: '',
  generatedCoverLetter: '',
  updatePersonalInfo: (data) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        personalInfo: { ...state.cvData.personalInfo, ...data },
      },
    })),
  updateSummary: (summary) =>
    set((state) => ({
      cvData: { ...state.cvData, summary },
    })),
  addExperience: (exp) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        experience: [...state.cvData.experience, exp],
      },
    })),
  updateExperience: (index, exp) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        experience: state.cvData.experience.map((e, i) =>
          i === index ? exp : e
        ),
      },
    })),
  addEducation: (edu) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        education: [...state.cvData.education, edu],
      },
    })),
  addSkill: (skill) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        skills: [...state.cvData.skills, skill],
      },
    })),
  setLayout: (layout) =>
    set((state) => ({
      cvData: { ...state.cvData, selectedLayout: layout },
    })),
  setGeneratedCV: (cvText) => set({ generatedCV: cvText }),
  setGeneratedCoverLetter: (letterText) =>
    set({ generatedCoverLetter: letterText }),
}))

