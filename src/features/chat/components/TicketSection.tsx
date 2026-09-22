import { Plus, TicketIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { agents } from '../data/mockChatData'
import { ticketPriorityMeta, ticketStatusMeta } from '@/features/tickets'
import type { Ticket, TicketStatus } from '@/features/tickets'
import { useCategories } from '@/features/category'

/** Tickets still needing attention sort above the ones that are done. */
const openStatuses: TicketStatus[] = ['open', 'pending', 'on-hold']

function labelFor(list: { id: string; name: string }[], id: string | null, fallback: string) {
  if (!id) return fallback
  return list.find((entry) => entry.id === id)?.name ?? fallback
}

interface TicketSectionProps {
  tickets: Ticket[]
  onCreateTicket: () => void
}

export function TicketSection({ tickets, onCreateTicket }: TicketSectionProps) {
  const { categories } = useCategories()
  const openCount = tickets.filter((ticket) => openStatuses.includes(ticket.status)).length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">
            Tickets {tickets.length > 0 && <span className="font-normal text-gray-400">({tickets.length})</span>}
          </p>
          {tickets.length > 0 && (
            <p className="text-[11px] text-gray-400">
              {openCount} open · {tickets.length - openCount} closed
            </p>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={onCreateTicket}>
          <Plus className="h-3.5 w-3.5" />
          Create
        </Button>
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
          <TicketIcon className="h-5 w-5 text-gray-300" />
          <p className="text-sm text-gray-500">No tickets for this chat yet.</p>
          <p className="text-xs text-gray-400">Raise one to track the issue beyond this conversation.</p>
          <Button size="sm" className="mt-1" onClick={onCreateTicket}>
            Create Ticket
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {tickets.map((ticket) => {
            const priority = ticketPriorityMeta[ticket.priority]
            const status = ticketStatusMeta[ticket.status]

            return (
              <li key={ticket.id} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 text-sm font-medium text-gray-900">{ticket.subject}</p>
                  <span className="shrink-0 font-mono text-[11px] text-gray-400">{ticket.reference}</span>
                </div>

                {ticket.description && <p className="mt-1 text-xs text-gray-500">{ticket.description}</p>}

                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge className={status.className}>{status.label}</Badge>
                  <Badge className={priority.className}>{priority.label}</Badge>
                  <Badge variant="gray">{labelFor(categories, ticket.categoryId, 'Uncategorised')}</Badge>
                </div>

                <dl className="mt-2.5 flex flex-col gap-1 border-t border-gray-100 pt-2 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500">Assignee</dt>
                    <dd className="font-medium text-gray-700">{labelFor(agents, ticket.assigneeId, 'Unassigned')}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500">Due</dt>
                    <dd className="text-gray-600">{ticket.dueOn}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500">Created</dt>
                    <dd className="text-gray-600">
                      {ticket.createdAt} · {ticket.createdBy}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500">Updated</dt>
                    <dd className="text-gray-600">{ticket.updatedAt}</dd>
                  </div>
                </dl>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
