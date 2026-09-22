import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { agents, useConversations, type Conversation } from '@/features/chat'
import { useTickets, type Ticket } from '@/features/tickets'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useViewer } from '@/stores/useWorkspaceRoleStore'
import type { Shift } from '../types'
import { useHandovers } from '../hooks/useHandovers'

const UNASSIGNED = 'unassigned'

interface CoveringDialogProps {
  shift: Shift
  openChats: Conversation[]
  openTickets: Ticket[]
  onClose: () => void
}

/**
 * Unplanned, lead-initiated — for an absent or disconnected agent. Kept
 * visually distinct (amber, "Reassigned by lead" everywhere) so nobody
 * mistakes a lead's emergency reassignment for the agent's own handover.
 */
export function CoveringDialog({ shift, openChats, openTickets, onClose }: CoveringDialogProps) {
  const viewer = useViewer()
  const { conversations, patchConversation } = useConversations()
  const { tickets, assign } = useTickets()
  const { createHandover } = useHandovers()

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
      initiatedBy: 'lead',
      reason: 'covering',
      reassignedByAgentId: viewer.agentId,
      note: note.trim() || undefined,
      conversations,
      tickets,
      agents,
      patchConversation,
      assignTicket: assign,
    })
    onClose()
  }

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader className="bg-amber-600">
          <DialogTitle className="flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Reassign — covering
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
            This agent didn't hand their work off themselves. Reassigning{' '}
            <span className="font-medium">{openChats.length} open chat(s)</span> and{' '}
            <span className="font-medium">{openTickets.length} open ticket(s)</span> on their behalf — this is
            recorded as "Reassigned by lead", not a normal handover.
          </p>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Reassign to</span>
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
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Reason</span>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why this is being reassigned by a lead"
              rows={3}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="w-auto px-6 bg-amber-600 text-white hover:bg-amber-700">
            Reassign now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
