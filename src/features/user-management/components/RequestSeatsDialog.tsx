import { useState } from 'react'
import { ArrowRight, Check, Info, Lock, Minus, Plus, TriangleAlert } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { formatMoney, planById, planTiers, smallestPlanFor } from '../data/mockUserManagementData'
import type { SeatAllocation } from '../types'

interface RequestSeatsDialogProps {
  seats: SeatAllocation
  onClose: () => void
  onRequest: (requestedSeats: number, planId: string, reason: string) => void
}

export function RequestSeatsDialog({ seats, onClose, onRequest }: RequestSeatsDialogProps) {
  const currentPlan = planById(seats.planId)

  const [requestedSeats, setRequestedSeats] = useState(seats.total + 2)
  const [planId, setPlanId] = useState(seats.planId)
  const [reason, setReason] = useState('')

  // The two decisions are coupled: a seat count the current tier cannot hold
  // *is* a plan change, so the minimum viable tier is derived rather than left
  // for the reader to work out.
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
    // Follow the seat count up to the tier that can hold it, but never silently
    // downgrade a tier the person picked on purpose.
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
            Mercury 360 owns billing, so this is a request rather than a purchase. You hold{' '}
            <span className="font-medium text-gray-700">
              {seats.total} seats on {currentPlan.name}
            </span>
            , {seats.used} of them in use.
          </p>

          {/* --- how many seats ------------------------------------------- */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">How many seats in total?</span>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
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

              <div className="flex flex-wrap gap-1.5">
                {[5, 10, 25].map((jump) => (
                  <button
                    key={jump}
                    type="button"
                    onClick={() => setSeatCount(seats.total + jump)}
                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    +{jump}
                  </button>
                ))}
              </div>

              <span className="text-xs text-[#6E7678]">
                {seats.total} <ArrowRight className="inline h-3 w-3" /> {requestedSeats} seats
              </span>
            </div>

            {requestedSeats === seats.used && (
              <p className="text-xs text-[#6E7678]">
                Cannot go below {seats.used} — that many seats are already in use.
              </p>
            )}
          </div>

          {/* --- which plan ----------------------------------------------- */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Plan</span>

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
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      {formatMoney(tier.pricePerSeat)}/seat · up to {tier.seatCap}
                    </span>
                    <span className="text-[11px] text-[#6E7678]">{tier.summary}</span>
                    {isCurrent && <span className="text-[11px] font-medium text-[#1B5E20]">Current plan</span>}
                    {tooSmall && (
                      <span className="text-[11px] text-gray-500">Holds {tier.seatCap} seats, you asked for {requestedSeats}</span>
                    )}
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
          </div>

          {/* --- what it costs -------------------------------------------- */}
          <div className="rounded-xl border border-gray-100 bg-[#F7F7F8] p-3.5">
            <p className="text-xs font-medium text-gray-700">What changes</p>
            <dl className="mt-2 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Today</dt>
                <dd className="text-gray-700 tabular-nums">
                  {seats.total} × {formatMoney(currentPlan.pricePerSeat)} = {formatMoney(currentMonthly)}/mo
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Requested</dt>
                <dd className="font-medium text-gray-900 tabular-nums">
                  {requestedSeats} × {formatMoney(selectedPlan.pricePerSeat)} = {formatMoney(newMonthly)}/mo
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-gray-200 pt-1.5">
                <dt className="text-gray-500">Difference</dt>
                <dd
                  className={cn(
                    'font-semibold tabular-nums',
                    difference > 0 ? 'text-amber-700' : difference < 0 ? 'text-emerald-700' : 'text-gray-700',
                  )}
                >
                  {difference > 0 ? '+' : ''}
                  {formatMoney(difference)}/mo
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] text-[#6E7678]">
              Indicative only — Mercury 360 confirms the final price and prorates against your{' '}
              {seats.renewsOn} renewal.
            </p>
          </div>

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
