import { CATEGORICAL, INK } from '@/lib/vizTokens'

interface HBarChartProps {
  rows: { label: string; value: number }[]
  unit?: string
}

/**
 * Ranked magnitude on nominal categories. One hue for every bar: the ranking is
 * already carried by the ordering and the length, so colouring each bar
 * differently would imply a distinction that is not in the data.
 */
export function HBarChart({ rows, unit }: HBarChartProps) {
  const max = Math.max(1, ...rows.map((row) => row.value))

  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((row) => (
        <li key={row.label} className="group">
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-xs" style={{ color: INK.secondary }} title={row.label}>
              {row.label}
            </span>
            {/* Direct value label — never only in a tooltip. */}
            <span className="shrink-0 text-xs font-semibold tabular-nums" style={{ color: INK.primary }}>
              {row.value.toLocaleString()}
              {unit}
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: INK.grid }}>
            <div
              className="h-full rounded-full transition-opacity group-hover:opacity-80"
              style={{ width: `${(row.value / max) * 100}%`, backgroundColor: CATEGORICAL[0] }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
