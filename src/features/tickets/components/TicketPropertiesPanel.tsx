import { useState } from 'react'
import { Check, ChevronDown, Link2, Plus, UserRound, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Ticket, TicketPriority, TicketStatus } from '../types'
import { useTags } from '@/features/tags'
import { useCategories } from '@/features/category'
import { ticketAgents } from '../data/mockTicketsData'
import { channelMeta, priorityMeta, statusMeta, ticketPriorities, ticketStatuses } from '../utils/ticketMeta'
import { hasRequesterName, requesterDisplayName } from '../utils/requesterIdentity'
import { eligibleTicketAssignees } from '../utils/assigneeEligibility'

interface FieldRowProps {
  label: string
  children: React.ReactNode
}

function FieldRow({ label, children }: FieldRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="shrink-0 text-xs text-gray-500">{label}</span>
      <div className="min-w-0 text-right">{children}</div>
    </div>
  )
}

interface TicketPropertiesPanelProps {
  ticket: Ticket
  /** `tickets.assign` — CSR Admin and up route work; a CSR handles only what lands on them. */
  canAssign: boolean
  /** `tickets.setStatus` — the fold of status *and* priority. A view-only ticket CSR sees both as plain badges. */
  canSetStatus: boolean
  onSetStatus: (status: TicketStatus) => void
  onSetPriority: (priority: TicketPriority) => void
  onAssign: (assigneeId: string | null) => void
  onSetTags: (tags: string[]) => void
  onOpenConversation?: (conversationId: string) => void
}

export function TicketPropertiesPanel({
  ticket,
  canAssign,
  canSetStatus,
  onSetStatus,
  onSetPriority,
  onAssign,
  onSetTags,
  onOpenConversation,
}: TicketPropertiesPanelProps) {
  const [isTagMenuOpen, setTagMenuOpen] = useState(false)
  const { tags } = useTags()
  const { categories } = useCategories()
  const status = statusMeta[ticket.status]
  const priority = priorityMeta[ticket.priority]
  const assignee = ticketAgents.find((agent) => agent.id === ticket.assigneeId)
  const category = categories.find((entry) => entry.id === ticket.categoryId)

  function toggleTag(tag: string) {
    onSetTags(ticket.tags.includes(tag) ? ticket.tags.filter((t) => t !== tag) : [...ticket.tags, tag])
  }

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-gray-900">Ticket info</p>

        <div className="mt-3 flex flex-col gap-2.5">
          <FieldRow label="Reference">
            <span className="font-mono text-xs text-gray-700">{ticket.reference}</span>
          </FieldRow>

          <FieldRow label="Status">
            {canSetStatus ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium hover:opacity-80',
                    status.className,
                  )}
                >
                  {status.label}
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-40">
                  {ticketStatuses.map((value) => (
                    <DropdownMenuItem key={value} onClick={() => onSetStatus(value)}>
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                        {ticket.status === value && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                      </span>
                      {statusMeta[value].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Badge className={status.className}>{status.label}</Badge>
            )}
          </FieldRow>

          <FieldRow label="Priority">
            {canSetStatus ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium hover:opacity-80',
                    priority.className,
                  )}
                >
                  {priority.label}
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-40">
                  {ticketPriorities.map((value) => (
                    <DropdownMenuItem key={value} onClick={() => onSetPriority(value)}>
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                        {ticket.priority === value && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                      </span>
                      {priorityMeta[value].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Badge className={priority.className}>{priority.label}</Badge>
            )}
          </FieldRow>

          <FieldRow label="Assignee">
            {canAssign ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    'inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-0.5 text-xs font-medium hover:bg-gray-50',
                    assignee ? 'text-gray-700' : 'text-amber-600',
                  )}
                >
                  {assignee?.name ?? 'Unassigned'}
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-44">
                  <DropdownMenuItem onClick={() => onAssign(null)}>
                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                      {!ticket.assigneeId && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </span>
                    Unassigned
                  </DropdownMenuItem>
                  {eligibleTicketAssignees(ticketAgents).map((agent) => (
                    <DropdownMenuItem key={agent.id} onClick={() => onAssign(agent.id)}>
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                        {ticket.assigneeId === agent.id && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                      </span>
                      {agent.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Badge variant={assignee ? 'outline' : 'gray'}>{assignee?.name ?? 'Unassigned'}</Badge>
            )}
          </FieldRow>

          <FieldRow label="Category">
            <span className="text-xs font-medium text-gray-700">{category?.name ?? 'Uncategorised'}</span>
          </FieldRow>
          <FieldRow label="Source">
            <span className="text-xs font-medium text-gray-700">{channelMeta[ticket.channel].label}</span>
          </FieldRow>
          <FieldRow label="Created">
            <span className="text-xs text-gray-600">{ticket.createdAt}</span>
          </FieldRow>
          <FieldRow label="Last update">
            <span className="text-xs text-gray-600">{ticket.updatedAt}</span>
          </FieldRow>
          <FieldRow label="Due">
            <span className={cn('text-xs font-medium', ticket.isOverdue ? 'text-rose-600' : 'text-gray-700')}>
              {ticket.dueOn}
              {ticket.isOverdue && ' · overdue'}
            </span>
          </FieldRow>
        </div>

        {ticket.conversationId && onOpenConversation && (
          <button
            type="button"
            onClick={() => onOpenConversation(ticket.conversationId!)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <Link2 className="h-3.5 w-3.5" />
            Open the original chat
          </button>
        )}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-gray-900">Requester</p>
        <div className="mt-3 flex items-center gap-2.5">
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
              ticket.requester.avatarColor,
            )}
          >
            {hasRequesterName(ticket.requester) ? ticket.requester.initials : <UserRound className="h-4 w-4" />}
          </span>
          <div className="min-w-0">
            <p className={cn('truncate text-sm font-medium', hasRequesterName(ticket.requester) ? 'text-gray-900' : 'text-gray-500 italic')}>
              {requesterDisplayName(ticket.requester)}
            </p>
            <p className="truncate text-xs text-gray-500">{ticket.requester.email}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Tags</p>
          <DropdownMenu open={isTagMenuOpen} onOpenChange={setTagMenuOpen}>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50">
              <Plus className="h-3 w-3" />
              Add
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-44">
              {tags.map((tag) => (
                <DropdownMenuItem key={tag.id} onClick={() => toggleTag(tag.name)}>
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                    {ticket.tags.includes(tag.name) && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                  </span>
                  {tag.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {ticket.tags.length === 0 ? (
            <span className="text-xs text-gray-400">No tags yet</span>
          ) : (
            ticket.tags.map((tag) => (
              <Badge key={tag} variant="gray" className="gap-1 pr-1">
                {tag}
                <button
                  type="button"
                  onClick={() => toggleTag(tag)}
                  aria-label={`Remove tag ${tag}`}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))
          )}
        </div>
      </div>
    </aside>
  )
}
