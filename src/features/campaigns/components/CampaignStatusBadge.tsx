import { Clock, FileEdit, ToggleLeft, ToggleRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CampaignStatus } from '../types'

const statusConfig: Record<CampaignStatus, { label: string; icon: LucideIcon; iconClassName: string; labelClassName: string }> = {
  active: { label: 'Active', icon: ToggleRight, iconClassName: 'text-emerald-600', labelClassName: 'text-gray-900' },
  inactive: { label: 'Inactive', icon: ToggleLeft, iconClassName: 'text-gray-300', labelClassName: 'text-gray-400' },
  scheduled: { label: 'Scheduled', icon: Clock, iconClassName: 'text-amber-500', labelClassName: 'text-gray-900' },
  draft: { label: 'Draft', icon: FileEdit, iconClassName: 'text-gray-400', labelClassName: 'text-gray-900' },
}

interface CampaignStatusBadgeProps {
  status: CampaignStatus
}

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  const { label, icon: Icon, iconClassName, labelClassName } = statusConfig[status]

  return (
    <span className="flex items-center gap-1.5 text-sm font-medium">
      <Icon className={cn('h-5 w-5', iconClassName)} />
      <span className={labelClassName}>{label}</span>
    </span>
  )
}
