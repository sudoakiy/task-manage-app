import { Board } from '@/components/board/Board'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  return <Board boardId={id} />
}
