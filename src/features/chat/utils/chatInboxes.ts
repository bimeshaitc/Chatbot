import { Archive, Bot, Inbox, Users, type LucideIcon } from 'lucide-react'
import type { Permission } from '@/config/roles'
import type {
  ArchiveFilter,
  BotQueueFilter,
  ChatInbox,
  Conversation,
  InboxFilter,
  MyInboxFilter,
  TeamInboxFilter,
} from '../types'
import { isArchived } from './conversationStatus'
import { LOW_CONFIDENCE_THRESHOLD } from './botMeta'

export interface InboxDefinition {
  id: ChatInbox
  label: string
  icon: LucideIcon
  /** Shown in the rail under the label, and as the list panel's subtitle. */
  description: string
  /** Any one of these is enough to open the inbox. */
  permission: Permission[]
  /** Rail accent, matched to the handler tones so the colour means one thing. */
  accent: string
}

export const CHAT_INBOXES: InboxDefinition[] = [
  {
    id: 'mine',
    label: 'My chats',
    icon: Inbox,
    description: 'Assigned to you',
    permission: ['chats.view.own', 'chats.view.team', 'chats.view.all'],
    accent: 'text-emerald-600',
  },
  {
    id: 'bot',
    label: 'AI bot',
    icon: Bot,
    description: 'Answering with no agent attached',
    permission: ['bot.queue.view'],
    accent: 'text-violet-600',
  },
  {
    id: 'team',
    label: 'Team chats',
    icon: Users,
    description: "Everyone's live chats",
    // Deliberately not `.own`: at own scope this inbox would just repeat
    // "My chats" plus the AI queue, so the rail hides it rather than showing an
    // agent a wider-sounding view that is not wider.
    permission: ['chats.view.team', 'chats.view.all'],
    accent: 'text-slate-600',
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: Archive,
    description: 'Resolved and closed',
    permission: ['chats.view.own', 'chats.view.team', 'chats.view.all'],
    accent: 'text-gray-500',
  },
]

export const DEFAULT_INBOX: ChatInbox = 'mine'

export function isChatInbox(value: string | undefined): value is ChatInbox {
  return CHAT_INBOXES.some((inbox) => inbox.id === value)
}

/**
 * Which inbox a chat belongs to, given who is looking.
 *
 * Archive wins over everything: a resolved chat is finished, and leaving it in
 * the live queues was the reason "closed" chats had nowhere to go.
 */
export function conversationsForInbox(
  conversations: Conversation[],
  inbox: ChatInbox,
  viewerAgentId: string,
): Conversation[] {
  switch (inbox) {
    case 'archive':
      return conversations.filter(isArchived)
    case 'mine':
      return conversations.filter(
        (conversation) => !isArchived(conversation) && conversation.assignedAgentId === viewerAgentId,
      )
    case 'bot':
      return conversations.filter((conversation) => !isArchived(conversation) && conversation.handling !== 'agent')
    case 'team':
      return conversations.filter((conversation) => !isArchived(conversation))
  }
}

export interface FilterChip<TValue extends string = string> {
  value: TValue
  label: string
  /** Renders the count in a warning tone when it is non-zero. */
  isAlert?: boolean
}

const myFilters: FilterChip<MyInboxFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread', isAlert: true },
  { value: 'handling', label: 'Replying' },
  { value: 'supervising', label: 'Supervising' },
  { value: 'waiting', label: 'Waiting' },
]

const botFilters: FilterChip<BotQueueFilter>[] = [
  { value: 'all', label: 'All AI chats' },
  { value: 'handoff', label: 'Needs a human', isAlert: true },
  { value: 'unattended', label: 'Unattended' },
  { value: 'supervised', label: 'Supervised' },
  { value: 'low-confidence', label: 'Low confidence' },
]

const teamFilters: FilterChip<TeamInboxFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'unassigned', label: 'Unassigned', isAlert: true },
  { value: 'ai', label: 'AI handling' },
  { value: 'agents', label: 'Agent handling' },
]

const archiveFilters: FilterChip<ArchiveFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'bot-resolved', label: 'Closed by AI' },
  { value: 'agent-resolved', label: 'Closed by an agent' },
]

export const inboxFilters: Record<ChatInbox, FilterChip[]> = {
  mine: myFilters,
  bot: botFilters,
  team: teamFilters,
  archive: archiveFilters,
}

export function defaultFilterFor(inbox: ChatInbox): InboxFilter {
  return inboxFilters[inbox][0].value as InboxFilter
}

export function isFilterFor(inbox: ChatInbox, value: string | null): value is InboxFilter {
  return inboxFilters[inbox].some((filter) => filter.value === value)
}

/** The chip predicates. Kept beside the chip list so a new chip cannot forget one. */
export function matchesFilter(conversation: Conversation, inbox: ChatInbox, filter: InboxFilter): boolean {
  switch (inbox) {
    case 'mine':
      switch (filter as MyInboxFilter) {
        case 'unread':
          return Boolean(conversation.unreadCount)
        case 'handling':
          return conversation.handling === 'agent'
        case 'supervising':
          return conversation.handling === 'supervised'
        case 'waiting':
          return conversation.status === 'waiting'
        default:
          return true
      }
    case 'bot':
      switch (filter as BotQueueFilter) {
        case 'handoff':
          return conversation.handoffReason !== null
        case 'unattended':
          return conversation.handling === 'bot'
        case 'supervised':
          return conversation.handling === 'supervised'
        case 'low-confidence':
          return conversation.botConfidence < LOW_CONFIDENCE_THRESHOLD
        default:
          return true
      }
    case 'team':
      switch (filter as TeamInboxFilter) {
        case 'new':
          return Boolean(conversation.isNew)
        case 'unassigned':
          return conversation.assignedAgentId === null
        case 'ai':
          return conversation.handling !== 'agent'
        case 'agents':
          return conversation.handling === 'agent'
        default:
          return true
      }
    case 'archive':
      switch (filter as ArchiveFilter) {
        case 'resolved':
          return conversation.status === 'resolved'
        case 'closed':
          return conversation.status === 'closed'
        case 'bot-resolved':
          return conversation.closedBy?.by === 'bot'
        case 'agent-resolved':
          return conversation.closedBy?.by === 'agent'
        default:
          return true
      }
  }
}
