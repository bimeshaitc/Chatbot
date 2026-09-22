import { useEffect, useRef, useState } from 'react'
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Ban,
  Check,
  ChevronDown,
  Eye,
  Info,
  LogOut,
  MoreVertical,
  RotateCcw,
  ShieldOff,
  SquareCheckBig,
  UserCheck,
  UserRound,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type {
  Agent,
  ChatMessage,
  ComposerMode,
  Conversation,
  ConversationHandling,
  ConversationStatus,
} from '../types'
import {
  ARCHIVED_STATUSES,
  conversationStatusMeta,
  conversationStatuses,
  isArchived,
} from '../utils/conversationStatus'
import { isIdentified } from '../utils/customerIdentity'
import { describeHandler } from '../utils/handler'
import { ChatMessageBubble } from './ChatMessageBubble'
import { HandlerChip } from './HandlerChip'
import { HandlingBanner } from './HandlingBanner'
import { roleCan } from '@/config/roles'
import { useViewer, useWorkspaceRoleStore } from '@/stores/useWorkspaceRoleStore'
import { MessageComposer } from './MessageComposer'
import { SuggestReplyDialog } from './SuggestReplyDialog'

interface ChatPanelProps {
  conversation: Conversation | null
  messages: ChatMessage[]
  agents: Agent[]
  viewerAgentId: string
  onBack?: () => void
  isDetailsOpen: boolean
  onToggleDetails: () => void
  onSend: (text: string, mode: ComposerMode, options?: { attachmentName?: string }) => void
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  onCreateTicket: () => void
  onSetHandling: (handling: ConversationHandling) => void
  onSetStatus: (status: ConversationStatus) => void
  onStopSupervising: () => void
  onRequestTransfer: () => void
  onRequestBan: () => void
  onLiftBan: () => void
  onReopen: () => void
  canTakeOver: boolean
  canReply: boolean
  canTransfer: boolean
  canBan: boolean
  canChangeStatus: boolean
  canCreateTicket: boolean
  /** Copy for the empty state, which differs per inbox. */
  emptyHint: string
}

export function ChatPanel({
  conversation,
  messages,
  agents,
  viewerAgentId,
  onBack,
  isDetailsOpen,
  onToggleDetails,
  onSend,
  onAddTag,
  onRemoveTag,
  onCreateTicket,
  onSetHandling,
  onSetStatus,
  onStopSupervising,
  onRequestTransfer,
  onRequestBan,
  onLiftBan,
  onReopen,
  canTakeOver,
  canReply,
  canTransfer,
  canBan,
  canChangeStatus,
  canCreateTicket,
  emptyHint,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isSuggestOpen, setSuggestOpen] = useState(false)
  const [suggestedDraft, setSuggestedDraft] = useState<string | null>(null)
  // Groups are read from the store rather than threaded through ChatView:
  // they are a retrieval detail, not something the parent should own.
  const viewer = useViewer()
  const viewerRole = useWorkspaceRoleStore((state) => state.role)

  // Keep the newest message in view when the thread grows or the chat changes.
  // Hooks stay above the empty-state return so the order never varies.
  useEffect(() => {
    const node = scrollRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages.length, conversation?.id])

  if (!conversation) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-1 px-6 text-center">
        <p className="text-sm text-gray-500">Select a chat to view the conversation</p>
        <p className="text-xs text-gray-400">{emptyHint}</p>
      </div>
    )
  }

  const groupedByDate = messages.reduce<{ date: string; items: ChatMessage[] }[]>((groups, message) => {
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && lastGroup.date === message.date) {
      lastGroup.items.push(message)
    } else {
      groups.push({ date: message.date, items: [message] })
    }
    return groups
  }, [])

  const archived = isArchived(conversation)
  const handler = describeHandler(conversation, agents, viewerAgentId)
  const identified = isIdentified(conversation)
  const status = conversationStatusMeta[conversation.status]
  const isMine = conversation.assignedAgentId === viewerAgentId
  // The handoff banner already carries its own "Take over" — showing a second
  // one right above it in the header would be the same button said twice.
  const hasHandoffBanner = !archived && conversation.handoffReason !== null

  /**
   * A hard lock closes the composer outright: there is nothing useful to write
   * here at all. Order matters — archived beats banned beats "your role
   * cannot", in the order the reasons stop being fixable from this screen.
   */
  const lockedReason = archived
    ? 'This chat is archived. Reopen it to reply.'
    : conversation.isBanned
      ? `${conversation.customer} is banned. Lift the ban to reply.`
      : !canReply
        ? 'Your role cannot reply to chats.'
        : null

  /** A soft lock: you may not send to the customer, but notes still make sense. */
  const replyLockedReason = lockedReason
    ? undefined
    : conversation.handling === 'agent' && !isMine
      ? `${handler.label} is handling this chat.`
      : conversation.handling !== 'agent'
        ? 'The AI is answering this chat.'
        : undefined

  const lastCustomerMessage = [...messages].reverse().find((message) => message.sender === 'customer')?.text ?? ''
  // Only for the agent who owns the chat and may read internal knowledge:
  // drafting customer wording out of staff-only material is not a bystander's
  // job, and there is nothing to answer without a question to answer.
  const canSuggestReply =
    isMine && !replyLockedReason && lastCustomerMessage !== '' && roleCan(viewerRole, 'knowledge.internal.view')

  return (
    <div className="flex h-full flex-1 flex-col bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to chats"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-50 lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <span className="relative shrink-0">
            <span
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold',
                conversation.avatarColor,
                archived && 'opacity-60',
              )}
            >
              {identified ? conversation.initials : <UserRound className="h-4 w-4" />}
            </span>
            {conversation.isOnline && !conversation.isBanned && !archived && (
              <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{conversation.customer}</p>
            {/* Who is answering, rather than a presence line: an agent opening
                a chat needs to know whether it is theirs before anything else. */}
            <HandlerChip handler={handler} className="mt-0.5" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {canChangeStatus ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium hover:bg-gray-50',
                  status.badgeClass,
                )}
                aria-label="Change status"
              >
                {status.label}
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-48">
                {conversationStatuses.map((value) => (
                  <DropdownMenuItem key={value} onClick={() => onSetStatus(value)}>
                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                      {conversation.status === value && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </span>
                    {conversationStatusMeta[value].label}
                    {ARCHIVED_STATUSES.includes(value) && !archived && (
                      <span className="ml-auto text-[11px] text-gray-400">archives</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Badge variant="outline" className={status.badgeClass}>
              {status.label}
            </Badge>
          )}

          {/* The one or two moves that change who is answering. Kept to a
              button an agent reaches for constantly (Take over) plus, only
              for a bot chat, the second one they reach for almost as often
              (Supervise) — everything else lives in the overflow menu. */}
          {canTakeOver && !archived && !hasHandoffBanner && (
            <>
              {conversation.handling === 'bot' && (
                <button
                  type="button"
                  onClick={() => onSetHandling('supervised')}
                  className="hidden items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:flex"
                >
                  <Eye className="h-3 w-3" />
                  Supervise
                </button>
              )}
              {!(conversation.handling === 'agent' && isMine) && (
                <button
                  type="button"
                  onClick={() => onSetHandling('agent')}
                  className="flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-gray-800"
                >
                  <UserCheck className="h-3 w-3" />
                  Take over
                </button>
              )}
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-50"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-56">
              {archived ? (
                <>
                  {canChangeStatus && (
                    <DropdownMenuItem onClick={onReopen}>
                      <RotateCcw className="h-4 w-4" />
                      Reopen chat
                    </DropdownMenuItem>
                  )}
                  {canCreateTicket && (
                    <DropdownMenuItem onClick={onCreateTicket}>
                      <SquareCheckBig className="h-4 w-4 text-emerald-600" />
                      Create ticket
                    </DropdownMenuItem>
                  )}
                </>
              ) : (
                <>
                  {canTakeOver && conversation.handling === 'bot' && (
                    <DropdownMenuItem onClick={() => onSetHandling('supervised')}>
                      <Eye className="h-4 w-4" />
                      Start supervising
                    </DropdownMenuItem>
                  )}
                  {canTakeOver && conversation.handling === 'supervised' && isMine && (
                    <DropdownMenuItem onClick={onStopSupervising}>
                      <LogOut className="h-4 w-4" />
                      Stop supervising
                    </DropdownMenuItem>
                  )}
                  {canTransfer && (
                    <DropdownMenuItem onClick={onRequestTransfer}>
                      <ArrowRight className="h-4 w-4" />
                      Transfer to ...
                    </DropdownMenuItem>
                  )}
                  {canCreateTicket && (
                    <DropdownMenuItem onClick={onCreateTicket}>
                      <SquareCheckBig className="h-4 w-4 text-emerald-600" />
                      Create ticket
                    </DropdownMenuItem>
                  )}
                  {canChangeStatus && (
                    <DropdownMenuItem onClick={() => onSetStatus('resolved')}>
                      <Archive className="h-4 w-4" />
                      Resolve and archive
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {!canBan ? null : conversation.isBanned ? (
                    <DropdownMenuItem onClick={onLiftBan}>
                      <ShieldOff className="h-4 w-4" />
                      Lift ban
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem variant="destructive" onClick={onRequestBan}>
                      <Ban className="h-4 w-4" />
                      Ban this customer
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={onToggleDetails}
            aria-expanded={isDetailsOpen}
            title="Details, tickets and history"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-colors',
              isDetailsOpen
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50',
            )}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <HandlingBanner
        conversation={conversation}
        viewerAgentId={viewerAgentId}
        canTakeOver={canTakeOver}
        canChangeStatus={canChangeStatus}
        onTakeOver={() => onSetHandling('agent')}
        onReopen={onReopen}
      />

      <div ref={scrollRef} className={cn('flex-1 overflow-y-auto px-4 py-4 sm:px-5', archived && 'bg-gray-50/60')}>
        <div className="flex flex-col gap-4">
          {groupedByDate.map((group) => (
            <div key={group.date} className="flex flex-col gap-4">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <span className="h-px w-10 bg-gray-100" />
                {group.date}
                <span className="h-px w-10 bg-gray-100" />
              </div>
              {group.items.map((message) => (
                <ChatMessageBubble key={message.id} message={message} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <MessageComposer
        tags={conversation.tags}
        botIntent={conversation.botIntent}
        isLocked={lockedReason !== null}
        lockedReason={lockedReason ?? undefined}
        replyLockedReason={replyLockedReason}
        onSend={onSend}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
        onSuggestReply={canSuggestReply ? () => setSuggestOpen(true) : undefined}
        suggestedDraft={suggestedDraft}
        onSuggestedDraftUsed={() => setSuggestedDraft(null)}
      />

      {isSuggestOpen && (
        <SuggestReplyDialog
          customerName={conversation.customer}
          lastCustomerMessage={lastCustomerMessage}
          tags={conversation.tags}
          category={conversation.categoryId}
          viewerGroups={viewer.groups}
          onClose={() => setSuggestOpen(false)}
          onUseDraft={(draft) => {
            setSuggestedDraft(draft)
            setSuggestOpen(false)
          }}
        />
      )}
    </div>
  )
}
