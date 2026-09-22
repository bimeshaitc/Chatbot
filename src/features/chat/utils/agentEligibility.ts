import { ALL_CHANNELS, channelCan } from '@/config/roles'
import type { Agent } from '../types'

export type ChatIneligibleReason = 'channel' | 'offline' | 'not-accepting' | 'capacity'

export const CHAT_INELIGIBLE_LABEL: Record<ChatIneligibleReason, string> = {
  channel: 'Tickets only',
  offline: 'Offline',
  'not-accepting': 'Not accepting chats',
  capacity: 'At capacity',
}

/**
 * Why this agent cannot be transferred a chat right now, or `null` if they
 * can — mirrors `tickets/utils/assigneeEligibility.ts#isEligibleForTickets`.
 * Checked in the order the spec lists the exclusions: channel access first
 * (a Tickets Only CSR is never a candidate at all), then availability, then
 * capacity.
 */
export function chatIneligibilityReason(agent: Agent): ChatIneligibleReason | null {
  if (!channelCan(agent.role, agent.channels ?? ALL_CHANNELS, 'chats.reply')) return 'channel'
  if (agent.availability === 'offline') return 'offline'
  if (agent.availability === 'not-accepting') return 'not-accepting'
  if (agent.activeChats >= agent.chatLimit) return 'capacity'
  return null
}

export function isEligibleForChat(agent: Agent): boolean {
  return chatIneligibilityReason(agent) === null
}

export function eligibleChatAgents(agents: Agent[]): Agent[] {
  return agents.filter(isEligibleForChat)
}
