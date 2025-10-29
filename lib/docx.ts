interface Section {
  title: string
  content: string[]
}

// Helper function to download file using browser API
function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Helper function to parse text with bullets into structured paragraphs
function parseBulletContent(text: string, Paragraph: any): any[] {
  const paragraphs: any[] = []
  const lines = text.split('\n').filter(line => line.trim().length > 0)
  
  let currentBullets: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    // Check if line starts with a bullet marker (-, •, *, etc.)
    const bulletMatch = trimmed.match(/^[-•*]\s+(.+)$/)
    
    if (bulletMatch) {
      // It's a bullet point - add to current bullet list
      currentBullets.push(bulletMatch[1])
    } else {
      // It's regular text - flush any accumulated bullets first
      if (currentBullets.length > 0) {
        for (const bulletText of currentBullets) {
          paragraphs.push(
            new Paragraph({
              text: bulletText,
              bullet: { level: 0 },
              spacing: { after: 80 },
            })
          )
        }
        currentBullets = []
      }
      // Add the regular paragraph
      if (trimmed) {
        paragraphs.push(
          new Paragraph({
            text: trimmed,
            spacing: { after: 120 },
          })
        )
      }
    }
  }
  
  // Flush any remaining bullets
  if (currentBullets.length > 0) {
    for (const bulletText of currentBullets) {
      paragraphs.push(
        new Paragraph({
          text: bulletText,
          bullet: { level: 0 },
          spacing: { after: 80 },
        })
      )
    }
  }
  
  return paragraphs.length > 0 ? paragraphs : [
    new Paragraph({
      text: text,
      spacing: { after: 120 },
    })
  ]
}

export async function exportToDocx(
  name: string,
  sections: Section[],
  filename: string
) {
  if (typeof window === 'undefined') return
  
  const { Document, Packer, Paragraph, HeadingLevel, AlignmentType } = await import('docx')
  
  const paragraphs: any[] = []

  // Add title
  paragraphs.push(
    new Paragraph({
      text: name,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    })
  )

  // Add sections
  for (const section of sections) {
    paragraphs.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      })
    )

    for (const item of section.content) {
      if (item.trim()) {
        // Parse item for bullets and create appropriate paragraphs
        const parsedParagraphs = parseBulletContent(item, Paragraph)
        paragraphs.push(...parsedParagraphs)
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  })

  try {
    const blob = await Packer.toBlob(doc)
    downloadFile(blob, `${filename}.docx`)
  } catch (error) {
    console.error('DOCX export failed:', error)
    throw error
  }
}
