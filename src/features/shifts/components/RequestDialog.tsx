import { useState } from 'react'
import { agents } from '@/features/chat'
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
import { useViewer } from '@/stores/useWorkspaceRoleStore'
import type { Shift, ShiftRequestType } from '../types'
import { requestTypeMeta } from '../utils/shiftMeta'
import { useShiftRequests } from '../hooks/useShiftRequests'

const NO_ONE = 'anyone'

interface RequestDialogProps {
  shifts: Shift[]
  onClose: () => void
}

/** One dialog for all three request types — the fields that only apply to one type stay conditional. */
export function RequestDialog({ shifts, onClose }: RequestDialogProps) {
  const viewer = useViewer()
  const { createRequest } = useShiftRequests()

  const myShifts = shifts.filter((shift) => shift.agentId === viewer.agentId && shift.status === 'scheduled')
  const [type, setType] = useState<ShiftRequestType>('swap')
  const [shiftId, setShiftId] = useState(myShifts[0]?.id ?? '')
  const [swapWithShiftId, setSwapWithShiftId] = useState('')
  const [coverAgentId, setCoverAgentId] = useState(NO_ONE)
  const [reason, setReason] = useState('')

  const otherShifts = shifts.filter((shift) => shift.id !== shiftId && shift.status === 'scheduled')

  function handleSubmit() {
    if (!shiftId) return
    createRequest({
      id: `req-${Date.now()}`,
      type,
      requestedBy: viewer.agentId,
      shiftId,
      swapWithShiftId: type === 'swap' ? swapWithShiftId || undefined : undefined,
      coverAgentId: type === 'cover' && coverAgentId !== NO_ONE ? coverAgentId : undefined,
      reason: reason.trim() || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a change</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          {myShifts.length === 0 ? (
            <p className="text-sm text-gray-500">You have no upcoming scheduled shifts to raise a request against.</p>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Type</span>
                <Select value={type} onValueChange={(value) => setType(value as ShiftRequestType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['swap', 'cover', 'leave'] as const).map((option) => (
                      <SelectItem key={option} value={option}>
                        {requestTypeMeta[option].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Your shift</span>
                <Select value={shiftId} onValueChange={(value) => setShiftId(value as string)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {myShifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {shift.date} · {shift.startTime}–{shift.endTime}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {type === 'swap' && (
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-700">Swap with</span>
                  <Select value={swapWithShiftId} onValueChange={(value) => setSwapWithShiftId(value as string)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {otherShifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {agents.find((a) => a.id === shift.agentId)?.name} · {shift.date} · {shift.startTime}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {type === 'cover' && (
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-700">Ask a specific person? (optional)</span>
                  <Select value={coverAgentId} onValueChange={(value) => setCoverAgentId(value as string)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_ONE}>Anyone available</SelectItem>
                      {agents
                        .filter((agent) => agent.id !== viewer.agentId)
                        .map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Reason</span>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
              </div>
            </>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {myShifts.length > 0 && (
            <DialogPrimaryButton className="w-auto px-6" onClick={handleSubmit}>
              Submit request
            </DialogPrimaryButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
