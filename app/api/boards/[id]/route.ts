import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { LEGACY_USER_ID } from '@/lib/boards'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    let board = await prisma.board.findFirst({
      where: {
        id,
        OR: [{ userId: user.id }, { userId: LEGACY_USER_ID }],
      },
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              where: { archived: false },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    })

    if (board && board.userId === LEGACY_USER_ID) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: { id: user.id },
      })
      board = await prisma.board.update({
        where: { id: board.id },
        data: { userId: user.id },
        include: {
          lists: {
            orderBy: { position: 'asc' },
            include: {
              cards: {
                where: { archived: false },
                orderBy: { position: 'asc' },
              },
            },
          },
        },
      })
    }

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      )
    }

    // Update last viewed board
    await prisma.user.update({
      where: { id: user.id },
      data: { lastViewedBoardId: board.id },
    })

    return NextResponse.json(board)
  } catch (error) {
    console.error('Error fetching board:', error)
    return NextResponse.json(
      { error: 'Failed to fetch board' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { title } = await request.json()

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const existingBoard = await prisma.board.findFirst({
      where: { id, OR: [{ userId: user.id }, { userId: LEGACY_USER_ID }] },
    })

    if (!existingBoard) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      )
    }

    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: { id: user.id },
    })

    const board = await prisma.board.update({
      where: { id },
      data: {
        title,
        userId:
          existingBoard.userId === LEGACY_USER_ID
            ? user.id
            : existingBoard.userId,
      },
    })

    return NextResponse.json(board)
  } catch (error) {
    console.error('Error updating board:', error)
    return NextResponse.json(
      { error: 'Failed to update board' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const board = await prisma.board.findFirst({
      where: { id, OR: [{ userId: user.id }, { userId: LEGACY_USER_ID }] },
    })

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      )
    }

    await prisma.board.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting board:', error)
    return NextResponse.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    )
  }
}
