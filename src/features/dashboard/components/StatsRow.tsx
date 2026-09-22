import { ArrowUpRight, MessageSquare, Star, TrendingUp, Users } from 'lucide-react'
import { InfoTip } from '@/components/InfoTip'
import type { StatCard } from '../types'
import { statCards } from '../data/mockDashboardData'

const accentStyles: Record<StatCard['accent'], { card: string; icon: string }> = {
  green: { card: 'bg-emerald-50', icon: 'bg-emerald-500' },
  blue: { card: 'bg-blue-50', icon: 'bg-blue-500' },
  purple: { card: 'bg-violet-50', icon: 'bg-violet-500' },
  orange: { card: 'bg-amber-50', icon: 'bg-amber-500' },
}

const accentIcon: Record<StatCard['accent'], typeof MessageSquare> = {
  green: MessageSquare,
  blue: Users,
  purple: TrendingUp,
  orange: Star,
}

export function StatsRow() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = accentIcon[stat.accent]
        const styles = accentStyles[stat.accent]
        return (
          <div key={stat.label} className={`rounded-2xl p-5 ${styles.card}`}>
            <div className="flex items-start justify-between gap-2">
              <span className="flex items-center gap-1.5 text-sm text-gray-600">
                {stat.label}
                <InfoTip label={stat.description} align="right" />
              </span>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${styles.icon}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-gray-900">{stat.value}</p>
            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-700">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {stat.changeLabel}
            </p>
          </div>
        )
      })}
    </div>
  )
}
