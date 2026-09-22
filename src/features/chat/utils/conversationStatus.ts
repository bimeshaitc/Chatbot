import type { Conversation, ConversationStatus } from '../types'

interface StatusMeta {
  label: string
  /** Text colour for the compact list row. */
  textColor: string
  /** Badge colours for the chat header control. */
  badgeClass: string
}

export const conversationStatusMeta: Record<ConversationStatus, StatusMeta> = {
  active: { label: 'Active', textColor: 'text-emerald-600', badgeClass: 'border-emerald-200 text-emerald-700' },
  waiting: {
    label: 'Waiting on customer',
    textColor: 'text-amber-600',
    badgeClass: 'border-amber-200 text-amber-700',
  },
  resolved: { label: 'Resolved', textColor: 'text-blue-600', badgeClass: 'border-blue-200 text-blue-700' },
  // Rose rather than grey: a customer leaving unanswered is a bad outcome, and
  // it should not read like tidy housekeeping.
  abandoned: { label: 'Abandoned', textColor: 'text-rose-600', badgeClass: 'border-rose-200 text-rose-700' },
  closed: { label: 'Closed', textColor: 'text-gray-500', badgeClass: 'border-gray-200 text-gray-600' },
}

export const conversationStatuses = Object.keys(conversationStatusMeta) as ConversationStatus[]

/**
 * The statuses that take a chat out of the live inboxes and into Archive.
 *
 * Archiving is derived from the status rather than stored as its own flag, so
 * there is exactly one way for a chat to leave the floor and no way for the two
 * to drift apart.
 */
export const ARCHIVED_STATUSES: ConversationStatus[] = ['resolved', 'abandoned', 'closed']

export function isArchivedStatus(status: ConversationStatus): boolean {
  return ARCHIVED_STATUSES.includes(status)
}

export function isArchived(conversation: Conversation): boolean {
  return isArchivedStatus(conversation.status)
}
