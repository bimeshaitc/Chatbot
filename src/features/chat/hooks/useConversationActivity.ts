import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchConversationActivity } from '../api/chat'
import { activityLog } from '../data/mockChatData'
import type { ActivityLogEntry, ActivityType } from '../types'

function activityQueryKey(conversationId: string | undefined) {
  return ['chat', 'conversations', conversationId, 'activity'] as const
}

export function useConversationActivity(conversationId: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: activityQueryKey(conversationId),
    queryFn: () => fetchConversationActivity(conversationId!),
    enabled: Boolean(conversationId),
    initialData: () => (conversationId ? (activityLog[conversationId] ?? []) : []),
  })

  function logActivity(action: string, note?: string, type: ActivityType = 'system') {
    if (!conversationId) return
    const entry: ActivityLogEntry = {
      id: `activity-${Date.now()}`,
      actor: 'You',
      action,
      note,
      time: new Date().toLocaleString(),
      type,
    }
    queryClient.setQueryData<ActivityLogEntry[]>(activityQueryKey(conversationId), (prev) => [entry, ...(prev ?? [])])
  }

  function addNote(note: string) {
    logActivity('added notes', note, 'note')
  }

  return { entries: query.data ?? [], addNote, logActivity }
}
