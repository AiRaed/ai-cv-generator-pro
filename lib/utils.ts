import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a URL by:
 * - Trimming whitespace
 * - Adding https:// protocol if missing
 * - Removing duplicate protocols
 */
export function normalizeUrl(url: string): string {
  if (!url) return ''
  
  let normalized = url.trim()
  
  // Remove duplicate protocols
  normalized = normalized.replace(/^(https?:\/\/)+/i, 'https://')
  
  // Add protocol if missing (basic check)
  if (normalized && !/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized
  }
  
  return normalized
}

/**
 * Validates a URL (allows empty strings)
 */
export function isValidUrl(url: string): boolean {
  if (!url || !url.trim()) return true // Empty is valid (optional field)
  
  try {
    const normalized = normalizeUrl(url)
    const urlObj = new URL(normalized)
    // Basic validation: must have hostname
    return !!urlObj.hostname
  } catch {
    return false
  }
}

/**
 * Extracts clean display text from URL
 * E.g., "https://www.linkedin.com/in/johndoe" -> "linkedin.com/in/johndoe"
 * E.g., "https://www.example.com/path" -> "example.com/path"
 * Removes protocol and www prefix, but keeps path for readability
 */
export function extractDomain(url: string): string {
  if (!url || !url.trim()) return ''
  
  try {
    // First try to normalize for parsing
    const normalized = normalizeUrl(url)
    const urlObj = new URL(normalized)
    let hostname = urlObj.hostname.replace(/^www\./, '')
    const pathname = urlObj.pathname
    
    // For LinkedIn, keep the full path (e.g., linkedin.com/in/username)
    if (hostname.includes('linkedin.com')) {
      return hostname + pathname
    }
    
    // For other sites, return hostname + pathname (without query/hash)
    return hostname + (pathname !== '/' ? pathname : '')
  } catch {
    // If parsing fails, try to extract manually
    let cleaned = url.trim()
    // Remove protocol
    cleaned = cleaned.replace(/^https?:\/\//i, '')
    // Remove www. prefix
    cleaned = cleaned.replace(/^www\./i, '')
    // Remove trailing slash
    cleaned = cleaned.replace(/\/$/, '')
    return cleaned || url
  }
}

/**
 * Formats URL for display while preserving user's input format
 * Removes protocol but preserves www. if user included it
 * E.g., "www.ahmads-portfolio.com" -> "www.ahmads-portfolio.com"
 * E.g., "https://www.example.com" -> "www.example.com"
 * E.g., "linkedin.com/in/profile" -> "linkedin.com/in/profile"
 */
export function formatUrlForDisplay(url: string): string {
  if (!url || !url.trim()) return ''
  
  let cleaned = url.trim()
  // Remove protocol but preserve everything else
  cleaned = cleaned.replace(/^https?:\/\//i, '')
  // Remove trailing slash
  cleaned = cleaned.replace(/\/$/, '')
  // Return as-is (preserves www. if present)
  return cleaned || url
}

/**
 * Ensures URL has protocol for href attributes (but allows display without it)
 */
export function ensureUrlProtocol(url: string): string {
  if (!url || !url.trim()) return ''
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  return 'https://' + trimmed
}
