import { useState } from 'react'
import type { ReportSeries } from '../../types'
import { axisTicks, CATEGORICAL, formatNumber, INK, ORDINAL_3 } from '@/lib/vizTokens'

const PLOT_HEIGHT = 200
/** Keeps a non-zero value from vanishing at small scales. */
const MIN_SEGMENT_PX = 3

interface BarChartProps {
  labels: string[]
  series: ReportSeries[]
  stacked?: boolean
  /** Ordered parts of a whole use the single-hue ramp, not categorical hues. */
  ordered?: boolean
  unit?: string
}

export function BarChart({ labels, series, stacked = false, ordered = false, unit }: BarChartProps) {
  const [hover, setHover] = useState<{ group: number; series: number } | null>(null)

  // Colour follows the series' position in the data, never its current rank, so
  // filtering a series out never repaints the survivors.
  const palette = ordered ? ORDINAL_3 : CATEGORICAL
  const colorFor = (index: number) => palette[index % palette.length]

  const groupTotals = labels.map((_, groupIndex) =>
    stacked
      ? series.reduce((sum, entry) => sum + (entry.values[groupIndex] ?? 0), 0)
      : Math.max(...series.map((entry) => entry.values[groupIndex] ?? 0)),
  )
  const { max, ticks } = axisTicks(Math.max(0, ...groupTotals))

  return (
    <div className="flex gap-2">
      <div
        className="flex w-9 shrink-0 flex-col justify-between text-right text-[11px] tabular-nums"
        style={{ height: PLOT_HEIGHT, color: INK.muted }}
      >
        {ticks.map((tick) => (
          <span key={tick}>{formatNumber(tick)}</span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative" style={{ height: PLOT_HEIGHT }}>
          {/* Hairline grid, never dashed. */}
          {ticks.map((tick, index) => (
            <span
              key={tick}
              className="absolute inset-x-0 h-px"
              style={{
                top: `${(index / (ticks.length - 1)) * 100}%`,
                backgroundColor: index === ticks.length - 1 ? INK.baseline : INK.grid,
              }}
            />
          ))}

          <div className="absolute inset-0 flex items-end justify-around gap-1.5">
            {labels.map((label, groupIndex) => (
              <div key={label} className="flex h-full min-w-0 flex-1 items-end justify-center gap-0.5">
                {stacked ? (
                  <div className="relative flex h-full w-full max-w-12 flex-col justify-end">
                    {series
                      .map((entry, seriesIndex) => ({ entry, seriesIndex }))
                      // Draw the last series on top so the stack reads in order.
                      .reverse()
                      .map(({ entry, seriesIndex }) => {
                        const value = entry.values[groupIndex] ?? 0
                        if (value <= 0) return null
                        const height = Math.max((value / max) * PLOT_HEIGHT, MIN_SEGMENT_PX)
                        const isTop = seriesIndex === series.length - 1
                        const isHovered = hover?.group === groupIndex && hover?.series === seriesIndex

                        return (
                          <button
                            key={entry.key}
                            type="button"
                            onMouseEnter={() => setHover({ group: groupIndex, series: seriesIndex })}
                            onMouseLeave={() => setHover(null)}
                            onFocus={() => setHover({ group: groupIndex, series: seriesIndex })}
                            onBlur={() => setHover(null)}
                            aria-label={`${label}, ${entry.label}: ${value}`}
                            className="w-full outline-none"
                            style={{
                              height,
                              backgroundColor: colorFor(seriesIndex),
                              // A 2px surface gap separates segments — no borders.
                              marginBottom: 2,
                              borderTopLeftRadius: isTop ? 4 : 0,
                              borderTopRightRadius: isTop ? 4 : 0,
                              opacity: hover && !isHovered ? 0.55 : 1,
                            }}
                          />
                        )
                      })}
                  </div>
                ) : (
                  series.map((entry, seriesIndex) => {
                    const value = entry.values[groupIndex] ?? 0
                    const height = value > 0 ? Math.max((value / max) * PLOT_HEIGHT, MIN_SEGMENT_PX) : 0
                    const isHovered = hover?.group === groupIndex && hover?.series === seriesIndex

                    return (
                      <button
                        key={entry.key}
                        type="button"
                        onMouseEnter={() => setHover({ group: groupIndex, series: seriesIndex })}
                        onMouseLeave={() => setHover(null)}
                        onFocus={() => setHover({ group: groupIndex, series: seriesIndex })}
                        onBlur={() => setHover(null)}
                        aria-label={`${label}, ${entry.label}: ${value}`}
                        className="min-w-1.5 flex-1 outline-none"
                        style={{
                          height,
                          maxWidth: 22,
                          backgroundColor: colorFor(seriesIndex),
                          borderTopLeftRadius: 4,
                          borderTopRightRadius: 4,
                          opacity: hover && !isHovered ? 0.55 : 1,
                        }}
                      />
                    )
                  })
                )}
              </div>
            ))}
          </div>

          {hover && (
            <div
              className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 rounded-lg px-2.5 py-1.5 text-xs shadow-lg"
              style={{ backgroundColor: INK.primary, color: INK.surface }}
            >
              <span className="font-medium">{labels[hover.group]}</span>
              <span className="mx-1.5 opacity-50">·</span>
              {series[hover.series].label}
              <span className="ml-1.5 font-semibold tabular-nums">
                {(series[hover.series].values[hover.group] ?? 0).toLocaleString()}
                {unit}
              </span>
            </div>
          )}
        </div>

        {/* The axis band lives inside the container, so it is never clipped. */}
        <div className="mt-2 flex justify-around gap-1.5">
          {labels.map((label) => (
            <span
              key={label}
              className="min-w-0 flex-1 truncate text-center text-[11px]"
              style={{ color: INK.muted }}
              title={label}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
