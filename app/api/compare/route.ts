import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { cookies, headers } from 'next/headers'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

/**
 * Check if AI can be used based on preview_end_at or ai_unlocked_until cookie
 */
async function canUseAI(req: Request): Promise<boolean> {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const now = Date.now()
  
  // Check for full AI access (cookie)
  const aiUnlockedUntil = cookieStore.get('ai_unlocked_until')?.value
  if (aiUnlockedUntil) {
    const timestamp = Number(aiUnlockedUntil)
    if (!isNaN(timestamp) && now < timestamp) {
      return true // Has full access
    }
  }

  // Check for active preview window - check both cookie and header
  const previewEndCookie = cookieStore.get('preview_end_at')?.value
  const previewEndHeader = headerStore.get('x-preview-end')
  const previewEnd = previewEndCookie || previewEndHeader
  
  if (previewEnd) {
    const endAt = Number(previewEnd)
    if (!isNaN(endAt) && now < endAt) {
      return true // Within preview window
    }
  }

  return false
}

export async function POST(req: Request) {
  try {
    // Check authorization
    if (!(await canUseAI(req))) {
      return NextResponse.json({ ok: false, error: 'AI access required' }, { status: 403 })
    }

    const body = await req.json()
    const { content: contentParam, text, keywords } = body
    const content = contentParam || text

    console.log('[Compare] payload:', body)

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('[AI MOCK] no OPENAI_API_KEY')
      return NextResponse.json({
        ok: true,
        variants: [
          { id: 'A' as const, content: 'Experienced professional with a strategic focus on delivering high-quality results through innovative approaches and strong leadership capabilities.' },
          { id: 'B' as const, content: 'Results-oriented professional skilled in implementing solutions that drive measurable outcomes and enhance user experience through technical excellence.' },
          { id: 'C' as const, content: 'Versatile professional with a balanced approach combining technical expertise, creative problem-solving, and collaborative teamwork to achieve comprehensive project success.' },
        ],
      })
    }

    const prompt = content 
      ? `Generate three distinct, high-quality variations (labeled A, B, and C) of this CV section suitable for UI/UX or front-end developer roles. Write as clean paragraph text only - no headings, no bullets, no labels, no prefixes. Write in English only:\n\n${content}`
      : `Generate three distinct, high-quality CV sections based on these keywords suitable for UI/UX or front-end developer roles. Write as clean paragraph text only - no headings, no bullets, no labels, no prefixes. Write in English only:\n\n${keywords}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a senior career writer specializing in CV optimization for UI/UX and front-end developers. Generate three distinctly different variations of CV summary content (labeled A, B, and C) as clean, continuous paragraph text only. Critical requirements:
- Write ONLY plain paragraph text - no headings, no section titles, no bullet points, no lists, no markdown formatting (no **bold**, no bullets, no "#" headings)
- No prefixes or labels like "Executive Summary:", "Professional Overview:", "Summary:", etc.
- No marketing fluff phrases like "Modern, results-driven, innovation-focused..." at the start
- Do NOT include the candidate's name, honorifics (Mr/Ms), or any personal identifiers
- Each variant should be a clean, continuous paragraph summarizing professional experience
- Variant A: Executive-focused, leadership-oriented, strategic tone
- Variant B: Modern, results-driven, innovation-focused tone  
- Variant C: Balanced, polished, comprehensive tone

Output format: Three clearly separated blocks labeled "A:", "B:", and "C:" followed immediately by the paragraph text (no extra labels or prefixes in the text itself). Each variant must be pure paragraph prose ready to insert directly into a CV summary field. English only.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    })

    const result = completion.choices[0]?.message?.content || ''
    
    // Parse the three variants
    const aMatch = result.match(/A:\s*(.*?)(?=B:|$)/s)
    const bMatch = result.match(/B:\s*(.*?)(?=C:|$)/s)
    const cMatch = result.match(/C:\s*(.*?)$/s)

    const variants = [
      {
        id: 'A' as const,
        content: aMatch?.[1]?.trim() || result.substring(0, result.length / 3),
      },
      {
        id: 'B' as const,
        content: bMatch?.[1]?.trim() || result.substring(result.length / 3, (2 * result.length) / 3),
      },
      {
        id: 'C' as const,
        content: cMatch?.[1]?.trim() || result.substring((2 * result.length) / 3),
      },
    ]

    const response = { ok: true, variants }
    console.log('[Compare] response:', response)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error comparing content:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to compare content. Please try again.' },
      { status: 500 }
    )
  }
}
