import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { boardId, title } = await request.json()

    if (!boardId || !title) {
      return NextResponse.json(
        { error: 'Board ID and title are required' },
        { status: 400 }
      )
    }

    const listsCount = await prisma.list.count({
      where: { boardId },
    })

    const list = await prisma.list.create({
      data: {
        boardId,
        title,
        position: listsCount,
      },
      include: {
        cards: {
          where: { archived: false },
          orderBy: { position: 'asc' },
        },
      },
    })

    return NextResponse.json(list, { status: 201 })
  } catch (error) {
    console.error('Error creating list:', error)
    return NextResponse.json(
      { error: 'Failed to create list' },
      { status: 500 }
    )
  }
}
