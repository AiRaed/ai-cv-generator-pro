// PDF Export utility
export const exportToPDF = async () => {
  const html2pdf = (await import('html2pdf.js')).default
  
  const element = document.getElementById('cv-preview')
  if (!element) {
    alert('No preview content found')
    return
  }

  const opt = {
    margin: 0.5,
    filename: 'my-cv.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  }

  html2pdf().set(opt).from(element).save()
}

// DOCX Export utility
export const exportToDOCX = async () => {
  try {
    const { Document, Paragraph, TextRun, HeadingLevel, Packer } = await import('docx')
    const { saveAs } = await import('file-saver')

    // Get CV content
    const generatedCV = document.querySelector('#cv-preview')?.textContent || ''

    // Split content into paragraphs (simple implementation)
    const lines = generatedCV.split('\n').filter(line => line.trim())
    const docxParagraphs = lines.map(line => {
      if (line.match(/^[A-Z][^.!?]*$/)) {
        // Assume headings are in all caps or short lines
        return new Paragraph({
          text: line,
          heading: HeadingLevel.HEADING_2,
        })
      }
      return new Paragraph(line)
    })

    const doc = new Document({
      sections: [
        {
          children: docxParagraphs,
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, 'my-cv.docx')
  } catch (error) {
    console.error('Error exporting to DOCX:', error)
    alert('Failed to export to DOCX. Please try again.')
  }
}

