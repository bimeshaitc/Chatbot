import { initialTickets } from '../data/mockTicketsData'
import type { Ticket } from '../types'

/**
 * No backend endpoint is documented for tickets yet (see CLAUDE.md). These read
 * from the mock dataset but are shaped like the real calls (`GET /tickets`,
 * `GET /tickets/:id`) so swapping in `apiClient.get(...)` later only touches
 * this file, not the hooks or views above it.
 */
export async function fetchTickets(): Promise<Ticket[]> {
  return initialTickets
}

export async function fetchTicketById(ticketId: string): Promise<Ticket | null> {
  return initialTickets.find((ticket) => ticket.id === ticketId) ?? null
}
