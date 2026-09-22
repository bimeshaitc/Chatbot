import { ArrowDownRight, ArrowUpRight, CircleCheck, Minus, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReportStat } from '../types'
import { INK, STATUS } from '@/lib/vizTokens'

/** A status colour never travels without an icon and a label. */
const toneMeta = {
  good: { color: STATUS.good, Icon: CircleCheck },
  warning: { color: STATUS.warning, Icon: TriangleAlert },
  critical: { color: STATUS.critical, Icon: TriangleAlert },
  neutral: { color: INK.secondary, Icon: Minus },
} as const

export function StatTile({ stat }: { stat: ReportStat }) {
  const tone = toneMeta[stat.tone ?? 'neutral']
  const isDown = stat.delta?.trim().startsWith('-')
  const DeltaIcon = isDown ? ArrowDownRight : ArrowUpRight

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium" style={{ color: INK.secondary }}>
        {stat.label}
      </p>

      {/* No tabular-nums on a hero figure — equal-width digits read as a table. */}
      <p className="mt-1.5 text-2xl leading-none font-bold" style={{ color: INK.primary }}>
        {stat.value}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        {stat.delta && (
          <span
            className={cn('flex items-center gap-0.5 text-xs font-medium')}
            style={{ color: stat.tone && stat.tone !== 'neutral' ? tone.color : INK.secondary }}
          >
            <DeltaIcon className="h-3 w-3" />
            {stat.delta}
          </span>
        )}
        {stat.tone && stat.tone !== 'neutral' && (
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: tone.color }}>
            <tone.Icon className="h-3 w-3" />
            {stat.tone === 'good' ? 'On target' : stat.tone === 'warning' ? 'Watch' : 'Off target'}
          </span>
        )}
      </div>

      {stat.hint && (
        <p className="mt-1.5 text-[11px]" style={{ color: INK.muted }}>
          {stat.hint}
        </p>
      )}
    </div>
  )
}
