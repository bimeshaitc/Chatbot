import { useMemo, useRef, useState } from 'react'
import { InfoTip } from '@/components/InfoTip'
import { conversationsTrend as defaultTrend } from '../data/mockDashboardData'
import type { TrendPoint } from '../types'

const VIEW_WIDTH = 600
const VIEW_HEIGHT = 240
const PADDING_LEFT = 36
const PADDING_BOTTOM = 28
const TICK_COUNT = 4

type Point = [number, number]

type SeriesKey = 'received' | 'resolved'

const SERIES: { key: SeriesKey; label: string; color: string; gradientId: string }[] = [
  { key: 'received', label: 'Received', color: 'var(--color-sky-300)', gradientId: 'receivedFill' },
  { key: 'resolved', label: 'Resolved', color: 'var(--color-teal-600)', gradientId: 'resolvedFill' },
]

function toPoints(values: number[], plotHeight: number, plotWidth: number, yMax: number): Point[] {
  if (values.length === 1) return [[PADDING_LEFT, plotHeight - (values[0] / yMax) * plotHeight]]
  const step = plotWidth / (values.length - 1)
  return values.map((value, index) => [PADDING_LEFT + step * index, plotHeight - (value / yMax) * plotHeight])
}

function toSmoothPath(points: Point[]): string {
  if (points.length < 2) return points.length === 1 ? `M ${points[0][0]},${points[0][1]}` : ''
  let d = `M ${points[0][0]},${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 === points.length ? i + 1 : i + 2]
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`
  }
  return d
}

function toAreaPath(points: Point[], plotHeight: number): string {
  const linePath = toSmoothPath(points)
  const [firstX] = points[0]
  const [lastX] = points[points.length - 1]
  return `${linePath} L ${lastX},${plotHeight} L ${firstX},${plotHeight} Z`
}

interface ConversationsTrendCardProps {
  data?: TrendPoint[]
}

export function ConversationsTrendCard({ data = defaultTrend }: ConversationsTrendCardProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [visibleSeries, setVisibleSeries] = useState<Record<SeriesKey, boolean>>({ received: true, resolved: true })
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const plotHeight = VIEW_HEIGHT - PADDING_BOTTOM
  const plotWidth = VIEW_WIDTH - PADDING_LEFT

  const yMax = useMemo(() => {
    const rawMax = Math.max(0, ...data.flatMap((point) => [point.received, point.resolved]))
    if (rawMax === 0) return 100
    // Ceil to the next multiple of 100, always leaving headroom above the highest point.
    return Math.ceil((rawMax + 1) / 100) * 100
  }, [data])

  const yTicks = useMemo(
    () => Array.from({ length: TICK_COUNT + 1 }, (_, i) => Math.round((yMax / TICK_COUNT) * i)),
    [yMax],
  )

  const pointsBySeries = useMemo(
    () => ({
      received: toPoints(data.map((p) => p.received), plotHeight, plotWidth, yMax),
      resolved: toPoints(data.map((p) => p.resolved), plotHeight, plotWidth, yMax),
    }),
    [data, plotHeight, plotWidth, yMax],
  )

  // Only force horizontal scroll once there are enough points that labels would overlap;
  // typical datasets (a week, a month) just scale to fit via the SVG viewBox.
  const needsScroll = data.length > 10
  const minWidth = needsScroll ? data.length * 70 : undefined
  const hovered = hoverIndex !== null ? data[hoverIndex] : null
  const hoveredPct = hoverIndex !== null ? (pointsBySeries.received[hoverIndex][0] / VIEW_WIDTH) * 100 : 0
  const tooltipAlign: 'start' | 'center' | 'end' = hoveredPct <= 15 ? 'start' : hoveredPct >= 85 ? 'end' : 'center'
  const tooltipTranslate = tooltipAlign === 'start' ? '0%' : tooltipAlign === 'end' ? '-100%' : '-50%'

  function handlePointerMove(clientX: number, clientY: number) {
    const svg = svgRef.current
    if (!svg || data.length === 0) return
    const ctm = svg.getScreenCTM()
    if (!ctm) return
    const point = svg.createSVGPoint()
    point.x = clientX
    point.y = clientY
    const local = point.matrixTransform(ctm.inverse())
    if (local.x < PADDING_LEFT - 10 || local.x > VIEW_WIDTH + 10) {
      setHoverIndex(null)
      return
    }

    let nearest = 0
    let minDist = Infinity
    pointsBySeries.received.forEach(([x], index) => {
      const dist = Math.abs(x - local.x)
      if (dist < minDist) {
        minDist = dist
        nearest = index
      }
    })
    setHoverIndex(nearest)
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-[15px] leading-[1.4] font-semibold text-gray-900">
          Conversations Trend
          <InfoTip label="Conversations received versus resolved per day. A conversation counts on the day it was received, or the day it was resolved — so the two lines can diverge. Tap a legend dot to hide a line." />
        </h2>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {SERIES.map((series) => (
            <button
              key={series.key}
              type="button"
              onClick={() =>
                setVisibleSeries((prev) => ({
                  ...prev,
                  [series.key]: !prev[series.key],
                }))
              }
              className="flex items-center gap-1.5"
              aria-pressed={visibleSeries[series.key]}
            >
              <span
                className="h-2 w-2 rounded-full transition-opacity"
                style={{ backgroundColor: series.color, opacity: visibleSeries[series.key] ? 1 : 0.3 }}
              />
              <span className={visibleSeries[series.key] ? '' : 'text-gray-300 line-through'}>{series.label}</span>
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <p className="mt-4 py-16 text-center text-sm text-gray-400">No data to display</p>
      ) : (
        <div className={needsScroll ? 'relative mt-8 overflow-x-auto' : 'relative mt-8'}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="w-full touch-none"
            style={minWidth ? { minWidth } : undefined}
            role="img"
            aria-label="Conversations trend chart"
            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onMouseLeave={() => setHoverIndex(null)}
            onTouchStart={(e) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="receivedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-sky-300)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="var(--color-sky-300)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="resolvedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-teal-600)" stopOpacity="0.45" />
                <stop offset="100%" stopColor="var(--color-teal-600)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {yTicks.map((tick) => {
              const y = plotHeight - (tick / yMax) * plotHeight
              return (
                <g key={tick}>
                  <line x1={PADDING_LEFT} x2={VIEW_WIDTH} y1={y} y2={y} stroke="#F1F5F9" strokeWidth={1} />
                  <text x={0} y={y + 3} fontSize={11} fill="#94A3B8">
                    {tick}
                  </text>
                </g>
              )
            })}

            {SERIES.filter((series) => visibleSeries[series.key]).map((series) => {
              const points = pointsBySeries[series.key]
              return (
                <g key={series.key}>
                  <path d={toAreaPath(points, plotHeight)} fill={`url(#${series.gradientId})`} stroke="none" />
                  <path d={toSmoothPath(points)} fill="none" stroke={series.color} strokeWidth={2} />
                </g>
              )
            })}

            {data.map((point, index) => (
              <text
                key={point.day}
                x={PADDING_LEFT + (plotWidth / Math.max(data.length - 1, 1)) * index}
                y={VIEW_HEIGHT - 4}
                fontSize={11}
                fill="#94A3B8"
                textAnchor="middle"
              >
                {point.day}
              </text>
            ))}

            {hoverIndex !== null && (
              <g>
                <line
                  x1={pointsBySeries.received[hoverIndex][0]}
                  x2={pointsBySeries.received[hoverIndex][0]}
                  y1={0}
                  y2={plotHeight}
                  stroke="#CBD5E1"
                  strokeWidth={1}
                  strokeDasharray="4 3"
                />
                {SERIES.filter((series) => visibleSeries[series.key]).map((series) => {
                  const [x, y] = pointsBySeries[series.key][hoverIndex]
                  return (
                    <circle key={series.key} cx={x} cy={y} r={4} fill="white" stroke={series.color} strokeWidth={2} />
                  )
                })}
              </g>
            )}
          </svg>

          {hovered && (
            <div
              className="pointer-events-none absolute -top-6 z-10 min-w-32.5 rounded-lg border border-gray-100 bg-white p-2.5 text-xs shadow-lg"
              style={{
                left: `${hoveredPct}%`,
                transform: `translateX(${tooltipTranslate})`,
              }}
            >
              <p className="font-semibold text-gray-900">{hovered.day}</p>
              {visibleSeries.received && (
                <p className="mt-1 flex items-center justify-between gap-3 text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-300" /> Received
                  </span>
                  <span className="font-medium text-gray-900">{hovered.received.toLocaleString()}</span>
                </p>
              )}
              {visibleSeries.resolved && (
                <p className="mt-1 flex items-center justify-between gap-3 text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-600" /> Resolved
                  </span>
                  <span className="font-medium text-gray-900">{hovered.resolved.toLocaleString()}</span>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
