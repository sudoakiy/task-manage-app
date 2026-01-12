'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AddCardProps {
  onAdd: (title: string) => void
}

export function AddCard({ onAdd }: AddCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [isComposing, setIsComposing] = useState(false)

  const handleSubmit = () => {
    if (title.trim()) {
      onAdd(title)
      setTitle('')
      setIsAdding(false)
    }
  }

  const handleCancel = () => {
    setTitle('')
    setIsAdding(false)
  }

  if (!isAdding) {
    return (
      <Button
        variant="ghost"
        className="w-full mt-2 justify-start text-gray-600 hover:bg-gray-200 cursor-pointer px-2"
        onClick={() => setIsAdding(true)}
      >
        <Plus className="h-4 w-4 mr-1" />
        カードを追加
      </Button>
    )
  }

  return (
    <div className="mt-2 space-y-2">
      <Input
        placeholder="カードのタイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isComposing) {
            e.preventDefault()
            handleSubmit()
          } else if (e.key === 'Escape') {
            handleCancel()
          }
        }}
        autoFocus
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit}>
          追加
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
