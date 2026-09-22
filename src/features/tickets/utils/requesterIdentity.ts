import type { TicketRequester } from '../types'

/**
 * `name` can be empty — a ticket filed with just an email and nothing else.
 * That's not an edge case to guard against, it's the normal shape of a ticket
 * raised by a visitor who was never asked for a name: the widget's own
 * ticket form only ever collects an email (see `WidgetChatSimulator`), so any
 * integration that mirrors it will hand this feature exactly that. Read the
 * name through these two rather than `requester.name`/`requester.initials`
 * directly, so "nobody gave a name" renders as a deliberate state everywhere
 * instead of a blank space in some views and not others.
 */
export function hasRequesterName(requester: TicketRequester): boolean {
  return requester.name.trim().length > 0
}

export function requesterDisplayName(requester: TicketRequester): string {
  return requester.name.trim() || 'Guest'
}
