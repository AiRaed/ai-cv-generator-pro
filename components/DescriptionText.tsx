'use client'

import { normalizeStableFormatting } from '@/lib/normalize'

interface DescriptionTextProps {
  text: string
  className?: string
}

/**
 * Renders Experience description text with Stable Formatting Mode:
 * - Plain text rendering with white-space: pre-wrap (preserves line breaks exactly)
 * - Same normalization as AI Preview for 1:1 consistency
 * - Uses flexbox layout for bullets: bullet marker and content are separated
 *   Wrapped lines start exactly at the first letter of the line above (aligned with content start)
 * - Font-size: 14px, line-height: 1.35 for consistency with input and PDF
 */
export function DescriptionText({ text, className = '' }: DescriptionTextProps) {
  if (!text || text.trim().length === 0) {
    return null
  }

  // Use same normalization as AI Preview for 1:1 consistency
  const normalized = normalizeStableFormatting(text)
  
  if (!normalized || normalized.trim().length === 0) {
    return null
  }
  
  // Check if text contains bullets for CSS class application
  // After normalization, bullets are "- " format, so check for that pattern
  const bulletPattern = /^\s*-\s+/
  const lines = normalized.split('\n').filter(line => line.trim().length > 0) // Filter out empty lines
  
  if (lines.length === 0) {
    return null
  }
  
  const hasBullets = lines.some(line => bulletPattern.test(line))
  
  // If bullets are present, render each line separately with flexbox for perfect alignment
  // This ensures wrapped lines start exactly at the first letter of the line above
  if (hasBullets) {
    return (
      <div className={`cv-description-text cv-description-has-bullets ${className}`}>
        {lines.map((line, index) => {
          const isBullet = bulletPattern.test(line)
          
          if (isBullet) {
            // Split the line into bullet marker and content for perfect alignment
            const match = line.match(/^(\s*-\s+)(.*)$/)
            const bulletMarker = match ? match[1] : '- '
            const content = match ? match[2] : line.replace(bulletPattern, '')
            
            return (
              <div key={index} className="cv-bullet-item">
                <span className="cv-bullet-marker">{bulletMarker}</span>
                <span className="cv-bullet-content">{content}</span>
              </div>
            )
          }
          
          // Non-bullet lines (shouldn't happen after normalization, but handle it)
          return (
            <div key={index} className="cv-description-line" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.35' }}>
              {line}
            </div>
          )
        })}
      </div>
    )
  }
  
  // Render as plain text with white-space: pre-wrap for non-bullet content
  return (
    <div className={`cv-description-text ${className}`}>
      <div className="cv-description-line" style={{ whiteSpace: 'pre-wrap' }}>
        {normalized}
      </div>
    </div>
  )
}
