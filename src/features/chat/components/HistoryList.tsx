import {
  ArrowLeftRight,
  ArrowRight,
  CircleDot,
  History,
  MessageSquare,
  SquareCheckBig,
  StickyNote,
  Tag,
  UserCheck,
} from 'lucide-react'
import type { ActivityLogEntry, ActivityType } from '../types'

const typeConfig: Record<ActivityType, { icon: typeof History; className: string }> = {
  assignment: { icon: UserCheck, className: 'text-blue-500' },
  note: { icon: StickyNote, className: 'text-amber-500' },
  status: { icon: CircleDot, className: 'text-violet-500' },
  tag: { icon: Tag, className: 'text-teal-500' },
  ticket: { icon: SquareCheckBig, className: 'text-emerald-600' },
  handover: { icon: ArrowLeftRight, className: 'text-indigo-500' },
  transfer: { icon: ArrowRight, className: 'text-indigo-500' },
  message: { icon: MessageSquare, className: 'text-gray-400' },
  system: { icon: History, className: 'text-gray-400' },
}

interface HistoryListProps {
  entries: ActivityLogEntry[]
}

export function HistoryList({ entries }: HistoryListProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-gray-400">No activity yet.</p>
  }

  return (
    <ul className="flex flex-col">
      {entries.map((entry, index) => {
        const { icon: Icon, className } = typeConfig[entry.type ?? 'system']
        const isLast = index === entries.length - 1

        return (
          <li key={entry.id} className="flex gap-2.5">
            <div className="flex flex-col items-center">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${className}`} />
              {!isLast && <span className="mt-1 w-px flex-1 bg-gray-100" />}
            </div>
            <div className={`flex-1 ${isLast ? '' : 'pb-4'}`}>
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">{entry.actor}</span> {entry.action}
              </p>
              {entry.note && <p className="mt-1 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">{entry.note}</p>}
              <p className="mt-1 text-[11px] text-gray-400">{entry.time}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
