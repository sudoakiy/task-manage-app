import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.card.updateMany({
      where: { listId: id, archived: false },
      data: { archived: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error archiving cards in list:', error)
    return NextResponse.json(
      { error: 'Failed to archive cards in list' },
      { status: 500 }
    )
  }
}
