'use client'

import { Card as CardType } from '@/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Archive, Calendar } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CardDialog } from './CardDialog'

interface CardProps {
  card: CardType
  onUpdate: (id: string, data: Partial<CardType>) => void
  onArchive: (id: string) => void
}

export function Card({ card, onUpdate, onArchive }: CardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  const handleCardClick = () => {
    if (!isDragging) {
      setIsDialogOpen(true)
    }
  }

  const formatDueDate = (date: Date | string) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  }

  const isToday = (date: Date | string) => {
    const d = new Date(date)
    const today = new Date()
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    )
  }

  return (
    <>
      <div className="relative">
        {isOver && (
          <div className="absolute -top-3 left-0 right-0 pointer-events-none">
            <div className="h-1 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
          </div>
        )}
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          onClick={handleCardClick}
          className={`group bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border-2 ${
            isDragging
              ? 'border-blue-500 shadow-xl scale-105'
              : 'border-gray-200'
          }`}
        >
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-gray-900 flex-1">
            {card.title}
          </h3>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity relative inline-block group/archive">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-gray-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onArchive(card.id)
              }}
            >
              <Archive className="h-3 w-3" />
            </Button>
            <span className="absolute top-full left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/archive:opacity-100 transition-opacity duration-100 pointer-events-none z-[9999]">
              カードをアーカイブする
            </span>
          </div>
        </div>
        {card.description && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
            {card.description}
          </p>
        )}
        {card.dueDate && (
          <div className="flex items-center gap-1 mt-2">
            <Calendar className="h-3 w-3" />
            <span
              className={`text-xs ${
                isToday(card.dueDate) ? 'text-red-600 font-semibold' : 'text-gray-600'
              }`}
            >
              {formatDueDate(card.dueDate)}
            </span>
          </div>
        )}
        </div>
      </div>

      <CardDialog
        card={card}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onUpdate={onUpdate}
      />
    </>
  )
}
