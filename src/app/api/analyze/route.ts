import { OpenAI } from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const { ingredients } = await req.json()

  if (!ingredients || !Array.isArray(ingredients)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const prompt = `
You are a professional chef. Given these ingredients: ${ingredients.join(', ')}

Return a JSON object with:
1. exactMatches: recipes using only these ingredients
2. nearMatches: recipes needing 1–2 extra common items (list them)
3. smartSuggestions: single ingredients that would unlock the most new recipes

Use this format:
{
  "exactMatches": [ { "name": "", "ingredients": [], "steps": [] } ],
  "nearMatches": [ { "name": "", "missing": [], "ingredients": [], "steps": [] } ],
  "smartSuggestions": [ { "ingredient": "", "unlocksCount": 0 } ]
}
Only return valid JSON.
`.trim()

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  })

  const raw = response.choices[0].message.content

  try {
    const data = JSON.parse(raw!)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Invalid GPT response', raw }, { status: 500 })
  }
}
