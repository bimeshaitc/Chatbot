import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { activityLogEntries } from '../data/mockActivityLogData'

interface ActivityLogPanelProps {
  open: boolean
  onClose: () => void
}

export function ActivityLogPanel({ open, onClose }: ActivityLogPanelProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Close activity log" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Activity Logs</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activityLogEntries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-2.5 border-b border-gray-50 px-5 py-3">
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
                <p className="mt-1 text-xs text-gray-400">{entry.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
