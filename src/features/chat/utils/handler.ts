import { Bot, Eye, User, UserCheck, type LucideIcon } from 'lucide-react'
import type { Agent, Conversation } from '../types'

/**
 * Who is driving a chat, resolved once and rendered everywhere.
 *
 * The list row, the chat header strip and the details panel all used to work
 * this out for themselves from `handling` alone, which meant none of them could
 * say *which* human — the row showed "You have this chat" for a chat belonging
 * to somebody else. One descriptor, four tones, no disagreement.
 */
export type HandlerTone = 'bot' | 'supervised' | 'you' | 'agent' | 'closed'

export interface HandlerDescriptor {
  tone: HandlerTone
  icon: LucideIcon
  /** Short form for the list row: "AI bot", "You", "Anisha Thapa". */
  label: string
  /** Sentence form for the chat header: "The AI is answering on its own." */
  sentence: string
  /** Left accent on the list row, so the inbox is scannable without reading. */
  accent: string
  /** Chip colours. */
  chipClass: string
  dot: string
}

const tones: Record<HandlerTone, Pick<HandlerDescriptor, 'accent' | 'chipClass' | 'dot'>> = {
  bot: { accent: 'bg-violet-400', chipClass: 'bg-violet-50 text-violet-700', dot: 'bg-violet-500' },
  supervised: { accent: 'bg-blue-400', chipClass: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  you: { accent: 'bg-emerald-500', chipClass: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  agent: { accent: 'bg-slate-300', chipClass: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  closed: { accent: 'bg-gray-200', chipClass: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
}

function agentName(agents: Agent[], agentId: string | null | undefined): string {
  if (!agentId) return 'Unassigned'
  return agents.find((agent) => agent.id === agentId)?.name ?? 'Unknown agent'
}

export function describeHandler(
  conversation: Conversation,
  agents: Agent[],
  viewerAgentId: string,
): HandlerDescriptor {
  const isMine = conversation.assignedAgentId === viewerAgentId
  const who = isMine ? 'You' : agentName(agents, conversation.assignedAgentId)

  if (conversation.handling === 'bot') {
    return {
      tone: 'bot',
      icon: Bot,
      label: 'AI bot',
      sentence: 'The AI is answering on its own. No agent is attached to this chat.',
      ...tones.bot,
    }
  }

  if (conversation.handling === 'supervised') {
    return {
      tone: 'supervised',
      icon: Eye,
      label: isMine ? 'AI · you watching' : `AI · ${who} watching`,
      sentence: isMine
        ? 'The AI is answering and you are watching. Take over to reply yourself.'
        : `The AI is answering and ${who} is watching.`,
      ...tones.supervised,
    }
  }

  return {
    tone: isMine ? 'you' : 'agent',
    icon: isMine ? UserCheck : User,
    label: who,
    sentence: isMine ? 'You are handling this chat.' : `${who} is handling this chat.`,
    ...(isMine ? tones.you : tones.agent),
  }
}

/** Who ended an archived chat, for the archive row and the closed banner. */
export function describeCloser(conversation: Conversation, agents: Agent[], viewerAgentId: string): string {
  if (!conversation.closedBy) return 'Closed'
  if (conversation.closedBy.by === 'bot') return 'Resolved by the AI'
  const isMine = conversation.closedBy.agentId === viewerAgentId
  return isMine ? 'Closed by you' : `Closed by ${agentName(agents, conversation.closedBy.agentId)}`
}
