import { Calendar } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { systemActivityEntries } from '../data/mockSystemActivityData'
import { ActivityFeedList } from './ActivityFeedList'

export function ActivitiesLogPage() {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-2xl">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <PageHeader title="Activities log" description="Monitor all system activities and user actions" />
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <Calendar className="h-3.5 w-3.5" />
            Custom Range
          </button>
        </div>

        <div className="mt-4">
          <ActivityFeedList entries={systemActivityEntries} />
        </div>
      </div>
    </div>
  )
}
