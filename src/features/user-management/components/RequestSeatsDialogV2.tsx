import { useState } from 'react'
import { Check, Info, Lock, Minus, Plus, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPrimaryButton,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { formatMoney, planById, planTiers, smallestPlanFor } from '../data/mockUserManagementData'
import type { SeatAllocation } from '../types'

interface RequestSeatsDialogV2Props {
  seats: SeatAllocation
  onClose: () => void
  onRequest: (requestedSeats: number, planId: string, reason: string) => void
}

/**
 * V2 visual redesign of Request seats — the seat stepper and the cost
 * summary sit side by side in one hero row instead of stacked, and the plan
 * tiers are laid out as a wider comparison strip so "what changes" is
 * visible without scrolling past three tall cards first.
 */
export function RequestSeatsDialogV2({ seats, onClose, onRequest }: RequestSeatsDialogV2Props) {
  const currentPlan = planById(seats.planId)

  const [requestedSeats, setRequestedSeats] = useState(seats.total + 2)
  const [planId, setPlanId] = useState(seats.planId)
  const [reason, setReason] = useState('')

  const requiredPlan = smallestPlanFor(requestedSeats)
  const selectedPlan = planById(planId)
  const needsUpgrade = requiredPlan ? requiredPlan.seatCap > currentPlan.seatCap : false
  const selectionTooSmall = requestedSeats > selectedPlan.seatCap
  const beyondEveryTier = requiredPlan === null

  const currentMonthly = seats.total * currentPlan.pricePerSeat
  const newMonthly = requestedSeats * selectedPlan.pricePerSeat
  const difference = newMonthly - currentMonthly

  function setSeatCount(next: number) {
    const clamped = Math.max(seats.used, Math.min(next, 200))
    setRequestedSeats(clamped)
    const minimum = smallestPlanFor(clamped)
    if (minimum && minimum.seatCap > planById(planId).seatCap) setPlanId(minimum.id)
  }

  const canSubmit = requestedSeats > seats.total && !selectionTooSmall && !beyondEveryTier

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Request seats or change plan</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-5">
          <p className="flex items-start gap-1.5 rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-[#6E7678]">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
            Mercury 360 owns billing, so this is a request rather than a purchase.
          </p>

          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-100 bg-[#F7F7F8] p-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">How many seats?</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setSeatCount(requestedSeats - 1)}
                    disabled={requestedSeats <= seats.used}
                    aria-label="One seat fewer"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-10 text-center text-sm font-semibold text-gray-900 tabular-nums">
                    {requestedSeats}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSeatCount(requestedSeats + 1)}
                    aria-label="One seat more"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex gap-1">
                  {[5, 10, 25].map((jump) => (
                    <button
                      key={jump}
                      type="button"
                      onClick={() => setSeatCount(seats.total + jump)}
                      className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      +{jump}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-gray-500">
                {seats.total} seats today, {seats.used} in use.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-1 rounded-xl bg-white p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Today</span>
                <span className="tabular-nums text-gray-700">{formatMoney(currentMonthly)}/mo</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Requested</span>
                <span className="tabular-nums font-medium text-gray-900">{formatMoney(newMonthly)}/mo</span>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-gray-100 pt-1 text-xs">
                <span className="text-gray-500">Difference</span>
                <span
                  className={cn(
                    'font-semibold tabular-nums',
                    difference > 0 ? 'text-amber-700' : difference < 0 ? 'text-emerald-700' : 'text-gray-700',
                  )}
                >
                  {difference > 0 ? '+' : ''}
                  {formatMoney(difference)}/mo
                </span>
              </div>
            </div>
          </div>

          {needsUpgrade && requiredPlan && (
            <p className="flex items-start gap-1.5 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              {currentPlan.name} caps out at {currentPlan.seatCap} seats, so {requestedSeats} needs{' '}
              <span className="font-medium">{requiredPlan.name}</span>.
            </p>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {planTiers.map((tier) => {
              const tooSmall = requestedSeats > tier.seatCap
              const isCurrent = tier.id === seats.planId
              const isSelected = tier.id === planId

              return (
                <button
                  key={tier.id}
                  type="button"
                  disabled={tooSmall}
                  onClick={() => setPlanId(tier.id)}
                  className={cn(
                    'flex flex-col gap-1 rounded-xl border px-3 py-2.5 text-left transition-colors',
                    isSelected
                      ? 'border-[#1B5E20] bg-[#1B5E20]/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                    tooSmall && 'cursor-not-allowed opacity-55 hover:border-gray-200 hover:bg-transparent',
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-gray-900">{tier.name.replace('Mercury ', '')}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#1B5E20]" />}
                    {tooSmall && <Lock className="h-3 w-3 text-gray-400" />}
                    {isCurrent && (
                      <Badge variant="emerald" className="ml-auto">
                        Current
                      </Badge>
                    )}
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    {formatMoney(tier.pricePerSeat)}/seat · up to {tier.seatCap}
                  </span>
                  <span className="text-[11px] text-[#6E7678]">{tier.summary}</span>
                </button>
              )
            })}
          </div>

          {beyondEveryTier && (
            <p className="flex items-start gap-1.5 text-xs text-rose-600">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              No standard tier holds {requestedSeats} seats. Talk to Mercury 360 about a custom agreement.
            </p>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Reason</span>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional, but it gets approved faster with one"
              rows={2}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <DialogPrimaryButton
            className="w-auto px-6"
            disabled={!canSubmit}
            onClick={() => onRequest(requestedSeats, planId, reason.trim())}
          >
            {needsUpgrade ? 'Request upgrade' : 'Request seats'}
          </DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
