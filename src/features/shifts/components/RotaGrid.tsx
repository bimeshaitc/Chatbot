import { useState } from 'react'
import { agents } from '@/features/chat'
import { cn } from '@/lib/utils'
import type { Shift } from '../types'
import { getWeekDates, formatDayLabel, shiftsForAgentAndDay, shiftsOverlap } from '../utils/rota'
import { shiftStatusMeta } from '../utils/shiftMeta'
import { ShiftDetailDialog } from './ShiftDetailDialog'

interface RotaGridProps {
  shifts: Shift[]
  canManage: boolean
}

/** Hand-built, no calendar library — matches how `reports/components/charts/` hand-builds its charts. */
export function RotaGrid({ shifts, canManage }: RotaGridProps) {
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const weekDates = getWeekDates(new Date())
  const rowAgents = canManage ? agents : agents.filter((agent) => shifts.some((s) => s.agentId === agent.id))

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="w-40 px-3 py-2 text-left font-medium text-gray-500">Agent</th>
            {weekDates.map((date) => (
              <th key={date} className="px-2 py-2 text-left font-medium text-gray-500">
                {formatDayLabel(date)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowAgents.length === 0 && (
            <tr>
              <td colSpan={8} className="px-3 py-6 text-center text-sm text-gray-400">
                No shifts scheduled for you this week.
              </td>
            </tr>
          )}
          {rowAgents.map((agent) => (
            <tr key={agent.id} className="border-b border-gray-100 last:border-0">
              <td className="px-3 py-2.5 align-top">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${agent.avatarColor}`}
                  >
                    {agent.initials}
                  </span>
                  <span className="truncate font-medium text-gray-800">{agent.name}</span>
                </div>
              </td>
              {weekDates.map((date) => {
                const dayShifts = shiftsForAgentAndDay(shifts, agent.id, date)
                const overlapping = dayShifts.some((a, i) =>
                  dayShifts.some((b, j) => i !== j && shiftsOverlap(a, b)),
                )
                return (
                  <td key={date} className="px-2 py-2.5 align-top">
                    {dayShifts.length === 0 ? (
                      <span className="text-xs text-gray-300">—</span>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {dayShifts.map((shift) => (
                          <button
                            key={shift.id}
                            onClick={() => setSelectedShift(shift)}
                            className={cn(
                              'rounded-md px-2 py-1 text-left text-xs font-medium transition hover:opacity-80',
                              shiftStatusMeta[shift.status].className,
                            )}
                          >
                            {shift.startTime}–{shift.endTime}
                          </button>
                        ))}
                        {overlapping && (
                          <span className="text-[10px] font-medium text-amber-600">Overlaps another shift</span>
                        )}
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedShift && (
        <ShiftDetailDialog shift={selectedShift} canManage={canManage} onClose={() => setSelectedShift(null)} />
      )}
    </div>
  )
}
