import { Clock, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { planById } from '../data/mockUserManagementData'
import type { SeatAllocation } from '../types'

interface SeatSummaryProps {
  seats: SeatAllocation
  canInvite: boolean
  canRequestSeats: boolean
  /** Plan name, renewal date, seat cap and the pending-change banner are all
   * billing details — not a real feature yet, so V1 shows just the seat
   * count. Same v1/v2 split as Business Plan. */
  showBillingDetails: boolean
  onInvite: () => void
  onRequestSeats: () => void
}

export function SeatSummary({
  seats,
  canInvite,
  canRequestSeats,
  showBillingDetails,
  onInvite,
  onRequestSeats,
}: SeatSummaryProps) {
  const remaining = Math.max(seats.total - seats.used, 0)
  const isFull = remaining === 0
  const percentUsed = seats.total === 0 ? 0 : Math.min((seats.used / seats.total) * 100, 100)
  const currentPlan = planById(seats.planId)
  const pending = seats.pendingChange
  const pendingPlan = pending ? planById(pending.requestedPlanId) : null
  const isUpgrade = pendingPlan ? pendingPlan.id !== seats.planId : false

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <p
              className="text-2xl font-bold text-gray-900"
              title="Accounts are created by Mercury 360. This workspace invites existing accounts into the seats it has been allocated, and frees a seat when someone is removed."
            >
              {seats.used}
              <span className="text-base font-medium text-gray-400"> / {seats.total} seats</span>
            </p>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                isFull ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700',
              )}
            >
              {isFull ? 'All seats in use' : `${remaining} available`}
            </span>
          </div>
          {showBillingDetails && (
            <p className="mt-1 text-sm text-[#6E7678]">
              {seats.planName} · {currentPlan.seatCap} seat cap · renews {seats.renewsOn}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canInvite && (
            <Button
              onClick={onInvite}
              disabled={isFull}
              title={isFull ? (canRequestSeats ? 'No seats available — request more first' : 'No seats available') : undefined}
              className="bg-[#1B5E20] text-white hover:bg-[#1B5E20]/90"
            >
              <UserPlus className="h-4 w-4" />
              Invite to workspace
            </Button>
          )}
          {canRequestSeats && (
            <Button variant="outline" onClick={onRequestSeats}>
              {isFull || seats.total >= currentPlan.seatCap ? 'Add seats or change plan' : 'Request more seats'}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn('h-full rounded-full transition-all', isFull ? 'bg-rose-500' : 'bg-[#1B5E20]')}
          style={{ width: `${percentUsed}%` }}
        />
      </div>

      {showBillingDetails && pending && pendingPlan && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-amber-800">
              {isUpgrade
                ? `Upgrade to ${pendingPlan.name} requested — ${pending.requestedSeats} seats`
                : `${pending.requestedSeats - seats.total} more seats requested`}
            </p>
            <p className="mt-0.5 text-[11px] text-amber-700">
              Sent {pending.requestedOn}, waiting on Mercury 360. You still have {seats.total} seats until it is
              approved.
            </p>
          </div>
        </div>
      )}


    </div>
  )
}
