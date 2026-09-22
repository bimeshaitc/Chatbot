import { useMemo, useState, type ReactNode } from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import type { Agent, Conversation, InboxFilter } from '../types'
import type { FilterChip } from '../utils/chatInboxes'
import { ConversationListItem } from './ConversationListItem'

interface ConversationListPanelProps {
  conversations: Conversation[]
  agents: Agent[]
  viewerAgentId: string
  filters: FilterChip[]
  /** Counts are computed over the inbox, not the filtered list, so they stay put. */
  countByFilter: Record<string, number>
  activeFilter: InboxFilter
  onSelectFilter: (filter: InboxFilter) => void
  /** Inbox-specific controls under the chips — the agent/category pair on Team. */
  headerExtra?: ReactNode
  emptyMessage: string
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
}

/**
 * No title or subtitle here on purpose — the inbox rail right next to this
 * already says which inbox is open and what it means, in full sentences. This
 * used to repeat both, so switching inboxes changed one label in two places.
 */
export function ConversationListPanel({
  conversations,
  agents,
  viewerAgentId,
  filters,
  countByFilter,
  activeFilter,
  onSelectFilter,
  headerExtra,
  emptyMessage,
  selectedConversationId,
  onSelectConversation,
}: ConversationListPanelProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  const visibleConversations = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()
    if (!query) return conversations

    return conversations.filter((conversation) =>
      [conversation.customer, conversation.lastMessage, conversation.resolution ?? '', ...conversation.tags]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [conversations, debouncedSearch])

  const isSearching = search.trim().length > 0

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col border-r border-gray-100 bg-white lg:h-full lg:w-84 lg:flex-none">
      <div className="border-b border-gray-100 px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats, messages, tags"
            aria-label="Search chats"
            className="h-8 w-full rounded-lg border border-gray-200 pr-7 pl-8 text-xs outline-none focus:border-blue-400"
          />
          {isSearching && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute top-1/2 right-1.5 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {filters.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto px-3 py-2">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.value
            const count = countByFilter[filter.value] ?? 0

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => onSelectFilter(filter.value as InboxFilter)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors',
                  isActive ? 'bg-gray-900 font-medium text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100',
                )}
              >
                {filter.label}
                <span
                  className={cn(
                    'tabular-nums',
                    isActive
                      ? 'text-white/70'
                      : filter.isAlert && count > 0
                        ? 'font-medium text-amber-600'
                        : 'text-gray-400',
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {headerExtra && <div className="border-b border-gray-100 px-3 pb-2">{headerExtra}</div>}

      <div className="flex-1 overflow-y-auto">
        {visibleConversations.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-400">
            {isSearching ? `No chats match "${search.trim()}".` : emptyMessage}
          </p>
        ) : (
          visibleConversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              agents={agents}
              viewerAgentId={viewerAgentId}
              isActive={conversation.id === selectedConversationId}
              onSelect={onSelectConversation}
            />
          ))
        )}
      </div>
    </div>
  )
}
