import { useState } from 'react'
import { agents, useConversations, type Conversation } from '@/features/chat'
import { useTickets, type Ticket } from '@/features/tickets'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPrimaryButton,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Shift } from '../types'
import { useHandovers } from '../hooks/useHandovers'
import { useShifts } from '../hooks/useShifts'

const UNASSIGNED = 'unassigned'

interface HandoverDialogProps {
  shift: Shift
  openChats: Conversation[]
  openTickets: Ticket[]
  onClose: () => void
}

/** Self-initiated, planned, at shift end — the outgoing agent picks a destination for what's still open. */
export function HandoverDialog({ shift, openChats, openTickets, onClose }: HandoverDialogProps) {
  const { conversations, patchConversation } = useConversations()
  const { tickets, assign } = useTickets()
  const { createHandover } = useHandovers()
  const { patchShift } = useShifts()

  // Whoever else covers the same groups is the natural next destination — if
  // nobody does, "Unassigned pool" is pre-selected rather than left blank.
  const candidates = agents.filter(
    (agent) => agent.id !== shift.agentId && agent.groups.some((g) => shift.groups.includes(g)),
  )
  const [toAgentId, setToAgentId] = useState(candidates[0]?.id ?? UNASSIGNED)
  const [note, setNote] = useState('')

  function handleSubmit() {
    createHandover({
      shiftId: shift.id,
      fromAgentId: shift.agentId,
      toAgentId: toAgentId === UNASSIGNED ? null : toAgentId,
      initiatedBy: 'self',
      reason: 'shift-end',
      note: note.trim() || undefined,
      conversations,
      tickets,
      agents,
      patchConversation,
      assignTicket: assign,
    })
    patchShift(shift.id, { status: 'completed' })
    onClose()
  }

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hand over shift</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <p className="text-xs text-gray-500">
            Moving <span className="font-medium text-gray-700">{openChats.length} open chat(s)</span> and{' '}
            <span className="font-medium text-gray-700">{openTickets.length} open ticket(s)</span> to the next agent.
          </p>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Hand off to</span>
            <Select value={toAgentId} onValueChange={(value) => setToAgentId(value as string)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Unassigned pool</SelectItem>
                {agents
                  .filter((agent) => agent.id !== shift.agentId)
                  .map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {toAgentId === UNASSIGNED && candidates.length === 0 && (
              <p className="text-xs text-amber-600">Nobody else is scheduled for these groups right now.</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Handover note</span>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything the next agent should know about what's open"
              rows={3}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <DialogPrimaryButton className="w-auto px-6" onClick={handleSubmit}>
            Complete handover
          </DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
