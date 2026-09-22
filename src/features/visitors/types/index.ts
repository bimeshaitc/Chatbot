/**
 * A website visitor, identified or not. There is no stable person id shared
 * across chat/tickets/visitors anywhere in the app yet (a conversation's
 * `customer` is a display name, a ticket's `TicketRequester` is its own
 * struct) — this feature does not invent one either. `conversations` and
 * `tickets` below are seeded by matching name/email, the same "same
 * person, modelled independently" tradeoff the rest of the app already
 * lives with, not a real foreign key.
 */
export type VisitorDevice = 'Desktop' | 'Mobile' | 'Tablet'

/**
 * How confidently a conversation or ticket is linked to this visitor (BE-14
 * §5/§7). `direct` means it was created in this same visitor/browser session
 * — the strongest link, and one that needs no identity at all. `identified`
 * means it was matched through a reliable identifier, typically a verified
 * email. `best-effort` means the match used a weaker signal (commonly name
 * alone) and must be shown as uncertain, never as a confirmed identity.
 */
export type VisitorMatchType = 'direct' | 'identified' | 'best-effort'

export interface VisitorAssociation {
  id: string
  matchType: VisitorMatchType
}

export interface Visitor {
  id: string
  name: string
  email: string
  initials: string
  avatarColor: string
  isIdentified: boolean
  isOnline: boolean
  location: string
  device: VisitorDevice
  browser: string
  /** Where they arrived from — a search engine, a campaign link, direct. */
  referrer: string
  firstSeen: string
  lastSeen: string
  totalVisits: number
  totalConversations: number
  totalTickets: number
  tags: string[]
  conversations: VisitorAssociation[]
  tickets: VisitorAssociation[]
}
