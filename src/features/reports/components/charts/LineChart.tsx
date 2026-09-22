import { useState } from 'react'
import type { ReportSeries } from '../../types'
import { axisTicks, CATEGORICAL, formatNumber, INK } from '@/lib/vizTokens'

const PLOT_HEIGHT = 200
const VIEW_WIDTH = 600

interface LineChartProps {
  labels: string[]
  series: ReportSeries[]
  unit?: string
}

export function LineChart({ labels, series, unit }: LineChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const allValues = series.flatMap((entry) => entry.values)
  const { max, ticks } = axisTicks(Math.max(0, ...allValues))

  const stepX = labels.length > 1 ? VIEW_WIDTH / (labels.length - 1) : 0
  const pointX = (index: number) => (labels.length > 1 ? index * stepX : VIEW_WIDTH / 2)
  const pointY = (value: number) => PLOT_HEIGHT - (value / max) * PLOT_HEIGHT

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
          <svg
            viewBox={`0 0 ${VIEW_WIDTH} ${PLOT_HEIGHT}`}
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
            role="img"
            aria-label={series.map((entry) => entry.label).join(', ')}
          >
            {ticks.map((tick, index) => {
              const y = (index / (ticks.length - 1)) * PLOT_HEIGHT
              return (
                <line
                  key={tick}
                  x1={0}
                  x2={VIEW_WIDTH}
                  y1={y}
                  y2={y}
                  stroke={index === ticks.length - 1 ? INK.baseline : INK.grid}
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}

            {activeIndex !== null && (
              <line
                x1={pointX(activeIndex)}
                x2={pointX(activeIndex)}
                y1={0}
                y2={PLOT_HEIGHT}
                stroke={INK.baseline}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            )}

            {series.map((entry, seriesIndex) => (
              <polyline
                key={entry.key}
                points={entry.values.map((value, index) => `${pointX(index)},${pointY(value)}`).join(' ')}
                fill="none"
                stroke={CATEGORICAL[seriesIndex % CATEGORICAL.length]}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* Markers only on the hovered index, so the line stays readable. */}
            {activeIndex !== null &&
              series.map((entry, seriesIndex) => (
                <circle
                  key={entry.key}
                  cx={pointX(activeIndex)}
                  cy={pointY(entry.values[activeIndex] ?? 0)}
                  r={4}
                  fill={CATEGORICAL[seriesIndex % CATEGORICAL.length]}
                  stroke={INK.surface}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
          </svg>

          {/* Full-height hit strips, so the target is far bigger than the mark. */}
          <div className="absolute inset-0 flex">
            {labels.map((label, index) => (
              <button
                key={label}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
                aria-label={`${label}: ${series.map((s) => `${s.label} ${s.values[index]}`).join(', ')}`}
                className="h-full flex-1 outline-none"
              />
            ))}
          </div>

          {activeIndex !== null && (
            <div
              className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 rounded-lg px-2.5 py-1.5 text-xs shadow-lg"
              style={{ backgroundColor: INK.primary, color: INK.surface }}
            >
              <p className="font-medium">{labels[activeIndex]}</p>
              {series.map((entry, seriesIndex) => (
                <p key={entry.key} className="mt-0.5 flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: CATEGORICAL[seriesIndex % CATEGORICAL.length] }}
                  />
                  {entry.label}
                  <span className="font-semibold tabular-nums">
                    {(entry.values[activeIndex] ?? 0).toLocaleString()}
                    {unit}
                  </span>
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="mt-2 flex justify-between">
          {labels.map((label, index) => (
            <span
              key={label}
              className="text-[11px]"
              style={{
                color: INK.muted,
                // Label every other tick when the axis is crowded.
                visibility: labels.length > 8 && index % 2 === 1 ? 'hidden' : 'visible',
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
