'use client'

import { useState, useRef, useEffect, useMemo, memo, Fragment } from 'react'
import { motion } from 'framer-motion'
import { Layout, Sparkles, Download, CheckCircle2, AlertCircle, FileText, Plus, Trash2, CreditCard, Loader2, Undo2, Lock } from 'lucide-react'
import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { useCVStore } from '@/lib/store'
import { ComparePanel } from '@/components/ComparePanel'
import { AiButtonOverlay } from '@/components/AiButtonOverlay'
import { PreviewBlurOverlay } from '@/components/PreviewBlurOverlay'
import { InputBlurOverlay } from '@/components/InputBlurOverlay'
import { useAiAccess } from '@/lib/use-ai-access'
import { startCheckout } from '@/lib/checkout'
import { exportToPDF } from '@/lib/pdf'
import { exportToDocx } from '@/lib/docx'
import { normalizeCVText, normalizeExperienceBullets, trimToLastFullSentence, normalizeStableFormatting, normalizeSummaryParagraph } from '@/lib/normalize'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { extractDomain, formatUrlForDisplay, cn } from '@/lib/utils'
import { saveDraft, loadDraft, clearDraft, hasDraft } from '@/lib/draft'
import { DescriptionText } from '@/components/DescriptionText'
import { AIPreviewText } from '@/components/AIPreviewText'
import { PreviewTopBar } from '@/components/PreviewTopBar'
import { PreviewPaywallModal } from '@/components/PreviewPaywallModal'
import { PREVIEW_SECONDS, FUNNEL_STRINGS, detectFunnelLanguage } from '@/lib/funnelConfig'
import { trackEvent } from '@/lib/analytics'
import { 
  hasAiAccess as checkAiAccess, 
  setAiAccessCookie, 
  clearAiAccessCookie, 
  clearPreviewEndAt, 
  getPreviewEndAt, 
  startPreview, 
  isPreviewEnded, 
  getPreviewState, 
  getPreviewRemainingSeconds,
  canUseAI,
  getAiPreviewStartAt
} from '@/utils/access'

type Tab = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'layout'

type PreviewState = 'preview_active' | 'preview_ended' | 'unlocked_24h'

interface Variant {
  id: 'A' | 'B' | 'C'
  content: string
}

interface PreviewContentProps {
  personal: any
  summaryMd: string
  summaryPreview: string | null
  experience: any[]
  experienceDescriptionPreviews: Record<number, string>
  education: any[]
  skills: string[]
  layout: string
  isLocked: boolean
  watermarkText?: string
}

// Memoized preview component that only re-renders on debounced updates
const PreviewContent = memo(function PreviewContent({
  personal,
  summaryMd,
  summaryPreview,
  experience,
  experienceDescriptionPreviews,
  education,
  skills,
  layout,
  isLocked,
  watermarkText,
}: PreviewContentProps) {
  // Helper function to format URLs for display (clean host/path without protocol, keep www)
  const displayUrl = (url: string): string => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      return urlObj.hostname + (urlObj.pathname === '/' ? '' : urlObj.pathname)
    } catch {
      return url
    }
  }

  // Helper function to render contact info in two-line layout
  const getContactInfo = () => {
    // Helper to render a line with items separated by middle-dot
    const renderLine = (items: JSX.Element[], lineKey: string) => {
      if (items.length === 0) return null
      
      return (
        <div key={lineKey} className="cv-contact-line">
          {items.map((item, idx) => (
            <Fragment key={idx}>
              {idx > 0 && (
                <>
                  <span className="cv-contact-separator" aria-hidden="true">•</span>
                  {'\u00A0'}
                </>
              )}
              {item}
            </Fragment>
          ))}
        </div>
      )
    }

    // Build line 1: email, phone, city
    const line1: JSX.Element[] = []
    if (personal.email && personal.email.trim()) {
      line1.push(
        <a key="email" href={`mailto:${personal.email}`} className="cv-contact-link">
          {personal.email}
        </a>
      )
    }
    if (personal.phone && personal.phone.trim()) {
      line1.push(
        <a key="phone" href={`tel:${personal.phone}`} className="cv-contact-link">
          {personal.phone}
        </a>
      )
    }
    if (personal.city && personal.city.trim()) {
      line1.push(
        <span key="city" className="cv-contact-text">{personal.city}</span>
      )
    }

    // Build line 2: linkedin, website
    const line2: JSX.Element[] = []
    if (personal.linkedin && personal.linkedin.trim()) {
      const displayText = displayUrl(personal.linkedin)
      const hrefUrl = /^https?:\/\//i.test(personal.linkedin) 
        ? personal.linkedin 
        : `https://${personal.linkedin}`
      line2.push(
        <a 
          key="linkedin" 
          href={hrefUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="cv-contact-link"
        >
          {displayText}
        </a>
      )
    }
    if (personal.website && personal.website.trim()) {
      const displayText = displayUrl(personal.website)
      const hrefUrl = /^https?:\/\//i.test(personal.website) 
        ? personal.website 
        : `https://${personal.website}`
      line2.push(
        <a 
          key="website" 
          href={hrefUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="cv-contact-link"
        >
          {displayText}
        </a>
      )
    }

    // Render lines only if they have items
    const renderedLine1 = renderLine(line1, 'line1')
    const renderedLine2 = renderLine(line2, 'line2')

    // Return null if both lines are empty
    if (!renderedLine1 && !renderedLine2) {
      return null
    }

    return (
      <>
        {renderedLine1}
        {renderedLine2}
      </>
    )
  }

  // Filter experience items that have at least role or company
  const validExperience = experience?.filter(exp => 
    (exp.role && exp.role.trim()) || (exp.company && exp.company.trim())
  ) || []

  // Filter education items that have at least degree or school
  const validEducation = education?.filter(edu => 
    (edu.degree && edu.degree.trim()) || (edu.school && edu.school.trim())
  ) || []

  const summaryText = summaryPreview || summaryMd
  // Check if summary has content
  const hasSummary = !!(summaryText && summaryText.trim())

  // Check if skills have content
  const hasSkills = skills && skills.length > 0

  // Check if name exists
  const hasName = personal.fullName && personal.fullName.trim()

  // Check if contact info exists
  const contactInfo = getContactInfo()
  const hasContactInfo = contactInfo !== null

  return (
    <div id="cv-preview" className="cv-page text-left w-full relative">
        {/* Header - Only render if name or contact info exists */}
        {(hasName || hasContactInfo) && (
          <div className="cv-header-container">
            {hasName && (
              <h1 className="cv-name">{personal.fullName}</h1>
            )}
            {hasContactInfo && (
              <div className="cv-contact-info">
                {contactInfo}
              </div>
            )}
            <div className="cv-header-divider"></div>
          </div>
        )}
        
        {/* Summary - Only render if content exists */}
        {hasSummary && (
          <div className="cv-section-spacing">
            <h5 className="cv-section-title">Summary</h5>
            <p className="cv-text-content">
              {!isLocked || !summaryText
                ? summaryText
                : (() => {
                    const visibleLength = Math.floor(summaryText.length * 0.5)
                    const visible = summaryText.slice(0, visibleLength)
                    const hidden = summaryText.slice(visibleLength)
                    return (
                      <>
                        <span>{visible}</span>
                        {hidden && <span className="blur-sm">{hidden}</span>}
                      </>
                    )
                  })()}
            </p>
          </div>
        )}
        
        {/* Experience - Only render if there are valid entries */}
        {validExperience.length > 0 && (
          <div className="cv-section-spacing">
            <h5 className="cv-section-title">Experience</h5>
            <div className="cv-experience-list">
              {validExperience.map((exp, idx) => {
                // Find original index for preview lookups
                const originalIdx = experience.findIndex(e => e === exp)
                const hasRole = exp.role && exp.role.trim()
                const hasCompany = exp.company && exp.company.trim()
                const hasPeriod = exp.period && exp.period.trim()
                const hasDescription = exp.description && exp.description.trim()
                
                // Only render if at least role or company exists
                if (!hasRole && !hasCompany) return null

                return (
                  <div key={originalIdx} className="cv-experience-item">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        {hasRole && (
                          <p className="font-semibold text-gray-800">
                            {exp.role}
                          </p>
                        )}
                        {hasCompany && (
                          <p className="text-base font-medium text-gray-700 font-sans not-italic">
                            {exp.company}
                          </p>
                        )}
                      </div>
                      {hasPeriod && (
                        <p className="text-sm text-violet">{exp.period}</p>
                      )}
                    </div>
                    {hasDescription && !isLocked && (
                      <DescriptionText 
                        text={exp.description} 
                        className="font-normal"
                      />
                    )}
                    {hasDescription && isLocked && (
                      <div className="font-normal text-gray-700 dark:text-gray-200 whitespace-pre-line text-sm">
                        {(() => {
                          const raw = exp.description || ''
                          const lines = raw.split(/\r?\n/)
                          const visibleLines = lines.slice(0, 2).join('\n')
                          const hiddenLines = lines.slice(2).join('\n')
                          return (
                            <>
                              <span>{visibleLines}</span>
                              {hiddenLines && (
                                <span className="blur-sm">
                                  {visibleLines ? '\n' : ''}
                                  {hiddenLines}
                                </span>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    )}
                    {/* Display preview separately */}
                    {experienceDescriptionPreviews[originalIdx] && (
                      <div data-export-exclude="true" className="mt-2 border-t-2 border-dashed border-violet-300 pt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-3 h-3 text-violet" />
                          <span className="text-xs font-semibold text-violet">AI Preview</span>
                        </div>
                        <div className="text-sm bg-violet-50 border border-violet-200 rounded-lg p-3 text-gray-700">
                          <AIPreviewText text={experienceDescriptionPreviews[originalIdx] || ''} />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Education - Only render if there are valid entries */}
        {validEducation.length > 0 && (
          <div className="cv-section-spacing">
            <h5 className="cv-section-title">Education</h5>
            <div className="cv-education-list">
              {validEducation.map((edu, idx) => {
                // Find original index
                const originalIdx = education.findIndex(e => e === edu)
                const hasDegree = edu.degree && edu.degree.trim()
                const hasSchool = edu.school && edu.school.trim()
                const hasDetails = edu.details && edu.details.trim()
                const hasYear = edu.year && edu.year.trim()
                
                // Only render if at least degree or school exists
                if (!hasDegree && !hasSchool) return null

                return (
                  <div key={originalIdx} className="cv-education-item">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        {hasDegree && (
                          <p className="font-semibold text-gray-800">{edu.degree}</p>
                        )}
                        {hasSchool && (
                          <p className="text-base font-medium text-gray-700 font-sans not-italic">{edu.school}</p>
                        )}
                        {hasDetails && (
                          <p className="text-sm text-gray-500 font-normal">{edu.details}</p>
                        )}
                      </div>
                      {hasYear && (
                        <p className="text-sm text-violet">{edu.year}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Skills - Only render if skills exist */}
        {hasSkills && (
          <div className="cv-section-spacing">
            <h5 className="cv-section-title">SKILLS</h5>
            <div className="cv-skills-container">
              {skills.map((skill, idx) => (
                <Fragment key={idx}>
                  <span className="cv-skill-item">{skill}</span>
                  {idx < skills.length - 1 && <span className="cv-skill-separator" style={{ margin: '0 0.2ch' }}>{'\u2009\u00B7\u2009'}</span>}
                </Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
  )
})

export default function BuilderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>('personal')
  const [keywords, setKeywords] = useState('')
  const [rewriteMode, setRewriteMode] = useState('enhance')
  const [variants, setVariants] = useState<Variant[]>([])
  const [showCompare, setShowCompare] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState({ gen: false, rewrite: false, compare: false, export: false, rewriteSummary: false, rewriteDescription: {} as Record<number, boolean> })
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const [debouncedUpdateKey, setDebouncedUpdateKey] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [skillsInputValue, setSkillsInputValue] = useState('')
  const [previewRemaining, setPreviewRemaining] = useState<number | null>(null)
  const [previewEnded, setPreviewEnded] = useState(false)
  const [previewInitialized, setPreviewInitialized] = useState(false)
  const [emitted30s, setEmitted30s] = useState(false)
  const [paywallVariant, setPaywallVariant] = useState<'preview-ended' | 'access-expired' | null>(null)
  const [funnelLang, setFunnelLang] = useState<'en' | 'ar'>('en')
  
  // AI Access state - using cookie-based access
  const [hasAiAccess, setHasAiAccessState] = useState(false)
  const { valid: legacyHasAccess, remainingFormatted, remainingMs, setAccess: setLegacyAccess } = useAiAccess()
  const [previewState, setPreviewState] = useState<'preview_active' | 'preview_ended' | 'unlocked_24h' | 'not_started'>('not_started')
  const previewActive = !hasAiAccess && previewState === 'preview_active'
  const showPaywall = !hasAiAccess && previewState === 'preview_ended'
  
  // Toast function (defined early for use in effects)
  const showToast = useMemo(() => {
    return (type: 'success' | 'error', message: string) => {
      setToast({ type, message })
      setTimeout(() => setToast(null), 3000)
    }
  }, [])
  
  // Prevent hydration mismatch by only rendering client-specific content after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setFunnelLang(detectFunnelLanguage())
  }, [])
  
  // Initialize access state from cookie on mount and periodically check
  useEffect(() => {
    if (!mounted) return
    setHasAiAccessState(checkAiAccess())
    
    // Check access every minute to catch expiration
    const interval = setInterval(() => {
      const hasAccess = checkAiAccess()
      setHasAiAccessState(hasAccess)
      if (!hasAccess) {
        // Access expired, clear legacy access too
        clearAiAccessCookie()
      }
    }, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [mounted])

  // Handle successful payment redirect from Stripe
  useEffect(() => {
    if (!mounted) return
    
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    
    if (success === '1') {
      // Payment successful: set cookie and clear preview state
      try {
        setAiAccessCookie()
        clearPreviewEndAt()
        setHasAiAccessState(true)
        setLegacyAccess('stripe') // Also update legacy system for compatibility
        trackEvent('checkout_success')
        trackEvent('unlock_activated_24h')
        showToast('success', '✅ Payment successful! AI access unlocked for 24 hours.')
        
        // Clean up URL by removing query params
        const url = new URL(window.location.href)
        url.searchParams.delete('success')
        url.searchParams.delete('canceled')
        window.history.replaceState({}, '', url.toString())
      } catch (err) {
        console.error('[Builder] Error setting AI access after payment:', err)
        showToast('error', 'Payment successful but failed to unlock access. Please refresh the page.')
      }
    } else if (canceled === '1') {
      // User cancelled payment - don't change state, just clean URL
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      url.searchParams.delete('canceled')
      window.history.replaceState({}, '', url.toString())
    }
  }, [mounted, searchParams, setLegacyAccess, showToast])
  
  const {
    personal,
    summaryMd,
    summaryPreview,
    experience,
    experienceDescriptionPreviews,
    previousExperienceDescriptions,
    education,
    skills,
    layout,
    atsMode,
    setPersonal,
    setSummary,
    setSummaryPreview,
    applySummaryPreview,
    clearSummaryPreview,
    addExperience,
    updateExperience,
    removeExperience,
    setExperienceDescriptionPreview,
    applyExperienceDescriptionPreview,
    revertExperienceDescription,
    clearExperienceDescriptionPreview,
    addEducation,
    updateEducation,
    removeEducation,
    setSkills,
    setLayout,
    setAts,
  } = useCVStore()
  
  // Load draft on mount if available (after store is initialized)
  useEffect(() => {
    if (!mounted || draftLoaded) return
    
    const draft = loadDraft()
    if (draft) {
      // Load draft data into store
      setPersonal(draft.personal)
      setSummary(draft.summaryMd || '')
      // Clear existing items first
      while (experience.length > 0) removeExperience(0)
      while (education.length > 0) removeEducation(0)
      draft.experience.forEach(exp => addExperience(exp))
      draft.education.forEach(edu => addEducation(edu))
      setSkills(draft.skills)
      setLayout(draft.layout)
      setDraftLoaded(true)
      setTimeout(() => showToast('success', 'Draft loaded'), 100)
    } else {
      setDraftLoaded(true) // Mark as loaded even if no draft
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, draftLoaded, showToast])
  
  // Auto-save draft when data changes (debounced)
  useEffect(() => {
    if (!mounted || !draftLoaded) return
    
    const timer = setTimeout(() => {
      const draftData = {
        personal,
        summaryMd,
        experience,
        education,
        skills,
        layout,
      }
      // Save to localStorage manually (avoid passing functions)
      if (typeof window !== 'undefined') {
        try {
          const draft = {
            ...draftData,
            savedAt: new Date().toISOString(),
          }
          localStorage.setItem('cv_draft', JSON.stringify(draft))
        } catch (error) {
          console.error('Failed to save draft:', error)
        }
      }
    }, 1000) // Save after 1 second of inactivity
    
    return () => clearTimeout(timer)
  }, [personal, summaryMd, experience, education, skills, layout, mounted, draftLoaded])
  const [prevValid, setPrevValid] = useState<boolean | null>(null)
  const [showPreviewBlur, setShowPreviewBlur] = useState(false)
  const [showInputBlur, setShowInputBlur] = useState(false)
  const [lockedInputsRef, setLockedInputsRef] = useState<Set<string>>(new Set())
  
  // Handle access expiration with toast
  useEffect(() => {
    if (prevValid === null) {
      // Initial mount - set previous state
      setPrevValid(hasAiAccess)
      return
    }
    
    // Check if access just expired
    if (prevValid === true && hasAiAccess === false) {
      showToast('error', 'Your AI access expired. You can unlock again anytime.')
      trackEvent('unlock_expired_24h')
      setPaywallVariant('access-expired')
    }
    
    // If user gains access, clear the blur and reset preview funnel
    if (!prevValid && hasAiAccess) {
      setShowPreviewBlur(false)
      setShowInputBlur(false)
      setLockedInputsRef(new Set())
      clearPreviewEndAt()
      setPreviewRemaining(null)
      setPreviewEnded(false)
      setPreviewInitialized(false)
      setEmitted30s(false)
      setPaywallVariant(null)
      setPreviewState('unlocked_24h')
      trackEvent('unlock_activated_24h')
    }
    
    setPrevValid(hasAiAccess)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAiAccess])

  // Initialize preview state on mount from localStorage
  useEffect(() => {
    if (!mounted) return
    if (hasAiAccess) {
      setPreviewState('unlocked_24h')
      setPreviewRemaining(null)
      setPreviewEnded(false)
      setShowPreviewBlur(false)
      setShowInputBlur(false)
      return
    }

    const previewStartAt = getAiPreviewStartAt()
    if (!previewStartAt) {
      // Preview hasn't started yet
      setPreviewState('not_started')
      setPreviewRemaining(null)
      setPreviewEnded(false)
      setShowPreviewBlur(false)
      setShowInputBlur(false)
      return
    }

    // Check if preview has ended
    const ended = isPreviewEnded()
    if (ended) {
      setPreviewState('preview_ended')
      setPreviewRemaining(0)
      setPreviewEnded(true)
      setPaywallVariant('preview-ended')
      setShowPreviewBlur(true)
      setShowInputBlur(false)
      trackEvent('preview_ended')
    } else {
      // Preview is still active
      const remaining = getPreviewRemainingSeconds()
      setPreviewState('preview_active')
      setPreviewRemaining(remaining)
      setPreviewEnded(false)
      setShowPreviewBlur(false)
      setShowInputBlur(false)
      trackEvent('preview_started', { totalSeconds: PREVIEW_SECONDS })
    }
    setPreviewInitialized(true)
  }, [mounted, hasAiAccess])

  // Listen to localStorage changes for preview state
  useEffect(() => {
    if (!mounted) return

    const handleStorageChange = () => {
      if (hasAiAccess) {
        setPreviewState('unlocked_24h')
        setPreviewRemaining(null)
        setPreviewEnded(false)
        setShowPreviewBlur(false)
        setShowInputBlur(false)
        return
      }

      const previewStartAt = getAiPreviewStartAt()
      if (!previewStartAt) {
        setPreviewState('not_started')
        setPreviewRemaining(null)
        setPreviewEnded(false)
        setShowPreviewBlur(false)
        setShowInputBlur(false)
        return
      }

      const ended = isPreviewEnded()
      if (ended) {
        setPreviewState('preview_ended')
        setPreviewRemaining(0)
        setPreviewEnded(true)
        setPaywallVariant('preview-ended')
        setShowPreviewBlur(true)
        setShowInputBlur(false)
      } else {
        const remaining = getPreviewRemainingSeconds()
        setPreviewState('preview_active')
        setPreviewRemaining(remaining)
        setPreviewEnded(false)
        setShowPreviewBlur(false)
        setShowInputBlur(false)
      }
    }

    window.addEventListener('localStorageChange', handleStorageChange as EventListener)
    return () => {
      window.removeEventListener('localStorageChange', handleStorageChange as EventListener)
    }
  }, [mounted, hasAiAccess])

  // Tick preview countdown
  useEffect(() => {
    if (!mounted) return
    if (hasAiAccess) return
    if (previewState !== 'preview_active') return
    if (previewRemaining === null || previewRemaining <= 0) return

    const interval = setInterval(() => {
      const currentEndAt = getPreviewEndAt()
      if (!currentEndAt) {
        clearInterval(interval)
        return
      }

      const remaining = getPreviewRemainingSeconds()
      
      if (remaining <= 0) {
        clearInterval(interval)
        setPreviewEnded(true)
        setPreviewState('preview_ended')
        setPreviewRemaining(0)
        console.log('preview_ended')
        trackEvent('preview_ended')
        setPaywallVariant('preview-ended')
        return
      }

      setPreviewRemaining(remaining)
      if (!emitted30s && remaining === 30) {
        trackEvent('preview_30s')
        setEmitted30s(true)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [mounted, hasAiAccess, previewState, previewRemaining, emitted30s])

  // Skills tokenization helper
  const tokenizeSkills = (input: string): string[] => {
    if (!input.trim()) return []
    
    // Replace dots with commas (legacy support), then split by commas, Arabic comma, and newlines
    const normalized = input.replace(/\./g, ',')
    const tokens = normalized.split(/[،,\n\r]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0)
    
    return tokens
  }

  // Deduplicate skills case-insensitively, keeping first capitalization
  const deduplicateSkills = (newSkills: string[], existingSkills: string[]): string[] => {
    const existingLower = new Set(existingSkills.map(s => s.toLowerCase()))
    const seen = new Set<string>()
    const result: string[] = []
    
    // First add existing skills
    existingSkills.forEach(skill => {
      if (!seen.has(skill.toLowerCase())) {
        result.push(skill)
        seen.add(skill.toLowerCase())
      }
    })
    
    // Then add new skills that aren't duplicates
    newSkills.forEach(skill => {
      if (!seen.has(skill.toLowerCase()) && skill.length <= 30) {
        result.push(skill)
        seen.add(skill.toLowerCase())
      }
    })
    
    return result.slice(0, 25) // Max 25 skills
  }

  // Handle adding skills from input
  const handleAddSkillsFromInput = () => {
    if (!skillsInputValue.trim()) return
    
    const newTokens = tokenizeSkills(skillsInputValue)
    if (newTokens.length === 0) {
      setSkillsInputValue('')
      return
    }
    
    const updatedSkills = deduplicateSkills(newTokens, skills)
    setSkills(updatedSkills)
    setSkillsInputValue('')
  }

  // Handle paste
  const handlePasteSkills = (pastedText: string) => {
    const newTokens = tokenizeSkills(pastedText)
    if (newTokens.length === 0) {
      setSkillsInputValue('')
      return
    }
    
    const updatedSkills = deduplicateSkills(newTokens, skills)
    setSkills(updatedSkills)
    setSkillsInputValue('')
  }

  // Handle input change - tokenize on comma/Arabic comma as user types
  const handleSkillsInputChange = (value: string) => {
    // Check for comma, Arabic comma, or Enter key
    if (/[،,]/g.test(value)) {
      // Found delimiter, process immediately
      const tokens = tokenizeSkills(value)
      if (tokens.length > 0) {
        const updatedSkills = deduplicateSkills(tokens, skills)
        setSkills(updatedSkills)
        setSkillsInputValue('')
      } else {
        setSkillsInputValue('')
      }
    } else {
      setSkillsInputValue(value)
    }
  }

  // Handle removing a skill
  const handleRemoveSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index)
    setSkills(newSkills)
  }

  // Handle checkout
  const handleCheckout = async () => {
    setCheckoutLoading(true)
    try {
      const success = await startCheckout()
      // If checkout succeeded, redirect will happen in startCheckout
      // If it failed (returned false), reset loading state
      if (!success) {
        setCheckoutLoading(false)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setCheckoutLoading(false)
    }
  }

  // Debounce preview updates to avoid excessive re-renders while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUpdateKey(prev => prev + 1)
    }, 150)
    return () => clearTimeout(timer)
  }, [personal, summaryMd, experience, education, skills, layout])

  // Log completion message
  if (typeof window !== 'undefined' && !(window as any)._launchFixLogged) {
    console.log("[LAUNCH FIX] AI actions active, fields bound, compare improved, export stable.")
    ;(window as any)._launchFixLogged = true
  }

  // Debug logging for builder page
  if (typeof window !== 'undefined') {
    console.log('[BUILDER] mounted')
  }

  const handleGenerate = async () => {
    if (!keywords.trim()) {
      showToast('error', 'Please enter keywords')
      return
    }

    // Start preview timer on first AI button click if not paid and not started
    if (!hasAiAccess) {
      const endAt = startPreview()
      const remaining = Math.max(0, Math.floor((endAt - Date.now()) / 1000))
      setPreviewState('preview_active')
      setPreviewRemaining(remaining)
      setPreviewEnded(false)
      setShowPreviewBlur(false)
      setShowInputBlur(false)
      if (!previewInitialized) {
        setPreviewInitialized(true)
        trackEvent('preview_started', { totalSeconds: PREVIEW_SECONDS })
      }
    }

    // Check if AI can be used (after starting preview)
    if (!canUseAI()) {
      // Preview ended, show paywall
      setPreviewState('preview_ended')
      setPaywallVariant('preview-ended')
      setShowPreviewBlur(true)
      setShowInputBlur(false)
      return
    }

    const payload = {
      lang: 'en',
      keywords,
      personal: { ...personal },
      summaryMd,
      experience,
      education,
      skills,
      layout,
    }
    console.log('[AI] generate payload:', payload)
    setLoading(prev => ({ ...prev, gen: true }))

    try {
      const previewEndAt = getPreviewEndAt()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (previewEndAt) {
        headers['x-preview-end'] = previewEndAt.toString()
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log('[AI] result:', data)

      if (!response.ok || !data.ok) {
        console.error('[AI] request failed')
        showToast('error', 'AI request failed')
        return
      }

      if (data.content || data.summary) {
        const content = data.content || data.summary
        const normalized = normalizeSummaryParagraph(content)
        setSummaryPreview(normalized)
        showToast('success', 'Preview generated - click Apply to update')
      }
    } catch (error) {
      console.error('[AI] error generating CV:', error)
      showToast('error', 'AI request failed')
    } finally {
      setLoading(prev => ({ ...prev, gen: false }))
    }
  }

  const handleRewrite = async () => {
    if (!summaryMd.trim()) {
      showToast('error', 'Please generate or write content first')
      return
    }

    // Start preview timer on first AI button click if not paid and not started
    if (!hasAiAccess) {
      const endAt = startPreview()
      const remaining = Math.max(0, Math.floor((endAt - Date.now()) / 1000))
      setPreviewState('preview_active')
      setPreviewRemaining(remaining)
      setPreviewEnded(false)
      setShowPreviewBlur(false)
      setShowInputBlur(false)
      if (!previewInitialized) {
        setPreviewInitialized(true)
        trackEvent('preview_started', { totalSeconds: PREVIEW_SECONDS })
      }
    }

    // Check if AI can be used (after starting preview)
    if (!canUseAI()) {
      // Preview ended, show paywall
      setPreviewState('preview_ended')
      setPaywallVariant('preview-ended')
      setShowPreviewBlur(true)
      setShowInputBlur(false)
      return
    }

    const payload = {
      mode: rewriteMode,
      section: 'summary',
      content: summaryMd,
    }
    console.log('[AI] rewrite payload:', payload)
    setLoading(prev => ({ ...prev, rewrite: true }))
    
    try {
      const previewEndAt = getPreviewEndAt()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (previewEndAt) {
        headers['x-preview-end'] = previewEndAt.toString()
      }

      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log('[AI] result:', data)

      if (!response.ok || !data.ok) {
        console.error('[AI] request failed')
        showToast('error', 'AI request failed')
        return
      }

      if (data.content) {
        const normalized = normalizeSummaryParagraph(data.content)
        setSummaryPreview(normalized)
        showToast('success', 'Preview generated - click Apply to update')
      }
    } catch (error) {
      console.error('[AI] error rewriting:', error)
      showToast('error', 'AI request failed')
    } finally {
      setLoading(prev => ({ ...prev, rewrite: false }))
    }
  }

  const handleCompare = async () => {
    if (!summaryMd.trim()) {
      showToast('error', 'Please generate or write content first')
      return
    }

    // Start preview timer on first AI button click if not paid and not started
    if (!hasAiAccess) {
      const endAt = startPreview()
      const remaining = Math.max(0, Math.floor((endAt - Date.now()) / 1000))
      setPreviewState('preview_active')
      setPreviewRemaining(remaining)
      setPreviewEnded(false)
      setShowPreviewBlur(false)
      setShowInputBlur(false)
      if (!previewInitialized) {
        setPreviewInitialized(true)
        trackEvent('preview_started', { totalSeconds: PREVIEW_SECONDS })
      }
    }

    // Check if AI can be used (after starting preview)
    if (!canUseAI()) {
      // Preview ended, show paywall
      setPreviewState('preview_ended')
      setPaywallVariant('preview-ended')
      setShowPreviewBlur(true)
      setShowInputBlur(false)
      return
    }

    const payload = {
      content: summaryMd,
      keywords,
    }
    console.log('[AI] compare payload:', payload)
    setLoading(prev => ({ ...prev, compare: true }))
    
    try {
      const previewEndAt = getPreviewEndAt()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (previewEndAt) {
        headers['x-preview-end'] = previewEndAt.toString()
      }

      const response = await fetch('/api/compare', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log('[AI] result:', data)

      if (!response.ok || !data.ok) {
        console.error('[AI] request failed')
        showToast('error', 'AI request failed')
        return
      }

      if (data.variants && data.variants.length > 0) {
        const normalizedVariants = data.variants.map((v: Variant) => ({
          ...v,
          content: normalizeSummaryParagraph(v.content)
        }))
        setVariants(normalizedVariants)
        setShowCompare(true)
        showToast('success', 'Generated variants')
      }
    } catch (error) {
      console.error('[AI] error comparing:', error)
      showToast('error', 'AI request failed')
    } finally {
      setLoading(prev => ({ ...prev, compare: false }))
    }
  }

  const handleSelectVariant = (variant: Variant) => {
    const normalized = normalizeSummaryParagraph(variant.content)
    setSummaryPreview(normalized)
    setVariants([])
    setShowCompare(false)
    showToast('success', 'Preview generated - click Apply to update')
  }

  const handleRewriteSummary = async (mode: string = 'enhance') => {
    if (!summaryMd.trim()) {
      showToast('error', 'Please add summary content first')
      return
    }

    // Start preview timer on first AI button click if not paid and not started
    if (!hasAiAccess) {
      const endAt = startPreview()
      const remaining = Math.max(0, Math.floor((endAt - Date.now()) / 1000))
      setPreviewState('preview_active')
      setPreviewRemaining(remaining)
      setPreviewEnded(false)
      setShowPreviewBlur(false)
      setShowInputBlur(false)
      if (!previewInitialized) {
        setPreviewInitialized(true)
        trackEvent('preview_started', { totalSeconds: PREVIEW_SECONDS })
      }
    }

    // Check if AI can be used (after starting preview)
    if (!canUseAI()) {
      // Preview ended, show paywall
      setPreviewState('preview_ended')
      setPaywallVariant('preview-ended')
      setShowPreviewBlur(true)
      setShowInputBlur(false)
      return
    }

    // Set loading state immediately for instant feedback
    setLoading(prev => ({ ...prev, rewriteSummary: true }))

    try {
      const previewEndAt = getPreviewEndAt()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (previewEndAt) {
        headers['x-preview-end'] = previewEndAt.toString()
      }

      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: summaryMd,
          mode: mode,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        showToast('error', 'AI request failed')
        return
      }

      if (data.content) {
        const normalized = normalizeSummaryParagraph(data.content)
        setSummaryPreview(normalized)
        showToast('success', 'Preview generated - click Apply to update')
      }
    } catch (error) {
      console.error('[AI] error rewriting summary:', error)
      showToast('error', 'AI request failed')
    } finally {
      setLoading(prev => ({ ...prev, rewriteSummary: false }))
    }
  }

  const handleRewriteDescription = async (index: number, originalText: string, mode: string = 'enhance') => {
    // Prevent multiple clicks while loading
    if (loading.rewriteDescription[index]) {
      return
    }

    if (!originalText.trim()) {
      showToast('error', 'Please add description first')
      return
    }

    // Start preview timer on first AI button click if not paid and not started
    if (!hasAiAccess) {
      const endAt = startPreview()
      const remaining = Math.max(0, Math.floor((endAt - Date.now()) / 1000))
      setPreviewState('preview_active')
      setPreviewRemaining(remaining)
      setPreviewEnded(false)
      setShowPreviewBlur(false)
      setShowInputBlur(false)
      if (!previewInitialized) {
        setPreviewInitialized(true)
        trackEvent('preview_started', { totalSeconds: PREVIEW_SECONDS })
      }
    }

    // Check if AI can be used (after starting preview)
    if (!canUseAI()) {
      // Preview ended, show paywall
      setPreviewState('preview_ended')
      setPaywallVariant('preview-ended')
      setShowPreviewBlur(true)
      setShowInputBlur(false)
      return
    }

    // Set loading state immediately for instant feedback
    setLoading(prev => ({ ...prev, rewriteDescription: { ...prev.rewriteDescription, [index]: true } }))

    try {
      const previewEndAt = getPreviewEndAt()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (previewEndAt) {
        headers['x-preview-end'] = previewEndAt.toString()
      }

      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: originalText,
          mode: mode,
        }),
      })

      // Check network/response errors first
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[AI] HTTP error rewriting description:', response.status, errorData)
        showToast('error', 'AI service temporarily unavailable. Please try again.')
        return
      }

      const data = await response.json()

      // Check API-level errors
      if (!data.ok) {
        console.error('[AI] API error rewriting description:', data)
        showToast('error', 'AI service temporarily unavailable. Please try again.')
        return
      }

      // Success: process and set the content
      if (data.content) {
        // Use Stable Formatting Mode: strip prefaces, normalize bullets to •, collapse blank lines
        let normalized = normalizeStableFormatting(data.content)
        
        // Trim to last full sentence if output is too long (max 2000 chars)
        normalized = trimToLastFullSentence(normalized, 2000)
        
        setExperienceDescriptionPreview(index, normalized)
        showToast('success', 'Preview generated')
      } else {
        // No content in response
        console.error('[AI] No content in response:', data)
        showToast('error', 'AI service temporarily unavailable. Please try again.')
      }
    } catch (error) {
      // Handle network errors, timeouts, or any other exceptions
      console.error('[AI] Error rewriting description:', error)
      showToast('error', 'AI service temporarily unavailable. Please try again.')
      // Previous text is kept safe - we don't overwrite on error
    } finally {
      // Always reset loading state, ensuring button returns to normal
      setLoading(prev => ({ ...prev, rewriteDescription: { ...prev.rewriteDescription, [index]: false } }))
    }
  }

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!hasAiAccess) {
      return
    }
    setLoading(prev => ({ ...prev, export: true }))
    try {
      const name = personal.fullName || 'CV'
      const date = new Date().toISOString().split('T')[0]
      
      if (format === 'pdf') {
        const filename = `CV-${name.replace(/\s+/g, '-')}-${date}`
        await exportToPDF('cv-preview', filename)
      } else {
        // DOCX filename: CV-[UserName]-[Date].docx
        const filename = `CV-${name.replace(/\s+/g, '-')}-${date}`
        
        const sections: Array<{ title: string; content: string[] }> = []
        
        // Personal Info - only include filled fields
        const contactInfoParts: string[] = []
        if (personal.email && personal.email.trim()) contactInfoParts.push(personal.email)
        if (personal.phone && personal.phone.trim()) contactInfoParts.push(personal.phone)
        if (personal.city && personal.city.trim()) contactInfoParts.push(personal.city)
        if (personal.linkedin && personal.linkedin.trim()) {
          contactInfoParts.push(formatUrlForDisplay(personal.linkedin))
        }
        if (personal.website && personal.website.trim()) {
          contactInfoParts.push(formatUrlForDisplay(personal.website))
        }
        const contactInfo = contactInfoParts.join(' · ')
        
        if (contactInfo) {
          sections.push({ title: 'Contact Information', content: [contactInfo] })
        }
        
        // Summary - only include if content exists
        const summaryContent = summaryPreview || summaryMd
        if (summaryContent && summaryContent.trim()) {
          sections.push({ title: 'Summary', content: [summaryContent] })
        }
        
        // Experience - filter empty entries and only include filled fields
        const validExperience = experience?.filter(exp => 
          (exp.role && exp.role.trim()) || (exp.company && exp.company.trim())
        ) || []
        
        if (validExperience.length > 0) {
          const expContent = validExperience.flatMap(exp => {
            const parts: string[] = []
            if (exp.role && exp.role.trim()) parts.push(exp.role)
            if (exp.company && exp.company.trim()) parts.push(exp.company)
            if (parts.length === 0) return []
            
            const line = parts.join(' — ') + (exp.period && exp.period.trim() ? ` (${exp.period})` : '')
            const desc = (exp.description && exp.description.trim()) ? [exp.description] : []
            return [line, ...desc]
          }).filter(Boolean)
          
          if (expContent.length > 0) {
            sections.push({ title: 'Experience', content: expContent })
          }
        }
        
        // Education - filter empty entries and only include filled fields
        const validEducation = education?.filter(edu => 
          (edu.degree && edu.degree.trim()) || (edu.school && edu.school.trim())
        ) || []
        
        if (validEducation.length > 0) {
          const eduContent = validEducation.map(edu => {
            const parts: string[] = []
            if (edu.degree && edu.degree.trim()) parts.push(edu.degree)
            if (edu.school && edu.school.trim()) parts.push(edu.school)
            if (edu.year && edu.year.trim()) parts.push(edu.year)
            
            let line = parts.join(' — ')
            if (edu.details && edu.details.trim()) line += `\n${edu.details}`
            return line
          }).filter(line => line.trim())
          
          if (eduContent.length > 0) {
            sections.push({ title: 'Education', content: eduContent })
          }
        }
        
        // Skills - only include if skills exist
        if (skills && skills.length > 0) {
          sections.push({ title: 'Skills', content: [skills.join(', ')] })
        }
        
        await exportToDocx(name, sections, filename)
      }
      showToast('success', '✅ Export successful')
    } catch (error) {
      console.error('Export error:', error)
      showToast('error', `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(prev => ({ ...prev, export: false }))
    }
  }

  const funnelStrings = FUNNEL_STRINGS[funnelLang]

  // Temporary debug logs for paywall visibility – remove after verification
  useEffect(() => {
    if (showPaywall) {
      console.log('paywall:active', { previewState })
    } else {
      console.log('paywall:hidden', { previewState })
    }
  }, [showPaywall, previewState])

  useEffect(() => {
    const paywallVisible = showPaywall && !!paywallVariant
    if (paywallVisible) {
      trackEvent('paywall_shown', { variant: paywallVariant })
    }
  }, [showPaywall, paywallVariant])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-platinum dark:from-gray-900 dark:to-page text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-20 right-4 z-50 p-4 rounded-2xl shadow-md flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
          onClick={() => setToast(null)}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-white" />
          ) : (
            <AlertCircle className="w-5 h-5 text-white" />
          )}
          <span className="text-white font-medium">{toast.message}</span>
        </motion.div>
      )}

      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-violet-accent" />
            <span className="text-2xl font-heading font-bold">AI CV Generator Pro</span>
          </Link>
          <div className="flex items-center gap-4">
            {mounted && hasAiAccess && remainingFormatted ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
                <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
                  AI access:
                </span>
                <span className="text-sm font-mono font-bold text-violet-600 dark:text-violet-400">
                  {remainingFormatted}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">left</span>
              </div>
            ) : mounted ? (
              <>
                {/* During funnel, the primary CTA lives in the sticky preview bar */}
              </>
            ) : (
              // SSR placeholder - matches the button layout to prevent hydration mismatch
              <>
                <div className="hidden md:inline-flex h-[36px] w-[180px]" aria-hidden="true" />
                <div className="md:hidden h-[36px] w-[100px]" aria-hidden="true" />
              </>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/cover')}
            >
              Cover Letter
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      {/* Funnel bars */}
      {!hasAiAccess && previewState === 'preview_active' && previewRemaining !== null && (
        <PreviewTopBar
          remainingSeconds={previewRemaining}
          onPayClick={handleCheckout}
        />
      )}

      <div className={cn('container mx-auto px-4 py-8', showPaywall ? 'pointer-events-none select-none' : '')}>
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create, edit, and optimize your professional CV.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <div className="space-y-6">
            {/* Tabs */}
            <Card>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Tab)} className="w-full">
                <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-6 pointer-events-auto">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  {/* Layout tab - hidden for now, can be re-enabled later */}
                  {/* <TabsTrigger value="layout">Layout</TabsTrigger> */}
                </TabsList>

              {/* Tab Content */}
                <TabsContent value="personal">
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={personal.fullName || ''}
                      onChange={(e) => setPersonal({ fullName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={personal.email || ''}
                      onChange={(e) => setPersonal({ email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={personal.phone || ''}
                      onChange={(e) => setPersonal({ phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={personal.city || ''}
                      onChange={(e) => setPersonal({ city: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                    />
                    <div>
                      <input
                        type="text"
                        placeholder="LinkedIn (optional, e.g., linkedin.com/in/yourprofile)"
                        value={personal.linkedin || ''}
                        onChange={(e) => setPersonal({ linkedin: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                        aria-label="LinkedIn"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Website (optional, e.g., yourportfolio.com)"
                        value={personal.website || ''}
                        onChange={(e) => setPersonal({ website: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                        aria-label="Website"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="summary">
                  <div className="relative">
                    <textarea
                      placeholder="Professional summary or let AI generate it..."
                      className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 min-h-[200px] transition-colors duration-300 summary-input ${
                        (() => {
                          // Detect if text contains bullets (check for lines starting with canonical "- " or other bullet markers)
                          // After normalization, bullets are "- " format, but we also detect other markers for manual input
                          const text = summaryMd || ''
                          if (!text.trim()) return ''
                          // Pattern matches: optional whitespace, then bullet marker (including normalized "-"), then required space
                          const bulletPattern = /^\s*[•●·\-\*\u2022\u2023\u2043\u2219\u2013\u2014]\s+/m
                          return bulletPattern.test(text) ? 'has-bullets' : ''
                        })()
                      }`}
                      value={summaryMd || ''}
                      onChange={(e) => setSummary(e.target.value)}
                      onCopy={(e) => {
                        if (showInputBlur && lockedInputsRef.has('summary') && !hasAiAccess) {
                          e.preventDefault()
                        }
                      }}
                      onCut={(e) => {
                        if (showInputBlur && lockedInputsRef.has('summary') && !hasAiAccess) {
                          e.preventDefault()
                        }
                      }}
                      onPaste={(e) => {
                        if (showInputBlur && lockedInputsRef.has('summary') && !hasAiAccess) {
                          e.preventDefault()
                        }
                      }}
                      style={{
                        pointerEvents: showInputBlur && lockedInputsRef.has('summary') && !hasAiAccess ? 'none' : 'auto',
                        userSelect: showInputBlur && lockedInputsRef.has('summary') && !hasAiAccess ? 'none' : 'auto',
                      }}
                    />
                    {showInputBlur && lockedInputsRef.has('summary') && !hasAiAccess && (
                      <InputBlurOverlay onUnlock={() => {
                        setShowInputBlur(false)
                        setLockedInputsRef(new Set())
                      }} 
                      showButton={previewState === 'preview_ended'}
                      />
                    )}
                  </div>
                  {/* AI Improve Summary button */}
                  {summaryMd && summaryMd.trim() && (
                    <div className="flex justify-end mt-2">
                      <AiButtonOverlay disabled={!canUseAI()} previewActive={previewActive}>
                        <button
                          onClick={() => handleRewriteSummary(rewriteMode)}
                          disabled={loading.rewriteSummary}
                          className="flex items-center gap-2 px-4 py-2 bg-[#22C55E] text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading.rewriteSummary ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              AI working...
                            </>
                          ) : (
                            <>
                              <Sparkles size={16} />
                              AI Improve Summary
                            </>
                          )}
                        </button>
                      </AiButtonOverlay>
                    </div>
                  )}
                  {/* Preview Display */}
                  {summaryPreview && (
                    <div className="mt-4 p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-violet-900 dark:text-violet-200">AI Preview Available</span>
                        <div className="flex gap-2">
                          {!showInputBlur || hasAiAccess ? (
                            <>
                              <button
                                onClick={() => {
                                  if (!summaryPreview?.trim()) {
                                    showToast('error', 'No preview to apply');
                                    return;
                                  }
                                  applySummaryPreview();
                                  showToast('success', 'Applied to form');
                                }}
                                disabled={!summaryPreview?.trim()}
                                className="px-3 py-1 bg-violet text-white rounded-lg hover:bg-violet/90 text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Apply to Form
                              </button>
                              <button
                                onClick={() => {
                                  clearSummaryPreview();
                                  showToast('success', 'Preview cancelled');
                                }}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                              >
                                Cancel
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">AI-generated content ready to apply</p>
                      <div 
                        className="bg-white dark:bg-gray-800 p-3 rounded-lg"
                        onCopy={(e) => {
                          if (showInputBlur && lockedInputsRef.has('summary') && !hasAiAccess) {
                            e.preventDefault()
                          }
                        }}
                        onCut={(e) => {
                          if (showInputBlur && lockedInputsRef.has('summary') && !hasAiAccess) {
                            e.preventDefault()
                          }
                        }}
                        style={{
                          pointerEvents: showInputBlur && lockedInputsRef.has('summary') && !hasAiAccess ? 'none' : 'auto',
                          userSelect: showInputBlur && lockedInputsRef.has('summary') && !hasAiAccess ? 'none' : 'auto',
                        }}
                      >
                        <AIPreviewText text={summaryPreview || ''} paragraph={true} />
                      </div>
                      {showInputBlur && lockedInputsRef.has('summary') && !hasAiAccess && (
                        <InputBlurOverlay onUnlock={() => {
                          setShowInputBlur(false)
                          setLockedInputsRef(new Set())
                        }} />
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="experience">
                  <div className="space-y-4">
                    <button
                      onClick={() => addExperience()}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-accent text-white rounded-lg hover:bg-violet-accent/90 transition w-full justify-center"
                    >
                      <Plus size={20} />
                      Add Experience
                    </button>
                    {experience.map((exp, idx) => (
                      <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-3">
                        <input
                          type="text"
                          placeholder="Role"
                          value={exp.role}
                          onChange={(e) => updateExperience(idx, { role: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                        />
                        <input
                          type="text"
                          placeholder="Company"
                          value={exp.company}
                          onChange={(e) => updateExperience(idx, { company: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                        />
                        <input
                          type="text"
                          placeholder="Period"
                          value={exp.period || ''}
                          onChange={(e) => updateExperience(idx, { period: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                        />
                        <div className="relative">
                          <textarea
                            placeholder="Description"
                            rows={3}
                            value={exp.description || ''}
                            onChange={(e) => {
                              // Don't normalize on every keystroke to avoid disrupting typing
                              // Normalization happens on paste and in preview rendering
                              updateExperience(idx, { description: e.target.value })
                            }}
                            onPaste={(e) => {
                              if (showInputBlur && lockedInputsRef.has(`exp-${idx}`) && !hasAiAccess) {
                                e.preventDefault()
                                return
                              }
                              
                              // Normalize pasted text: normalize bullets and preserve line breaks
                              e.preventDefault()
                              const pastedText = e.clipboardData.getData('text/plain')
                              const normalized = normalizeStableFormatting(pastedText)
                              
                              // Insert normalized text at cursor position
                              const textarea = e.currentTarget
                              const start = textarea.selectionStart || 0
                              const end = textarea.selectionEnd || 0
                              const currentValue = textarea.value || ''
                              const newValue = currentValue.substring(0, start) + normalized + currentValue.substring(end)
                              updateExperience(idx, { description: newValue })
                              
                              // Set cursor position after pasted content
                              setTimeout(() => {
                                textarea.selectionStart = textarea.selectionEnd = start + normalized.length
                              }, 0)
                            }}
                            className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300 description-input ${
                              (() => {
                                // Detect if text contains bullets (check for lines starting with canonical "- " or other bullet markers)
                                // After normalization, bullets are "- " format, but we also detect other markers for manual input
                                const text = exp.description || ''
                                if (!text.trim()) return ''
                                // Pattern matches: optional whitespace, then bullet marker (including normalized "-"), then required space
                                const bulletPattern = /^\s*[•●·\-\*\u2022\u2023\u2043\u2219\u2013\u2014]\s+/m
                                return bulletPattern.test(text) ? 'has-bullets' : ''
                              })()
                            }`}
                            onCopy={(e) => {
                              if (showInputBlur && lockedInputsRef.has(`exp-${idx}`) && !hasAiAccess) {
                                e.preventDefault()
                              }
                            }}
                            onCut={(e) => {
                              if (showInputBlur && lockedInputsRef.has(`exp-${idx}`) && !hasAiAccess) {
                                e.preventDefault()
                              }
                            }}
                            style={{
                              pointerEvents: showInputBlur && lockedInputsRef.has(`exp-${idx}`) && !hasAiAccess ? 'none' : 'auto',
                              userSelect: showInputBlur && lockedInputsRef.has(`exp-${idx}`) && !hasAiAccess ? 'none' : 'auto',
                            }}
                          />
                          {showInputBlur && lockedInputsRef.has(`exp-${idx}`) && !hasAiAccess && (
                            <InputBlurOverlay onUnlock={() => {
                              const newLocked = new Set(lockedInputsRef)
                              newLocked.delete(`exp-${idx}`)
                              setLockedInputsRef(newLocked)
                              if (newLocked.size === 0) {
                                setShowInputBlur(false)
                              }
                            }} 
                            showButton={previewState === 'preview_ended'}
                            />
                          )}
                        </div>
                        {/* Revert button - shows when there's a previous value to revert to */}
                        {previousExperienceDescriptions[idx] !== undefined && (
                          <button
                            onClick={() => {
                              revertExperienceDescription(idx)
                              showToast('success', 'Reverted to previous version')
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm w-full"
                          >
                            <Undo2 size={16} />
                            Revert
                          </button>
                        )}
                        {/* AI Rewrite button for description */}
                        {exp.description && (
                          <AiButtonOverlay disabled={!canUseAI()} previewActive={previewActive}>
                            <button
                              onClick={() => handleRewriteDescription(idx, exp.description || '', rewriteMode)}
                              disabled={loading.rewriteDescription[idx]}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loading.rewriteDescription[idx] ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  AI working...
                                </>
                              ) : (
                                <>
                                  <Sparkles size={16} />
                                  AI Rewrite Description
                                </>
                              )}
                            </button>
                          </AiButtonOverlay>
                        )}
                        {/* Preview Display for description */}
                        {experienceDescriptionPreviews[idx] && (
                          <div className="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl relative">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-violet-900 dark:text-violet-200">AI Preview Available</span>
                              <div className="flex gap-2">
                                {!showInputBlur || hasAiAccess ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        const success = applyExperienceDescriptionPreview(idx)
                                        if (success) {
                                          showToast('success', 'Applied to form')
                                        } else {
                                          showToast('error', 'Nothing to apply.')
                                        }
                                      }}
                                      className="px-3 py-1 bg-violet text-white rounded-lg hover:bg-violet/90 text-sm flex items-center gap-1"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      Apply
                                    </button>
                                    <button
                                      onClick={() => clearExperienceDescriptionPreview(idx)}
                                      className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : null}
                              </div>
                            </div>
                            <div 
                              className="bg-white dark:bg-gray-800 p-3 rounded-lg"
                              onCopy={(e) => {
                                if (showInputBlur && lockedInputsRef.has(`exp-${idx}`) && !hasAiAccess) {
                                  e.preventDefault()
                                }
                              }}
                              onCut={(e) => {
                                if (showInputBlur && lockedInputsRef.has(`exp-${idx}`) && !hasAiAccess) {
                                  e.preventDefault()
                                }
                              }}
                              style={{
                                pointerEvents: showInputBlur && lockedInputsRef.has(`exp-${idx}`) && !hasAiAccess ? 'none' : 'auto',
                                userSelect: showInputBlur && lockedInputsRef.has(`exp-${idx}`) && !hasAiAccess ? 'none' : 'auto',
                              }}
                            >
                              <AIPreviewText text={experienceDescriptionPreviews[idx] || ''} />
                            </div>
                            {showInputBlur && lockedInputsRef.has(`exp-${idx}`) && !hasAiAccess && (
                              <InputBlurOverlay onUnlock={() => {
                                const newLocked = new Set(lockedInputsRef)
                                newLocked.delete(`exp-${idx}`)
                                setLockedInputsRef(newLocked)
                                if (newLocked.size === 0) {
                                  setShowInputBlur(false)
                                }
                              }} />
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => removeExperience(idx)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="education">
                  <div className="space-y-4">
                    <button
                      onClick={() => addEducation()}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-accent text-white rounded-lg hover:bg-violet-accent/90 transition w-full justify-center"
                    >
                      <Plus size={20} />
                      Add Education
                    </button>
                    {education.map((edu, idx) => (
                      <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-3">
                        <input
                          type="text"
                          placeholder="Degree"
                          value={edu.degree}
                          onChange={(e) => updateEducation(idx, { degree: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                        />
                        <input
                          type="text"
                          placeholder="School"
                          value={edu.school}
                          onChange={(e) => updateEducation(idx, { school: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                        />
                        <input
                          type="text"
                          placeholder="Year"
                          value={edu.year || ''}
                          onChange={(e) => updateEducation(idx, { year: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                        />
                        <input
                          type="text"
                          placeholder="Details (optional)"
                          value={edu.details || ''}
                          onChange={(e) => updateEducation(idx, { details: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                        />
                        <button
                          onClick={() => removeEducation(idx)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="skills">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Enter skills separated by commas (e.g., HTML, CSS, Adobe Photoshop)"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                        value={skillsInputValue}
                        onChange={(e) => handleSkillsInputChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddSkillsFromInput()
                          } else if (e.key === 'Backspace' && skillsInputValue === '' && skills.length > 0) {
                            // Remove last skill when backspace on empty input
                            setSkills(skills.slice(0, -1))
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault()
                          const pastedText = e.clipboardData.getData('text')
                          handlePasteSkills(pastedText)
                        }}
                      />
                      {skills.length >= 25 && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          Maximum 25 skills allowed. Consider removing some to add new ones.
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', lineHeight: 'normal' }}>
                        {skills.map((skill, idx) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center gap-1 bg-violet-accent/10 dark:bg-violet-accent/20 text-violet-accent dark:text-violet-200 rounded-full text-sm font-medium"
                            style={{ padding: '4px 12px', minHeight: '18px', height: 'auto', lineHeight: '1.2', display: 'inline-flex', alignItems: 'center' }}
                          >
                            {skill.length > 30 ? (
                              <>
                                <span className="truncate" style={{ maxWidth: '30ch' }}>{skill.slice(0, 30)}</span>
                                <span className="text-xs opacity-75" title={skill}>...</span>
                              </>
                            ) : (
                              skill
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(idx)}
                              className="ml-1 hover:bg-violet-accent/20 rounded-full p-0.5 transition-colors"
                              aria-label="Remove skill"
                            >
                              <span className="text-xs leading-none">×</span>
                            </button>
                          </span>
                        ))}
                      </div>
                      {skills.some(s => s.length > 30) && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          Some skills exceed 30 characters. Consider shortening them.
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Layout tab content - hidden for now, can be re-enabled later */}
                {/* <TabsContent value="layout">
                  <div className="grid grid-cols-2 gap-4">
                    {(['minimal', 'modern', 'corporate'] as const).map((layoutOption) => (
                      <button
                        key={layoutOption}
                        onClick={() => setLayout(layoutOption)}
                        className={`p-4 rounded-xl border-2 text-center capitalize transition-all ${
                          layout === layoutOption
                            ? 'border-violet-accent bg-violet-accent/10'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                        }`}
                      >
                        {layoutOption}
                      </button>
                    ))}
                  </div>
                </TabsContent> */}
              </Tabs>
            </Card>

            {/* AI Engine Panel - Only visible on Summary tab */}
            {activeTab === 'summary' && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-heading font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-accent" />
                    AI Engine
                  </h3>
                  {/* Pay CTA is centralized in the preview funnel bar and modal */}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Generate from Keywords</label>
                    <p className="text-xs text-muted-foreground mb-2">No summary yet? Enter a few keywords and AI will generate one for you.</p>
                    <textarea
                      placeholder="e.g., Senior Software Engineer, Python, React, AWS..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      💡 Type a few keywords (e.g., graphic design, leadership, problem solving) and AI will create a brand-new summary.
                    </p>
                    <AiButtonOverlay disabled={!canUseAI()} previewActive={previewActive}>
                      <Button
                        onClick={handleGenerate}
                        disabled={loading.gen || !keywords}
                        isLoading={loading.gen}
                        className="mt-2 w-full"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Summary from Keywords
                      </Button>
                    </AiButtonOverlay>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Rewrite Mode</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-2"
                      value={rewriteMode}
                      onChange={(e) => setRewriteMode(e.target.value)}
                    >
                      <option value="enhance">Enhance</option>
                      <option value="executive">Executive Tone</option>
                      <option value="creative">Creative Portfolio</option>
                      <option value="academic">Academic Formal</option>
                    </select>
                    <AiButtonOverlay disabled={!canUseAI()} previewActive={previewActive}>
                      <Button
                        onClick={handleRewrite}
                        disabled={loading.rewrite || !summaryMd}
                        isLoading={loading.rewrite}
                        variant="secondary"
                        className="w-full"
                      >
                        Rewrite
                      </Button>
                    </AiButtonOverlay>
                  </div>

                  <AiButtonOverlay disabled={!canUseAI()} previewActive={previewActive}>
                    <Button
                      onClick={handleCompare}
                      disabled={loading.compare || !summaryMd}
                      isLoading={loading.compare}
                      variant="outline"
                      className="w-full"
                    >
                      Compare 3 AI Versions
                    </Button>
                  </AiButtonOverlay>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Generate and compare three different AI-written versions of your text.
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <Card>
                <div className="mb-4">
                  <h3 className="text-xl font-heading font-semibold mb-4">Preview</h3>
                    <div className="flex flex-col items-center">
                    <div className="flex flex-row gap-4 items-center justify-center">
                      <Button 
                        size="sm" 
                        onClick={() => handleExport('pdf')} 
                        isLoading={loading.export}
                        disabled={!hasAiAccess}
                        className="rounded-full px-4 py-2 focus-visible:ring-2 focus-visible:ring-violet-accent focus-visible:ring-offset-2"
                        aria-label="Download PDF"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleExport('docx')} 
                        isLoading={loading.export}
                        disabled={!hasAiAccess}
                        className="rounded-full px-4 py-2 border-2 border-violet-accent text-violet-accent hover:bg-violet-accent hover:text-white bg-transparent dark:bg-transparent dark:border-violet-accent dark:text-violet-accent dark:hover:bg-violet-accent dark:hover:text-white focus-visible:ring-2 focus-visible:ring-violet-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Download DOCX"
                        aria-describedby="docx-helper-text"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        DOCX
                      </Button>
                    </div>
                    {!hasAiAccess && (
                      <div
                        className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
                        title={funnelStrings.lockTooltip}
                      >
                        <Lock className="w-3 h-3" />
                        <span>{funnelStrings.lockTooltip}</span>
                      </div>
                    )}
                    <span 
                      id="docx-helper-text" 
                      className="text-xs mt-2 text-center"
                      style={{ 
                        fontSize: '12px', 
                        color: '#9CA3AF',
                        fontFamily: 'inherit',
                        fontWeight: 'normal'
                      }}
                    >
                      Download DOCX to edit or add more details.
                    </span>
                  </div>
                </div>
              <div className="flex justify-center">
                <div className="a4-preview-frame transition-all duration-500 relative">
                  <div
                    ref={previewRef}
                    key={debouncedUpdateKey}
                    className={cn(
                      'a4-paper cv-container',
                      !hasAiAccess ? 'select-none' : ''
                    )}
                    onCopy={(e) => {
                      if (!hasAiAccess) e.preventDefault()
                    }}
                    onPaste={(e) => {
                      if (!hasAiAccess) e.preventDefault()
                    }}
                    onContextMenu={(e) => {
                      if (!hasAiAccess) e.preventDefault()
                    }}
                    onKeyDown={(e) => {
                      if (!hasAiAccess && (e.metaKey || e.ctrlKey)) {
                        const key = e.key.toLowerCase()
                        if (key === 'c' || key === 'v' || key === 's') {
                          e.preventDefault()
                        }
                      }
                    }}
                  >
                    <PreviewContent
                      personal={personal}
                      summaryMd={summaryMd}
                      summaryPreview={summaryPreview}
                      experience={experience}
                      experienceDescriptionPreviews={experienceDescriptionPreviews}
                      education={education}
                      skills={skills}
                      layout={layout}
                      isLocked={showPaywall}
                      watermarkText={showPaywall ? funnelStrings.watermark : undefined}
                    />
                  </div>
                  {showPaywall && (
                    <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-4">
                      <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-400 bg-white/80 dark:bg-gray-900/80 px-3 py-1 rounded-full">
                        {funnelStrings.watermark}
                      </span>
                    </div>
                  )}
                  {showPreviewBlur && !hasAiAccess && (
                    <PreviewBlurOverlay 
                      onUnlock={() => setShowPreviewBlur(false)} 
                      showButton={previewState === 'preview_ended'}
                    />
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Compare Panel */}
      <ComparePanel
        variants={variants}
        isOpen={showCompare}
        onClose={() => setShowCompare(false)}
        onSelect={handleSelectVariant}
        paragraph={true}
      />
      {/* Hard overlay + paywall when access is locked */}
      {showPaywall && (
        <>
          <div
            className="fixed inset-0 z-30 bg-transparent"
            onClick={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          />
          {paywallVariant && (
            <PreviewPaywallModal
              isOpen={true}
              variant={paywallVariant}
            />
          )}
        </>
      )}

    </div>
  )
}
