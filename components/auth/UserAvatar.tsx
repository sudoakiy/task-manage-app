'use client'

interface UserAvatarProps {
  name: string
  src?: string
}

export function UserAvatar({ name, src }: UserAvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name ? `${name}のアイコン` : 'ユーザーアイコン'}
        width={36}
        height={36}
        loading="lazy"
        className="h-9 w-9 rounded-full border border-white/40 object-cover shadow-sm"
      />
    )
  }

  const initial = name.trim().charAt(0) || '?'

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/20 text-sm font-semibold text-white shadow-sm">
      {initial}
    </div>
  )
}
