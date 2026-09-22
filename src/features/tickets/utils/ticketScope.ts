import type { Scope } from '@/config/roles'
import type { Ticket } from '../types'

export interface TicketAgentRef {
  id: string
  groups: string[]
}

/**
 * How much of the workspace's ticket traffic a role may see. Mirrors
 * `features/chat/utils/chatScope.ts`'s three tiers and "team means shares a
 * group with the viewer" rule.
 *
 * Unlike chat, there is no shared pool carved out at every tier: an
 * unassigned ticket only becomes visible once scope reaches `team`, which is
 * also where `tickets.assign` starts being granted — a CSR who cannot pick up
 * unassigned work has no use for seeing it either.
 */
export function scopeTickets(tickets: Ticket[], scope: Scope, viewerAgentId: string, agents: TicketAgentRef[]): Ticket[] {
  if (scope === 'all') return tickets
  if (scope === 'none') return []

  if (scope === 'own') {
    return tickets.filter((ticket) => ticket.assigneeId === viewerAgentId)
  }

  const viewer = agents.find((agent) => agent.id === viewerAgentId)
  const viewerGroups = new Set(viewer?.groups ?? [])
  const teamIds = new Set(
    agents.filter((agent) => agent.groups.some((group) => viewerGroups.has(group))).map((agent) => agent.id),
  )
  return tickets.filter((ticket) => ticket.assigneeId === null || teamIds.has(ticket.assigneeId))
}
