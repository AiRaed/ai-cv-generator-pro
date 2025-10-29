import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('[AI MOCK] no OPENAI_API_KEY');
      return NextResponse.json({ ok: true, content: "Mocked professional content for preview.", variants: [
        {id:"A", content:"Variant A…"}, {id:"B", content:"Variant B…"}, {id:"C", content:"Variant C…"}
      ] }, { status: 200 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a professional translator.' },
        { role: 'user', content: `Translate the following text into natural, professional English. Preserve the meaning and tone:\n\n${text}` }
      ],
      max_tokens: 1500,
      temperature: 0.3,
    })

    const content = completion.choices[0]?.message?.content || ''
    
    return NextResponse.json({ content })
  } catch (error: any) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to translate text' },
      { status: 500 }
    )
  }
}
