'use client'

import { useState } from 'react'
import { IngredientInput } from '@/components/IngredientInput'
import { ImageUpload } from '@/components/ImageUpload'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'

type Recipe = {
  name: string
  ingredients: string[]
  steps: string[]
  missing?: string[]
}

type ResultData = {
  exactMatches: Recipe[]
  nearMatches: Recipe[]
  smartSuggestions: { ingredient: string; unlocksCount: number }[]
}

export default function Home() {
  const [data, setData] = useState<ResultData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async (ingredients: string[]) => {
    setLoading(true)
    setError('')
    setData(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Unknown error')
      setData(json)
    } catch (err) {
      if (err instanceof Error) setError(err.message)
      else setError('Unexpected error');
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">🧊 What’s in My Fridge?</h1>
      <p className="text-gray-600">
        Enter your ingredients or upload a fridge photo. AI will suggest meals you can make now, plus near-misses and smart add-ons.
      </p>

      <ImageUpload onExtract={handleAnalyze} />
      <IngredientInput onSubmit={handleAnalyze} />

      {loading && <p className="text-blue-500">Analyzing...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {data && (
        <div className="space-y-8">
          <Section title="🎯 Exact Matches" recipes={data.exactMatches} />
          <Section title="🧩 Near Matches" recipes={data.nearMatches} showMissing />
          <div>
            <h2 className="text-2xl font-semibold">🧠 Smart Suggestions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {data.smartSuggestions.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <p>
                        <strong>{s.ingredient}</strong> unlocks{' '}
                        <span className="text-blue-600 font-semibold">{s.unlocksCount}</span> recipes
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({
  title,
  recipes,
  showMissing = false,
}: {
  title: string
  recipes: Recipe[]
  showMissing?: boolean
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {recipes.length === 0 ? (
        <p className="text-gray-500">None found.</p>
      ) : (
        <div className="grid gap-4">
          {recipes.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="bg-white shadow-md border border-gray-200">
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-bold text-lg">{r.name}</h3>
                  {showMissing && r.missing && (
                    <p className="text-sm text-orange-600">Missing: {r.missing.join(', ')}</p>
                  )}
                  <p className="text-sm text-gray-600">Ingredients: {r.ingredients.join(', ')}</p>
                  <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                    {r.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
