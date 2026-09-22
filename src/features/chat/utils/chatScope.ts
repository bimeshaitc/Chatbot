import type { Scope } from '@/config/roles'
import type { Agent, Conversation } from '../types'

/**
 * How much of the workspace's chat traffic a role may see.
 *
 * `config/roles.ts` already declares the three tiers (`chats.view.own` /
 * `.team` / `.all`) and `resolveScope` picks the widest one a role holds — but
 * until now nothing applied the answer, so every role saw every chat. This is
 * where the tier turns into a filter.
 *
 * The one rule worth stating out loud: **unassigned AI chats are visible at
 * every tier.** The AI's queue is a shared pool, and an agent who cannot see it
 * can never pick a chat out of it — `bot.queue.view` would grant nothing. So
 * `own` means "mine, plus the pool I am allowed to pull from", not "mine alone".
 */
export interface ChatViewer {
  name: string
  agentId: string
  groups: string[]
}

/** True when nobody owns the chat — it is sitting in the AI's shared pool. */
export function isUnassigned(conversation: Conversation): boolean {
  return conversation.assignedAgentId === null
}

/** The ids of every agent the viewer shares at least one group with, plus themselves. */
export function teammateIds(viewer: ChatViewer, agents: Agent[]): Set<string> {
  const ids = new Set<string>([viewer.agentId])
  for (const agent of agents) {
    if (agent.groups.some((group) => viewer.groups.includes(group))) ids.add(agent.id)
  }
  return ids
}

export function scopeConversations(
  conversations: Conversation[],
  scope: Scope,
  viewer: ChatViewer,
  agents: Agent[],
): Conversation[] {
  if (scope === 'all') return conversations
  if (scope === 'none') return []

  if (scope === 'own') {
    return conversations.filter(
      (conversation) => isUnassigned(conversation) || conversation.assignedAgentId === viewer.agentId,
    )
  }

  const team = teammateIds(viewer, agents)
  return conversations.filter(
    (conversation) => isUnassigned(conversation) || team.has(conversation.assignedAgentId as string),
  )
}

/** One line explaining the active tier, shown under the inbox rail. */
export function describeScope(scope: Scope, viewer: ChatViewer): { label: string; detail: string } {
  switch (scope) {
    case 'all':
      return { label: 'All chats', detail: 'You can see every chat in this workspace.' }
    case 'team':
      return {
        label: 'Team chats',
        detail: `You can see chats handled by ${viewer.groups.join(', ')}, plus the AI's unassigned queue.`,
      }
    case 'own':
      return {
        label: 'Your chats only',
        detail: "You can see chats assigned to you, plus the AI's unassigned queue.",
      }
    default:
      return { label: 'No chat access', detail: 'Your role cannot open chats.' }
  }
}
