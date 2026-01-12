'use client'

import { useEffect, useRef, useState } from 'react'
import { BoardWithLists, Card as CardType } from '@/types'
import { useRouter } from 'next/navigation'
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

interface BoardSummary {
  id: string
  title: string
}

export function Board({ boardId, userAvatarUrl, userName }: BoardProps) {
  const router = useRouter()
  const [board, setBoard] = useState<BoardWithLists | null>(null)
  const [boards, setBoards] = useState<BoardSummary[]>([])
  const [isBoardMenuOpen, setIsBoardMenuOpen] = useState(false)
  const [newBoardTitle, setNewBoardTitle] = useState('')
  const [isCreatingBoard, setIsCreatingBoard] = useState(false)
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const boardMenuRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    fetchBoards()
  }, [boardId])

  useEffect(() => {
    if (!isBoardMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        boardMenuRef.current &&
        !boardMenuRef.current.contains(event.target as Node)
      ) {
        setIsBoardMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isBoardMenuOpen])

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

  const fetchBoards = async () => {
    try {
      const res = await fetch('/api/boards')
      if (res.ok) {
        const data = await res.json()
        setBoards(data)
      }
    } catch (error) {
      console.error('Failed to fetch boards:', error)
    }
  }

  const handleSwitchBoard = (id: string) => {
    setIsBoardMenuOpen(false)
    if (id !== boardId) {
      router.push(`/board/${id}`)
    }
  }

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim() || isCreatingBoard) return

    setIsCreatingBoard(true)
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newBoardTitle.trim() }),
      })

      if (res.ok) {
        const newBoard = await res.json()
        setBoards((prev) => [newBoard, ...prev])
        setNewBoardTitle('')
        setIsBoardMenuOpen(false)
        router.push(`/board/${newBoard.id}`)
      }
    } catch (error) {
      console.error('Failed to create board:', error)
    } finally {
      setIsCreatingBoard(false)
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
    const tempId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? `temp-${crypto.randomUUID()}`
        : `temp-${Date.now()}`
    const now = new Date()

    setBoard((prev) => {
      if (!prev) return prev
      const position =
        prev.lists.find((list) => list.id === listId)?.cards.length ?? 0
      const optimisticCard: CardType = {
        id: tempId,
        listId,
        title,
        description: null,
        dueDate: null,
        position,
        archived: false,
        createdAt: now,
        updatedAt: now,
      }
      return {
        ...prev,
        lists: prev.lists.map((list) =>
          list.id === listId
            ? { ...list, cards: [...list.cards, optimisticCard] }
            : list
        ),
      }
    })

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
                ? {
                    ...list,
                    cards: list.cards.map((card) =>
                      card.id === tempId ? newCard : card
                    ),
                  }
                : list
            ),
          }
        })
      } else {
        setBoard((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            lists: prev.lists.map((list) =>
              list.id === listId
                ? {
                    ...list,
                    cards: list.cards.filter((card) => card.id !== tempId),
                  }
                : list
            ),
          }
        })
      }
    } catch (error) {
      setBoard((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          lists: prev.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  cards: list.cards.filter((card) => card.id !== tempId),
                }
              : list
          ),
        }
      })
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

  const handleArchiveAllCards = async (listId: string) => {
    try {
      const res = await fetch(`/api/lists/${listId}/archive`, {
        method: 'POST',
      })

      if (res.ok) {
        setBoard((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            lists: prev.lists.map((list) =>
              list.id === listId ? { ...list, cards: [] } : list
            ),
          }
        })
      }
    } catch (error) {
      console.error('Failed to archive cards in list:', error)
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
          <div className="relative flex items-center gap-3" ref={boardMenuRef}>
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
            <button
              type="button"
              onClick={() => setIsBoardMenuOpen((prev) => !prev)}
              className="rounded-full border border-white/30 px-3 py-1 text-sm font-medium text-white/90 transition hover:border-white/60 hover:text-white"
            >
              Boards
            </button>
            {isBoardMenuOpen ? (
              <div className="absolute left-0 top-full z-20 mt-3 w-72 rounded-xl border border-white/20 bg-white/95 p-3 text-sm text-gray-900 shadow-xl backdrop-blur">
                <div className="max-h-64 overflow-y-auto">
                  {boards.length === 0 ? (
                    <div className="px-2 py-2 text-gray-500">
                      No boards yet
                    </div>
                  ) : (
                    boards.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSwitchBoard(item.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition hover:bg-gray-100 ${
                          item.id === boardId ? 'bg-gray-100 font-semibold' : ''
                        }`}
                      >
                        <span className="truncate">{item.title}</span>
                        {item.id === boardId ? (
                          <span className="text-xs text-gray-500">Current</span>
                        ) : null}
                      </button>
                    ))
                  )}
                </div>
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Create board
                  </label>
                  <Input
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    placeholder="New board title"
                    className="h-9 text-sm text-gray-900"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateBoard()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateBoard}
                    disabled={!newBoardTitle.trim() || isCreatingBoard}
                    className="mt-2 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    Create Board
                  </button>
                </div>
              </div>
            ) : null}
          </div>
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
            onArchiveAllCards={handleArchiveAllCards}
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
