import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let board = await prisma.board.findFirst({
    orderBy: { createdAt: 'desc' },
  })

  if (!board) {
    board = await prisma.board.create({
      data: {
        title: 'マイボード',
      },
    })
  }

  redirect(`/board/${board.id}`)
}
