import { OpenAI } from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const data = await req.formData()
  const file = data.get('image') as File

  if (!file) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString('base64')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `
List all the visible food ingredients in this image.

Only return a valid JSON array like this:
["eggs", "milk", "lettuce"]

No commentary. No markdown. No extra text.
`.trim()
          },
          {
            type: 'image_url',
            image_url: { url: `data:${file.type};base64,${base64}` },
          },
        ],
      },
    ],
    max_tokens: 300,
  })

  const raw = response.choices[0].message.content || ''

  try {
    const cleaned = raw.trim().replace(/^```json\n/, '').replace(/```$/, '')
    return NextResponse.json({ ingredients: JSON.parse(cleaned) })
  } catch {
    console.error('GPT Raw Output:', raw)
    return NextResponse.json({
      error: 'Could not parse image output',
      raw
    }, { status: 500 })
  }
}

