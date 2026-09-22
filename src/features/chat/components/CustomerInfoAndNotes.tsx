import { useState } from 'react'
import {
  AtSign,
  CalendarDays,
  Check,
  Clock,
  Globe,
  Languages,
  MapPin,
  Phone,
  StickyNote,
  UserRound,
} from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useCategories } from '@/features/category'
import { agents } from '../data/mockChatData'
import { confidenceTone, formatConfidence, handoffReasonMeta } from '../utils/botMeta'
import { isArchived } from '../utils/conversationStatus'
import { isIdentified } from '../utils/customerIdentity'
import { describeCloser } from '../utils/handler'
import type { ActivityLogEntry, Conversation, CustomerProfile } from '../types'

const channelLabel: Record<Conversation['channel'], string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
}

function nameFor(list: { id: string; name: string }[], id: string | null, fallback: string) {
  if (!id) return fallback
  return list.find((entry) => entry.id === id)?.name ?? fallback
}

/**
 * One contact fact. The icon carries the label, so the eye can find "phone" by
 * shape instead of reading a column of grey words — which is what made the old
 * label-on-the-left layout so hard to scan at 320px wide.
 */
function ContactRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <li className="flex items-start gap-2 text-xs">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
      <span className="sr-only">{label}: </span>
      <span className="min-w-0 break-words text-gray-700" title={`${label}: ${value}`}>
        {value}
      </span>
    </li>
  )
}

/** A single number worth seeing before reading anything else. */
function SignalTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-[#F7F7F8] px-2 py-1.5">
      <p className="truncate text-[10px] font-medium tracking-wide text-gray-400 uppercase">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-gray-900" title={value}>
        {value}
      </p>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd className="min-w-0 text-right font-medium break-words text-gray-900">{value}</dd>
    </div>
  )
}

interface CustomerInfoAndNotesProps {
  conversation: Conversation
  customerProfile: CustomerProfile | null
  activityEntries: ActivityLogEntry[]
  viewerAgentId: string
  onAddNote: (note: string) => void
  /** Only meaningful while `!isIdentified(conversation)` — records a name once the customer gives one. */
  onIdentifyCustomer: (name: string) => void
}

export function CustomerInfoAndNotes({
  conversation,
  customerProfile,
  activityEntries,
  viewerAgentId,
  onAddNote,
  onIdentifyCustomer,
}: CustomerInfoAndNotesProps) {
  const [note, setNote] = useState('')
  const [nameDraft, setNameDraft] = useState('')
  const identified = isIdentified(conversation)
  const { categories } = useCategories()

  function handleIdentify() {
    if (!nameDraft.trim()) return
    onIdentifyCustomer(nameDraft)
    setNameDraft('')
  }

  // Notes live on the activity log, so the Details tab reads them back from there
  // rather than keeping a second copy that could drift.
  const notes = activityEntries.filter((entry) => entry.type === 'note' && entry.note)

  // While the AI is driving, its own reading of the chat is part of the detail
  // an agent needs before deciding to step in.
  const isBotDriving = conversation.handling !== 'agent'
  const confidence = confidenceTone(conversation.botConfidence)
  const handoff = conversation.handoffReason ? handoffReasonMeta[conversation.handoffReason] : null
  const archived = isArchived(conversation)

  function handleAddNote() {
    if (!note.trim()) return
    onAddNote(note.trim())
    setNote('')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Identity first, at a readable size. Name and email used to be rows 1
          and 2 of an eight-row list, which buried the only two facts an agent
          looks for every single time. */}
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
            conversation.avatarColor,
            archived && 'opacity-60',
          )}
        >
          {identified ? conversation.initials : <UserRound className="h-4.5 w-4.5" />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{conversation.customer}</p>
          {customerProfile ? (
            <a
              href={`mailto:${customerProfile.email}`}
              className="block truncate text-xs text-blue-600 hover:underline"
              title={customerProfile.email}
            >
              {customerProfile.email}
            </a>
          ) : conversation.customerEmail ? (
            // An email with no CRM record behind it yet — collected on the
            // spot by a ticket, not looked up. Still worth a working mailto
            // link; just not the richer plan/lifetime-value tiles below,
            // which need a real record to mean anything.
            <a
              href={`mailto:${conversation.customerEmail}`}
              className="block truncate text-xs text-blue-600 hover:underline"
              title={conversation.customerEmail}
            >
              {conversation.customerEmail}
            </a>
          ) : (
            <p className="text-xs text-gray-400">No customer record linked</p>
          )}
        </div>
      </div>

      {/* The widget never collects a name — only an email, and only once a
          ticket needs one — so this is the one place that gap actually gets
          closed: the agent hears a name in the conversation and records it
          here, updating the avatar, the list row and the header at once. */}
      {!identified && (
        <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-200 px-2.5 py-2">
          <Input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleIdentify()}
            placeholder="Their name, once they tell you"
            className="h-7 flex-1 text-xs"
          />
          <button
            type="button"
            onClick={handleIdentify}
            disabled={!nameDraft.trim()}
            aria-label="Save name"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 enabled:hover:bg-gray-100 enabled:hover:text-gray-600 disabled:opacity-40"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* The three facts that answer "how much care does this need?". Promoted
          out of a fourth-position accordion, where they were invisible. */}
      {customerProfile && (
        <div className="grid grid-cols-3 gap-1.5">
          <SignalTile label="Plan" value={customerProfile.plan.replace(/\s*\(.*\)$/, '')} />
          <SignalTile label="Lifetime" value={customerProfile.lifetimeValue} />
          <SignalTile label="Chats" value={String(customerProfile.totalConversations)} />
        </div>
      )}

      <Accordion defaultValue={['contact', 'conversation', 'ai', 'internal-notes']} multiple>
        {customerProfile && (
          <AccordionItem value="contact">
            <AccordionTrigger>Contact</AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col gap-2">
                <ContactRow icon={Phone} label="Phone" value={customerProfile.phone} />
                <ContactRow icon={AtSign} label="Channel handle" value={customerProfile.channelHandle} />
                <ContactRow icon={MapPin} label="Location" value={customerProfile.location} />
                <ContactRow icon={Clock} label="Timezone" value={customerProfile.timezone} />
                <ContactRow icon={Languages} label="Language" value={customerProfile.language} />
                <ContactRow icon={CalendarDays} label="Customer since" value={customerProfile.customerSince} />
                <ContactRow icon={Globe} label="Last order" value={customerProfile.lastOrder} />
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="conversation">
          <AccordionTrigger>This conversation</AccordionTrigger>
          <AccordionContent>
            {/* Status, who is handling it and the assignee are all in the chat
                header a few pixels above, so repeating them here was the main
                reason this panel read as a wall of text. Only what the header
                does not already say survives. "Unread" is gone too — opening a
                chat clears it, so it always read 0. */}
            <dl className="flex flex-col gap-2">
              <DetailRow label="Channel" value={channelLabel[conversation.channel]} />
              <DetailRow label="Category" value={nameFor(categories, conversation.categoryId, 'Uncategorised')} />
              <DetailRow label="First contact" value={conversation.firstContact} />
              <DetailRow label="Avg. response" value={conversation.responseTime} />

              {archived && (
                <>
                  <DetailRow label="Closed by" value={describeCloser(conversation, agents, viewerAgentId)} />
                  <DetailRow label="Closed at" value={conversation.closedAt ?? 'Unknown'} />
                  {conversation.resolution && <DetailRow label="Resolution" value={conversation.resolution} />}
                </>
              )}

              <div className="flex justify-between gap-3 text-xs">
                <dt className="shrink-0 text-gray-500">Tags</dt>
                <dd className="flex min-w-0 flex-wrap justify-end gap-1">
                  {conversation.tags.length === 0 ? (
                    <span className="text-gray-400">None</span>
                  ) : (
                    conversation.tags.map((tag) => (
                      <Badge key={tag} variant="gray">
                        {tag}
                      </Badge>
                    ))
                  )}
                </dd>
              </div>
            </dl>
          </AccordionContent>
        </AccordionItem>

        {isBotDriving && (
          <AccordionItem value="ai">
            <AccordionTrigger>AI handling</AccordionTrigger>
            <AccordionContent>
              <dl className="flex flex-col gap-2">
                <DetailRow label="Matched intent" value={conversation.botIntent} />
                <div className="flex justify-between gap-3 text-xs">
                  <dt className="shrink-0 text-gray-500">Confidence</dt>
                  <dd className={cn('font-medium', confidence.textColor)}>
                    {formatConfidence(conversation.botConfidence)} ({confidence.label})
                  </dd>
                </div>
                <DetailRow label="Fallbacks" value={String(conversation.botFallbacks)} />
                <div className="flex justify-between gap-3 text-xs">
                  <dt className="shrink-0 text-gray-500">Handoff</dt>
                  <dd className={cn('text-right font-medium', handoff ? 'text-amber-700' : 'text-gray-900')}>
                    {handoff ? handoff.label : 'Not requested'}
                  </dd>
                </div>
              </dl>
              {handoff && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">{handoff.description}</p>
              )}
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="internal-notes">
          <AccordionTrigger>
            Internal notes{notes.length > 0 && <span className="ml-1 text-gray-400">({notes.length})</span>}
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3">
              {notes.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {notes.map((entry) => (
                    <li key={entry.id} className="rounded-lg border border-amber-100 bg-amber-50/70 px-3 py-2">
                      <p className="flex items-start gap-1.5 text-xs text-gray-700">
                        <StickyNote className="mt-0.5 h-3 w-3 shrink-0 text-amber-600" />
                        {entry.note}
                      </p>
                      <p className="mt-1 pl-4.5 text-[11px] text-gray-400">
                        {entry.actor} · {entry.time}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-col gap-2">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write a note only your team can see"
                  rows={3}
                />
                <Button size="sm" className="self-start" onClick={handleAddNote}>
                  Add note
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
