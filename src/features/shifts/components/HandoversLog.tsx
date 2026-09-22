import { AlertTriangle, ArrowRight } from 'lucide-react'
import { agents } from '@/features/chat'
import { cn } from '@/lib/utils'
import type { ShiftHandover } from '../types'

interface HandoversLogProps {
  handovers: ShiftHandover[]
}

function agentName(agentId: string | null) {
  if (!agentId) return 'Unassigned pool'
  return agents.find((agent) => agent.id === agentId)?.name ?? agentId
}

export function HandoversLog({ handovers }: HandoversLogProps) {
  if (handovers.length === 0) {
    return <p className="mt-6 text-sm text-gray-400">No handovers recorded yet.</p>
  }

  const sorted = [...handovers].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="mt-4 flex flex-col gap-2.5">
      {sorted.map((handover) => {
        const isCovering = handover.reason === 'covering'
        return (
          <div
            key={handover.id}
            className={cn(
              'rounded-xl border p-3',
              isCovering ? 'border-amber-200 bg-amber-50/60' : 'border-gray-200 bg-white',
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                {agentName(handover.fromAgentId)}
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                {agentName(handover.toAgentId)}
              </div>
              {isCovering ? (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                  <AlertTriangle className="h-3 w-3" />
                  Reassigned by lead
                </span>
              ) : (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  Handover
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {handover.items.length} item{handover.items.length === 1 ? '' : 's'} moved ·{' '}
              {new Date(handover.createdAt).toLocaleString()}
              {!handover.acknowledgedAt && ' · Not yet acknowledged'}
            </p>
            {handover.note && <p className="mt-1.5 text-xs text-gray-600">{handover.note}</p>}
          </div>
        )
      })}
    </div>
  )
}
