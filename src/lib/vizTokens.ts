/**
 * Chart palette for the Reports section.
 *
 * These values are not chosen by eye — they were run through the data-viz
 * validator against this app's chart surface (#ffffff, light mode). Recorded
 * here so nobody has to re-derive them:
 *
 *   CATEGORICAL (4 slots, adjacent-pair forms: bars, lines, stacks)
 *     ALL CHECKS PASS — worst adjacent CVD ΔE 9.1 (protan), normal-vision ΔE 22.9.
 *     One WARN: aqua (2.82:1) and yellow (2.17:1) fall below 3:1 against white.
 *     That WARN is not dismissable — every chart using them ships visible value
 *     labels AND a table view. See ChartCard's `table` toggle.
 *
 *   ORDINAL (3 steps, for genuinely ordered categories only)
 *     ALL CHECKS PASS — monotone lightness, ΔL gaps ≥ 0.06, light end 2.11:1.
 *
 *   STATUS (good / warning / critical)
 *     Fixed roles, never themed and never reused as a series colour. Warning is
 *     sub-3:1 on white by design, so a status colour is ALWAYS paired with an
 *     icon and a text label — it never carries meaning on its own.
 *
 * Two hand-picked palettes were rejected on the way here: a brand-green ramp
 * (adjacent steps only ΔE 10 apart in normal vision) and an amber/red status
 * pair (ΔE 9.1). Re-run the validator before changing any value below.
 */

/** Identity. Assigned in fixed order, never cycled, never by rank. */
export const CATEGORICAL = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100'] as const

/** Magnitude on ordered categories only — never on nominal ones. */
export const ORDINAL_3 = ['#86b6ef', '#3987e5', '#1c5cab'] as const

export const STATUS = {
  good: '#0ca30c',
  warning: '#fab219',
  critical: '#d03b3b',
} as const

/** Chart chrome. Recessive by design: hairline grid, no dashes. */
export const INK = {
  primary: '#0b0b0b',
  secondary: '#52514e',
  muted: '#898781',
  grid: '#e1e0d9',
  baseline: '#c3c2b7',
  surface: '#ffffff',
} as const

export type SeriesColor = (typeof CATEGORICAL)[number] | (typeof ORDINAL_3)[number]

/** Rounds a raw tick step up to a clean 1/2/5 × 10^n so axis labels stay legible. */
export function niceStep(rawMax: number, tickCount: number): number {
  if (rawMax <= 0) return 1
  const rawStep = rawMax / tickCount
  const exponent = Math.floor(Math.log10(rawStep))
  const fraction = rawStep / 10 ** exponent
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10
  return niceFraction * 10 ** exponent
}

export function axisTicks(rawMax: number, tickCount = 4): { max: number; ticks: number[] } {
  const step = niceStep(rawMax, tickCount)
  const max = step * tickCount
  return { max, ticks: Array.from({ length: tickCount + 1 }, (_, i) => max - step * i) }
}

export function formatNumber(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(Math.round(value))
}
