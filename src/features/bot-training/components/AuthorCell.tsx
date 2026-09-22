import type { SourceAuthor } from '../types'

export function AuthorCell({ author }: { author: SourceAuthor }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${author.avatarColor}`}>
        {author.initials}
      </span>
      <span className="text-gray-700">{author.name}</span>
      <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">{author.role}</span>
    </span>
  )
}
