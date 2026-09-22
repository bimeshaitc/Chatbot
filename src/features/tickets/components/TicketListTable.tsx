import { Archive, Ban, MessageSquare, RotateCw, Trash2, TriangleAlert, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Ticket, TicketMailbox, TicketPlacement } from '../types'
import { ticketAgents } from '../data/mockTicketsData'
import { channelMeta, isStorageMailbox, priorityMeta, statusMeta } from '../utils/ticketMeta'
import { hasRequesterName, requesterDisplayName } from '../utils/requesterIdentity'

function assigneeName(assigneeId: string | null) {
  if (!assigneeId) return 'Unassigned'
  return ticketAgents.find((agent) => agent.id === assigneeId)?.name ?? 'Unassigned'
}

interface TicketListTableProps {
  tickets: Ticket[]
  mailbox: TicketMailbox
  /** `tickets.file` — archive / spam / trash / restore. */
  canFile: boolean
  /** `tickets.delete` — permanently removing a trashed ticket. */
  canDelete: boolean
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onOpenTicket: (id: string) => void
  onMove: (id: string, placement: TicketPlacement) => void
  onDeleteForever: (id: string) => void
}

export function TicketListTable({
  tickets,
  mailbox,
  canFile,
  canDelete,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onOpenTicket,
  onMove,
  onDeleteForever,
}: TicketListTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-gray-200 px-6 py-16 text-center">
        <MessageSquare className="h-5 w-5 text-gray-300" />
        <p className="text-sm text-gray-500">Nothing in {mailbox === 'all' ? 'this view' : mailbox}.</p>
        <p className="text-xs text-gray-400">Tickets raised from a chat land here automatically.</p>
      </div>
    )
  }

  const inStorage = isStorageMailbox(mailbox)
  const allSelected = tickets.every((ticket) => selectedIds.includes(ticket.id))

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-[940px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-[#F7F7F8] text-xs tracking-wide text-gray-600 uppercase">
            <th className="w-10 p-4">
              <Checkbox checked={allSelected} onCheckedChange={onToggleSelectAll} aria-label="Select all tickets" />
            </th>
            <th className="p-4 font-medium">Requester</th>
            <th className="p-4 font-medium">Subject</th>
            <th className="p-4 font-medium">Priority</th>
            <th className="p-4 font-medium">Agent</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium">Updated</th>
            <th className="w-12 p-4" />
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket, index) => {
            const priority = priorityMeta[ticket.priority]
            const status = statusMeta[ticket.status]
            const isSelected = selectedIds.includes(ticket.id)

            return (
              <tr
                key={ticket.id}
                className={cn(
                  index !== tickets.length - 1 && 'border-b border-gray-100',
                  isSelected ? 'bg-[#E8EFE9]/40' : 'hover:bg-gray-50',
                )}
              >
                <td className="p-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(ticket.id)}
                    aria-label={`Select ${ticket.reference}`}
                  />
                </td>

                <td className="p-4">
                  <span className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                        ticket.requester.avatarColor,
                      )}
                    >
                      {hasRequesterName(ticket.requester) ? ticket.requester.initials : <UserRound className="h-3.5 w-3.5" />}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className={cn('truncate', hasRequesterName(ticket.requester) ? 'text-gray-900' : 'text-gray-500 italic')}>
                        {requesterDisplayName(ticket.requester)}
                      </span>
                      <span className="truncate text-xs text-gray-400">{ticket.requester.email}</span>
                    </span>
                  </span>
                </td>

                <td className="max-w-80 p-4">
                  <button type="button" onClick={() => onOpenTicket(ticket.id)} className="group text-left">
                    <span className="flex items-center gap-1.5">
                      {ticket.unreadReplies > 0 && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1B5E20]" title="Unread reply" />
                      )}
                      <span
                        className={cn(
                          'truncate group-hover:underline',
                          ticket.unreadReplies > 0 ? 'font-semibold text-gray-900' : 'text-gray-800',
                        )}
                      >
                        {ticket.subject}
                      </span>
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
                      <span className="font-mono">{ticket.reference}</span>
                      <span>·</span>
                      <span>{channelMeta[ticket.channel].label}</span>
                      {ticket.isOverdue && !inStorage && (
                        <span className="flex items-center gap-0.5 font-medium text-rose-600">
                          <TriangleAlert className="h-3 w-3" />
                          Overdue
                        </span>
                      )}
                    </span>
                  </button>
                </td>

                <td className="p-4">
                  <span className="flex items-center gap-1.5">
                    <span className={cn('h-4 w-1 shrink-0 rounded-full', priority.bar)} />
                    <span className="text-xs text-gray-600">{priority.label}</span>
                  </span>
                </td>

                <td className="p-4">
                  <span className={cn('text-xs', ticket.assigneeId ? 'text-gray-700' : 'text-amber-600')}>
                    {assigneeName(ticket.assigneeId)}
                  </span>
                </td>

                <td className="p-4">
                  <Badge className={status.className}>{status.label}</Badge>
                </td>

                <td className="p-4">
                  <span className="text-xs text-gray-500">{ticket.updatedAt}</span>
                  {ticket.placement === 'trash' && ticket.trashedOn && (
                    <span className="mt-0.5 block text-[11px] text-gray-400">Trashed {ticket.trashedOn}</span>
                  )}
                </td>

                <td className="p-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label={`Actions for ${ticket.reference}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      ⋯
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-52">
                      <DropdownMenuItem onClick={() => onOpenTicket(ticket.id)}>Open ticket</DropdownMenuItem>
                      {(canFile || canDelete) && <DropdownMenuSeparator />}
                      {inStorage ? (
                        <>
                          {canFile && (
                            <DropdownMenuItem onClick={() => onMove(ticket.id, 'inbox')}>
                              <RotateCw className="h-3.5 w-3.5" />
                              Restore to inbox
                            </DropdownMenuItem>
                          )}
                          {canDelete && mailbox === 'trash' && (
                            <DropdownMenuItem variant="destructive" onClick={() => onDeleteForever(ticket.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete permanently
                            </DropdownMenuItem>
                          )}
                        </>
                      ) : (
                        canFile && (
                          <>
                            <DropdownMenuItem onClick={() => onMove(ticket.id, 'archive')}>
                              <Archive className="h-3.5 w-3.5" />
                              Move to archive
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onMove(ticket.id, 'spam')}>
                              <Ban className="h-3.5 w-3.5" />
                              Mark as spam
                            </DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => onMove(ticket.id, 'trash')}>
                              <Trash2 className="h-3.5 w-3.5" />
                              Move to trash
                            </DropdownMenuItem>
                          </>
                        )
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
