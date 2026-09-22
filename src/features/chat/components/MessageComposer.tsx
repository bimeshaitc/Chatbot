import { useEffect, useMemo, useRef, useState } from 'react'
import { BookOpenCheck, Bot, Check, ChevronDown, Lock, Paperclip, Plus, Send, Smile, Sparkles, Tag, Users, X } from 'lucide-react'
import { initialFaqs } from '@/features/bot-training'
import { useCannedResponses, visibleCannedResponses } from '@/features/canned-responses'
import { useTags } from '@/features/tags'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useViewer } from '@/stores/useWorkspaceRoleStore'
import { cn } from '@/lib/utils'
import { emojiOptions } from '../data/mockChatData'
import type { ComposerMode } from '../types'
import { rankFaqsForIntent } from '../utils/knowledgeSuggestions'
import { AddTagDialog } from './AddTagDialog'

const modeCopy: Record<ComposerMode, { label: string; placeholder: string }> = {
  message: { label: 'Message', placeholder: 'Type a message...' },
  note: { label: 'Note', placeholder: 'Write an internal note (not sent to the customer)...' },
}

interface MessageComposerProps {
  tags: string[]
  /** What the bot matched on this chat, used to surface its own trained answer first. */
  botIntent: string
  isLocked?: boolean
  lockedReason?: string
  /**
   * Set when the agent may not send to the customer but may still leave an
   * internal note — supervising the AI, or reading a colleague's chat. Watching
   * a bot conversation and jotting down what it got wrong is the whole point of
   * supervising, so a full lock would have taken that away.
   */
  replyLockedReason?: string
  onSend: (text: string, mode: ComposerMode, options?: { attachmentName?: string }) => void
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  /**
   * Only set when this agent owns the chat and may read internal knowledge —
   * drafting a customer reply out of staff-only material is not something a
   * bystander should be doing.
   */
  onSuggestReply?: () => void
  /** Set by the suggest dialog. Replaces the draft rather than appending. */
  suggestedDraft?: string | null
  onSuggestedDraftUsed?: () => void
}

export function MessageComposer({
  tags,
  botIntent,
  isLocked = false,
  lockedReason,
  replyLockedReason,
  onSend,
  onAddTag,
  onRemoveTag,
  onSuggestReply,
  suggestedDraft,
  onSuggestedDraftUsed,
}: MessageComposerProps) {
  const { tags: tagDefinitions } = useTags()
  const viewer = useViewer()
  const { responses: cannedResponses } = useCannedResponses()
  const availableCannedResponses = useMemo(
    () => visibleCannedResponses(cannedResponses, viewer),
    [cannedResponses, viewer],
  )
  const [selectedMode, setSelectedMode] = useState<ComposerMode>('message')
  const canReply = !replyLockedReason
  // Forced rather than stored, so flipping back to a chat you own restores the
  // agent's own last choice instead of stranding them in note mode.
  const mode: ComposerMode = canReply ? selectedMode : 'note'
  const [draft, setDraft] = useState('')
  // Tracks which suggestion has already been adopted, so the block below only
  // fires once per new value rather than on every render.
  const [adoptedDraft, setAdoptedDraft] = useState<string | null>(null)

  // Adjusting our own state from a prop during render is the sanctioned
  // pattern for this (react.dev/learn/you-might-not-need-an-effect) — React
  // re-renders with the update before committing, so it's cheap and safe.
  // What is *not* safe here is `onSuggestedDraftUsed`: it sets state on the
  // parent, and calling another component's setter while this one is still
  // rendering is the specific case React warns about ("Cannot update a
  // component while rendering a different component"). That call is deferred
  // to the effect below instead, which runs after this render has committed.
  if (suggestedDraft && suggestedDraft !== adoptedDraft) {
    setAdoptedDraft(suggestedDraft)
    setDraft(suggestedDraft)
  }

  useEffect(() => {
    if (adoptedDraft) onSuggestedDraftUsed?.()
  }, [adoptedDraft, onSuggestedDraftUsed])

  const [attachment, setAttachment] = useState<string | null>(null)
  const [isTagDialogOpen, setTagDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isNote = mode === 'note'
  const rankedFaqs = rankFaqsForIntent(initialFaqs, botIntent)

  function handleSend() {
    // An attachment on its own is a valid message; text is not required then.
    if (!draft.trim() && !attachment) return
    onSend(draft.trim() || `Sent ${attachment}`, mode, attachment ? { attachmentName: attachment } : undefined)
    setDraft('')
    setAttachment(null)
  }

  /** Appends rather than replaces so picking a reply never eats a typed draft. */
  function insertQuickReply(body: string) {
    setDraft((prev) => (prev.trim() ? `${prev.trimEnd()} ${body}` : body))
  }

  function insertEmoji(emoji: string) {
    setDraft((prev) => prev + emoji)
  }

  if (isLocked) {
    return (
      <div className="flex items-center gap-2 border-t border-gray-100 bg-gray-50 px-4 py-4 sm:px-5">
        <Lock className="h-4 w-4 shrink-0 text-gray-400" />
        <p className="text-sm text-gray-500">{lockedReason ?? 'This chat is read-only.'}</p>
      </div>
    )
  }

  return (
    <div className={cn('border-t border-gray-100 transition-colors', isNote && 'bg-amber-50/60')}>
      {/* Tags describe the chat, not the message about to be sent, so they get
          their own quiet line rather than competing with the send toolbar. */}
      <div className="flex flex-wrap items-center gap-1.5 px-4 pt-2.5 sm:px-5">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <Tag className="h-3 w-3" />
            Add tag
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-72 min-w-48 overflow-y-auto">
            {tagDefinitions.map((tag) => {
              const isApplied = tags.some((existing) => existing.toLowerCase() === tag.name.toLowerCase())
              return (
                <DropdownMenuItem key={tag.id} onClick={() => (isApplied ? onRemoveTag(tag.name) : onAddTag(tag.name))}>
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                    {isApplied && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                  </span>
                  {tag.name}
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTagDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              New tag...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {tags.map((tag) => (
          <Badge key={tag} variant="gray" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              aria-label={`Remove tag ${tag}`}
              className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        ))}
      </div>

      {!canReply && (
        <p className="flex items-center gap-1.5 px-4 pt-2 text-xs text-gray-500 sm:px-5">
          <Lock className="h-3 w-3 shrink-0 text-gray-400" />
          {replyLockedReason} You can still leave an internal note.
        </p>
      )}

      {attachment && (
        <div className="px-4 pt-2 sm:px-5">
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600">
            <Paperclip className="h-3 w-3 shrink-0 text-gray-400" />
            <span className="truncate">{attachment}</span>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              aria-label="Remove attachment"
              className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        </div>
      )}

      {/* One row: how you're sending it, the ways to fill it in, and Send. */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 sm:gap-2 sm:px-5">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium',
              isNote ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50',
            )}
          >
            {modeCopy[mode].label}
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-32">
            <DropdownMenuItem
              onClick={() => setSelectedMode('message')}
              disabled={!canReply}
              title={!canReply ? replyLockedReason : undefined}
              className={!canReply ? 'cursor-not-allowed opacity-40' : undefined}
            >
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                {mode === 'message' && <Check className="h-3.5 w-3.5 text-emerald-600" />}
              </span>
              Message
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedMode('note')}>
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                {mode === 'note' && <Check className="h-3.5 w-3.5 text-emerald-600" />}
              </span>
              Note
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {onSuggestReply && (
          <button
            type="button"
            onClick={onSuggestReply}
            aria-label="Draft a reply from the knowledge base"
            title="Draft a reply from the internal knowledge base"
            className="text-violet-500 hover:text-violet-700"
          >
            <BookOpenCheck className="h-4.5 w-4.5" />
          </button>
        )}

        {/* Canned replies and the bot's own trained answers used to be two
            buttons; an agent reaching for "something to say" does not care
            which one wrote it, so they're one menu now, split by section. */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="text-gray-400 hover:text-gray-600"
            aria-label="Quick replies"
            title="Quick replies"
          >
            <Sparkles className="h-4.5 w-4.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-80 w-80 max-w-[calc(100vw-2rem)] overflow-y-auto">
            <p className="px-2 pt-1 pb-0.5 text-[11px] font-medium tracking-wide text-gray-400 uppercase">
              Canned responses
            </p>
            {availableCannedResponses.map((response) => (
              <DropdownMenuItem
                key={response.id}
                className="flex-col items-start gap-0.5"
                onClick={() => insertQuickReply(response.body)}
              >
                <span className="flex w-full items-center gap-1.5">
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-900">{response.title}</span>
                  {/* Private ones only ever appear here for their own owner
                      (see `visibleCannedResponses`), so this badge is about
                      trust, not access — a quick reminder of who else could
                      be using the same line before you send it. */}
                  {response.visibility === 'private' ? (
                    <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                      <Lock className="h-2.5 w-2.5" />
                      Private
                    </span>
                  ) : (
                    <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                      <Users className="h-2.5 w-2.5" />
                      Shared
                    </span>
                  )}
                </span>
                <span className="line-clamp-2 text-[11px] text-gray-500">{response.body}</span>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <p className="px-2 pt-1 pb-0.5 text-[11px] font-medium tracking-wide text-gray-400 uppercase">
              From the knowledge base
            </p>
            {rankedFaqs.map((faq) => (
              <DropdownMenuItem
                key={faq.id}
                className="flex-col items-start gap-0.5"
                onClick={() => insertQuickReply(faq.answer)}
              >
                <span className="flex w-full items-center gap-1.5">
                  <Bot className="h-3 w-3 shrink-0 text-violet-500" />
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-900">{faq.question}</span>
                  {faq.isSuggested && (
                    <span className="shrink-0 rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
                      Suggested
                    </span>
                  )}
                </span>
                <span className="line-clamp-2 pl-4.5 text-[11px] text-gray-500">{faq.answer}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setAttachment(file.name)
            // Reset so picking the same file twice still fires a change event.
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Attach file"
        >
          <Paperclip className="h-4.5 w-4.5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="text-gray-400 hover:text-gray-600" aria-label="Emoji">
            <Smile className="h-4.5 w-4.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="grid grid-cols-8 gap-0.5">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="flex h-6 w-6 items-center justify-center rounded text-base hover:bg-gray-100"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={modeCopy[mode].placeholder}
          className={cn(
            'min-w-0 flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none',
            isNote ? 'border-amber-300 bg-white focus:border-amber-400' : 'border-gray-200 focus:border-blue-400',
          )}
        />
        <button
          type="button"
          onClick={handleSend}
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white',
            isNote ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700',
          )}
          aria-label={isNote ? 'Save note' : 'Send message'}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      {isTagDialogOpen && (
        <AddTagDialog existingTags={tags} onClose={() => setTagDialogOpen(false)} onAddTag={onAddTag} />
      )}
    </div>
  )
}
