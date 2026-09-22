import { Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatInbox } from '../types'
import type { InboxDefinition } from '../utils/chatInboxes'

export interface InboxCount {
  total: number
  /** Chats in this inbox that want attention now — rendered in amber. */
  alert: number
}

interface ChatInboxRailProps {
  inboxes: InboxDefinition[]
  countByInbox: Record<ChatInbox, InboxCount>
  activeInbox: ChatInbox
  onSelectInbox: (inbox: ChatInbox) => void
  /** The `own` / `team` / `all` rule, shown as one line with the detail in a tooltip. */
  scope: { label: string; detail: string }
  /** Average confidence across the AI's live chats, 0-1. Shown on the AI inbox. */
  averageBotConfidence: number
}

/**
 * The permanent left rail: four inboxes, one question each. Each row carries
 * its own alert count, so that number is stated exactly once — not repeated
 * again in a footer banner the way an earlier pass here did.
 */
export function ChatInboxRail({
  inboxes,
  countByInbox,
  activeInbox,
  onSelectInbox,
  scope,
  averageBotConfidence,
}: ChatInboxRailProps) {
  const confidencePercent = Math.round(averageBotConfidence * 100)

  return (
    <div className="flex w-full shrink-0 flex-col border-b border-gray-100 bg-white lg:h-full lg:w-56 lg:border-b-0 lg:border-r">
      <div className="flex gap-2 overflow-x-auto px-3 py-2 lg:flex-1 lg:flex-col lg:gap-0.5 lg:overflow-y-auto lg:overflow-x-hidden lg:px-2 lg:py-2">
        {inboxes.map((inbox) => {
          const Icon = inbox.icon
          const isActive = activeInbox === inbox.id
          const { total, alert } = countByInbox[inbox.id]

          return (
            <button
              key={inbox.id}
              type="button"
              onClick={() => onSelectInbox(inbox.id)}
              aria-current={isActive ? 'page' : undefined}
              title={inbox.description}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-left transition-colors lg:w-full lg:rounded-lg lg:px-3 lg:py-2',
                isActive ? 'bg-gray-900 text-white lg:bg-gray-100 lg:text-gray-900' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 lg:bg-transparent lg:hover:bg-gray-50',
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white lg:text-gray-900' : inbox.accent)} />
              <span className="flex-1 truncate text-xs font-medium lg:text-sm">{inbox.label}</span>
              {alert > 0 && (
                <span
                  className={cn(
                    'flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-semibold',
                    isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700',
                  )}
                >
                  {alert}
                </span>
              )}
              <span className={cn('shrink-0 text-xs tabular-nums', isActive ? 'text-white/70 lg:text-gray-500' : 'text-gray-400')}>
                {total}
              </span>
            </button>
          )
        })}
      </div>

      {activeInbox === 'bot' && (
        <div className="hidden items-center gap-2 border-t border-gray-100 px-4 py-2.5 lg:flex">
          <span className="text-[11px] text-gray-400">Avg. confidence</span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-violet-500" style={{ width: `${confidencePercent}%` }} />
          </div>
          <span className="text-xs font-medium text-gray-700">{confidencePercent}%</span>
        </div>
      )}

      <div className="hidden items-center gap-1.5 border-t border-gray-100 px-4 py-2.5 lg:flex" title={scope.detail}>
        <Eye className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        <p className="truncate text-[11px] text-gray-500">{scope.label}</p>
      </div>
    </div>
  )
}
