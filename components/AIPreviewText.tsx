'use client'

import { normalizeStableFormatting, normalizeSummaryParagraph } from '@/lib/normalize'

interface AIPreviewTextProps {
  text: string
  className?: string
  paragraph?: boolean // If true, render as continuous paragraph (no bullets)
}

/**
 * Renders AI-generated preview text in Stable Formatting Mode:
 * - Plain text rendering with white-space: pre-wrap (preserves line breaks exactly)
 * - Removes unwanted prefixes (e.g., "Enhanced Content:", "Revised Content:", "Certainly")
 * - Normalizes bullets: converts •, ●, ·, or other markers to "- " (hyphen + space)
 * - Removes all blank lines (before, between, and after bullets)
 * - Uses hanging indent for wrapped lines - wrapped lines align exactly under first letter after "- "
 * - Single, tight, consistent line height across whole preview
 * - No extra blank lines, no introductory phrases
 * 
 * If paragraph=true, renders as continuous paragraph format (no bullets)
 */
export function AIPreviewText({ text, className = '', paragraph = false }: AIPreviewTextProps) {
  if (!text || text.trim().length === 0) {
    return null
  }

  // If paragraph mode, normalize to continuous paragraph format
  if (paragraph) {
    const normalized = normalizeSummaryParagraph(text)
    
    if (!normalized || normalized.trim().length === 0) {
      return null
    }
    
    // Render as plain paragraph text
    return (
      <div className={`ai-preview-text ai-preview-paragraph ${className}`}>
        {normalized}
      </div>
    )
  }

  // Normalize for Stable Formatting Mode
  // This already removes prefaces, blank lines, and normalizes bullets to "- "
  const normalized = normalizeStableFormatting(text)
  
  if (!normalized || normalized.trim().length === 0) {
    return null
  }

  // Check if text contains bullets for CSS class application
  // After normalization, bullets are dashes (-), so we check for that pattern
  // Pattern matches: optional whitespace, then dash, then required space
  const bulletPattern = /^\s*-\s+/
  const lines = normalized.split('\n').filter(line => line.trim().length > 0) // Filter out any empty lines
  
  if (lines.length === 0) {
    return null
  }
  
  const hasBullets = lines.some(line => bulletPattern.test(line))
  
  // If bullets are present, render each line separately for perfect alignment
  if (hasBullets) {
    return (
      <div className={`ai-preview-text ai-preview-stable ai-preview-has-bullets ${className}`}>
        {lines.map((line, index) => {
          const isBullet = bulletPattern.test(line)
          
          if (isBullet) {
            // Split the line into bullet marker and content for perfect alignment
            const match = line.match(/^(\s*-\s+)(.*)$/)
            const bulletMarker = match ? match[1] : '- '
            const content = match ? match[2] : line.replace(bulletPattern, '')
            
            // Render as single text element for proper hanging indent
            // The hanging indent CSS will handle alignment correctly
            return (
              <div key={index} className="ai-preview-bullet-item">
                {bulletMarker}{content}
              </div>
            )
          }
          
          return (
            <div key={index} className="ai-preview-line">
              {line}
            </div>
          )
        })}
      </div>
    )
  }
  
  // Render as plain text with white-space: pre-wrap for non-bullet content
  // This preserves line breaks naturally through CSS
  return (
    <div className={`ai-preview-text ai-preview-stable ${className}`}>
      {normalized}
    </div>
  )
}

