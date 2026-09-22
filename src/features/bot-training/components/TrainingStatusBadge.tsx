import { CircleCheck, CircleSlash, Clock, LoaderCircle, TriangleAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { SourceAudience, TrainingStatus } from '../types'

const statusMeta: Record<TrainingStatus, { label: string; className: string; icon: typeof CircleCheck }> = {
  indexed: { label: 'Indexed', className: 'bg-emerald-50 text-emerald-700', icon: CircleCheck },
  indexing: { label: 'Indexing', className: 'bg-blue-50 text-blue-700', icon: LoaderCircle },
  queued: { label: 'Queued', className: 'bg-gray-100 text-gray-600', icon: Clock },
  failed: { label: 'Failed', className: 'bg-rose-50 text-rose-700', icon: TriangleAlert },
}

interface TrainingStatusBadgeProps {
  status: TrainingStatus
  /** A disabled source is still indexed but the bot will not answer from it. */
  isEnabled: boolean
}

export function TrainingStatusBadge({ status, isEnabled }: TrainingStatusBadgeProps) {
  if (!isEnabled) {
    return (
      <Badge className="bg-gray-100 text-gray-500">
        <CircleSlash className="h-3 w-3" />
        Not in use
      </Badge>
    )
  }

  const meta = statusMeta[status]
  const Icon = meta.icon

  return (
    <Badge className={meta.className}>
      <Icon className={status === 'indexing' ? 'h-3 w-3 animate-spin' : 'h-3 w-3'} />
      {meta.label}
    </Badge>
  )
}

const audienceMeta: Record<SourceAudience, string> = {
  public: 'Anyone',
  'signed-in': 'Signed-in only',
}

export function AudienceBadge({ audience }: { audience: SourceAudience }) {
  return <Badge variant="gray">{audienceMeta[audience]}</Badge>
}
