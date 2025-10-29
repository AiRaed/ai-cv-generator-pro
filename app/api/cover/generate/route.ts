import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

interface GenerateRequest {
  applicantName: string
  recipientName?: string
  company?: string
  cityState?: string
  role?: string
  mode: 'Executive' | 'Creative' | 'Academic' | 'Technical' | 'Body Only'
  keywords: string
  industry?: string
  topSkills?: string
  experienceSnippet?: string
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      applicantName,
      recipientName,
      company,
      cityState,
      role,
      mode = 'Executive',
      keywords,
      industry,
      topSkills,
      experienceSnippet,
    }: GenerateRequest = body

    console.log('[Cover Generate] payload:', body)

    if (!keywords || keywords.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Keywords are required' },
        { status: 400 }
      )
    }

    const isBodyOnlyMode = mode === 'Body Only'

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('[AI MOCK] no OPENAI_API_KEY')
      if (isBodyOnlyMode) {
        const mockBody = `With a strong background in ${keywords}, I am confident that I would be a valuable addition to your team. My experience has equipped me with the skills necessary to excel in this role. I am excited about the opportunity to contribute to your organization.`
        return NextResponse.json({ ok: true, body: mockBody, letter: mockBody })
      }
      const mockLetter = `Dear ${recipientName || 'Hiring Manager'},

I am writing to express my interest in the ${role || 'position'}${company ? ` at ${company}` : ''}.

With a strong background in ${keywords}, I am confident that I would be a valuable addition to your team. My experience has equipped me with the skills necessary to excel in this role.

I am excited about the opportunity to contribute to your organization and would welcome the chance to discuss how my qualifications align with your needs.

Sincerely,
${applicantName || 'Your Name'}`
      return NextResponse.json({ ok: true, letter: mockLetter })
    }

    const modeGuide: Record<string, string> = {
      Executive: 'professional and strategic tone, focus on leadership and business impact',
      Creative: 'dynamic and engaging tone, highlight creativity and innovation',
      Academic: 'formal scholarly tone, emphasize research and intellectual contributions',
      Technical: 'precise and technical tone, focus on technical expertise and problem-solving',
    }

    const location = cityState ? ` in ${cityState}` : ''

    // Handle Body Only mode
    if (isBodyOnlyMode) {
      const roleTitle = role || 'the position'
      const industryText = industry || 'the industry'
      const keywordsList = keywords.split(',').map(k => k.trim()).join(', ')
      const candidateHighlights = topSkills || experienceSnippet || keywordsList

      const systemPrompt = `You are a professional cover-letter writer. Produce body-only text (no greeting or sign-off). Write in clear, confident, professional English with a focus on clarity, professionalism, and relevance (no fluff). Maximum 180 words total. Be concise and avoid unnecessary repetition.
Prioritize specifics over buzzwords: convert duties into impact + metrics (e.g., "reduced load time by 28%"). If the user/job data lacks numbers, infer reasonable qualitative impact without inventing unverifiable facts.
Never include headings, placeholders, brackets, or explanations. No "Dear…", "Sincerely," names, or contact details. Plain paragraphs only.`

      const userPrompt = `Write a cover-letter body only tailored to the role below.

Maximum 180 words total, 2–3 concise paragraphs. Be professional, clear, and avoid repetition.

Focus on clarity, professionalism, and relevance. Map my strengths to the employer's needs; highlight impact and results; add 1–2 light, plausible metrics if absent.

No greeting/sign-off/headings/placeholders; plain text only.
Role & keywords: ${roleTitle}${company ? ` at ${company}` : ''} (${keywordsList})
My relevant experience (bullets or sentences):

${candidateHighlights}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 250,
      })

      const body = completion.choices[0]?.message?.content || ''
      return NextResponse.json({ ok: true, body: body.trim(), letter: body.trim() })
    }

    const systemPrompt = `You are an expert cover letter writer. Write a professional cover letter in ${mode.toLowerCase()} style with ${modeGuide[mode]}. Follow these strict rules:
1. Begin with exactly ONE greeting: "Dear ${recipientName || 'Hiring Manager'},"
2. Write 3-4 paragraphs addressing the role, company, and how the candidate's expertise in ${keywords} makes them an ideal fit
3. Use a ${modeGuide[mode]} tone
4. Mention the company by name if provided
5. End with exactly ONE signature: "Sincerely,"
6. Followed by the applicant's name: "${applicantName}"
7. Never include placeholders or duplicate greetings/signatures
8. English only
9. Keep it professional and compelling`

    const userPrompt = `Write a ${mode.toLowerCase()} cover letter for ${applicantName} applying for ${role || 'the position'}${company ? ` at ${company}` : ''}${location}. 

Key expertise areas to highlight: ${keywords}

${company ? `\nCompany context: ${company}` : ''}
${role ? `\nPosition: ${role}` : ''}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const letter = completion.choices[0]?.message?.content || ''

    // Clean up the letter
    const cleanedLetter = letter
      .replace(/^Dear\s+[^,]+,?\s*\n?/gm, `Dear ${recipientName || 'Hiring Manager'},\n\n`)
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .trim()

    // Ensure signature
    if (!cleanedLetter.match(/Sincerely,?\s*\n/)) {
      const lines = cleanedLetter.split('\n')
      // Add signature if not present
      if (!lines[lines.length - 1]?.includes('Sincerely')) {
        const withSignature = cleanedLetter + (cleanedLetter.endsWith('\n') ? '' : '\n') + '\nSincerely,\n' + applicantName
        return NextResponse.json({ ok: true, letter: withSignature })
      }
    }

    const response = { ok: true, letter: cleanedLetter }
    console.log('[Cover Generate] response length:', cleanedLetter.length)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error generating cover letter:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to generate cover letter. Please try again.' },
      { status: 500 }
    )
  }
}
