import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Agent, Conversation } from '@/features/chat'
import type { Ticket } from '@/features/tickets'
import { shiftHandovers as seedHandovers } from '../data/mockShiftsData'
import type { HandoverInitiator, HandoverReason, ShiftHandover } from '../types'
import { getOpenChats, getOpenTickets, toHandoverItems } from '../utils/openItems'

const handoversQueryKey = ['shifts', 'handovers'] as const

export interface CreateHandoverInput {
  shiftId: string
  fromAgentId: string
  toAgentId: string | null
  initiatedBy: HandoverInitiator
  reason: HandoverReason
  reassignedByAgentId?: string
  note?: string
  conversations: Conversation[]
  tickets: Ticket[]
  agents: Agent[]
  patchConversation: (conversationId: string, patch: Partial<Conversation>) => void
  assignTicket: (ticketId: string, assigneeId: string | null, assigneeName: string) => void
}

/**
 * Reuses chat's `patchConversation` and tickets' `assign` per item, looped,
 * rather than adding a bulk-mutation surface to either feature — this keeps
 * every existing side effect (tickets' "Assigned to X" system message) as-is.
 */
export function useHandovers() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: handoversQueryKey,
    queryFn: () => Promise.resolve(seedHandovers),
    initialData: () => seedHandovers,
  })

  const handovers = query.data ?? []

  function createHandover(input: CreateHandoverInput) {
    const openChats = getOpenChats(input.conversations, input.fromAgentId)
    const openTickets = getOpenTickets(input.tickets, input.fromAgentId)
    const toAgentName = input.toAgentId
      ? (input.agents.find((agent) => agent.id === input.toAgentId)?.name ?? 'Unknown agent')
      : 'Unassigned'

    for (const chat of openChats) {
      input.patchConversation(chat.id, {
        assignedAgentId: input.toAgentId,
        handling: input.toAgentId ? 'agent' : 'bot',
        newlyAssigned: input.toAgentId !== null,
      })
    }

    for (const ticket of openTickets) {
      input.assignTicket(ticket.id, input.toAgentId, toAgentName)
    }

    const handover: ShiftHandover = {
      id: `handover-${Date.now()}`,
      shiftId: input.shiftId,
      fromAgentId: input.fromAgentId,
      toAgentId: input.toAgentId,
      initiatedBy: input.initiatedBy,
      reason: input.reason,
      reassignedByAgentId: input.reassignedByAgentId,
      note: input.note,
      items: toHandoverItems(openChats, openTickets),
      createdAt: new Date().toISOString(),
    }

    queryClient.setQueryData<ShiftHandover[]>(handoversQueryKey, (prev) => [handover, ...(prev ?? [])])
    return handover
  }

  function acknowledge(handoverId: string) {
    queryClient.setQueryData<ShiftHandover[]>(handoversQueryKey, (prev) =>
      (prev ?? []).map((entry) =>
        entry.id === handoverId ? { ...entry, acknowledgedAt: new Date().toISOString() } : entry,
      ),
    )
  }

  return { handovers, createHandover, acknowledge }
}
