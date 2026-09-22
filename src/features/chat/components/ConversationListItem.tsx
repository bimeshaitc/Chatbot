import { Sparkles, UserRound } from 'lucide-react'
import { FacebookIcon, InstagramIcon, WhatsappIcon } from '@/features/integrations'
import { cn } from '@/lib/utils'
import type { Agent, Conversation } from '../types'
import { isArchived } from '../utils/conversationStatus'
import { isIdentified } from '../utils/customerIdentity'
import { describeCloser, describeHandler, type HandlerTone } from '../utils/handler'

const channelIcon: Record<Conversation['channel'], typeof WhatsappIcon> = {
  whatsapp: WhatsappIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
}

interface ConversationListItemProps {
  conversation: Conversation
  agents: Agent[]
  viewerAgentId: string
  isActive: boolean
  onSelect: (id: string) => void
}

/**
 * Two lines, always; a third only when there's something to act on. Everything
 * else this used to show on the row — status label, confidence, matched
 * intent, tags, a handoff badge with its own description — is either the
 * inbox's own context already (you filtered to it), or one click away in the
 * chat itself. Stacking all of it here was the busiest part of the screen for
 * the least reason: most rows have nothing urgent to say.
 */
export function ConversationListItem({
  conversation,
  agents,
  viewerAgentId,
  isActive,
  onSelect,
}: ConversationListItemProps) {
  const archived = isArchived(conversation)
  const ChannelIcon = channelIcon[conversation.channel]
  const handler = describeHandler(conversation, agents, viewerAgentId)
  const isWaitingOnUs = conversation.lastMessageDirection === 'inbound'
  const identified = isIdentified(conversation)
  // Only for the actual owner: `newlyAssigned` lives on the conversation, not
  // per-viewer, so a bystander with team-wide visibility must never read it as
  // "assigned to you" for a colleague's chat.
  const isNewlyAssignedToViewer =
    !archived && Boolean(conversation.newlyAssigned) && conversation.assignedAgentId === viewerAgentId

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={cn(
        'flex w-full flex-col gap-1 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50',
        isActive && 'bg-gray-50',
        isNewlyAssignedToViewer && 'bg-emerald-50/60',
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="relative shrink-0">
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ring-2',
              conversation.avatarColor,
              archived ? 'opacity-60 ring-transparent' : ring[handler.tone],
              // A brief pulse is the "notice me" signal at a glance, before
              // anyone reads the badge line below it.
              isNewlyAssignedToViewer && 'animate-pulse ring-emerald-400',
            )}
          >
            {/* A person-outline instead of initials when nobody has told us a
                name yet — there is nothing to abbreviate. */}
            {identified ? conversation.initials : <UserRound className="h-3.5 w-3.5" />}
          </span>
          {conversation.isOnline && !archived && (
            <span className="absolute right-0 bottom-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <span className="flex items-center gap-1">
            <span className="truncate text-sm font-medium text-gray-900">{conversation.customer}</span>
            <ChannelIcon className="h-3 w-3 shrink-0 opacity-60" />
            <span className="truncate text-xs text-gray-400">
              · {archived ? describeCloser(conversation, agents, viewerAgentId) : handler.label}
            </span>
          </span>
        </div>

        <span className="shrink-0 text-[11px] text-gray-400">{conversation.time}</span>
      </div>

      <div className="flex items-center gap-1.5 pl-10.5">
        {!archived && (
          <span
            className={cn('h-1.5 w-1.5 shrink-0 rounded-full', isWaitingOnUs ? 'bg-amber-400' : 'bg-gray-300')}
            title={isWaitingOnUs ? 'Waiting on a reply' : 'We replied last'}
          />
        )}
        <p className="min-w-0 flex-1 truncate text-xs text-gray-500">{conversation.lastMessage}</p>
        {!!conversation.unreadCount && (
          <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-medium text-white">
            {conversation.unreadCount}
          </span>
        )}
      </div>

      {/* Priority order: being told this is now yours outranks the AI asking
          for a human, since a chat that is newly assigned to you as a human
          is already past that point. */}
      {isNewlyAssignedToViewer ? (
        <p className="flex items-center gap-1 truncate pl-10.5 text-[11px] font-medium text-emerald-700">
          <Sparkles className="h-3 w-3 shrink-0" />
          Assigned to you
        </p>
      ) : (
        !archived &&
        conversation.handoffReason && (
          <p className="truncate pl-10.5 text-[11px] font-medium text-amber-600">Needs a human</p>
        )
      )}
    </button>
  )
}

const ring: Record<HandlerTone, string> = {
  bot: 'ring-violet-200',
  supervised: 'ring-blue-200',
  you: 'ring-emerald-300',
  agent: 'ring-slate-200',
  closed: 'ring-transparent',
}
