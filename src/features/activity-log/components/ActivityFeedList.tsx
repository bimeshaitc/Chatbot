import { cn } from '@/lib/utils'
import type { ActivityLogEntry } from '../types'

interface ActivityFeedListProps {
  entries: ActivityLogEntry[]
}

export function ActivityFeedList({ entries }: ActivityFeedListProps) {
  if (entries.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-400">Nothing here yet.</p>
  }

  const days = Array.from(new Set(entries.map((entry) => entry.day)))

  return (
    <div className="flex flex-col">
      {days.map((day) => (
        <div key={day}>
          <p className="px-1 py-2 text-xs font-medium text-gray-400">{day}</p>
          {entries
            .filter((entry) => entry.day === day)
            .map((entry) => (
              <div key={entry.id} className="flex items-start gap-2.5 border-b border-gray-50 px-1 py-3">
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
                    entry.actor.avatarColor,
                  )}
                >
                  {entry.actor.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">{entry.actor.name}</span> {entry.action}
                    {entry.target && (
                      <>
                        {' '}
                        <span
                          className={cn(
                            'mx-1 inline-flex h-4 w-4 items-center justify-center rounded-full align-middle text-[8px] font-semibold',
                            entry.target.avatarColor,
                          )}
                        >
                          {entry.target.initials}
                        </span>
                        <span className="font-medium text-gray-900">{entry.target.name}</span>
                      </>
                    )}
                  </p>
                  {entry.note && (
                    <span className="mt-1.5 inline-block rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">{entry.note}</span>
                  )}
                  <p className="mt-1 text-xs text-gray-400">{entry.time}</p>
                </div>
                {!entry.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1B5E20]" />}
              </div>
            ))}
        </div>
      ))}
    </div>
  )
}
