import { Paperclip, StickyNote } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '../types'

interface ChatMessageBubbleProps {
  message: ChatMessage
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  // Internal notes sit in the thread but must never read as something the
  // customer can see, so they get their own treatment rather than a bubble.
  if (message.isNote) {
    return (
      <div className="flex justify-center">
        <div className="flex w-full max-w-[85%] gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 sm:max-w-[70%]">
          <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium tracking-wide text-amber-700 uppercase">
              Internal note{message.authorName ? ` · ${message.authorName}` : ''}
            </p>
            <p className="mt-0.5 text-sm text-gray-700">{message.text}</p>
            <p className="mt-1 text-[11px] text-amber-700/70">{message.time}</p>
          </div>
        </div>
      </div>
    )
  }

  if (message.sender === 'system') {
    return (
      <div className="flex items-center justify-center gap-2 py-1 text-xs text-gray-400">
        <span className="h-px w-8 bg-gray-200" />
        {message.text}
        <span className="h-px w-8 bg-gray-200" />
      </div>
    )
  }

  const isAgent = message.sender === 'agent'

  return (
    <div className={cn('flex flex-col', isAgent ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm sm:max-w-[70%]',
          isAgent ? 'rounded-tr-sm bg-blue-600 text-white' : 'rounded-tl-sm bg-gray-100 text-gray-800',
        )}
      >
        {message.text}
        {message.attachmentName && (
          <span
            className={cn(
              'mt-1.5 flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs',
              isAgent ? 'bg-white/15' : 'bg-white',
            )}
          >
            <Paperclip className="h-3 w-3 shrink-0" />
            <span className="truncate">{message.attachmentName}</span>
          </span>
        )}
      </div>
      <span className="mt-1 text-[11px] text-gray-400">
        {message.authorName ? `${message.authorName} · ` : ''}
        {message.time}
      </span>
    </div>
  )
}
