import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { listId, title, description } = await request.json()

    if (!listId || !title) {
      return NextResponse.json(
        { error: 'List ID and title are required' },
        { status: 400 }
      )
    }

    const cardsCount = await prisma.card.count({
      where: { listId, archived: false },
    })

    const card = await prisma.card.create({
      data: {
        listId,
        title,
        description: description || null,
        position: cardsCount,
      },
    })

    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    console.error('Error creating card:', error)
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    )
  }
}
