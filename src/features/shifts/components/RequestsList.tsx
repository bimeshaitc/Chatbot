import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usePermission } from '@/stores/useWorkspaceRoleStore'
import type { Shift, ShiftRequest } from '../types'
import { ApprovalRow } from './ApprovalRow'
import { RequestDialog } from './RequestDialog'

interface RequestsListProps {
  requests: ShiftRequest[]
  shifts: Shift[]
}

export function RequestsList({ requests, shifts }: RequestsListProps) {
  const canRequest = usePermission('shifts.request')
  const [showDialog, setShowDialog] = useState(false)
  const sorted = [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="mt-4 flex flex-col gap-3">
      {canRequest && (
        <div className="flex justify-end">
          <Button onClick={() => setShowDialog(true)} className="h-8 w-auto px-3 text-xs">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Raise a request
          </Button>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400">No requests yet.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sorted.map((request) => (
            <ApprovalRow
              key={request.id}
              request={request}
              shift={shifts.find((shift) => shift.id === request.shiftId)}
            />
          ))}
        </div>
      )}

      {showDialog && <RequestDialog shifts={shifts} onClose={() => setShowDialog(false)} />}
    </div>
  )
}
