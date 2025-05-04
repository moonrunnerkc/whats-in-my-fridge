'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function IngredientInput({ onSubmit }: { onSubmit: (items: string[]) => void }) {
  const [input, setInput] = useState('')
  const [items, setItems] = useState<string[]>([])

  const addItem = () => {
    const trimmed = input.trim()
    if (trimmed && !items.includes(trimmed)) {
      setItems([...items, trimmed])
    }
    setInput('')
  }

  const removeItem = (item: string) => {
    setItems(items.filter(i => i !== item))
  }

  const handleSubmit = () => {
    if (items.length > 0) onSubmit(items)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="e.g. eggs, cheese, broccoli"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <Button onClick={addItem}>Add</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge
            key={item}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => removeItem(item)}
          >
            {item} ✕
          </Badge>
        ))}
      </div>

      <Button onClick={handleSubmit} disabled={items.length === 0}>
        Find Recipes
      </Button>
    </div>
  )
}
