import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchTickets } from '../api/tickets'
import { CURRENT_AGENT_ID, initialTickets } from '../data/mockTicketsData'
import { isDueForPurge } from '../utils/ticketMeta'
import { requesterDisplayName } from '../utils/requesterIdentity'
import type {
  NewTicketInput,
  ReplyMode,
  Ticket,
  TicketMessage,
  TicketPlacement,
  TicketPriority,
  TicketStatus,
} from '../types'

const ticketsQueryKey = ['tickets'] as const

function now() {
  return new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function today() {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * The single ticket store for the app. `features/chat` writes into this same
 * cache when an agent raises a ticket from a conversation, so there is one
 * place a ticket can live rather than two that drift.
 */
export function useTickets() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ticketsQueryKey,
    queryFn: fetchTickets,
    initialData: () => initialTickets,
  })

  const tickets = query.data ?? []

  /**
   * Stands in for the server-side scheduled purge job (BE-09): drops any
   * trashed ticket that's sat past `TRASH_RETENTION_DAYS`. A pure filter over
   * current state, so running it again — every consumer of this hook does,
   * on mount — never double-deletes anything.
   */
  function purgeExpiredTrash() {
    queryClient.setQueryData<Ticket[]>(ticketsQueryKey, (prev) => {
      if (!prev) return prev
      const kept = prev.filter((ticket) => !(ticket.placement === 'trash' && isDueForPurge(ticket.trashedOn)))
      return kept.length === prev.length ? prev : kept
    })
  }

  useEffect(() => {
    purgeExpiredTrash()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function patch(ticketId: string, changes: Partial<Ticket>) {
    queryClient.setQueryData<Ticket[]>(ticketsQueryKey, (prev) =>
      (prev ?? []).map((ticket) =>
        ticket.id === ticketId ? { ...ticket, ...changes, updatedAt: now() } : ticket,
      ),
    )
  }

  function patchMany(ticketIds: string[], changes: Partial<Ticket>) {
    const ids = new Set(ticketIds)
    queryClient.setQueryData<Ticket[]>(ticketsQueryKey, (prev) =>
      (prev ?? []).map((ticket) => (ids.has(ticket.id) ? { ...ticket, ...changes, updatedAt: now() } : ticket)),
    )
  }

  function appendSystemMessage(ticketId: string, body: string) {
    queryClient.setQueryData<Ticket[]>(ticketsQueryKey, (prev) =>
      (prev ?? []).map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              messages: [
                ...ticket.messages,
                { id: `sys-${Date.now()}`, author: 'system', authorName: 'System', body, sentAt: now() },
              ],
            }
          : ticket,
      ),
    )
  }

  function setStatus(ticketId: string, status: TicketStatus) {
    patch(ticketId, { status })
    appendSystemMessage(ticketId, `Status changed to ${status}`)
  }

  function setPriority(ticketId: string, priority: TicketPriority) {
    patch(ticketId, { priority })
    appendSystemMessage(ticketId, `Priority set to ${priority}`)
  }

  function assign(ticketId: string, assigneeId: string | null, assigneeName: string) {
    patch(ticketId, { assigneeId })
    appendSystemMessage(ticketId, assigneeId ? `Assigned to ${assigneeName}` : 'Unassigned')
  }

  function setTags(ticketId: string, tags: string[]) {
    patch(ticketId, { tags })
  }

  /** Moving to trash records the date so the purge countdown can be shown. */
  function move(ticketId: string, placement: TicketPlacement) {
    patch(ticketId, {
      placement,
      trashedOn: placement === 'trash' ? today() : undefined,
    })
    appendSystemMessage(
      ticketId,
      placement === 'inbox' ? 'Restored to the inbox' : `Moved to ${placement}`,
    )
  }

  function moveMany(ticketIds: string[], placement: TicketPlacement) {
    patchMany(ticketIds, {
      placement,
      trashedOn: placement === 'trash' ? today() : undefined,
    })
  }

  /**
   * Only ever called from the trash, and it cannot be undone — enforced here
   * (not just by which button the UI shows), so any id passed in that isn't
   * currently in trash placement is silently left alone rather than deleted.
   */
  function deleteForever(ticketIds: string[]) {
    const ids = new Set(ticketIds)
    queryClient.setQueryData<Ticket[]>(ticketsQueryKey, (prev) =>
      (prev ?? []).filter((t) => !(ids.has(t.id) && t.placement === 'trash')),
    )
  }

  function addReply(ticketId: string, body: string, mode: ReplyMode, attachmentName?: string) {
    const message: TicketMessage = {
      id: `reply-${Date.now()}`,
      author: 'agent',
      authorName: 'You',
      body,
      sentAt: now(),
      isInternal: mode === 'note',
      attachmentName,
    }

    queryClient.setQueryData<Ticket[]>(ticketsQueryKey, (prev) =>
      (prev ?? []).map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              messages: [...ticket.messages, message],
              updatedAt: now(),
              // A public reply hands the ticket back to the requester; an
              // internal note changes nothing about who is waiting.
              status: mode === 'reply' && ticket.status === 'open' ? 'pending' : ticket.status,
            }
          : ticket,
      ),
    )
  }

  function markRead(ticketId: string) {
    const ticket = tickets.find((entry) => entry.id === ticketId)
    if (!ticket?.unreadReplies) return
    queryClient.setQueryData<Ticket[]>(ticketsQueryKey, (prev) =>
      (prev ?? []).map((entry) => (entry.id === ticketId ? { ...entry, unreadReplies: 0 } : entry)),
    )
  }

  /** Used by the chat feature so a ticket raised from a chat lands here. */
  function createTicket(
    input: NewTicketInput,
    context: { conversationId?: string; requester: Ticket['requester']; chatSummary?: string },
  ) {
    const stamp = Date.now()
    const ticket: Ticket = {
      id: `t-${stamp}`,
      reference: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: input.subject,
      description: input.description,
      requester: context.requester,
      priority: input.priority,
      status: 'open',
      placement: 'inbox',
      channel: context.conversationId ? 'chat' : 'manual',
      categoryId: input.categoryId,
      assigneeId: input.assigneeId,
      tags: [],
      createdBy: 'You',
      createdAt: now(),
      updatedAt: now(),
      dueOn: new Date(stamp + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      isOverdue: false,
      conversationId: context.conversationId,
      linkedChatSummary: context.chatSummary,
      unreadReplies: 0,
      messages: [
        {
          id: `sys-${stamp}`,
          author: 'system',
          authorName: 'System',
          body: context.conversationId
            ? `Raised from chat with ${requesterDisplayName(context.requester)}`
            : 'Created manually in Tickets',
          sentAt: now(),
        },
        ...(input.description
          ? [
              {
                id: `desc-${stamp}`,
                author: 'agent' as const,
                authorName: 'You',
                body: input.description,
                sentAt: now(),
                isInternal: true,
              },
            ]
          : []),
      ],
    }

    queryClient.setQueryData<Ticket[]>(ticketsQueryKey, (prev) => [ticket, ...(prev ?? [])])
    return ticket
  }

  return {
    tickets,
    currentAgentId: CURRENT_AGENT_ID,
    setStatus,
    setPriority,
    assign,
    setTags,
    move,
    moveMany,
    deleteForever,
    addReply,
    markRead,
    createTicket,
  }
}
