import type { Scope } from '@/config/roles'
import type { TicketChannel, TicketMailbox, TicketPlacement, TicketPriority, TicketStatus } from '../types'

export const priorityMeta: Record<TicketPriority, { label: string; className: string; bar: string; rank: number }> = {
  urgent: { label: 'Urgent', className: 'bg-rose-50 text-rose-700', bar: 'bg-rose-500', rank: 3 },
  high: { label: 'High', className: 'bg-amber-50 text-amber-700', bar: 'bg-amber-500', rank: 2 },
  medium: { label: 'Medium', className: 'bg-blue-50 text-blue-700', bar: 'bg-blue-500', rank: 1 },
  low: { label: 'Low', className: 'bg-gray-100 text-gray-600', bar: 'bg-gray-400', rank: 0 },
}

export const statusMeta: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-emerald-50 text-emerald-700' },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
  'on-hold': { label: 'On hold', className: 'bg-violet-50 text-violet-700' },
  solved: { label: 'Solved', className: 'bg-blue-50 text-blue-700' },
  closed: { label: 'Closed', className: 'bg-gray-100 text-gray-500' },
}

export const placementMeta: Record<TicketPlacement, { label: string }> = {
  inbox: { label: 'Inbox' },
  archive: { label: 'Archived' },
  spam: { label: 'Spam' },
  trash: { label: 'Trash' },
}

export const channelMeta: Record<TicketChannel, { label: string }> = {
  chat: { label: 'From chat' },
  email: { label: 'Email' },
  form: { label: 'Web form' },
  manual: { label: 'Created manually' },
  phone: { label: 'Phone' },
}

export const ticketStatuses: TicketStatus[] = ['open', 'pending', 'on-hold', 'solved', 'closed']
export const ticketPriorities: TicketPriority[] = ['urgent', 'high', 'medium', 'low']

/** Statuses that still need someone to act. */
export const ACTIVE_STATUSES: TicketStatus[] = ['open', 'pending', 'on-hold']

/** Days a ticket sits in the trash before it is purged for good. */
export const TRASH_RETENTION_DAYS = 30

const MONTH_INDEX: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

/** Parses the "17-Dec-2025" / "17 Dec 2025" shapes this feature seeds and generates — retention math only, never for display. */
function parseDisplayDate(label: string): Date | null {
  const match = label.match(/(\d{1,2})\D+([A-Za-z]{3})\D+(\d{4})/)
  if (!match) return null
  const month = MONTH_INDEX[match[2].toLowerCase()]
  if (month === undefined) return null
  return new Date(Number(match[3]), month, Number(match[1]))
}

/**
 * Stands in for the server-side scheduled purge job: true once a trashed
 * ticket has sat past the retention window and is due to be removed for
 * good. Pure function of `trashedOn` and the current time, so calling it
 * (and acting on it) repeatedly is inherently idempotent — nothing to
 * double-delete.
 */
export function isDueForPurge(trashedOn: string | undefined, asOf: Date = new Date()): boolean {
  if (!trashedOn) return false
  const trashedDate = parseDisplayDate(trashedOn)
  if (!trashedDate) return false
  const msInDay = 24 * 60 * 60 * 1000
  return asOf.getTime() - trashedDate.getTime() >= TRASH_RETENTION_DAYS * msInDay
}

/** Days left before the purge job removes this ticket for good, floored at 0. `null` when there's nothing to count down (not trashed / unparsable). */
export function daysUntilPurge(trashedOn: string | undefined, asOf: Date = new Date()): number | null {
  if (!trashedOn) return null
  const trashedDate = parseDisplayDate(trashedOn)
  if (!trashedDate) return null
  const msInDay = 24 * 60 * 60 * 1000
  const elapsedDays = Math.floor((asOf.getTime() - trashedDate.getTime()) / msInDay)
  return Math.max(TRASH_RETENTION_DAYS - elapsedDays, 0)
}

export interface MailboxDefinition {
  value: TicketMailbox
  label: string
  /** Mailboxes are grouped in the rail; a divider is drawn between groups. */
  group: 'queues' | 'states' | 'storage'
  /**
   * The narrowest scope tier that may see this mailbox. "All tickets",
   * "Unassigned" and the storage folders are team-management surfaces — a CSR
   * scoped to `own` cannot self-assign anyway (`tickets.assign` starts at CSR
   * Admin), so there is nothing for them to do with an unassigned queue or a
   * team-wide bulk-cleanup folder. Mirrors how `chats.view.team` gates the
   * Team inbox in chat.
   */
  minScope: Scope
}

export const ticketMailboxes: MailboxDefinition[] = [
  { value: 'all', label: 'All tickets', group: 'queues', minScope: 'team' },
  { value: 'mine', label: 'Assigned to me', group: 'queues', minScope: 'own' },
  { value: 'unassigned', label: 'Unassigned', group: 'queues', minScope: 'team' },
  { value: 'overdue', label: 'Overdue', group: 'queues', minScope: 'team' },
  { value: 'open', label: 'Open', group: 'states', minScope: 'own' },
  { value: 'pending', label: 'Pending', group: 'states', minScope: 'own' },
  { value: 'solved', label: 'Solved', group: 'states', minScope: 'own' },
  { value: 'archive', label: 'Archive', group: 'storage', minScope: 'team' },
  { value: 'spam', label: 'Spam', group: 'storage', minScope: 'team' },
  { value: 'trash', label: 'Trash', group: 'storage', minScope: 'team' },
]

const SCOPE_RANK: Record<Scope, number> = { none: -1, own: 0, team: 1, all: 2 }

/** The mailboxes a role at this scope tier is allowed to see. */
export function visibleTicketMailboxes(scope: Scope): MailboxDefinition[] {
  return ticketMailboxes.filter((mailbox) => SCOPE_RANK[scope] >= SCOPE_RANK[mailbox.minScope])
}

/** Mailboxes that show tickets outside the working inbox. */
export const STORAGE_MAILBOXES: TicketMailbox[] = ['archive', 'spam', 'trash']

export function isStorageMailbox(mailbox: TicketMailbox): boolean {
  return STORAGE_MAILBOXES.includes(mailbox)
}
