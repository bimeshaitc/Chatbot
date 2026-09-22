import { useState } from 'react'
import { agents } from '@/features/chat'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/textarea'
import { useViewer, usePermission } from '@/stores/useWorkspaceRoleStore'
import type { Shift, ShiftRequest } from '../types'
import { requestStatusMeta, requestTypeMeta } from '../utils/shiftMeta'
import { useShiftRequests } from '../hooks/useShiftRequests'

interface ApprovalRowProps {
  request: ShiftRequest
  shift?: Shift
}

function agentName(agentId: string) {
  return agents.find((agent) => agent.id === agentId)?.name ?? agentId
}

/** "Never their own" — hides its own controls when the viewer is the requester, on top of the hook-level guard. */
export function ApprovalRow({ request, shift }: ApprovalRowProps) {
  const viewer = useViewer()
  const canApprove = usePermission('shifts.approve')
  const { decide } = useShiftRequests()
  const [declining, setDeclining] = useState(false)
  const [declineReason, setDeclineReason] = useState('')

  const statusMeta = requestStatusMeta[request.status]
  const isOwnRequest = request.requestedBy === viewer.agentId
  const canDecide = canApprove && !isOwnRequest && request.status === 'pending'

  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="font-medium text-gray-800">{agentName(request.requestedBy)}</span>
          <span className="text-gray-500"> requested a {requestTypeMeta[request.type].label.toLowerCase()}</span>
          {shift && <span className="text-gray-400"> · {shift.date}</span>}
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusMeta.className}`}>
          {statusMeta.label}
        </span>
      </div>
      {request.reason && <p className="mt-1.5 text-xs text-gray-600">{request.reason}</p>}
      {request.status === 'declined' && request.declineReason && (
        <p className="mt-1.5 text-xs text-rose-600">Declined: {request.declineReason}</p>
      )}

      {canDecide && !declining && (
        <div className="mt-2.5 flex gap-2">
          <Button
            className="h-8 w-auto bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-700"
            onClick={() => decide(request.id, 'approved', viewer.agentId)}
          >
            Approve
          </Button>
          <Button variant="outline" className="h-8 w-auto px-3 text-xs" onClick={() => setDeclining(true)}>
            Decline
          </Button>
        </div>
      )}

      {canDecide && declining && (
        <div className="mt-2.5 flex flex-col gap-2">
          <Textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Reason for declining"
            rows={2}
          />
          <div className="flex gap-2">
            <Button
              className="h-8 w-auto bg-rose-600 px-3 text-xs text-white hover:bg-rose-700"
              onClick={() => decide(request.id, 'declined', viewer.agentId, declineReason.trim() || undefined)}
            >
              Confirm decline
            </Button>
            <Button variant="outline" className="h-8 w-auto px-3 text-xs" onClick={() => setDeclining(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
