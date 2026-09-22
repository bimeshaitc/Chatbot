/**
 * The Tickets section's ticket model. This is the canonical one for the app —
 * the chat feature raises tickets into this same store rather than keeping its
 * own, so a ticket created from a conversation shows up in Tickets too.
 */

import type { TicketAccessLevel, WorkChannel, WorkspaceRole } from '@/config/roles'

/** A possible ticket assignee. See `utils/assigneeEligibility.ts` for who may actually be assigned. */
export interface TicketAgent {
  id: string
  name: string
  groups: string[]
  role: WorkspaceRole
  /** Only meaningful when `role` is `CSR`. Absent means both. */
  channels?: WorkChannel[]
  /** Only meaningful when `role` is `CSR` and `channels` includes `'tickets'`. Absent means `'edit'`. */
  ticketAccess?: TicketAccessLevel
}

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

/** Where a ticket is in its working life. */
export type TicketStatus = 'open' | 'pending' | 'on-hold' | 'solved' | 'closed'

/**
 * Which mailbox holds the ticket. Deliberately separate from `status`: a ticket
 * can be `open` and sitting in the trash. Folding spam and trash into the
 * status (the way some help desks do) means restoring one has to guess which
 * status to put it back to, and loses the distinction between "we finished
 * this" and "this should not have been here".
 */
export type TicketPlacement = 'inbox' | 'archive' | 'spam' | 'trash'

/** How the ticket reached us. */
export type TicketChannel = 'chat' | 'email' | 'form' | 'manual' | 'phone'

export type TicketMessageAuthor = 'requester' | 'agent' | 'system'

export interface TicketMessage {
  id: string
  author: TicketMessageAuthor
  authorName: string
  body: string
  sentAt: string
  /** Internal notes sit in the thread but are never sent to the requester. */
  isInternal?: boolean
  attachmentName?: string
}

export interface TicketRequester {
  name: string
  email: string
  initials: string
  avatarColor: string
}

export interface Ticket {
  id: string
  reference: string
  subject: string
  description: string
  requester: TicketRequester
  priority: TicketPriority
  status: TicketStatus
  placement: TicketPlacement
  channel: TicketChannel
  categoryId: string
  assigneeId: string | null
  tags: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
  dueOn: string
  /** True once the SLA window has passed without resolution. */
  isOverdue: boolean
  /** Set when the ticket was raised from a chat, so the two can be linked. */
  conversationId?: string
  /**
   * A recap of that chat, captured once at the moment the ticket was raised
   * — not a live link to it. An agent replying can attach it to the outgoing
   * email so the customer isn't asked to repeat what they already said.
   */
  linkedChatSummary?: string
  /** When it was moved to trash; used for the auto-purge countdown. */
  trashedOn?: string
  messages: TicketMessage[]
  unreadReplies: number
}

/** The fields a create form collects; everything else is derived on save. */
export interface NewTicketInput {
  subject: string
  description: string
  priority: TicketPriority
  categoryId: string
  assigneeId: string | null
}

/** Left-rail buckets. Some filter on status, others on placement. */
export type TicketMailbox =
  | 'all'
  | 'unassigned'
  | 'mine'
  | 'open'
  | 'pending'
  | 'solved'
  | 'overdue'
  | 'archive'
  | 'spam'
  | 'trash'

export type ReplyMode = 'reply' | 'note'
