import { useTickets } from '@/features/tickets'
import type { NewTicketInput, TicketRequester } from '@/features/tickets'
import type { ChatMessage } from '../types'
import { summarizeChatMessages } from '../utils/conversationSummary'

/**
 * A view over the Tickets store, narrowed to one conversation.
 *
 * Chat deliberately does not keep its own ticket list: a ticket raised here
 * has to show up in Tickets too, and two stores would drift.
 */
export function useConversationTickets(conversationId: string | undefined) {
  const { tickets, createTicket } = useTickets()

  const conversationTickets = conversationId
    ? tickets.filter((ticket) => ticket.conversationId === conversationId)
    : []

  /**
   * `messages` is the thread as it stands right now — captured into the
   * ticket's `linkedChatSummary` at this exact moment, not kept live. An
   * agent replying to the ticket later sees what led to it, not whatever the
   * chat has moved on to since.
   */
  async function create(input: NewTicketInput, requester: TicketRequester, messages: ChatMessage[]) {
    if (!conversationId) throw new Error('No conversation selected')
    return createTicket(input, { conversationId, requester, chatSummary: summarizeChatMessages(messages) })
  }

  return { tickets: conversationTickets, createTicket: create, isCreating: false }
}
