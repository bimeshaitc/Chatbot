import { Eye, EyeOff, MousePointerClick, Percent, Target, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { CampaignRecord } from '../types'
import { CampaignStatusBadge } from './CampaignStatusBadge'

interface CampaignCardProps {
  campaign: CampaignRecord
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const { title, category, message, status, stats } = campaign

  return (
    <div className="w-full rounded-lg bg-gray-50 p-4">
      <div className="flex items-start justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex flex-1 flex-col justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-base font-bold text-gray-900">{title}</p>
            <Badge variant="emerald">{category}</Badge>
          </div>
          <p className="text-sm font-medium text-gray-500">{message}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <CampaignStatusBadge status={status} />
          <button type="button" aria-label="Toggle visibility" className="text-gray-400 hover:text-gray-600">
            <EyeOff className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm font-medium text-[#1B5E20]">
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {stats.views.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <MousePointerClick className="h-4 w-4" />
          {stats.clicks.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <Percent className="h-4 w-4" />
          {stats.ctr}%
        </span>
        <span className="flex items-center gap-1">
          <Target className="h-4 w-4" />
          {stats.conversions.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {stats.audience}
        </span>
      </div>
    </div>
  )
}
