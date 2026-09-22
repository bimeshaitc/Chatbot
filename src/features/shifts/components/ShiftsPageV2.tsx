import { useState } from 'react'
import { CalendarClock, Users, ClipboardList, ArrowLeftRight } from 'lucide-react'
import { agents } from '@/features/chat'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/lib/utils'
import { useViewer, usePermission } from '@/stores/useWorkspaceRoleStore'
import { useShifts } from '../hooks/useShifts'
import { useShiftRequests } from '../hooks/useShiftRequests'
import { useHandovers } from '../hooks/useHandovers'
import { getWeekDates, formatDayLabel, shiftsForAgentAndDay } from '../utils/rota'
import { shiftStatusMeta } from '../utils/shiftMeta'
import { ShiftDetailDialog } from './ShiftDetailDialog'
import { RequestsList } from './RequestsList'
import { HandoversLog } from './HandoversLog'
import type { Shift } from '../types'

interface StatTileProps {
  icon: typeof CalendarClock
  label: string
  value: string | number
  tone: 'green' | 'amber' | 'blue'
}

function StatTile({ icon: Icon, label, value, tone }: StatTileProps) {
  const toneClasses = {
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
  }[tone]

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', toneClasses)}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
}

/**
 * V2 visual redesign of the Shifts page — stat-forward dashboard layout and
 * per-day agent cards instead of the v1 grid table. Same hooks and data as
 * v1 (`ShiftsPage`); this is a design variant, not a second data model.
 */
export function ShiftsPageV2() {
  const viewer = useViewer()
  const canManage = usePermission('shifts.manage')
  const { shifts } = useShifts()
  const { requests } = useShiftRequests()
  const { handovers } = useHandovers()
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [section, setSection] = useState<'rota' | 'requests' | 'handovers'>('rota')

  const visibleShifts = canManage
    ? shifts
    : shifts.filter((shift) => shift.agentId === viewer.agentId || shift.groups.some((g) => viewer.groups.includes(g)))

  const weekDates = getWeekDates(new Date())
  const today = new Date().toISOString().slice(0, 10)
  const onNow = shifts.filter((shift) => shift.date === today && shift.status === 'in-progress').length
  const pendingRequests = requests.filter((r) => r.status === 'pending').length
  const recentHandovers = handovers.filter((h) => h.createdAt.slice(0, 10) >= weekDates[0]).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title="Shifts" description="Rota, handovers, and requests — v2 design." />
        <p className="text-xs text-gray-400">All times shown in workspace time.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Users} label="On shift now" value={onNow} tone="green" />
        <StatTile icon={ClipboardList} label="Pending requests" value={pendingRequests} tone="amber" />
        <StatTile icon={ArrowLeftRight} label="Handovers this week" value={recentHandovers} tone="blue" />
        <StatTile icon={CalendarClock} label="Agents scheduled" value={visibleShifts.length} tone="green" />
      </div>

      <div className="flex gap-2 rounded-xl bg-gray-100 p-1 w-fit">
        {(['rota', 'requests', 'handovers'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition',
              section === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {key}
          </button>
        ))}
      </div>

      {section === 'rota' && (
        <div className="flex flex-col gap-4">
          {weekDates.map((date) => {
            const dayShifts = agents
              .map((agent) => ({ agent, shifts: shiftsForAgentAndDay(visibleShifts, agent.id, date) }))
              .filter((entry) => entry.shifts.length > 0)

            return (
              <div key={date} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-800">{formatDayLabel(date)}</p>
                {dayShifts.length === 0 ? (
                  <p className="mt-2 text-xs text-gray-400">No one scheduled.</p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {dayShifts.flatMap(({ agent, shifts: agentShifts }) =>
                      agentShifts.map((shift) => (
                        <button
                          key={shift.id}
                          onClick={() => setSelectedShift(shift)}
                          className="flex items-center gap-2 rounded-xl border border-gray-100 px-3 py-2 text-left transition hover:border-gray-200 hover:bg-gray-50"
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${agent.avatarColor}`}
                          >
                            {agent.initials}
                          </span>
                          <div>
                            <p className="text-xs font-medium text-gray-800">{agent.name}</p>
                            <p className="text-[11px] text-gray-500">
                              {shift.startTime}–{shift.endTime}
                            </p>
                          </div>
                          <span
                            className={cn(
                              'ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                              shiftStatusMeta[shift.status].className,
                            )}
                          >
                            {shiftStatusMeta[shift.status].label}
                          </span>
                        </button>
                      )),
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {section === 'requests' && <RequestsList requests={requests} shifts={shifts} />}
      {section === 'handovers' && <HandoversLog handovers={handovers} />}

      {selectedShift && (
        <ShiftDetailDialog shift={selectedShift} canManage={canManage} onClose={() => setSelectedShift(null)} />
      )}
    </div>
  )
}
