import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { systemActivityEntries } from '../data/mockSystemActivityData'
import { ActivityFeedList } from './ActivityFeedList'

interface NotificationsPanelProps {
  onClose: () => void
}

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const unreadCount = systemActivityEntries.filter((entry) => !entry.read).length
  const visibleEntries = tab === 'unread' ? systemActivityEntries.filter((entry) => !entry.read) : systemActivityEntries

  return (
    <>
      <button type="button" aria-label="Close notifications" onClick={onClose} className="fixed inset-0 z-40" />
      <div className="fixed inset-x-4 top-16 z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-[420px]">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setTab('all')}
              className={cn('border-b-2 pb-1 text-sm font-medium transition-colors', tab === 'all' ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-transparent text-gray-500')}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setTab('unread')}
              className={cn('flex items-center gap-1.5 border-b-2 pb-1 text-sm font-medium transition-colors', tab === 'unread' ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-transparent text-gray-500')}
            >
              Unread
              {unreadCount > 0 && <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">{unreadCount}</span>}
            </button>
          </div>
          <span className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-600">
            <Calendar className="h-3 w-3" />
            Custom Range
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <ActivityFeedList entries={visibleEntries} />
        </div>
      </div>
    </>
  )
}
