import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { listId, position } = await request.json()

    if (!listId || position === undefined) {
      return NextResponse.json(
        { error: 'List ID and position are required' },
        { status: 400 }
      )
    }

    const card = await prisma.card.findUnique({
      where: { id },
    })

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    const isSameList = card.listId === listId

    if (isSameList) {
      const cardsInList = await prisma.card.findMany({
        where: { listId, archived: false, id: { not: id } },
        orderBy: { position: 'asc' },
      })

      const reorderedCards = cardsInList.filter((c) => c.position >= position)

      await prisma.$transaction([
        ...reorderedCards.map((c) =>
          prisma.card.update({
            where: { id: c.id },
            data: { position: c.position + 1 },
          })
        ),
        prisma.card.update({
          where: { id },
          data: { position },
        }),
      ])
    } else {
      const oldListCards = await prisma.card.findMany({
        where: { listId: card.listId, archived: false, position: { gt: card.position } },
        orderBy: { position: 'asc' },
      })

      const newListCards = await prisma.card.findMany({
        where: { listId, archived: false },
        orderBy: { position: 'asc' },
      })

      const newListReordered = newListCards.filter((c) => c.position >= position)

      await prisma.$transaction([
        ...oldListCards.map((c) =>
          prisma.card.update({
            where: { id: c.id },
            data: { position: c.position - 1 },
          })
        ),
        ...newListReordered.map((c) =>
          prisma.card.update({
            where: { id: c.id },
            data: { position: c.position + 1 },
          })
        ),
        prisma.card.update({
          where: { id },
          data: { listId, position },
        }),
      ])
    }

    const updatedCard = await prisma.card.findUnique({
      where: { id },
    })

    return NextResponse.json(updatedCard)
  } catch (error) {
    console.error('Error moving card:', error)
    return NextResponse.json(
      { error: 'Failed to move card' },
      { status: 500 }
    )
  }
}
