import type { WorkChannel, WorkspaceRole } from '@/config/roles'

/** Mirrors `user-management`'s `AgentAvailability` — duplicated locally rather
 * than imported, same tradeoff as `TicketAgent`'s `role`/`channels` fields. */
export type AgentAvailability = 'accepting' | 'not-accepting' | 'offline'

/**
 * A chat's state. Named for the question an agent actually asks of a list:
 * "is anyone waiting on me?"
 *
 *   active     live, someone or something is answering
 *   waiting    we have replied; the ball is in the customer's court
 *   resolved   ended, and the customer got what they needed
 *   abandoned  the customer left before it was resolved
 *   closed     we ended it without resolving (spam, duplicate, handled elsewhere)
 *
 * `abandoned` is deliberately distinct from `closed`: one is the customer's
 * doing and is what the abandonment report measures, the other is ours. The
 * previous set could not express it, so every unresolved ending looked the
 * same. `waiting` replaces a bare "pending" because "pending" never said whose
 * turn it was, which is the only thing that decides whether to act.
 */
export type ConversationStatus = 'active' | 'waiting' | 'resolved' | 'abandoned' | 'closed'

export type ConversationChannel = 'whatsapp' | 'instagram' | 'facebook'

export type MessageDirection = 'inbound' | 'outbound'

/**
 * Who is driving the chat.
 *
 * - `bot`        the AI is answering on its own, with nobody watching
 * - `supervised` the AI is answering and an agent is watching
 * - `agent`      a human has taken over
 *
 * `bot` and `supervised` used to be one value, which left "Stop supervising"
 * with nowhere to land. Splitting them also gives the AI Bot inbox something
 * precise to list: the chats no human is attached to.
 *
 * This pairs with `Conversation.assignedAgentId`, and the two may not disagree:
 * `bot` means nobody is assigned, the other two name the human. See
 * `assignedAgentId`.
 */
export type ConversationHandling = 'bot' | 'supervised' | 'agent'

/** Why the AI asked for a human. `null` means it is coping. */
export type BotHandoffReason = 'low-confidence' | 'explicit-request' | 'repeated-fallback' | 'negative-sentiment'

export interface Agent {
  id: string
  name: string
  initials: string
  avatarColor: string
  /**
   * The groups this agent works in. Compared against the viewer's own groups to
   * resolve `team` scope — see `utils/chatScope.ts`. Must use the vocabulary in
   * `user-management`'s `groupOptions`, which `config/viewer.ts` also restates.
   */
  groups: string[]
  /** Drives chat-transfer eligibility (`utils/agentEligibility.ts`) — a CSR without the chat channel cannot be transferred a chat. Ignored above CSR, same as `channelCan`. */
  role: WorkspaceRole
  /** Only meaningful when `role` is `CSR`. Absent means both channels, same default as `channelCan`. */
  channels?: WorkChannel[]
  /** A CSR who is offline or not accepting chats cannot receive a new one. */
  availability: AgentAvailability
  /** Max simultaneous chats this agent can hold. */
  chatLimit: number
  /** How many of those slots are currently in use. */
  activeChats: number
}

/** Who ended a chat. The AI can resolve a thread without a human ever touching it. */
export type ConversationCloser = { by: 'bot' } | { by: 'agent'; agentId: string }

/**
 * A chat thread with a customer. This used to be called `Ticket`, but that name
 * now belongs to the support tickets raised *from* a conversation (see `Ticket`
 * below) — a conversation may have zero, one, or several of them.
 */
export interface Conversation {
  id: string
  /**
   * A display name — always a real string, never blank. For a widget visitor
   * nobody has identified yet, this holds a generated placeholder ("Visitor
   * 7215") rather than being empty or null; see `isIdentified` below and
   * `utils/customerIdentity.ts` for why.
   */
  customer: string
  initials: string
  avatarColor: string
  /**
   * `false` only for a chat that started anonymous and nobody has identified
   * yet. Omitted (or `true`) everywhere else — read it through
   * `utils/customerIdentity.ts#isIdentified` rather than comparing directly,
   * since `undefined` must count as identified.
   */
  isIdentified?: boolean
  /**
   * An email captured directly on this conversation — separate from
   * `CustomerProfile.email`, which means "we have a full CRM record on this
   * person." This is the lighter case: nothing on file yet, but a ticket
   * needed a reply channel, so one was collected on the spot. The standard
   * trigger for capturing contact info at all — see `CreateTicketDialog` and
   * the widget's own `WidgetChatSimulator`, which asks at the same moment for
   * the same reason. Ignored wherever a real `CustomerProfile` exists; that
   * one wins.
   */
  customerEmail?: string
  status: ConversationStatus
  channel: ConversationChannel
  handling: ConversationHandling
  /** The AI's own confidence in its last reply, 0-1. */
  botConfidence: number
  /** Intent the AI matched, shown so a supervisor can sanity-check routing. */
  botIntent: string
  /** Times the AI had to fall back to "I don't know" on this thread. */
  botFallbacks: number
  /** Set when the AI wants a human; drives the handoff queue. */
  handoffReason: BotHandoffReason | null
  lastMessage: string
  lastMessageDirection: MessageDirection
  tags: string[]
  time: string
  categoryId: string
  /**
   * The human who owns this thread, or `null` when nobody does.
   *
   * `null` is the AI's own pool: the chat sits in the AI Bot inbox where any
   * agent with `bot.queue.view` can pick it up. It is the one field that decides
   * whether a chat lands in an agent's "My chats", so it is kept in lockstep
   * with `handling` — taking over or supervising claims it, handing back to the
   * AI releases it. Was `agentId`, which every conversation carried even when
   * the AI was answering alone, so "assigned to me" and "I am handling this"
   * could not be told apart.
   */
  assignedAgentId: string | null
  /** When the customer first made contact on this thread. */
  firstContact: string
  /** Median agent reply time on this thread, pre-computed for display. */
  responseTime: string
  unreadCount?: number
  isNew?: boolean
  /**
   * True from the moment someone else hands this chat to an agent (a
   * transfer, or a future "assign to..." action) until that agent opens it.
   * Not set when an agent claims a chat themselves via Take over — they just
   * clicked the button, they do not need telling. Scoped to whoever
   * `assignedAgentId` names: a bystander with team-wide visibility must never
   * see this as "assigned to you" for somebody else's chat.
   */
  newlyAssigned?: boolean
  isOnline?: boolean
  /** A banned customer can still be read, but the composer is locked. */
  isBanned?: boolean
  /** Set once the chat reaches a `resolved` or `closed` status. */
  closedAt?: string
  closedBy?: ConversationCloser
  /** One line on how it ended, shown on the archive row. */
  resolution?: string
}

/**
 * The four inboxes the chat screen is built from. Each answers a different
 * question, which is why they are top-level rather than filters over one list:
 *
 * - `mine`    what *I* am on the hook for
 * - `bot`     what the AI is handling with no human attached
 * - `team`    everything my role is allowed to see (scope-gated)
 * - `archive` what is finished
 */
export type ChatInbox = 'mine' | 'bot' | 'team' | 'archive'

/** Secondary chips inside `mine`. */
export type MyInboxFilter = 'all' | 'unread' | 'handling' | 'supervising' | 'waiting'

/** Secondary chips inside `bot` — the AI triage buckets. */
export type BotQueueFilter = 'all' | 'handoff' | 'unattended' | 'supervised' | 'low-confidence'

/** Secondary chips inside `team`. */
export type TeamInboxFilter = 'all' | 'new' | 'unassigned' | 'ai' | 'agents'

/** Secondary chips inside `archive`. */
export type ArchiveFilter = 'all' | 'resolved' | 'closed' | 'bot-resolved' | 'agent-resolved'

/** Whatever chip set the active inbox uses. */
export type InboxFilter = MyInboxFilter | BotQueueFilter | TeamInboxFilter | ArchiveFilter

export type MessageSender = 'customer' | 'agent' | 'system'

/** What the composer sends: a reply visible to the customer, or an internal note. */
export type ComposerMode = 'message' | 'note'

export interface ChatMessage {
  id: string
  sender: MessageSender
  authorName?: string
  text: string
  date: string
  time: string
  /** Internal notes render inline in the thread but are never sent to the customer. */
  isNote?: boolean
  /** Name of a file attached to this message, if any. */
  attachmentName?: string
}

/** The customer record behind a conversation, shown in the Details tab. */
export interface CustomerProfile {
  email: string
  phone: string
  channelHandle: string
  location: string
  timezone: string
  language: string
  customerSince: string
  plan: string
  lifetimeValue: string
  totalOrders: number
  lastOrder: string
  totalConversations: number
}

export type ActivityType =
  | 'assignment'
  | 'note'
  | 'status'
  | 'tag'
  | 'ticket'
  | 'handover'
  | 'transfer'
  | 'message'
  | 'system'

export interface ActivityLogEntry {
  id: string
  actor: string
  action: string
  note?: string
  time: string
  type?: ActivityType
}

export type DetailsSideTab = 'details' | 'ticket' | 'history'
