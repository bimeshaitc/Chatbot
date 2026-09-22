import { isArchived, type Conversation } from '@/features/chat'
import type { Ticket, TicketStatus } from '@/features/tickets'
import type { HandoverItemRef } from '../types'

/**
 * Kept local rather than exported from `features/tickets` — this is the one
 * place in the app that needs "still open" as a single predicate, so a shared
 * export would be speculative reuse until something else needs it too.
 */
const OPEN_TICKET_STATUSES: TicketStatus[] = ['open', 'pending', 'on-hold']

/**
 * A handover only ever moves *live* work — anything already resolved before
 * shift end stays exactly where it is. This is what makes "zero open items"
 * a real, common case rather than something to special-case defensively.
 */
export function getOpenChats(conversations: Conversation[], agentId: string): Conversation[] {
  return conversations.filter((conversation) => conversation.assignedAgentId === agentId && !isArchived(conversation))
}

export function getOpenTickets(tickets: Ticket[], agentId: string): Ticket[] {
  return tickets.filter((ticket) => ticket.assigneeId === agentId && OPEN_TICKET_STATUSES.includes(ticket.status))
}

export function toHandoverItems(chats: Conversation[], tickets: Ticket[]): HandoverItemRef[] {
  return [
    ...chats.map((chat): HandoverItemRef => ({ kind: 'chat', id: chat.id })),
    ...tickets.map((ticket): HandoverItemRef => ({ kind: 'ticket', id: ticket.id })),
  ]
}
