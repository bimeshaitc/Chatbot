import { useEffect, useRef, useState } from 'react'
import {
  Archive,
  ArrowLeft,
  Ban,
  ChevronLeft,
  ChevronRight,
  Lock,
  Mail,
  MessageSquareQuote,
  Paperclip,
  RotateCw,
  Send,
  StickyNote,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ReplyMode, Ticket, TicketPlacement, TicketStatus } from '../types'
import { daysUntilPurge, placementMeta, priorityMeta, statusMeta } from '../utils/ticketMeta'
import { requesterDisplayName } from '../utils/requesterIdentity'

const modes: { value: ReplyMode; label: string }[] = [
  { value: 'reply', label: 'Reply to requester' },
  { value: 'note', label: 'Internal note' },
]

interface TicketDetailProps {
  ticket: Ticket
  /** Position within the current mailbox, for the prev/next control. */
  position: { index: number; total: number }
  /** `tickets.file` — archive / spam / trash / restore. */
  canFile: boolean
  /** `tickets.delete` — permanently removing a trashed ticket. */
  canDelete: boolean
  /** `tickets.reply` — a view-only ticket CSR can read the thread but not add to it. */
  canReply: boolean
  /** `tickets.setStatus` — the fold of status *and* priority; same view-only gate. */
  canSetStatus: boolean
  onBack: () => void
  onPrevious: () => void
  onNext: () => void
  onReply: (body: string, mode: ReplyMode, attachmentName?: string) => void
  onMove: (placement: TicketPlacement) => void
  onDeleteForever: () => void
  onSetStatus: (status: TicketStatus) => void
}

export function TicketDetail({
  ticket,
  position,
  canFile,
  canDelete,
  canReply,
  canSetStatus,
  onBack,
  onPrevious,
  onNext,
  onReply,
  onMove,
  onDeleteForever,
  onSetStatus,
}: TicketDetailProps) {
  const [mode, setMode] = useState<ReplyMode>('reply')
  const [draft, setDraft] = useState('')
  const [attachment, setAttachment] = useState<string | null>(null)
  // Separate from `attachment`: this isn't a file, it's a block of quoted
  // text that goes into the message body itself once sent.
  const [isChatSummaryAttached, setChatSummaryAttached] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)

  const isNote = mode === 'note'
  const inStorage = ticket.placement !== 'inbox'

  useEffect(() => {
    const node = threadRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [ticket.messages.length, ticket.id])

  function handleSend() {
    if (!draft.trim() && !attachment) return
    const summaryBlock = isChatSummaryAttached && ticket.linkedChatSummary
      ? `--- Original chat ---\n${ticket.linkedChatSummary}\n---\n\n`
      : ''
    onReply(summaryBlock + (draft.trim() || `Sent ${attachment}`), mode, attachment ?? undefined)
    setDraft('')
    setAttachment(null)
    setChatSummaryAttached(false)
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to ticket list"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{ticket.subject}</p>
              <p className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
                <span className="font-mono">{ticket.reference}</span>
                <span>·</span>
                <span>{requesterDisplayName(ticket.requester)}</span>
                {inStorage && (
                  <>
                    <span>·</span>
                    <span className="font-medium text-gray-500">{placementMeta[ticket.placement].label}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {inStorage ? (
              <>
                {canFile && (
                  <button
                    type="button"
                    onClick={() => onMove('inbox')}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    Restore
                  </button>
                )}
                {canDelete && ticket.placement === 'trash' && (
                  <button
                    type="button"
                    onClick={onDeleteForever}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete forever
                  </button>
                )}
              </>
            ) : (
              canFile && (
                <>
                  <button
                    type="button"
                    onClick={() => onMove('archive')}
                    title="Move to archive"
                    aria-label="Move to archive"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove('spam')}
                    title="Mark as spam"
                    aria-label="Mark as spam"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
                  >
                    <Ban className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove('trash')}
                    title="Move to trash"
                    aria-label="Move to trash"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )
            )}

            <span className="mx-1 h-5 w-px bg-gray-200" />

            <span className="text-xs text-gray-400">
              {position.index + 1} of {position.total}
            </span>
            <button
              type="button"
              onClick={onPrevious}
              disabled={position.index === 0}
              aria-label="Previous ticket"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={position.index >= position.total - 1}
              aria-label="Next ticket"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {ticket.placement === 'trash' && (
          <div className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-4 py-2.5">
            <TriangleAlert className="h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-800">
              In the trash since {ticket.trashedOn}.{' '}
              {(() => {
                const remaining = daysUntilPurge(ticket.trashedOn)
                if (remaining === null) return 'It will be purged automatically in 30 days.'
                return remaining === 0
                  ? "It's due to be purged automatically any moment now."
                  : `It will be purged automatically in ${remaining} day${remaining === 1 ? '' : 's'}.`
              })()}
            </p>
          </div>
        )}

        {ticket.placement === 'spam' && (
          <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
            <Ban className="h-4 w-4 shrink-0 text-gray-500" />
            <p className="text-xs text-gray-600">Marked as spam. Replies are disabled until it is restored.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 border-b border-gray-100 px-4 py-2.5">
          <Badge className={statusMeta[ticket.status].className}>{statusMeta[ticket.status].label}</Badge>
          <Badge className={priorityMeta[ticket.priority].className}>
            {priorityMeta[ticket.priority].label} priority
          </Badge>
          {ticket.isOverdue && <Badge className="bg-rose-50 text-rose-700">Overdue</Badge>}
        </div>

        <div ref={threadRef} className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-3">
            {ticket.messages.map((message) => {
              if (message.author === 'system') {
                return (
                  <div key={message.id} className="flex items-center justify-center gap-2 py-1 text-xs text-gray-400">
                    <span className="h-px w-8 bg-gray-200" />
                    <span>
                      {message.body} · {message.sentAt}
                    </span>
                    <span className="h-px w-8 bg-gray-200" />
                  </div>
                )
              }

              if (message.isInternal) {
                return (
                  <div key={message.id} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                    <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-amber-700 uppercase">
                      <StickyNote className="h-3 w-3" />
                      Internal note · {message.authorName}
                    </p>
                    <p className="mt-1 text-sm text-gray-700">{message.body}</p>
                    {message.attachmentName && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-700">
                        <Paperclip className="h-3 w-3" />
                        {message.attachmentName}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-amber-700/70">{message.sentAt}</p>
                  </div>
                )
              }

              const isAgent = message.author === 'agent'

              return (
                <div key={message.id} className={cn('flex flex-col', isAgent ? 'items-end' : 'items-start')}>
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap sm:max-w-[75%]',
                      isAgent ? 'rounded-tr-sm bg-[#1B5E20] text-white' : 'rounded-tl-sm bg-gray-100 text-gray-800',
                    )}
                  >
                    {message.body}
                    {message.attachmentName && (
                      <span
                        className={cn(
                          'mt-1.5 flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs',
                          isAgent ? 'bg-white/15' : 'bg-white',
                        )}
                      >
                        <Paperclip className="h-3 w-3 shrink-0" />
                        <span className="truncate">{message.attachmentName}</span>
                      </span>
                    )}
                  </div>
                  <span className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                    {/* Every non-internal reply is an email — this is the one
                        place the thread says so, rather than requiring
                        someone to already know that's how tickets work. */}
                    {isAgent && (
                      <span title="Sent to the requester by email" className="flex items-center gap-0.5">
                        <Mail className="h-2.5 w-2.5" />
                      </span>
                    )}
                    {message.authorName} · {message.sentAt}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {ticket.placement === 'spam' ? (
          <div className="flex items-center gap-2 border-t border-gray-100 bg-gray-50 px-4 py-4">
            <Lock className="h-4 w-4 shrink-0 text-gray-400" />
            <p className="text-sm text-gray-500">Restore this ticket to reply.</p>
          </div>
        ) : !canReply ? (
          <div className="flex items-center gap-2 border-t border-gray-100 bg-gray-50 px-4 py-4">
            <Lock className="h-4 w-4 shrink-0 text-gray-400" />
            <p className="text-sm text-gray-500">View-only access. You cannot reply to or change this ticket.</p>
          </div>
        ) : (
          <div className={cn('border-t border-gray-100', isNote && 'bg-amber-50/60')}>
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-2.5">
              <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5">
                {modes.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMode(option.value)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                      mode === option.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {canSetStatus && (
                <label className="flex items-center gap-1.5 text-xs text-gray-500">
                  Set status on send
                  <select
                    value={ticket.status}
                    onChange={(e) => onSetStatus(e.target.value as TicketStatus)}
                    className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 outline-none focus:border-[#1B5E20]"
                  >
                    {Object.entries(statusMeta).map(([value, meta]) => (
                      <option key={value} value={value}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            {/* States what a reply actually does before anyone hits send —
                without this, "Reply to requester" reads like an in-app
                message, not the email it becomes the moment it's sent. */}
            {!isNote && (
              <p className="flex items-center gap-1.5 px-4 pt-2 text-[11px] text-gray-400">
                <Mail className="h-3 w-3 shrink-0" />
                Sent to {ticket.requester.email} by email
              </p>
            )}

            {ticket.linkedChatSummary && !isNote && (
              <div className="px-4 pt-2">
                {isChatSummaryAttached ? (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600">
                    <MessageSquareQuote className="h-3 w-3 shrink-0 text-gray-400" />
                    <span className="truncate">Chat summary attached</span>
                    <button
                      type="button"
                      onClick={() => setChatSummaryAttached(false)}
                      aria-label="Remove chat summary"
                      className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setChatSummaryAttached(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-200 px-2 py-1 text-xs text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    <MessageSquareQuote className="h-3 w-3" />
                    Attach chat summary
                  </button>
                )}
              </div>
            )}

            {attachment && (
              <div className="px-4 pt-2">
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600">
                  <Paperclip className="h-3 w-3 shrink-0 text-gray-400" />
                  <span className="truncate">{attachment}</span>
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    aria-label="Remove attachment"
                    className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              </div>
            )}

            <div className="flex items-end gap-2 px-4 py-3">
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setAttachment(file.name)
                  e.target.value = ''
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach file"
                className="mb-1.5 text-gray-400 hover:text-gray-600"
              >
                <Paperclip className="h-4.5 w-4.5" />
              </button>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                placeholder={
                  isNote ? 'Write a note only your team can see...' : `Reply to ${requesterDisplayName(ticket.requester)}...`
                }
                className={cn(
                  'min-w-0 flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none',
                  isNote ? 'border-amber-300 bg-white focus:border-amber-400' : 'border-gray-200 focus:border-[#1B5E20]',
                )}
              />
              <button
                type="button"
                onClick={handleSend}
                className={cn(
                  'mb-0.5 flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-white',
                  isNote ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#1B5E20] hover:bg-[#1B5E20]/90',
                )}
              >
                {isNote ? <Send className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                {isNote ? 'Save note' : 'Send email'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
