import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY no configurada' }, { status: 500 })

    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `${prompt} Professional advertising photography, high quality, no text, no watermark.`,
        n: 1, size: '1024x1024', quality: 'standard', response_format: 'url',
      }),
    })
    if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message) }
    const data = await res.json()
    return NextResponse.json({ imageUrl: data.data[0].url })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
