import type { ConversationStatus } from '../types'
import { InfoTip } from '@/components/InfoTip'
import { recentConversations } from '../data/mockDashboardData'

const statusStyles: Record<ConversationStatus, { label: string; dot: string; badge: string }> = {
  pending: { label: 'Pending', dot: 'bg-secondary-secondary', badge: 'bg-transparent text-secondary-secondary' },
  resolved: { label: 'Resolved', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
  unassigned: { label: 'Unassigned', dot: 'bg-pink-500', badge: 'bg-pink-50 text-pink-700' },
}

export function RecentConversationsCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[15px] leading-[1.4] font-semibold text-gray-900">
          Recent Conversations
          <InfoTip label="The latest conversations by most recent message. The badge shows status, the dark circle counts unread messages, and the time is when the last message arrived." align="right" />
        </h2>
        <button type="button" className="text-xs font-medium text-gray-500 hover:text-gray-800">
          View all
        </button>
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {recentConversations.map((conversation) => {
          const status = statusStyles[conversation.status]
          return (
            <li key={conversation.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-pastel-background p-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${conversation.avatarColor}`}>
                  {conversation.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{conversation.customer}</p>
                  <p className="mt-0.5 max-w-[16rem] truncate text-xs text-gray-500 sm:max-w-xs">{conversation.message}</p>
                  <div className="mt-1.5 flex gap-1.5">
                    {conversation.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${status.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[9px] font-semibold text-white">
                  {conversation.unreadCount}
                </span>
                <span className="text-[10px] text-gray-400">{conversation.time}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
