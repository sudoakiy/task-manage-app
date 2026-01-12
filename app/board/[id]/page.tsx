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
  const userMetadata = user.user_metadata ?? {}
  const userAvatarUrl =
    userMetadata.avatar_url ?? userMetadata.picture ?? null
  const userName =
    userMetadata.full_name ?? userMetadata.name ?? user.email ?? ''

  return (
    <Board
      boardId={id}
      userAvatarUrl={userAvatarUrl}
      userName={userName}
    />
  )
}
