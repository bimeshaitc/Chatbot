import { useState } from 'react'
import { agents, useConversations } from '@/features/chat'
import { useTickets } from '@/features/tickets'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useViewer } from '@/stores/useWorkspaceRoleStore'
import type { Shift } from '../types'
import { getOpenChats, getOpenTickets } from '../utils/openItems'
import { shiftStatusMeta } from '../utils/shiftMeta'
import { useShifts } from '../hooks/useShifts'
import { HandoverDialog } from './HandoverDialog'
import { CoveringDialog } from './CoveringDialog'

interface ShiftDetailDialogProps {
  shift: Shift
  canManage: boolean
  onClose: () => void
}

export function ShiftDetailDialog({ shift, canManage, onClose }: ShiftDetailDialogProps) {
  const viewer = useViewer()
  const { conversations } = useConversations()
  const { tickets } = useTickets()
  const { patchShift } = useShifts()
  const [showHandover, setShowHandover] = useState(false)
  const [showCovering, setShowCovering] = useState(false)

  const agent = agents.find((a) => a.id === shift.agentId)
  const openChats = getOpenChats(conversations, shift.agentId)
  const openTickets = getOpenTickets(tickets, shift.agentId)
  const openCount = openChats.length + openTickets.length
  const isOwnShift = shift.agentId === viewer.agentId
  const meta = shiftStatusMeta[shift.status]

  function closeOutShift() {
    // Zero open items — nothing to hand off, the shift just closes.
    patchShift(shift.id, { status: 'completed' })
    onClose()
  }

  return (
    <>
      <Dialog open={!showHandover && !showCovering} onOpenChange={(next) => !next && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{agent?.name ?? shift.agentId}'s shift</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {shift.date} · {shift.startTime}–{shift.endTime}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.className}`}>{meta.label}</span>
            </div>
            <div className="text-sm text-gray-600">Groups: {shift.groups.join(', ')}</div>
            {shift.notes && <p className="rounded-lg bg-gray-50 p-2.5 text-xs text-gray-600">{shift.notes}</p>}

            <div className="rounded-lg border border-gray-200 p-3 text-sm">
              {openCount === 0 ? (
                <p className="text-gray-500">No open chats or tickets on this shift.</p>
              ) : (
                <p className="text-gray-700">
                  <span className="font-semibold">{openChats.length}</span> open chat
                  {openChats.length === 1 ? '' : 's'} and <span className="font-semibold">{openTickets.length}</span>{' '}
                  open ticket{openTickets.length === 1 ? '' : 's'} still assigned to {agent?.name ?? 'this agent'}.
                </p>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {isOwnShift && (shift.status === 'scheduled' || shift.status === 'in-progress') && (
              <Button
                onClick={() => (openCount === 0 ? closeOutShift() : setShowHandover(true))}
                className="bg-[#1B5E20] text-white hover:bg-[#1B5E20]/90"
              >
                {openCount === 0 ? 'End shift' : 'Hand over'}
              </Button>
            )}
            {!isOwnShift && canManage && openCount > 0 && (
              <Button onClick={() => setShowCovering(true)} className="bg-amber-600 text-white hover:bg-amber-700">
                Reassign (covering)
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showHandover && (
        <HandoverDialog
          shift={shift}
          openChats={openChats}
          openTickets={openTickets}
          onClose={() => {
            setShowHandover(false)
            onClose()
          }}
        />
      )}
      {showCovering && (
        <CoveringDialog
          shift={shift}
          openChats={openChats}
          openTickets={openTickets}
          onClose={() => {
            setShowCovering(false)
            onClose()
          }}
        />
      )}
    </>
  )
}
