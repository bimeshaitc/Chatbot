import { Archive, Ban, Inbox, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { TicketMailbox } from '../types'
import type { MailboxDefinition } from '../utils/ticketMeta'

const groupLabels: Record<string, string> = {
  queues: '',
  states: 'Statuses',
  storage: 'Folders',
}

const storageIcons: Partial<Record<TicketMailbox, typeof Inbox>> = {
  archive: Archive,
  spam: Ban,
  trash: Trash2,
}

interface TicketMailboxPanelProps {
  /** Already filtered to what this role's scope may see — see `visibleTicketMailboxes`. */
  mailboxes: MailboxDefinition[]
  countByMailbox: Record<TicketMailbox, number>
  activeMailbox: TicketMailbox
  search: string
  /** `tickets.create` — a view-only ticket CSR can't raise new ones either. */
  canCreate: boolean
  onSearchChange: (value: string) => void
  onSelectMailbox: (mailbox: TicketMailbox) => void
  onCreateTicket: () => void
}

export function TicketMailboxPanel({
  mailboxes,
  countByMailbox,
  activeMailbox,
  search,
  canCreate,
  onSearchChange,
  onSelectMailbox,
  onCreateTicket,
}: TicketMailboxPanelProps) {
  const groups = ['queues', 'states', 'storage'] as const

  return (
    <div className="flex w-full shrink-0 flex-col gap-3 lg:w-60">
      {canCreate && (
        <Button onClick={onCreateTicket} className="w-full bg-[#1B5E20] text-white hover:bg-[#1B5E20]/90">
          <Plus className="h-4 w-4" />
          New ticket
        </Button>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search all tickets"
          aria-label="Search tickets"
          className="h-9 w-full rounded-lg border border-gray-200 pr-3 pl-9 text-sm outline-none focus:border-[#1B5E20]"
        />
      </div>

      <nav className="flex flex-col gap-3">
        {groups.map((group) => {
          const items = mailboxes.filter((mailbox) => mailbox.group === group)
          if (items.length === 0) return null

          return (
            <div key={group} className="flex flex-col gap-0.5">
              {groupLabels[group] && (
                <p className="px-2 pt-1 pb-1 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
                  {groupLabels[group]}
                </p>
              )}
              {items.map((mailbox) => {
                const isActive = activeMailbox === mailbox.value
                const count = countByMailbox[mailbox.value]
                const Icon = storageIcons[mailbox.value]

                return (
                  <button
                    key={mailbox.value}
                    type="button"
                    onClick={() => onSelectMailbox(mailbox.value)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                      isActive
                        ? 'bg-[#E8EFE9] font-medium text-[#1B5E20]'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    )}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                    <span className="min-w-0 flex-1 truncate">{mailbox.label}</span>
                    {count > 0 && (
                      <span
                        className={cn(
                          'shrink-0 text-xs',
                          mailbox.value === 'overdue' && !isActive
                            ? 'font-medium text-rose-600'
                            : isActive
                              ? 'text-[#1B5E20]'
                              : 'text-gray-400',
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
