'use client'

import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  return (
    <Button
      onClick={() => signOut()}
      variant="ghost"
      size="icon"
      className="cursor-pointer hover:bg-white/20"
      title="ログアウト"
    >
      <LogOut className="h-5 w-5" />
    </Button>
  )
}
