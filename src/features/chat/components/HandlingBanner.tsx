import { Archive, RotateCcw, Sparkles, TriangleAlert, UserCheck } from 'lucide-react'
import type { Conversation } from '../types'
import { handoffReasonMeta } from '../utils/botMeta'
import { isArchived } from '../utils/conversationStatus'

interface HandlingBannerProps {
  conversation: Conversation
  viewerAgentId: string
  canTakeOver: boolean
  canChangeStatus: boolean
  onTakeOver: () => void
  onReopen: () => void
}

/**
 * A single-line strip, shown only when the chat genuinely wants a decision:
 * it was just handed to you, the AI is asking for a human, or the chat is
 * sitting closed. Every other state — bot handling fine, someone supervising,
 * an agent already on it — says nothing here, because the header's handler
 * chip already says who is driving and system messages in the thread already
 * say when that changed.
 *
 * This used to render for every conversation with a full sentence plus a
 * confidence/intent/fallback line plus its own button row — the one place on
 * the whole screen a chat that needed nothing still took the most space.
 */
export function HandlingBanner({
  conversation,
  viewerAgentId,
  canTakeOver,
  canChangeStatus,
  onTakeOver,
  onReopen,
}: HandlingBannerProps) {
  const archived = isArchived(conversation)
  const handoff = conversation.handoffReason ? handoffReasonMeta[conversation.handoffReason] : null
  // Same gate as the list row: only the actual assignee sees this, never a
  // bystander with team-wide visibility looking at somebody else's chat.
  const isNewlyAssignedToViewer =
    !archived && Boolean(conversation.newlyAssigned) && conversation.assignedAgentId === viewerAgentId

  // Outranks the archived and handoff strips: it clears itself the instant the
  // assignee opens the chat, so there is never a moment where it would compete
  // with them for attention — by the time either of those could also be true,
  // this one is already gone.
  if (isNewlyAssignedToViewer) {
    return (
      <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-4 py-1.5 sm:px-5">
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
        <p className="min-w-0 flex-1 truncate text-xs text-emerald-800">This chat was just assigned to you.</p>
      </div>
    )
  }

  if (archived) {
    if (!canChangeStatus) return null
    return (
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-1.5 sm:px-5">
        <Archive className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        <p className="min-w-0 flex-1 text-xs text-gray-600">This chat is archived.</p>
        <button
          type="button"
          onClick={onReopen}
          className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
        >
          <RotateCcw className="h-3 w-3" />
          Reopen
        </button>
      </div>
    )
  }

  if (!handoff) return null

  return (
    <div className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-4 py-1.5 sm:px-5">
      <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-amber-600" />
      <p className="min-w-0 flex-1 truncate text-xs text-amber-800">
        The AI wants a human — <span className="font-medium">{handoff.label}</span>
      </p>
      {canTakeOver && (
        <button
          type="button"
          onClick={onTakeOver}
          className="flex shrink-0 items-center gap-1 rounded-full bg-amber-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-amber-700"
        >
          <UserCheck className="h-3 w-3" />
          Take over
        </button>
      )}
    </div>
  )
}
