'use client'

import { useState } from 'react'
import { ListWithCards } from '@/types'
import { Card as CardType } from '@/types'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Card } from './Card'
import { AddCard } from './AddCard'
import { Archive, MoreHorizontal, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDroppable as useDroppableEnd } from '@dnd-kit/core'

interface ListProps {
  list: ListWithCards
  onAddCard: (listId: string, title: string) => void
  onUpdateCard: (id: string, data: Partial<CardType>) => void
  onArchiveCard: (id: string) => void
  onArchiveAllCards: (listId: string) => void
  onDeleteList: (id: string) => void
  onUpdateList: (id: string, title: string) => void
}

export function List({
  list,
  onAddCard,
  onUpdateCard,
  onArchiveCard,
  onArchiveAllCards,
  onDeleteList,
  onUpdateList,
}: ListProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [isComposing, setIsComposing] = useState(false)

  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
  })

  const { setNodeRef: setEndRef, isOver: isOverEnd } = useDroppableEnd({
    id: `${list.id}-end`,
  })

  const handleStartEditTitle = () => {
    setEditedTitle(list.title)
    setIsEditingTitle(true)
  }

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== list.title) {
      onUpdateList(list.id, editedTitle)
    }
    setIsEditingTitle(false)
  }

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false)
    setEditedTitle('')
  }

  return (
    <div
      className={`flex-shrink-0 w-80 rounded-lg p-3 overflow-visible transition-all ${
        isOver
          ? 'bg-blue-100 ring-2 ring-blue-500 shadow-lg'
          : 'bg-gray-100'
      }`}
    >
      <div className="flex items-center justify-between mb-3 overflow-visible">
        {isEditingTitle ? (
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isComposing) {
                handleSaveTitle()
              } else if (e.key === 'Escape') {
                handleCancelEditTitle()
              }
            }}
            onBlur={handleSaveTitle}
            className="font-semibold text-gray-800 flex-1 mr-2"
            autoFocus
          />
        ) : (
          <h2
            className="font-semibold text-gray-800 cursor-pointer flex-1"
            onClick={handleStartEditTitle}
          >
            {list.title}
          </h2>
        )}
        <div className="flex items-center gap-1">
          <div className="relative inline-block group/archive">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-amber-600 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              onClick={() => onArchiveAllCards(list.id)}
              disabled={list.cards.length === 0}
            >
              <Archive className="h-4 w-4" />
            </Button>
            <span className="absolute top-full left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/archive:opacity-100 transition-opacity duration-100 pointer-events-none z-[9999]">
              リストのカードをすべてアーカイブ
            </span>
          </div>
          <div className="relative inline-block group/delete">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-red-600 hover:bg-gray-200 transition-colors cursor-pointer"
              onClick={() => onDeleteList(list.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <span className="absolute top-full left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/delete:opacity-100 transition-opacity duration-100 pointer-events-none z-[9999]">
              リストを削除する
            </span>
          </div>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`space-y-2 rounded-md p-2 transition-all relative ${
          list.cards.length === 0 ? 'min-h-[20px]' : ''
        } ${isOver ? 'bg-blue-50 ring-1 ring-blue-300' : ''}`}
      >
        {isOver && list.cards.length <= 1 && (
          <div className="absolute -top-1 left-0 right-0 pointer-events-none">
            <div className="w-full h-1 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
          </div>
        )}
        <SortableContext
          items={list.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {list.cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onUpdate={onUpdateCard}
              onArchive={onArchiveCard}
            />
          ))}
        </SortableContext>

        {/* 末尾へのドロップエリア */}
        {list.cards.length > 0 && (
          <div
            ref={setEndRef}
            className={`-mx-2 -mb-2 rounded transition-all ${
              isOverEnd ? 'bg-blue-50 min-h-[40px]' : 'min-h-[8px]'
            }`}
          >
            {isOverEnd && (
              <div className="h-1 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 mx-2 mt-2" />
            )}
          </div>
        )}

        {/* カード追加ボタンをカードエリア内に配置 */}
        <AddCard onAdd={(title) => onAddCard(list.id, title)} />
      </div>
    </div>
  )
}
