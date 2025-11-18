'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Download, CheckCircle2, AlertCircle, FileText, CreditCard } from 'lucide-react'
import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { ComparePanel } from '@/components/ComparePanel'
import CoverPreview from '@/components/cover/Preview'
import { useCoverStore } from '@/lib/cover-store'
import { useCVStore } from '@/lib/store'
import { exportToPDF } from '@/lib/pdf'
import { exportToDocx } from '@/lib/docx'
import { normalizeCoverLetter, cleanCoverLetterText, normalizeSummaryParagraph, stripPlaceholders } from '@/lib/normalize'
import { startCheckout } from '@/lib/checkout'
import { useAiAccess } from '@/lib/use-ai-access'
import { canUseAI, getPreviewEndAt, startPreview, getAiPreviewStartAt, isPreviewEnded, getPreviewRemainingSeconds } from '@/utils/access'
import { AiButtonOverlay } from '@/components/AiButtonOverlay'
import { PreviewBlurOverlay } from '@/components/PreviewBlurOverlay'
import { InputBlurOverlay } from '@/components/InputBlurOverlay'
import { AIPreviewText } from '@/components/AIPreviewText'
import { PreviewPaywallModal } from '@/components/PreviewPaywallModal'
import { PreviewTopBar } from '@/components/PreviewTopBar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { LAUNCH_PRICE_GBP, PREVIEW_SECONDS } from '@/lib/funnelConfig'
import { trackEvent } from '@/lib/analytics'
import Link from 'next/link'

type PreviewState = 'preview_active' | 'preview_ended' | 'unlocked_24h'

type Tab = 'recipient' | 'letter' | 'layout'

interface Variant {
  id: 'A' | 'B' | 'C'
  letter: string
}

export default function CoverPage() {
  const [activeTab, setActiveTab] = useState<Tab>('recipient')
  const [generateMode, setGenerateMode] = useState<'Executive' | 'Creative' | 'Academic' | 'Technical'>('Executive')
  const [rewriteMode, setRewriteMode] = useState<'Enhance' | 'Executive Tone' | 'Creative Portfolio' | 'Academic Formal'>('Enhance')
  const [variants, setVariants] = useState<Variant[]>([])
  const [showCompare, setShowCompare] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState({ gen: false, rewrite: false, compare: false, export: false, improve: false })
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [aiPreview, setAiPreview] = useState<string>('')
  const [isImprovePreview, setIsImprovePreview] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const priceLabel = `£${LAUNCH_PRICE_GBP.toFixed(2)}`

  // Prevent hydration mismatch by only rendering client-specific content after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // AI Access state
  const { valid: hasAiAccess, remainingFormatted } = useAiAccess()
  const [prevValid, setPrevValid] = useState<boolean | null>(null)
  const [showPreviewBlur, setShowPreviewBlur] = useState(false)
  const [showInputBlur, setShowInputBlur] = useState(false)
  const [lockedInputsRef, setLockedInputsRef] = useState<Set<string>>(new Set())
  
  // Preview state tracking
  const [previewState, setPreviewState] = useState<PreviewState | 'not_started'>('not_started')
  const [previewInitialized, setPreviewInitialized] = useState(false)
  const [previewRemaining, setPreviewRemaining] = useState<number | null>(null)
  const [previewEnded, setPreviewEnded] = useState(false)
  const [paywallVariant, setPaywallVariant] = useState<'preview-ended' | 'access-expired' | null>(null)
  const previewActive = !hasAiAccess && previewState === 'preview_active'
  const showPaywall = !hasAiAccess && previewState === 'preview_ended'

  // Prevent hydration mismatch - mounted state is set in useEffect after client hydration

  const {
    recipientName,
    company,
    cityState,
    role,
    keywords,
    letterBody,
    applicantName,
    layout,
    atsMode,
    setRecipientInfo,
    setKeywords,
    setLetterBody,
    setApplicantName,
    setLayout,
    setAtsMode,
  } = useCoverStore()

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
    }
    
    // If user gains access, clear the blur and reset preview funnel
    if (!prevValid && hasAiAccess) {
      setShowPreviewBlur(false)
      setShowInputBlur(false)
      setLockedInputsRef(new Set())
      setPreviewRemaining(null)
      setPreviewEnded(false)
      setPreviewInitialized(false)
      setPreviewState('unlocked_24h')
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
      const remaining = getPreviewRemainingSeconds()
      
      if (remaining <= 0) {
        clearInterval(interval)
        setPreviewEnded(true)
        setPreviewState('preview_ended')
        setPreviewRemaining(0)
        setPaywallVariant('preview-ended')
        setShowPreviewBlur(true)
        setShowInputBlur(false)
        trackEvent('preview_ended')
        return
      }

      setPreviewRemaining(remaining)
    }, 1000)

    return () => clearInterval(interval)
  }, [mounted, hasAiAccess, previewState, previewRemaining])

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

  const { personal } = useCVStore()

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('[COVER PAGE] mounted')
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleGenerate = async () => {
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

    setLoading(prev => ({ ...prev, gen: true }))

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 30000) // 30 second timeout
      )

      const previewEndAt = getPreviewEndAt()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (previewEndAt) {
        headers['x-preview-end'] = previewEndAt.toString()
      }

      const fetchPromise = fetch('/api/cover/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          applicantName: applicantName, // keep user's name field unchanged
          recipientName, company, cityState, role, mode: generateMode, keywords
        }),
      })

      const res = await Promise.race([fetchPromise, timeoutPromise]) as Response

      let data: any = null
      try { data = await res.json(); } catch {}

      if (!res.ok || !data?.ok) {
        showToast('error', 'AI temporarily unavailable. Using a safe draft.')
        // fallback to mock if server ever returns non-ok - use local preview state
        const cleanedText = cleanCoverLetterText(
          data?.letter || '(temporary draft)…',
          applicantName
        )
        setAiPreview(cleanedText)
        setIsImprovePreview(false)
        showToast('success', 'Preview generated - click Apply to update')
      } else {
        // Clean the AI-generated text and store in local preview state (preview only)
        const cleanedText = cleanCoverLetterText(data.letter, applicantName)
        setAiPreview(cleanedText)
        setIsImprovePreview(false)
        showToast('success', 'Preview generated - click Apply to update')
      }
    } catch (error: any) {
      console.error('[AI] Generate error:', error)
      showToast('error', 'Request timed out or failed. Please try again.')
    } finally {
      setLoading(prev => ({ ...prev, gen: false }))
    }
  }

  const handleImprove = async () => {
    if (!letterBody.trim()) {
      showToast('error', 'Please write or paste content first')
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

    console.log('[COVER] improve', { chars: letterBody.length })
    setLoading(prev => ({ ...prev, improve: true }))

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 30000) // 30 second timeout
      )

      const previewEndAt = getPreviewEndAt()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (previewEndAt) {
        headers['x-preview-end'] = previewEndAt.toString()
      }

      const fetchPromise = fetch('/api/cover/rewrite', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          letter: letterBody,
          mode: 'Improve',
          role,
          company,
          applicantName,
        }),
      })

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response

      const data = await response.json()
      console.log('[AI] improve result:', data)

      if (!response.ok || !data.ok) {
        console.error('[AI] request failed')
        showToast('error', '⚠️ AI request failed')
        return
      }

      if (data.body || data.letter) {
        // For Improve mode, we get just the body (paragraph text)
        // Normalize it to ensure it's a clean paragraph
        const improvedText = data.body || data.letter
        
        // Strip any prefixes and normalize to paragraph format
        const normalized = normalizeSummaryParagraph(improvedText.trim())
        
        if (normalized) {
          setAiPreview(normalized)
          setIsImprovePreview(true)
          showToast('success', 'Preview generated - click Apply to update')
        } else {
          showToast('error', 'Failed to generate improved version')
        }
      }
    } catch (error: any) {
      console.error('[AI] error improving cover letter:', error)
      showToast('error', error.message?.includes('timeout') ? 'Request timed out. Please try again.' : '⚠️ AI request failed')
    } finally {
      setLoading(prev => ({ ...prev, improve: false }))
    }
  }

  const handleRewrite = async () => {
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

    if (!letterBody.trim()) {
      showToast('error', 'Please generate or write content first')
      return
    }

    console.log('[COVER] rewrite', { mode: rewriteMode, chars: letterBody.length })
    setLoading(prev => ({ ...prev, rewrite: true }))

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 30000) // 30 second timeout
      )

      const previewEndAt = getPreviewEndAt()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (previewEndAt) {
        headers['x-preview-end'] = previewEndAt.toString()
      }

      const fetchPromise = fetch('/api/cover/rewrite', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          letter: letterBody,
          mode: rewriteMode,
        }),
      })

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response

      const data = await response.json()
      console.log('[AI] result:', data)

      if (!response.ok || !data.ok) {
        console.error('[AI] request failed')
        showToast('error', '⚠️ AI request failed')
        return
      }

      if (data.body) {
        // Clean the rewritten text (body only, no greetings/closings) and store in local preview state (preview only)
        // Use stripPlaceholders instead of cleanCoverLetterText since rewrite returns body-only text
        const cleanedText = stripPlaceholders(data.body.trim())
        setAiPreview(cleanedText)
        setIsImprovePreview(false)
        showToast('success', 'Preview generated - click Apply to update')
      } else if (data.letter) {
        // Fallback for backward compatibility - clean the text (body only, no greetings/closings) and store in local preview state
        // Use stripPlaceholders instead of cleanCoverLetterText since rewrite returns body-only text
        const cleanedText = stripPlaceholders(data.letter.trim())
        setAiPreview(cleanedText)
        setIsImprovePreview(false)
        showToast('success', 'Preview generated - click Apply to update')
        
      }
    } catch (error: any) {
      console.error('[AI] error rewriting cover letter:', error)
      showToast('error', error.message?.includes('timeout') ? 'Request timed out. Please try again.' : '⚠️ AI request failed')
    } finally {
      setLoading(prev => ({ ...prev, rewrite: false }))
    }
  }

  const handleCompare = async () => {
    if (!letterBody.trim()) {
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

    console.log('[COVER] compare', { keywords, mode: generateMode })
    setLoading(prev => ({ ...prev, compare: true }))

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 30000) // 30 second timeout
      )

      const previewEndAt = getPreviewEndAt()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (previewEndAt) {
        headers['x-preview-end'] = previewEndAt.toString()
      }

      const fetchPromise = fetch('/api/cover/compare', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: letterBody, // Pass current body text for rewriting/improving
          keywords,
          mode: generateMode,
          recipientName,
          company,
          role,
          fullName: applicantName,
        }),
      })

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response

      const data = await response.json()
      console.log('[AI] result:', data)

      if (!response.ok || !data.ok) {
        console.error('[AI] request failed')
        showToast('error', '⚠️ AI request failed')
        return
      }

      if (data.variants && data.variants.length > 0) {
        // Variants are already cleaned by the API (removes greetings and closings)
        // We just need to ensure they're trimmed and ready for display
        const normalizedVariants = data.variants.map((v: Variant) => ({
          ...v,
          letter: (v.letter || '').trim(),
          content: (v.letter || '').trim(), // For compatibility with ComparePanel
        }))
        setVariants(normalizedVariants)
        setShowCompare(true)
        showToast('success', 'Generated variants')
      }
    } catch (error: any) {
      console.error('[AI] error comparing cover letters:', error)
      showToast('error', error.message?.includes('timeout') ? 'Request timed out. Please try again.' : '⚠️ AI request failed')
    } finally {
      setLoading(prev => ({ ...prev, compare: false }))
    }
  }

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!letterBody) {
      showToast('error', 'Please add content first')
      return
    }

    setLoading(prev => ({ ...prev, export: true }))
    try {
      const date = new Date().toISOString().split('T')[0]
      
      if (format === 'pdf') {
        const name = personal.fullName || 'Cover'
        const filename = `Cover-${name.replace(/\s+/g, '-')}-${date}`
        await exportToPDF('cover-preview', filename)
      } else {
        // DOCX filename: Cover-[Date].docx (per requirements)
        const filename = `Cover-${date}`
        
        // Build full letter content with greeting, body, and signature
        const greetName = recipientName.trim() || 'Hiring Manager'
        const signatureName = applicantName.trim() || 'Your Name'
        
        const letterContent = `Dear ${greetName},\n\n${letterBody}\n\nSincerely,\n${signatureName}`
        const sections = [{ title: 'Cover Letter', content: [letterContent] }]
        await exportToDocx('Cover Letter', sections, filename)
      }
      showToast('success', '✅ Export successful')
    } catch (error) {
      console.error('Export error:', error)
      showToast('error', `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(prev => ({ ...prev, export: false }))
    }
  }


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
            <span className="text-sm text-violet-400 dark:text-violet-400">/ Cover Letter</span>
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
            ) : mounted && showPaywall ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={checkoutLoading}
                  onClick={handleCheckout}
                  className="hidden md:inline-flex"
                  aria-label={`Unlock AI for 24h — ${priceLabel}`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay with Stripe — {priceLabel}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={checkoutLoading}
                  onClick={handleCheckout}
                  className="md:hidden"
                  aria-label={`Unlock AI for 24h — ${priceLabel}`}
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  Pay — {priceLabel}
                </Button>
              </>
            ) : (
              // SSR placeholder - matches the button layout to prevent hydration mismatch
              <>
                <div className="hidden md:inline-flex h-[36px] w-[180px]" aria-hidden="true" />
                <div className="md:hidden h-[36px] w-[100px]" aria-hidden="true" />
              </>
            )}
            <Link
              href="/builder"
              prefetch
              className="inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-300 px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              CV Builder
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Preview countdown bar */}
      {!hasAiAccess && previewState === 'preview_active' && previewRemaining !== null && (
        <PreviewTopBar
          remainingSeconds={previewRemaining}
          onPayClick={handleCheckout}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generate personalized Cover Letters that perfectly match your CV.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <div className="space-y-6">
            {/* Tabs */}
            <Card>
              <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as Tab)} className="w-full">
                <TabsList className="w-full grid grid-cols-2 gap-2 mb-6 pointer-events-auto">
                  <TabsTrigger value="recipient">Recipient</TabsTrigger>
                  <TabsTrigger value="letter">Letter Body</TabsTrigger>
                  {/* Layout tab - hidden for now, can be re-enabled later */}
                  {/* <TabsTrigger value="layout">Layout</TabsTrigger> */}
                </TabsList>

                {/* Recipient Tab */}
                <TabsContent value="recipient">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Applicant Name</label>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Used in the signature (e.g., &quot;Sincerely, Your Name&quot;)
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Recipient Name (optional)</label>
                      <input
                        type="text"
                        placeholder="Hiring Manager"
                        value={recipientName}
                        onChange={(e) => setRecipientInfo({ recipientName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Company (optional)</label>
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={company}
                        onChange={(e) => setRecipientInfo({ company: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">City, State (optional)</label>
                      <input
                        type="text"
                        placeholder="New York, NY"
                        value={cityState}
                        onChange={(e) => setRecipientInfo({ cityState: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Role Title (optional)</label>
                      <input
                        type="text"
                        placeholder="Software Engineer"
                        value={role}
                        onChange={(e) => setRecipientInfo({ role: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      If left blank, we&apos;ll use generic salutations (&apos;Dear Hiring Manager,&apos;).
                    </p>
                  </div>
                </TabsContent>

                {/* Letter Body Tab */}
                <TabsContent value="letter">
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        placeholder="Write or paste your cover letter here..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 min-h-[300px] transition-colors duration-300"
                        value={letterBody}
                        onChange={(e) => setLetterBody(e.target.value)}
                        onCopy={(e) => {
                          if (showInputBlur && lockedInputsRef.has('letter') && !hasAiAccess && letterBody.trim()) {
                            e.preventDefault()
                          }
                        }}
                        onCut={(e) => {
                          if (showInputBlur && lockedInputsRef.has('letter') && !hasAiAccess && letterBody.trim()) {
                            e.preventDefault()
                          }
                        }}
                        onPaste={(e) => {
                          if (showInputBlur && lockedInputsRef.has('letter') && !hasAiAccess && letterBody.trim()) {
                            e.preventDefault()
                          }
                        }}
                        style={{
                          pointerEvents: showInputBlur && lockedInputsRef.has('letter') && !hasAiAccess && letterBody.trim() ? 'none' : 'auto',
                          userSelect: showInputBlur && lockedInputsRef.has('letter') && !hasAiAccess && letterBody.trim() ? 'none' : 'auto',
                        }}
                      />
                      {/* Only show overlay on Letter Body if it contains AI text (from Apply to Form) */}
                      {showInputBlur && lockedInputsRef.has('letter') && !hasAiAccess && letterBody.trim() && (
                        <InputBlurOverlay 
                          onUnlock={() => {
                            setShowInputBlur(false)
                            setLockedInputsRef(new Set())
                          }}
                          showButton={previewState === 'preview_ended'}
                        />
                      )}
                    </div>
                    {/* AI Improve Button - only show when letterBody has content */}
                    {letterBody.trim() && (
                      <div>
                        <AiButtonOverlay disabled={!canUseAI()}>
                          <Button
                            onClick={handleImprove}
                            disabled={loading.improve || !letterBody.trim()}
                            isLoading={loading.improve}
                            variant="primary"
                            className="w-full"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            AI Improve Cover Letter
                          </Button>
                        </AiButtonOverlay>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Refine your existing cover letter—clearer, tighter, and tailored.
                        </p>
                      </div>
                    )}
                    {/* AI Draft Preview */}
                    {aiPreview && (
                      <div className="rounded-xl border p-4 bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-violet-900 dark:text-violet-200">AI Preview Available</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">AI-generated content ready to apply</p>
                        <div 
                          className="text-sm bg-white dark:bg-gray-800 p-3 rounded-lg"
                          onCopy={(e) => {
                            if ((showPreviewBlur || showInputBlur) && !hasAiAccess) {
                              e.preventDefault()
                            }
                          }}
                          onCut={(e) => {
                            if ((showPreviewBlur || showInputBlur) && !hasAiAccess) {
                              e.preventDefault()
                            }
                          }}
                          onPaste={(e) => {
                            if ((showPreviewBlur || showInputBlur) && !hasAiAccess) {
                              e.preventDefault()
                            }
                          }}
                          style={{
                            pointerEvents: (showPreviewBlur || showInputBlur) && !hasAiAccess ? 'none' : 'auto',
                            userSelect: (showPreviewBlur || showInputBlur) && !hasAiAccess ? 'none' : 'auto',
                          }}
                        >
                          <AIPreviewText text={aiPreview || ''} paragraph={isImprovePreview} />
                        </div>
                        <div className="mt-3 flex gap-2 justify-end">
                          {!(showPreviewBlur || showInputBlur) || hasAiAccess ? (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  if (!aiPreview?.trim()) return;
                                  // Trim leading/trailing blank lines before applying
                                  const appliedText = aiPreview.trim();
                                  setLetterBody(appliedText);
                                  setAiPreview('');
                                  setIsImprovePreview(false);
                                  showToast('success', 'Applied to form');
                                }} 
                                disabled={!aiPreview.trim()}
                              >
                                Apply to Form
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setAiPreview('');
                                  setIsImprovePreview(false);
                                  showToast('success', 'Preview cancelled');
                                }}
                              >
                                Discard
                              </Button>
                            </>
                          ) : null}
                        </div>
                        {(showPreviewBlur || showInputBlur) && !hasAiAccess && (
                          <InputBlurOverlay 
                            onUnlock={() => {
                              setShowPreviewBlur(false)
                              setShowInputBlur(false)
                              setLockedInputsRef(new Set())
                            }}
                            showButton={previewState === 'preview_ended'}
                          />
                        )}
                      </div>
                    )}

                    {/* AI Engine Section - Only in Letter Body tab */}
                    <Card className="mt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-heading font-semibold flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-violet-accent" />
                            AI Engine
                          </h4>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Generate from Keywords</label>
                          <p className="text-xs text-muted-foreground mb-2">No cover letter yet? Enter a few keywords and AI will create one for you.</p>
                          <textarea
                            placeholder="e.g., Senior Software Engineer, Python, React, AWS..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 min-h-[80px] transition-colors duration-300"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                          />
                          <div className="mt-2">
                            <label className="block text-sm font-medium mb-2">Mode</label>
                            <select
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                              value={generateMode}
                              onChange={(e) => setGenerateMode(e.target.value as any)}
                            >
                              <option value="Executive">Executive</option>
                              <option value="Creative">Creative</option>
                              <option value="Academic">Academic</option>
                              <option value="Technical">Technical</option>
                            </select>
                          </div>
                          <AiButtonOverlay disabled={!canUseAI()}>
                            <Button
                              onClick={handleGenerate}
                              disabled={loading.gen || !keywords}
                              isLoading={loading.gen}
                              className="mt-2 w-full"
                            >
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate
                            </Button>
                          </AiButtonOverlay>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Use this if you don&apos;t have a cover letter yet.
                          </p>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                          <label className="block text-sm font-medium mb-2">Rewrite Mode</label>
                          <select
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-2"
                            value={rewriteMode}
                            onChange={(e) => setRewriteMode(e.target.value as any)}
                          >
                            <option value="Enhance">Enhance</option>
                            <option value="Executive Tone">Executive Tone</option>
                            <option value="Creative Portfolio">Creative Portfolio</option>
                            <option value="Academic Formal">Academic Formal</option>
                          </select>
                          <AiButtonOverlay disabled={!canUseAI()}>
                            <Button
                              onClick={handleRewrite}
                              disabled={loading.rewrite || !letterBody}
                              isLoading={loading.rewrite}
                              variant="secondary"
                              className="w-full"
                            >
                              Rewrite
                            </Button>
                          </AiButtonOverlay>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                          <AiButtonOverlay disabled={!canUseAI()}>
                            <Button
                              onClick={handleCompare}
                              disabled={loading.compare || !letterBody}
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
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                {/* Layout Tab - hidden for now, can be re-enabled later */}
                {/* <TabsContent value="layout">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-3">Style</label>
                      <div className="grid grid-cols-2 gap-4">
                        {(['minimal', 'modern', 'corporate', 'portfolio'] as const).map((layoutOption) => (
                          <button
                            key={layoutOption}
                            onClick={() => setLayout(layoutOption)}
                            className={`p-4 rounded-xl border-2 text-center capitalize transition-colors duration-300 ${
                              layout === layoutOption
                                ? 'border-violet-accent bg-violet-accent/10'
                                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                            }`}
                          >
                            {layoutOption}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <input
                        type="checkbox"
                        id="atsMode"
                        checked={atsMode}
                        onChange={(e) => setAtsMode(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-violet-accent focus:ring-violet-accent"
                      />
                      <label htmlFor="atsMode" className="text-sm font-medium">
                        ATS Mode (monochrome, print-safe)
                      </label>
                    </div>
                  </div>
                </TabsContent> */}
              </Tabs>
            </Card>
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
                        className="rounded-full px-4 py-2 border-2 border-violet-accent text-violet-accent hover:bg-violet-accent hover:text-white bg-transparent dark:bg-transparent dark:border-violet-accent dark:text-violet-accent dark:hover:bg-violet-accent dark:hover:text-white focus-visible:ring-2 focus-visible:ring-violet-accent focus-visible:ring-offset-2"
                        aria-label="Download DOCX"
                        aria-describedby="docx-helper-text"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        DOCX
                      </Button>
                    </div>
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
                <div className="a4-preview-frame relative">
                  <div 
                    ref={previewRef} 
                    id="cover-preview" 
                    className="a4-paper cv-container"
                    onCopy={(e) => {
                      if (showPreviewBlur && !hasAiAccess) {
                        e.preventDefault()
                      }
                    }}
                    onCut={(e) => {
                      if (showPreviewBlur && !hasAiAccess) {
                        e.preventDefault()
                      }
                    }}
                    onPaste={(e) => {
                      if (showPreviewBlur && !hasAiAccess) {
                        e.preventDefault()
                      }
                    }}
                    style={{
                      pointerEvents: showPreviewBlur && !hasAiAccess ? 'none' : 'auto',
                      userSelect: showPreviewBlur && !hasAiAccess ? 'none' : 'auto',
                    }}
                  >
                    <CoverPreview aiPreview={aiPreview} />
                  </div>
                  {showPreviewBlur && !hasAiAccess && (
                    <PreviewBlurOverlay 
                      onUnlock={() => {
                        setShowPreviewBlur(false)
                        setShowInputBlur(false)
                        setLockedInputsRef(new Set())
                      }}
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
      {showCompare && variants.length > 0 && (
        <ComparePanel
          variants={variants.map((v) => ({ id: v.id, content: v.letter }))}
          isOpen={showCompare}
          onClose={() => {
            setVariants([])
            setShowCompare(false)
          }}
          onSelect={(variant) => {
            // Store variant in local preview state (preview only)
            // Variant content is already cleaned by API (body text only, no greetings/closings)
            const cleanedText = (variant.content || '').trim()
            setAiPreview(cleanedText)
            setIsImprovePreview(false)
            setVariants([])
            setShowCompare(false)
            showToast('success', 'Preview generated - click Apply to update')
          }}
        />
      )}
      
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
