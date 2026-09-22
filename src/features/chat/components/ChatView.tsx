import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { channelCan, channelCanAny } from '@/config/roles'
import type { NewTicketInput } from '@/features/tickets'
import { useCategories } from '@/features/category'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useChannels, useScope, useTicketAccess, useViewer, useWorkspaceRoleStore } from '@/stores/useWorkspaceRoleStore'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import type {
  ChatInbox,
  Conversation,
  ConversationHandling,
  ConversationStatus,
  DetailsSideTab,
  InboxFilter,
} from '../types'
import { agents } from '../data/mockChatData'
import { useConversations } from '../hooks/useConversations'
import { useConversationDetail } from '../hooks/useConversationDetail'
import { useConversationActivity } from '../hooks/useConversationActivity'
import { useConversationTickets } from '../hooks/useConversationTickets'
import { conversationStatusMeta, isArchived, isArchivedStatus } from '../utils/conversationStatus'
import { describeScope, scopeConversations } from '../utils/chatScope'
import {
  CHAT_INBOXES,
  DEFAULT_INBOX,
  conversationsForInbox,
  defaultFilterFor,
  inboxFilters,
  isChatInbox,
  isFilterFor,
  matchesFilter,
} from '../utils/chatInboxes'
import { BanCustomerDialog } from './BanCustomerDialog'
import { ChatInboxRail, type InboxCount } from './ChatInboxRail'
import { ConversationListPanel } from './ConversationListPanel'
import { ChatPanel } from './ChatPanel'
import { CreateTicketDialog } from './CreateTicketDialog'
import { DetailsPanel } from './DetailsPanel'
import { NewAssignmentModal } from './NewAssignmentModal'
import { TransferChatDialog } from './TransferChatDialog'

const ANY = '__any__'

const emptyMessageByInbox: Record<ChatInbox, string> = {
  mine: 'Nothing assigned to you right now.',
  bot: 'The AI has no live chats.',
  team: 'No live chats in this view.',
  archive: 'Nothing archived yet.',
}

const emptyHintByInbox: Record<ChatInbox, string> = {
  mine: 'Chats you take over or supervise land here.',
  bot: 'These are the chats the AI is answering. Take one over to reply yourself.',
  team: 'Everything your role is allowed to see, still live.',
  archive: 'Resolved and closed chats are kept here, read-only until reopened.',
}

export function ChatView() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { inbox: inboxParam, conversationId: selectedConversationId } = useParams<{
    inbox?: string
    conversationId?: string
  }>()

  const viewerRole = useWorkspaceRoleStore((state) => state.role)
  const channels = useChannels()
  const ticketAccess = useTicketAccess()
  const viewer = useViewer()
  const scope = useScope('chats')
  const { categories } = useCategories()

  // Only the inboxes this role (and, for a CSR, channel) is allowed to open.
  // `team` disappears at `own` scope, where it could only ever repeat "My
  // chats" plus the AI queue; every inbox disappears for a ticket-only CSR.
  const availableInboxes = useMemo(
    () => CHAT_INBOXES.filter((definition) => channelCanAny(viewerRole, channels, definition.permission)),
    [viewerRole, channels],
  )

  const requestedInbox = isChatInbox(inboxParam) ? inboxParam : DEFAULT_INBOX
  const inbox = availableInboxes.some((definition) => definition.id === requestedInbox)
    ? requestedInbox
    : (availableInboxes[0]?.id ?? DEFAULT_INBOX)

  const filterParam = searchParams.get('filter')
  const activeFilter: InboxFilter = isFilterFor(inbox, filterParam) ? filterParam : defaultFilterFor(inbox)
  const agentParam = searchParams.get('agent') ?? ANY
  const categoryParam = searchParams.get('category') ?? ANY

  const [sideTab, setSideTab] = useState<DetailsSideTab>('details')
  const canTakeOver = channelCan(viewerRole, channels, 'chats.takeOver')
  const canReply = channelCan(viewerRole, channels, 'chats.reply')
  const canTransfer = channelCan(viewerRole, channels, 'chats.transfer')
  const canBan = channelCan(viewerRole, channels, 'chats.banCustomer')
  const canChangeStatus = channelCan(viewerRole, channels, 'chats.changeStatus')
  // Raising a ticket is fundamentally a ticket-side action, so it's gated the
  // same way every other ticket permission is — a chat-only CSR loses this
  // too, deliberately, and so does a view-only ticket CSR.
  const canCreateTicket = channelCan(viewerRole, channels, 'tickets.create', ticketAccess)

  const canDockDetails = useMediaQuery('(min-width: 1280px)')
  // Derived, not synced from an effect: the panel follows the viewport until the
  // user says otherwise, and their choice then sticks.
  const [detailsOverride, setDetailsOverride] = useState<boolean | null>(null)
  const isDetailsOpen = detailsOverride ?? canDockDetails
  const [isCreateTicketOpen, setCreateTicketOpen] = useState(false)
  const [isTransferOpen, setTransferOpen] = useState(false)
  const [isBanOpen, setBanOpen] = useState(false)
  // Popup ids the viewer has clicked Dismiss on, so it does not reappear for
  // that chat. Does not affect the list badge or header banner — those clear
  // only once the chat is actually opened.
  const [dismissedAssignmentIds, setDismissedAssignmentIds] = useState<Set<string>>(new Set())

  const { conversations } = useConversations()
  const {
    conversation: selectedConversation,
    messages,
    customerProfile,
    claimAs,
    releaseToBot,
    setStatus,
    transferToAgent,
    setBanned,
    identifyCustomer,
    recordCustomerEmail,
    markAsRead,
    acknowledgeAssignment,
    addTag,
    removeTag,
    appendMessage,
    appendSystemMessage,
  } = useConversationDetail(selectedConversationId)
  const { entries, addNote, logActivity } = useConversationActivity(selectedConversationId)
  const { tickets, createTicket, isCreating } = useConversationTickets(selectedConversationId)

  const unreadCount = selectedConversation?.unreadCount ?? 0
  const isNewlyAssignedToViewer = Boolean(
    selectedConversation?.newlyAssigned && selectedConversation.assignedAgentId === viewer.agentId,
  )

  // Opening a chat is what clears both signals: the unread badge, and the
  // "you just got this" flag once its actual owner has seen it.
  useEffect(() => {
    if (unreadCount > 0) markAsRead()
    if (isNewlyAssignedToViewer) acknowledgeAssignment()
  }, [selectedConversationId, unreadCount, isNewlyAssignedToViewer, markAsRead, acknowledgeAssignment])

  /** Everything this role may look at, before any inbox or chip narrows it. */
  const visibleConversations = useMemo(
    () => scopeConversations(conversations, scope, viewer, agents),
    [conversations, scope, viewer],
  )

  // The one, if any, waiting to be announced via popup: the oldest visible
  // conversation newly assigned to this viewer that they have not dismissed.
  // No boolean open/close state and no effect — the modal is simply open
  // whenever this is non-null, so it can never drift from the data.
  const pendingAssignment = visibleConversations.find(
    (conversation) =>
      !isArchived(conversation) &&
      conversation.newlyAssigned &&
      conversation.assignedAgentId === viewer.agentId &&
      !dismissedAssignmentIds.has(conversation.id),
  )

  const conversationsByInbox = useMemo(() => {
    return Object.fromEntries(
      CHAT_INBOXES.map((definition) => [
        definition.id,
        conversationsForInbox(visibleConversations, definition.id, viewer.agentId),
      ]),
    ) as Record<ChatInbox, Conversation[]>
  }, [visibleConversations, viewer.agentId])

  const inboxConversations = conversationsByInbox[inbox]

  const countByInbox = useMemo(() => {
    return Object.fromEntries(
      CHAT_INBOXES.map((definition) => {
        const list = conversationsByInbox[definition.id]
        // What "needs you" means depends on the inbox: unread or freshly
        // handed to you for yours, a handoff request for the AI's, an
        // unclaimed chat for the team's.
        const alert =
          definition.id === 'mine'
            ? list.filter(
                (conversation) => Boolean(conversation.unreadCount) || Boolean(conversation.newlyAssigned),
              ).length
            : definition.id === 'bot'
              ? list.filter((conversation) => conversation.handoffReason !== null).length
              : definition.id === 'team'
                ? list.filter((conversation) => conversation.assignedAgentId === null).length
                : 0
        return [definition.id, { total: list.length, alert } satisfies InboxCount]
      }),
    ) as Record<ChatInbox, InboxCount>
  }, [conversationsByInbox])

  const countByFilter = useMemo(() => {
    return Object.fromEntries(
      inboxFilters[inbox].map((filter) => [
        filter.value,
        inboxConversations.filter((conversation) => matchesFilter(conversation, inbox, filter.value as InboxFilter))
          .length,
      ]),
    )
  }, [inboxConversations, inbox])

  const averageBotConfidence = useMemo(() => {
    const botChats = conversationsByInbox.bot
    if (botChats.length === 0) return 0
    return botChats.reduce((sum, conversation) => sum + conversation.botConfidence, 0) / botChats.length
  }, [conversationsByInbox])

  const filteredConversations = useMemo(() => {
    return inboxConversations.filter((conversation) => {
      if (!matchesFilter(conversation, inbox, activeFilter)) return false
      // Agent and category only narrow the team inbox; elsewhere the inbox has
      // already answered the "whose" question and the selects are not rendered.
      if (inbox !== 'team') return true
      if (agentParam !== ANY && conversation.assignedAgentId !== agentParam) return false
      if (categoryParam !== ANY && conversation.categoryId !== categoryParam) return false
      return true
    })
  }, [inboxConversations, inbox, activeFilter, agentParam, categoryParam])

  const scopeCopy = describeScope(scope, viewer)

  function buildPath(nextInbox: ChatInbox, conversationId: string | null, params?: URLSearchParams) {
    const path = ['/chat', nextInbox, conversationId].filter(Boolean).join('/')
    const query = params?.toString()
    return query ? `${path}?${query}` : path
  }

  function selectInbox(nextInbox: ChatInbox) {
    // Chips and the agent/category pair belong to the inbox that defined them,
    // so switching inbox starts clean rather than carrying a stale filter over.
    navigate(buildPath(nextInbox, null))
  }

  function selectFilter(filter: InboxFilter) {
    const next = new URLSearchParams(searchParams)
    if (filter === defaultFilterFor(inbox)) next.delete('filter')
    else next.set('filter', filter)
    setSearchParams(next, { replace: true })
  }

  function selectTeamFilter(key: 'agent' | 'category', value: string) {
    const next = new URLSearchParams(searchParams)
    if (value === ANY) next.delete(key)
    else next.set(key, value)
    setSearchParams(next, { replace: true })
  }

  function selectConversation(conversationId: string) {
    navigate(buildPath(inbox, conversationId, searchParams))
  }

  function clearSelectedConversation() {
    navigate(buildPath(inbox, null, searchParams))
  }

  function handleSetHandling(handling: ConversationHandling) {
    if (!selectedConversation) return

    if (handling === 'bot') {
      releaseToBot()
      logActivity('handed the chat back to the AI', undefined, 'handover')
      appendSystemMessage('Chat handed back to the AI')
      toast.info('The AI is handling this chat again')
      return
    }

    claimAs(handling, viewer.agentId)
    if (handling === 'agent') {
      logActivity('took over the chat', undefined, 'handover')
      appendSystemMessage(`${viewer.name} took over the chat`)
      toast.success('You are now handling this chat')
    } else {
      logActivity('started supervising the chat', undefined, 'handover')
      appendSystemMessage(`${viewer.name} is now supervising this chat`)
      toast.success('You are supervising, the AI keeps replying')
    }
  }

  function handleStopSupervising() {
    if (!selectedConversation) return
    releaseToBot()
    logActivity('stopped supervising the chat', undefined, 'handover')
    appendSystemMessage('Agent stopped supervising, the AI continues alone')
    toast.info(`The AI is handling ${selectedConversation.customer} on its own`)
  }

  function handleSetStatus(status: ConversationStatus) {
    if (!selectedConversation || selectedConversation.status === status) return
    const label = conversationStatusMeta[status].label
    const wasArchived = isArchived(selectedConversation)
    const willArchive = isArchivedStatus(status)

    setStatus(status, willArchive ? { by: 'agent', agentId: viewer.agentId } : null)
    logActivity(`changed status to ${label}`, undefined, 'status')
    appendSystemMessage(
      willArchive ? `Chat ${label.toLowerCase()} and moved to the archive` : `Status changed to ${label}`,
    )

    if (willArchive && !wasArchived) toast.success(`Chat ${label.toLowerCase()} and archived`)
    else if (!willArchive && wasArchived) toast.success('Chat reopened')
    else toast.success(`Status set to ${label}`)
  }

  function handleReopen() {
    handleSetStatus('active')
  }

  function handleAddTag(tag: string) {
    addTag(tag)
    logActivity(`tagged the chat as "${tag}"`, undefined, 'tag')
  }

  function handleRemoveTag(tag: string) {
    removeTag(tag)
    logActivity(`removed the tag "${tag}"`, undefined, 'tag')
  }

  function handleTransfer(agentId: string, note: string) {
    const agentName = agents.find((agent) => agent.id === agentId)?.name ?? 'another agent'
    const transferredToViewer = agentId === viewer.agentId
    // The receiving agent owns it now, so it stops being anybody else's.
    transferToAgent(agentId)
    logActivity(`transferred the chat to ${agentName}`, note || undefined, 'transfer')
    appendSystemMessage(`Chat transferred to ${agentName}`)
    setTransferOpen(false)
    // A different toast when the viewer is the one receiving it: "assigned to
    // you" is the thing they actually need to notice, not a restatement of
    // whose name they just picked in the dialog.
    if (transferredToViewer) {
      toast.success(`New chat assigned to you — ${selectedConversation?.customer ?? 'a customer'}`)
    } else {
      toast.success(`Chat transferred to ${agentName}`)
    }
  }

  function handleBan(reason: string) {
    if (!selectedConversation) return
    setBanned(true)
    logActivity(`banned ${selectedConversation.customer}`, reason || undefined, 'status')
    appendSystemMessage(`${selectedConversation.customer} was banned`)
    setBanOpen(false)
    toast.success(`${selectedConversation.customer} is banned`)
  }

  function dismissAssignmentPopup(conversationId: string) {
    setDismissedAssignmentIds((prev) => new Set(prev).add(conversationId))
  }

  // Jumps straight to My Chats with that conversation open, whatever inbox
  // or filter the viewer happened to be looking at when the popup landed.
  function viewAssignedChat(conversationId: string) {
    dismissAssignmentPopup(conversationId)
    navigate(buildPath('mine', conversationId))
  }

  function handleLiftBan() {
    if (!selectedConversation) return
    setBanned(false)
    logActivity(`lifted the ban on ${selectedConversation.customer}`, undefined, 'status')
    appendSystemMessage(`Ban lifted for ${selectedConversation.customer}`)
    toast.success('Ban lifted')
  }

  function handleIdentifyCustomer(name: string) {
    identifyCustomer(name)
    logActivity(`identified the visitor as ${name.trim()}`, undefined, 'system')
    appendSystemMessage(`${name.trim()} — name recorded`)
    toast.success(`Saved as ${name.trim()}`)
  }

  async function handleCreateTicket(input: NewTicketInput, freshEmail?: string) {
    if (!selectedConversation) return
    // `freshEmail` only arrives when the dialog had to ask — nothing was on
    // file yet. This is the moment that gets remembered, the same trigger the
    // widget's own ticket form uses on the customer's side of the same event.
    if (freshEmail) {
      recordCustomerEmail(freshEmail)
      logActivity(`recorded contact email ${freshEmail}`, undefined, 'system')
    }
    try {
      // The requester comes from the conversation, so Tickets shows who the
      // ticket is actually for rather than who raised it.
      const ticket = await createTicket(
        input,
        {
          name: selectedConversation.customer,
          email: customerProfile?.email ?? selectedConversation.customerEmail ?? freshEmail ?? '',
          initials: selectedConversation.initials,
          avatarColor: selectedConversation.avatarColor,
        },
        messages,
      )
      setCreateTicketOpen(false)
      setSideTab('ticket')
      logActivity(`created ticket ${ticket.reference}`, ticket.subject, 'ticket')
      toast.success(`Ticket ${ticket.reference} created`)
    } catch {
      // The global MutationCache onError already toasts the message (see
      // lib/react-query.ts), so this only stops an unhandled rejection and
      // leaves the dialog open with the entered values intact.
    }
  }

  const teamFilterControls = inbox === 'team' && (
    <div className="flex gap-2">
      <Select value={agentParam} onValueChange={(value) => selectTeamFilter('agent', value as string)}>
        <SelectTrigger className="h-8 flex-1 text-xs" aria-label="Filter by agent">
          <SelectValue placeholder="Any agent" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any agent</SelectItem>
          {agents.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              {agent.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={categoryParam} onValueChange={(value) => selectTeamFilter('category', value as string)}>
        <SelectTrigger className="h-8 flex-1 text-xs" aria-label="Filter by category">
          <SelectValue placeholder="Any category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any category</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <div className="flex h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div
        className={cn(
          'flex w-full flex-col overflow-hidden lg:w-auto lg:flex-row',
          selectedConversationId ? 'hidden lg:flex' : 'flex',
        )}
      >
        <ChatInboxRail
          inboxes={availableInboxes}
          countByInbox={countByInbox}
          activeInbox={inbox}
          onSelectInbox={selectInbox}
          scope={scopeCopy}
          averageBotConfidence={averageBotConfidence}
        />
        <ConversationListPanel
          conversations={filteredConversations}
          agents={agents}
          viewerAgentId={viewer.agentId}
          filters={inboxFilters[inbox]}
          countByFilter={countByFilter}
          activeFilter={activeFilter}
          onSelectFilter={selectFilter}
          headerExtra={teamFilterControls || undefined}
          emptyMessage={emptyMessageByInbox[inbox]}
          selectedConversationId={selectedConversationId ?? null}
          onSelectConversation={selectConversation}
        />
      </div>
      <div className={cn('h-full w-full lg:w-auto lg:flex-1', selectedConversationId ? 'flex' : 'hidden lg:flex')}>
        <ChatPanel
          conversation={selectedConversation}
          messages={messages}
          agents={agents}
          viewerAgentId={viewer.agentId}
          onBack={clearSelectedConversation}
          isDetailsOpen={isDetailsOpen}
          onToggleDetails={() => setDetailsOverride(!isDetailsOpen)}
          onSend={appendMessage}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onCreateTicket={() => setCreateTicketOpen(true)}
          onSetHandling={handleSetHandling}
          onSetStatus={handleSetStatus}
          onStopSupervising={handleStopSupervising}
          onRequestTransfer={() => setTransferOpen(true)}
          onRequestBan={() => setBanOpen(true)}
          onLiftBan={handleLiftBan}
          onReopen={handleReopen}
          canTakeOver={canTakeOver}
          canReply={canReply}
          canTransfer={canTransfer}
          canBan={canBan}
          canChangeStatus={canChangeStatus}
          canCreateTicket={canCreateTicket}
          emptyHint={emptyHintByInbox[inbox]}
        />
      </div>
      <DetailsPanel
        conversation={selectedConversation}
        activityEntries={entries}
        customerProfile={customerProfile}
        tickets={tickets}
        viewerAgentId={viewer.agentId}
        activeTab={sideTab}
        onTabChange={setSideTab}
        onAddNote={addNote}
        onIdentifyCustomer={handleIdentifyCustomer}
        onCreateTicket={() => setCreateTicketOpen(true)}
        isOpen={isDetailsOpen}
        onClose={() => setDetailsOverride(false)}
      />

      {isCreateTicketOpen && selectedConversation && (
        <CreateTicketDialog
          conversation={selectedConversation}
          knownEmail={customerProfile?.email ?? selectedConversation.customerEmail ?? null}
          isSubmitting={isCreating}
          onClose={() => setCreateTicketOpen(false)}
          onCreate={handleCreateTicket}
        />
      )}
      {isTransferOpen && selectedConversation && (
        <TransferChatDialog
          conversation={selectedConversation}
          onClose={() => setTransferOpen(false)}
          onTransfer={handleTransfer}
        />
      )}
      {isBanOpen && selectedConversation && (
        <BanCustomerDialog conversation={selectedConversation} onClose={() => setBanOpen(false)} onConfirm={handleBan} />
      )}

      {pendingAssignment && (
        <NewAssignmentModal
          conversation={pendingAssignment}
          onDismiss={() => dismissAssignmentPopup(pendingAssignment.id)}
          onViewChat={() => viewAssignedChat(pendingAssignment.id)}
        />
      )}
    </div>
  )
}
