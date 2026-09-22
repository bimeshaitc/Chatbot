import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Archive, Ban, RotateCw, Trash2, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/PageHeader'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import { usePermission, useScope, useViewer } from '@/stores/useWorkspaceRoleStore'
import type { NewTicketInput, ReplyMode, TicketMailbox, TicketPlacement } from '../types'
import { ticketAgents } from '../data/mockTicketsData'
import { useTickets } from '../hooks/useTickets'
import { ACTIVE_STATUSES, isStorageMailbox, priorityMeta, ticketMailboxes, visibleTicketMailboxes } from '../utils/ticketMeta'
import { scopeTickets } from '../utils/ticketScope'
import { requesterDisplayName } from '../utils/requesterIdentity'
import { CreateTicketDialog } from './CreateTicketDialog'
import { TicketDetail } from './TicketDetail'
import { TicketListTable } from './TicketListTable'
import { TicketMailboxPanel } from './TicketMailboxPanel'
import { TicketPropertiesPanel } from './TicketPropertiesPanel'

export function TicketsPage() {
  const navigate = useNavigate()
  const {
    tickets,
    setStatus,
    setPriority,
    assign,
    setTags,
    move,
    moveMany,
    deleteForever,
    addReply,
    markRead,
    createTicket,
  } = useTickets()

  // The prototype's real identity for scoping — not the hook's hardcoded
  // CURRENT_AGENT_ID, so switching roles in the header actually changes whose
  // tickets "mine" and `own` scope resolve to.
  const viewer = useViewer()
  const currentAgentId = viewer.agentId
  const scope = useScope('tickets')
  const canFile = usePermission('tickets.file')
  const canDelete = usePermission('tickets.delete')
  const canAssign = usePermission('tickets.assign')
  const canCreate = usePermission('tickets.create')
  const canReply = usePermission('tickets.reply')
  const canSetStatus = usePermission('tickets.setStatus')

  const [mailbox, setMailbox] = useState<TicketMailbox>('all')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [openTicketId, setOpenTicketId] = useState<string | null>(null)
  const [isCreateOpen, setCreateOpen] = useState(false)

  const debouncedSearch = useDebounce(search)

  const scopedTickets = useMemo(
    () => scopeTickets(tickets, scope, currentAgentId, ticketAgents),
    [tickets, scope, currentAgentId],
  )

  // Derived, not stored: if a role switch makes the selected mailbox invisible
  // (e.g. "All tickets" while previewing as a CSR), fall back to the first
  // mailbox that role can actually see rather than needing an effect to reset it.
  const visibleMailboxes = useMemo(() => visibleTicketMailboxes(scope), [scope])
  const effectiveMailbox = visibleMailboxes.some((entry) => entry.value === mailbox)
    ? mailbox
    : (visibleMailboxes[0]?.value ?? 'mine')

  /**
   * Working mailboxes only ever show inbox tickets — archive, spam and trash
   * are reached explicitly. That is what keeps a spam ticket out of "Open"
   * while still letting it keep its own status.
   */
  function matchesMailbox(ticket: (typeof tickets)[number], target: TicketMailbox) {
    switch (target) {
      case 'archive':
        return ticket.placement === 'archive'
      case 'spam':
        return ticket.placement === 'spam'
      case 'trash':
        return ticket.placement === 'trash'
      case 'mine':
        return ticket.placement === 'inbox' && ticket.assigneeId === currentAgentId
      case 'unassigned':
        return ticket.placement === 'inbox' && ticket.assigneeId === null
      case 'overdue':
        return ticket.placement === 'inbox' && ticket.isOverdue && ACTIVE_STATUSES.includes(ticket.status)
      case 'open':
        return ticket.placement === 'inbox' && ticket.status === 'open'
      case 'pending':
        return ticket.placement === 'inbox' && ticket.status === 'pending'
      case 'solved':
        return ticket.placement === 'inbox' && (ticket.status === 'solved' || ticket.status === 'closed')
      default:
        return ticket.placement === 'inbox'
    }
  }

  const countByMailbox = useMemo(() => {
    const counts = {} as Record<TicketMailbox, number>
    for (const definition of visibleMailboxes) {
      counts[definition.value] = scopedTickets.filter((ticket) => matchesMailbox(ticket, definition.value)).length
    }
    return counts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopedTickets, visibleMailboxes, currentAgentId])

  const visibleTickets = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()
    return scopedTickets
      .filter((ticket) => matchesMailbox(ticket, effectiveMailbox))
      .filter((ticket) => {
        if (!query) return true
        return [ticket.subject, ticket.reference, ticket.requester.name, ticket.requester.email, ...ticket.tags]
          .join(' ')
          .toLowerCase()
          .includes(query)
      })
      // Most urgent first, so the queue reads top-down.
      .sort((a, b) => priorityMeta[b.priority].rank - priorityMeta[a.priority].rank)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopedTickets, effectiveMailbox, debouncedSearch, currentAgentId])

  const openTicket = openTicketId ? (tickets.find((ticket) => ticket.id === openTicketId) ?? null) : null
  const openIndex = openTicket ? visibleTickets.findIndex((ticket) => ticket.id === openTicket.id) : -1

  function handleOpenTicket(id: string) {
    setOpenTicketId(id)
    markRead(id)
    setSelectedIds([])
  }

  function stepTicket(delta: number) {
    const next = visibleTickets[openIndex + delta]
    if (next) handleOpenTicket(next.id)
  }

  function handleSelectMailbox(next: TicketMailbox) {
    setMailbox(next)
    setOpenTicketId(null)
    setSelectedIds([])
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]))
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => (prev.length === visibleTickets.length ? [] : visibleTickets.map((t) => t.id)))
  }

  function handleMove(id: string, placement: TicketPlacement) {
    move(id, placement)
    // Leaving the ticket open after filing it would show a row that no longer
    // belongs to this mailbox, so step back to the list.
    if (openTicketId === id) setOpenTicketId(null)
    toast.success(placement === 'inbox' ? 'Restored to the inbox' : `Moved to ${placement}`)
  }

  function handleBulkMove(placement: TicketPlacement) {
    moveMany(selectedIds, placement)
    toast.success(
      `${selectedIds.length} ticket${selectedIds.length === 1 ? '' : 's'} ${
        placement === 'inbox' ? 'restored' : `moved to ${placement}`
      }`,
    )
    setSelectedIds([])
  }

  function handleDeleteForever(ids: string[]) {
    if (!window.confirm(`Permanently delete ${ids.length} ticket${ids.length === 1 ? '' : 's'}? This cannot be undone.`))
      return
    deleteForever(ids)
    if (openTicketId && ids.includes(openTicketId)) setOpenTicketId(null)
    setSelectedIds([])
    toast.success('Deleted permanently')
  }

  function handleReply(body: string, mode: ReplyMode, attachmentName?: string) {
    if (!openTicket) return
    addReply(openTicket.id, body, mode, attachmentName)
    toast.success(mode === 'note' ? 'Note saved for your team' : `Emailed ${requesterDisplayName(openTicket.requester)}`)
  }

  function handleCreate(input: NewTicketInput, requester: { name: string; email: string }) {
    const initials = requester.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
    const ticket = createTicket(input, {
      requester: { ...requester, initials, avatarColor: 'bg-sky-200 text-sky-700' },
    })
    setCreateOpen(false)
    setMailbox('all')
    setOpenTicketId(ticket.id)
    toast.success(`${ticket.reference} created`)
  }

  const inStorage = isStorageMailbox(effectiveMailbox)
  const mailboxLabel = ticketMailboxes.find((entry) => entry.value === effectiveMailbox)?.label ?? 'All tickets'

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-4">
      <PageHeader title="Tickets" description="Every ticket, wherever it came from" />

      <div className="flex flex-col gap-4 lg:flex-row">
        <TicketMailboxPanel
          mailboxes={visibleMailboxes}
          countByMailbox={countByMailbox}
          activeMailbox={effectiveMailbox}
          search={search}
          canCreate={canCreate}
          onSearchChange={setSearch}
          onSelectMailbox={handleSelectMailbox}
          onCreateTicket={() => setCreateOpen(true)}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {openTicket ? (
            <div className="flex min-w-0 flex-col gap-4 lg:flex-row">
              <TicketDetail
                ticket={openTicket}
                position={{ index: Math.max(openIndex, 0), total: visibleTickets.length }}
                canFile={canFile}
                canDelete={canDelete}
                canReply={canReply}
                canSetStatus={canSetStatus}
                onBack={() => setOpenTicketId(null)}
                onPrevious={() => stepTicket(-1)}
                onNext={() => stepTicket(1)}
                onReply={handleReply}
                onMove={(placement) => handleMove(openTicket.id, placement)}
                onDeleteForever={() => handleDeleteForever([openTicket.id])}
                onSetStatus={(status) => setStatus(openTicket.id, status)}
              />
              <TicketPropertiesPanel
                ticket={openTicket}
                canAssign={canAssign}
                canSetStatus={canSetStatus}
                onSetStatus={(status) => setStatus(openTicket.id, status)}
                onSetPriority={(priority) => setPriority(openTicket.id, priority)}
                onAssign={(assigneeId) =>
                  assign(
                    openTicket.id,
                    assigneeId,
                    ticketAgents.find((agent) => agent.id === assigneeId)?.name ?? 'nobody',
                  )
                }
                onSetTags={(tags) => setTags(openTicket.id, tags)}
                onOpenConversation={(conversationId) => navigate(`/chat/finance/${conversationId}`)}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{mailboxLabel}</p>
                  <p className="text-xs text-[#6E7678]">
                    {visibleTickets.length} ticket{visibleTickets.length === 1 ? '' : 's'}
                    {search.trim() && ` matching "${search.trim()}"`}
                  </p>
                </div>

                {selectedIds.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-gray-200 bg-[#F7F7F8] px-2 py-1.5">
                    <span className="px-1 text-xs font-medium text-gray-700">{selectedIds.length} selected</span>
                    {inStorage ? (
                      <>
                        {canFile && (
                          <Button variant="ghost" size="sm" onClick={() => handleBulkMove('inbox')}>
                            <RotateCw className="h-3.5 w-3.5" />
                            Restore
                          </Button>
                        )}
                        {canDelete && effectiveMailbox === 'trash' && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteForever(selectedIds)}>
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete forever
                          </Button>
                        )}
                      </>
                    ) : (
                      canFile && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleBulkMove('archive')}>
                            <Archive className="h-3.5 w-3.5" />
                            Archive
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleBulkMove('spam')}>
                            <Ban className="h-3.5 w-3.5" />
                            Spam
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleBulkMove('trash')}>
                            <Trash2 className="h-3.5 w-3.5" />
                            Trash
                          </Button>
                        </>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedIds([])}
                      aria-label="Clear selection"
                      className={cn('flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-white')}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <TicketListTable
                tickets={visibleTickets}
                mailbox={effectiveMailbox}
                canFile={canFile}
                canDelete={canDelete}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={toggleSelectAll}
                onOpenTicket={handleOpenTicket}
                onMove={handleMove}
                onDeleteForever={(id) => handleDeleteForever([id])}
              />
            </>
          )}
        </div>
      </div>

      {isCreateOpen && <CreateTicketDialog onClose={() => setCreateOpen(false)} onCreate={handleCreate} />}
    </div>
  )
}
