import { AlertTriangle, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { agents } from '@/features/chat'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPrimaryButton,
  DialogTitle,
} from '@/components/ui/dialog'
import { useIncomingHandover } from '../hooks/useIncomingHandover'

/**
 * Mounted globally in `AppLayout`, unlike chat's `NewAssignmentModal` (which
 * is scoped to `/chat`) — a handover moves both chats and tickets, so no
 * single feature route is the "right" place to catch it.
 */
export function HandoverBatchModal() {
  const { incoming, acknowledge } = useIncomingHandover()
  const navigate = useNavigate()

  if (!incoming) return null

  const isCovering = incoming.reason === 'covering'
  const fromAgent = agents.find((agent) => agent.id === incoming.fromAgentId)?.name ?? incoming.fromAgentId
  const chatCount = incoming.items.filter((item) => item.kind === 'chat').length
  const ticketCount = incoming.items.filter((item) => item.kind === 'ticket').length

  return (
    <Dialog open onOpenChange={(next) => !next && acknowledge(incoming.id)}>
      <DialogContent>
        <DialogHeader className={isCovering ? 'bg-amber-600' : undefined}>
          <DialogTitle className="flex items-center gap-1.5">
            {isCovering ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <Sparkles className="h-4 w-4 shrink-0" />}
            {isCovering ? 'Work reassigned to you' : 'Shift handed over to you'}
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3">
          <p className="text-sm text-gray-600">
            {isCovering
              ? `A lead reassigned ${fromAgent}'s open work to you.`
              : `${fromAgent} handed their open work to you at shift end.`}
          </p>
          <div className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
            {chatCount} chat{chatCount === 1 ? '' : 's'} and {ticketCount} ticket{ticketCount === 1 ? '' : 's'} are
            now yours.
          </div>
          {incoming.note && <p className="rounded-lg bg-gray-50 p-2.5 text-xs text-gray-600">{incoming.note}</p>}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => acknowledge(incoming.id)}>
            Dismiss
          </Button>
          <DialogPrimaryButton
            className="w-auto px-6"
            onClick={() => {
              acknowledge(incoming.id)
              navigate('/shifts')
            }}
          >
            View handover
          </DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
