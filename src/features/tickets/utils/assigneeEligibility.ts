import { ALL_CHANNELS, channelCan } from '@/config/roles'
import type { TicketAgent } from '../types'

/**
 * Whether this agent could handle a ticket at all — a CSR whose channel
 * doesn't include tickets cannot be assigned one, the same rule that keeps
 * them out of the Tickets nav item and route; neither can a CSR whose tickets
 * access is view-only, since they cannot reply. Reuses `channelCan` rather
 * than re-deriving the logic, so an agent is evaluated exactly as they would
 * be if *they* were the signed-in viewer.
 */
export function isEligibleForTickets(agent: TicketAgent): boolean {
  return channelCan(agent.role, agent.channels ?? ALL_CHANNELS, 'tickets.reply', agent.ticketAccess ?? 'edit')
}

export function eligibleTicketAssignees(agents: TicketAgent[]): TicketAgent[] {
  return agents.filter(isEligibleForTickets)
}
