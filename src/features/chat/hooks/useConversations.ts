import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchConversations } from '../api/chat'
import { conversations as seedConversations } from '../data/mockChatData'
import type { Conversation } from '../types'

const conversationsQueryKey = ['chat', 'conversations'] as const

/**
 * The single store of conversations for the chat feature. Everything that
 * mutates a conversation — status, assignee, tags, handling, ban, unread —
 * goes through `patchConversation` so the list, the chat header and the details
 * panel can never disagree. Once a real API exists, `patchConversation` becomes
 * a mutation with an invalidate instead of a cache write.
 */
export function useConversations() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: conversationsQueryKey,
    queryFn: fetchConversations,
    initialData: () => seedConversations,
  })

  function patchConversation(conversationId: string, patch: Partial<Conversation>) {
    queryClient.setQueryData<Conversation[]>(conversationsQueryKey, (prev) =>
      (prev ?? []).map((conversation) =>
        conversation.id === conversationId ? { ...conversation, ...patch } : conversation,
      ),
    )
  }

  return { conversations: query.data ?? [], patchConversation }
}
