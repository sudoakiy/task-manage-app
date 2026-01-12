import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { LEGACY_USER_ID } from '@/lib/boards'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id },
  })

  let board = await prisma.board.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  if (!board) {
    const legacyBoard = await prisma.board.findFirst({
      where: { userId: LEGACY_USER_ID },
      orderBy: { createdAt: 'desc' },
    })

    if (legacyBoard) {
      board = await prisma.board.update({
        where: { id: legacyBoard.id },
        data: { userId: user.id },
      })
    } else {
      board = await prisma.board.create({
        data: {
          title: 'マイボード',
          userId: user.id,
        },
      })
    }
  }

  redirect(`/board/${board.id}`)
}
