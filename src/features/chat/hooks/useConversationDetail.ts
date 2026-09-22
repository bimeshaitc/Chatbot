import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchConversationMessages, fetchCustomerProfile } from '../api/chat'
import { customerProfilesByConversationId, messagesByConversationId } from '../data/mockChatData'
import type {
  ChatMessage,
  ComposerMode,
  Conversation,
  ConversationCloser,
  ConversationStatus,
} from '../types'
import { isArchivedStatus } from '../utils/conversationStatus'
import { avatarColorFor, initialsFromName } from '../utils/customerIdentity'
import { useConversations } from './useConversations'

function messagesQueryKey(conversationId: string | undefined) {
  return ['chat', 'conversations', conversationId, 'messages'] as const
}

interface AppendMessageOptions {
  attachmentName?: string
}

export function useConversationDetail(conversationId: string | undefined) {
  const queryClient = useQueryClient()
  // Derived from the shared store rather than fetched separately, so a patch
  // made anywhere is immediately visible here and in the conversation list.
  const { conversations, patchConversation } = useConversations()
  const conversation = conversations.find((entry) => entry.id === conversationId) ?? null

  const messagesQuery = useQuery({
    queryKey: messagesQueryKey(conversationId),
    queryFn: () => fetchConversationMessages(conversationId!),
    enabled: Boolean(conversationId),
    initialData: () => (conversationId ? (messagesByConversationId[conversationId] ?? []) : []),
  })

  const profileQuery = useQuery({
    queryKey: ['chat', 'conversations', conversationId, 'customer'],
    queryFn: () => fetchCustomerProfile(conversationId!),
    enabled: Boolean(conversationId),
    initialData: () => (conversationId ? (customerProfilesByConversationId[conversationId] ?? null) : null),
  })

  function patch(fields: Partial<Conversation>) {
    if (!conversationId) return
    patchConversation(conversationId, fields)
  }

  /**
   * A human attaches themselves to the chat, either to reply or to watch.
   *
   * Handling and assignee move together and only through here, because the two
   * describing the same chat differently is exactly the confusion the inbox
   * layout is meant to remove: "the AI is handling it" and "it is in Anisha's
   * queue" cannot both be true.
   */
  function claimAs(handling: 'agent' | 'supervised', agentId: string) {
    patch({ handling, assignedAgentId: agentId })
  }

  /** The mirror of `claimAs`: nobody owns it, it goes back to the AI's pool. */
  function releaseToBot() {
    patch({ handling: 'bot', assignedAgentId: null })
  }

  /**
   * `closer` is who ended the chat, and is only read when the new status is an
   * archiving one. Moving back to a live status clears the archive fields, so a
   * reopened chat does not keep claiming it was closed.
   */
  function setStatus(status: ConversationStatus, closer: ConversationCloser | null) {
    if (isArchivedStatus(status)) {
      patch({
        status,
        closedAt: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
        closedBy: closer ?? { by: 'bot' },
      })
      return
    }
    patch({ status, closedAt: undefined, closedBy: undefined, resolution: undefined })
  }

  /**
   * Hands the chat to another agent, who owns and answers it from now on.
   * `newlyAssigned` is what lets that agent's own view notice it happened
   * without them having done anything themselves.
   */
  function transferToAgent(agentId: string) {
    patch({ handling: 'agent', assignedAgentId: agentId, newlyAssigned: true })
  }

  function setBanned(isBanned: boolean) {
    patch({ isBanned })
  }

  /**
   * Records a name once the customer has actually given one — asked in the
   * conversation, not assumed. Replaces the generated placeholder everywhere
   * at once (the list row, the header, Details) since they all read the same
   * `customer`/`initials`/`avatarColor` fields rather than each computing
   * their own guess at who this is.
   */
  function identifyCustomer(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    patch({
      customer: trimmed,
      initials: initialsFromName(trimmed),
      avatarColor: avatarColorFor(trimmed),
      isIdentified: true,
    })
  }

  /**
   * Records an email on the spot — the standard trigger is a ticket needing a
   * reply channel and nothing being on file yet. Kept separate from
   * `identifyCustomer`: a ticket asks for an email, never a name, so the two
   * can arrive independently and neither should imply the other happened.
   */
  function recordCustomerEmail(email: string) {
    const trimmed = email.trim()
    if (!trimmed) return
    patch({ customerEmail: trimmed })
  }

  /** Called when a chat is opened, so the list badge clears. */
  function markAsRead() {
    if (!conversation?.unreadCount) return
    patch({ unreadCount: 0 })
  }

  /** Called once the assignee actually opens their newly-assigned chat. */
  function acknowledgeAssignment() {
    if (!conversation?.newlyAssigned) return
    patch({ newlyAssigned: false })
  }

  function addTag(tag: string) {
    if (!conversation) return
    // Tags are a display-only set here; ignore a repeat rather than duplicating it.
    if (conversation.tags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) return
    patch({ tags: [...conversation.tags, tag] })
  }

  function removeTag(tag: string) {
    if (!conversation) return
    patch({ tags: conversation.tags.filter((existing) => existing !== tag) })
  }

  function pushMessage(message: ChatMessage) {
    if (!conversationId) return
    queryClient.setQueryData<ChatMessage[]>(messagesQueryKey(conversationId), (prev) => [...(prev ?? []), message])
  }

  function nowParts() {
    const now = new Date()
    return {
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      stamp: now.getTime(),
    }
  }

  /** Appends to the local thread only — there is no send endpoint yet. */
  function appendMessage(text: string, mode: ComposerMode, options: AppendMessageOptions = {}) {
    if (!conversationId) return
    const { date, time, stamp } = nowParts()
    pushMessage({
      id: `local-${stamp}`,
      sender: 'agent',
      authorName: 'You',
      text,
      date,
      time,
      isNote: mode === 'note',
      attachmentName: options.attachmentName,
    })

    // An internal note is invisible to the customer, so it must not become the
    // conversation's last message in the list.
    if (mode === 'message') {
      patch({ lastMessage: text, lastMessageDirection: 'outbound', time })
    }
  }

  /** Handoffs, status changes and bans leave a marker in the thread itself. */
  function appendSystemMessage(text: string) {
    if (!conversationId) return
    const { date, time, stamp } = nowParts()
    pushMessage({ id: `system-${stamp}`, sender: 'system', text, date, time })
  }

  return {
    conversation,
    messages: messagesQuery.data ?? [],
    customerProfile: profileQuery.data ?? null,
    isLoading: messagesQuery.isLoading,
    claimAs,
    releaseToBot,
    setStatus,
    transferToAgent,
    setBanned,
    identifyCustomer,
    recordCustomerEmail,
    markAsRead,
    acknowledgeAssignment,
    addTag,
    removeTag,
    appendMessage,
    appendSystemMessage,
  }
}
