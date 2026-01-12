'use client'

import { useEffect, useState } from 'react'
import { BoardWithLists, Card as CardType } from '@/types'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { List } from './List'
import { AddList } from './AddList'
import { Card } from './Card'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { UserAvatar } from '@/components/auth/UserAvatar'
import { Input } from '@/components/ui/input'

interface BoardProps {
  boardId: string
  userAvatarUrl?: string | null
  userName?: string | null
}

export function Board({ boardId, userAvatarUrl, userName }: BoardProps) {
  const [board, setBoard] = useState<BoardWithLists | null>(null)
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [isComposing, setIsComposing] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    fetchBoard()
  }, [boardId])

  const fetchBoard = async () => {
    try {
      const res = await fetch(`/api/boards/${boardId}`)
      if (res.ok) {
        const data = await res.json()
        setBoard(data)
      }
    } catch (error) {
      console.error('Failed to fetch board:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddList = async (title: string) => {
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId, title }),
      })

      if (res.ok) {
        const newList = await res.json()
        setBoard((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            lists: [...prev.lists, newList],
          }
        })
      }
    } catch (error) {
      console.error('Failed to add list:', error)
    }
  }

  const handleDeleteList = async (listId: string) => {
    try {
      const res = await fetch(`/api/lists/${listId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setBoard((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            lists: prev.lists.filter((list) => list.id !== listId),
          }
        })
      }
    } catch (error) {
      console.error('Failed to delete list:', error)
    }
  }

  const handleUpdateList = async (listId: string, title: string) => {
    try {
      const res = await fetch(`/api/lists/${listId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })

      if (res.ok) {
        const updatedList = await res.json()
        setBoard((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            lists: prev.lists.map((list) =>
              list.id === listId ? { ...list, title: updatedList.title } : list
            ),
          }
        })
      }
    } catch (error) {
      console.error('Failed to update list:', error)
    }
  }

  const handleStartEditTitle = () => {
    if (board) {
      setEditedTitle(board.title)
      setIsEditingTitle(true)
    }
  }

  const handleSaveTitle = async () => {
    if (!board || !editedTitle.trim()) {
      setIsEditingTitle(false)
      return
    }

    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editedTitle }),
      })

      if (res.ok) {
        const updatedBoard = await res.json()
        setBoard((prev) => {
          if (!prev) return prev
          return { ...prev, title: updatedBoard.title }
        })
        setIsEditingTitle(false)
      }
    } catch (error) {
      console.error('Failed to update board title:', error)
    }
  }

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false)
    setEditedTitle('')
  }

  const handleAddCard = async (
    listId: string,
    title: string
  ) => {
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId, title }),
      })

      if (res.ok) {
        const newCard = await res.json()
        setBoard((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            lists: prev.lists.map((list) =>
              list.id === listId
                ? { ...list, cards: [...list.cards, newCard] }
                : list
            ),
          }
        })
      }
    } catch (error) {
      console.error('Failed to add card:', error)
    }
  }

  const handleUpdateCard = async (id: string, data: Partial<CardType>) => {
    try {
      const res = await fetch(`/api/cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        const updatedCard = await res.json()
        setBoard((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            lists: prev.lists.map((list) => ({
              ...list,
              cards: list.cards.map((card) =>
                card.id === id ? updatedCard : card
              ),
            })),
          }
        })
      }
    } catch (error) {
      console.error('Failed to update card:', error)
    }
  }

  const handleArchiveCard = async (id: string) => {
    try {
      const res = await fetch(`/api/cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true }),
      })

      if (res.ok) {
        setBoard((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            lists: prev.lists.map((list) => ({
              ...list,
              cards: list.cards.filter((card) => card.id !== id),
            })),
          }
        })
      }
    } catch (error) {
      console.error('Failed to archive card:', error)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const card = board?.lists
      .flatMap((list) => list.cards)
      .find((c) => c.id === active.id)
    if (card) {
      setActiveCard(card)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over || active.id === over.id) return

    const activeCardId = active.id as string
    const overCardId = over.id as string

    // 末尾エリアへのドロップを処理
    const isOverEnd = (overCardId as string).endsWith('-end')
    const actualOverId = isOverEnd ? (overCardId as string).replace('-end', '') : overCardId

    const sourceList = board?.lists.find((list) =>
      list.cards.some((card) => card.id === activeCardId)
    )
    const targetList = board?.lists.find(
      (list) =>
        list.id === actualOverId || list.cards.some((card) => card.id === actualOverId)
    )

    if (!sourceList || !targetList || !board) return

    const isOverList = board.lists.some((list) => list.id === actualOverId)
    const targetListId = isOverList || isOverEnd ? actualOverId : targetList.id

    let newPosition = 0
    if (isOverEnd) {
      // 末尾に追加
      newPosition = targetList.cards.length
    } else if (!isOverList) {
      const overCardIndex = targetList.cards.findIndex(
        (card) => card.id === actualOverId
      )
      newPosition = overCardIndex
    }

    // 楽観的更新: UIを即座に更新
    const movedCard = sourceList.cards.find((card) => card.id === activeCardId)
    if (!movedCard) return

    // 新しいボード状態を作成
    const updatedLists = board.lists.map((list) => {
      // 同じリスト内での移動
      if (list.id === sourceList.id && list.id === targetListId) {
        const newCards = list.cards.filter((card) => card.id !== activeCardId)
        newCards.splice(newPosition, 0, { ...movedCard, listId: targetListId })
        return {
          ...list,
          cards: newCards,
        }
      }
      // 別のリストへの移動: ソースリストからカードを削除
      if (list.id === sourceList.id) {
        return {
          ...list,
          cards: list.cards.filter((card) => card.id !== activeCardId),
        }
      }
      // 別のリストへの移動: ターゲットリストにカードを追加
      if (list.id === targetListId) {
        const newCards = [...list.cards]
        newCards.splice(newPosition, 0, { ...movedCard, listId: targetListId })
        return {
          ...list,
          cards: newCards,
        }
      }
      return list
    })

    // UIを即座に更新
    setBoard({
      ...board,
      lists: updatedLists,
    })

    // バックグラウンドでサーバーに送信
    try {
      await fetch(`/api/cards/${activeCardId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listId: targetListId,
          position: newPosition,
        }),
      })
    } catch (error) {
      console.error('Failed to move card:', error)
      // エラー時は再フェッチして正しい状態に戻す
      await fetchBoard()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">ボードが見つかりません</div>
      </div>
    )
  }

  return (
    <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 p-6">
        <div className="mb-6 flex items-center justify-between">
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
              className="text-3xl font-bold text-white bg-white/10 border-white/30 focus:border-white max-w-xl"
              autoFocus
            />
          ) : (
            <h1
              className="text-3xl font-bold text-white cursor-pointer"
              onClick={handleStartEditTitle}
            >
              {board.title}
            </h1>
          )}
          <div className="flex items-center gap-3">
            <UserAvatar name={userName ?? ''} src={userAvatarUrl ?? undefined} />
            <LogoutButton />
          </div>
        </div>

        <div
          className="flex gap-4 overflow-x-auto pb-4 board-scroll"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)',
          }}
        >
          {board.lists.map((list) => (
            <List
              key={list.id}
              list={list}
              onAddCard={handleAddCard}
              onUpdateCard={handleUpdateCard}
              onArchiveCard={handleArchiveCard}
              onDeleteList={handleDeleteList}
              onUpdateList={handleUpdateList}
            />
          ))}
          <AddList onAdd={handleAddList} />
        </div>
      </div>

        <DragOverlay>
          {activeCard ? (
            <div className="bg-white rounded-lg p-3 shadow-2xl border-2 border-blue-500 w-80 rotate-6 transform scale-110 ring-4 ring-blue-200 ring-opacity-50">
              <h3 className="text-sm font-medium text-gray-900">
                {activeCard.title}
              </h3>
              {activeCard.description && (
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                  {activeCard.description}
                </p>
              )}
            </div>
          ) : null}
        </DragOverlay>
    </DndContext>
  )
}
