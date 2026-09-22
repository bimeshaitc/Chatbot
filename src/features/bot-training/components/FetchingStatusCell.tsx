import { Clock, Globe, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TrainingStatus } from '../types'
import { TrainingStatusBadge } from './TrainingStatusBadge'

interface FetchingStatusCellProps {
  status: TrainingStatus
  isEnabled: boolean
  url: string
  failureReason?: string
}

/**
 * The training-status cell for a website URL specifically.
 *
 * A document is "indexed"; a URL is *fetched* — someone reading this table
 * should see the crawler actually out on the web right now, not just a static
 * "Indexing" chip identical to a PDF upload. `indexed` and `failed` fall
 * through to the shared badge, since those are settled states with nothing to
 * animate.
 */
export function FetchingStatusCell({ status, isEnabled, url, failureReason }: FetchingStatusCellProps) {
  if (!isEnabled || status === 'indexed' || status === 'failed') {
    return (
      <div className="flex flex-col gap-1.5">
        <TrainingStatusBadge status={status} isEnabled={isEnabled} />
        {failureReason && (
          <span className="flex max-w-64 items-start gap-1 text-xs text-rose-600">
            <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" />
            {failureReason}
          </span>
        )}
      </div>
    )
  }

  if (status === 'queued') {
    return (
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100">
          <Clock className="h-3 w-3 animate-pulse text-gray-500" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-700">Queued to fetch</p>
          <p className="truncate text-[11px] text-gray-400" title={url}>
            Waiting for a crawler slot
          </p>
        </div>
      </div>
    )
  }

  // status === 'indexing': the crawler is out on the web right now.
  return (
    <div className="flex min-w-40 flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-blue-400/40" />
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
            <Globe className="h-3 w-3 animate-spin text-blue-600" style={{ animationDuration: '2.5s' }} />
          </span>
        </span>
        <div className="min-w-0">
          <p className="flex items-center text-xs font-medium text-blue-700">
            Fetching
            <span className="ml-0.5 inline-flex" aria-hidden>
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>
                .
              </span>
              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>
                .
              </span>
              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>
                .
              </span>
            </span>
          </p>
          <p className="truncate text-[11px] text-gray-400" title={url}>
            {url}
          </p>
        </div>
      </div>

      {/* The sweep is the "this is alive" signal at a glance, before anyone
          reads the text next to it. */}
      <div className="h-1 w-36 overflow-hidden rounded-full bg-blue-100">
        <div className={cn('h-full w-1/3 rounded-full bg-blue-500', 'animate-fetch-sweep')} />
      </div>
    </div>
  )
}
