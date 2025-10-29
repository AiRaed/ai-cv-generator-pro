export async function exportToPDF(elementId: string, filename: string) {
  if (typeof window === 'undefined') return
  
  const html2pdf = (await import('html2pdf.js')).default
  
  // Wait for DOM to be ready and content to be rendered
  await new Promise(resolve => {
    if (document.readyState === 'complete') {
      resolve(undefined)
    } else {
      window.addEventListener('load', () => resolve(undefined))
    }
  })
  
  // Find the .a4-paper container first (this has the proper padding/margins)
  let element: HTMLElement | null = document.querySelector('.a4-paper') as HTMLElement
  
  // If not found, try finding by ID
  if (!element) {
    const idElement = document.getElementById(elementId)
    if (idElement) {
      // Check if it's inside an .a4-paper container
      const paperContainer = idElement.closest('.a4-paper') as HTMLElement
      if (paperContainer) {
        element = paperContainer
      } else {
        element = idElement
      }
    }
  }
  
  // Last resort: try finding .cv-page
  if (!element) {
    const cvPage = document.querySelector('.cv-page') as HTMLElement
    if (cvPage) {
      const paperContainer = cvPage.closest('.a4-paper') as HTMLElement
      if (paperContainer) {
        element = paperContainer
      } else {
        element = cvPage
      }
    }
  }
  
  if (!element) {
    throw new Error(`Preview element not found. Tried: .a4-paper, #${elementId}, .cv-page`)
  }
  
  // Ensure element has content before exporting
  if (!element || !element.innerHTML || element.innerHTML.trim() === '') {
    throw new Error('Preview element has no content to export')
  }

  // Calculate A4 dimensions in pixels (210mm x 297mm at 96 DPI)
  const A4_WIDTH_MM = 210
  const A4_HEIGHT_MM = 297
  const PADDING_MM = 20
  const DPI = 96
  const MM_TO_PX = DPI / 25.4
  
  const A4_WIDTH_PX = A4_WIDTH_MM * MM_TO_PX // ~794px
  const A4_HEIGHT_PX = A4_HEIGHT_MM * MM_TO_PX // ~1123px
  const CONTENT_WIDTH_PX = (A4_WIDTH_MM - PADDING_MM * 2) * MM_TO_PX // ~669px

  // Exclude elements marked for exclusion
  const excludedElements = element.querySelectorAll('[data-export-exclude="true"]')
  excludedElements.forEach(el => {
    if (el instanceof HTMLElement) {
      el.style.display = 'none'
    }
  })

  // Store original padding/margin for restoration (PDF export should use html2pdf margins, not CSS padding)
  const originalPadding = element.style.padding
  const originalMargin = element.style.margin
  const originalMinHeight = element.style.minHeight
  
  // Temporarily remove padding/margin for PDF export - html2pdf will handle margins
  element.style.padding = '0'
  element.style.margin = '0'
  element.style.minHeight = 'auto'

  const opt = {
    margin: [18, 20, 18, 20], // top, right, bottom, left in mm
    filename: `${filename || 'CV'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
      backgroundColor: '#ffffff',
      logging: false,
      removeContainer: false,
      printColorAdjust: 'exact',
      allowTaint: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    },
    jsPDF: { 
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    },
    pagebreak: { 
      mode: ['css', 'legacy'],
      avoid: ['.cv-bullet-item', '.ai-preview-bullet-item', 'li', '.cv-description-line', 'p', '.cv-text-content', '.cv-description-text', '.cv-bullet-content', '.ai-preview-text', '.ai-preview-line'],
      before: [],
      after: []
    }
  }

  try {
    // Ensure element is still valid
    if (!element || !element.parentNode) {
      throw new Error('Preview element is no longer available in the DOM')
    }
    
    await html2pdf().set(opt).from(element).save()
    
    // Restore original styles
    element.style.padding = originalPadding
    element.style.margin = originalMargin
    element.style.minHeight = originalMinHeight
    
    // Restore excluded elements
    excludedElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = ''
      }
    })
  } catch (error) {
    // Restore original styles even if export fails
    element.style.padding = originalPadding
    element.style.margin = originalMargin
    element.style.minHeight = originalMinHeight
    
    // Restore excluded elements even if export fails
    excludedElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = ''
      }
    })
    console.error('PDF export failed:', error)
    throw error instanceof Error ? error : new Error('PDF export failed: ' + String(error))
  }
}
