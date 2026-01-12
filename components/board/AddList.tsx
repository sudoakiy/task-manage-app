'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AddListProps {
  onAdd: (title: string) => void
}

export function AddList({ onAdd }: AddListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')

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
      <div className="flex-shrink-0 w-80">
        <Button
          variant="ghost"
          className="w-full bg-white/20 hover:bg-white/30 text-white justify-start cursor-pointer"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          リストを追加
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-3">
      <Input
        placeholder="リストのタイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit()
          } else if (e.key === 'Escape') {
            handleCancel()
          }
        }}
        autoFocus
      />
      <div className="flex gap-2 mt-2">
        <Button size="sm" onClick={handleSubmit}>
          追加
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
