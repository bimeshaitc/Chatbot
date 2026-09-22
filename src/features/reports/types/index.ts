import type { Scope } from '@/config/roles'

export interface ReportSeries {
  key: string
  label: string
  /** Values align index-for-index with the block's `labels`. */
  values: number[]
}

/** One visual block inside a report. */
export type ReportBlock =
  | {
      kind: 'line'
      title: string
      /** Shown under the title to say what the reader should take from it. */
      caption?: string
      labels: string[]
      series: ReportSeries[]
      unit?: string
    }
  | {
      kind: 'bar'
      title: string
      caption?: string
      labels: string[]
      series: ReportSeries[]
      /** `stacked` is only valid when the series are genuinely ordered parts of a whole. */
      stacked?: boolean
      /** Use the ordered ramp instead of categorical hues. Requires `stacked`. */
      ordered?: boolean
      unit?: string
    }
  | {
      kind: 'hbar'
      title: string
      caption?: string
      rows: { label: string; value: number }[]
      unit?: string
    }
  | {
      kind: 'table'
      title: string
      caption?: string
      columns: string[]
      rows: (string | number)[][]
    }

export type StatTone = 'neutral' | 'good' | 'warning' | 'critical'

export interface ReportStat {
  label: string
  value: string
  /** Change against the previous period, already formatted (e.g. "+12%"). */
  delta?: string
  /** Whether the delta is a good or bad thing — drives the icon, not just colour. */
  tone?: StatTone
  hint?: string
}

export type ReportGroup = 'Overview' | 'Chats' | 'AI Bot' | 'Tickets' | 'Agents' | 'Knowledge' | 'Export'

export interface ReportDefinition {
  id: string
  group: ReportGroup
  title: string
  description: string
  stats?: ReportStat[]
  blocks?: ReportBlock[]
  /** Set for the export tools, which are actions rather than charts. */
  isTool?: boolean
  /**
   * The narrowest `reports` scope tier that may see this report. Defaults to
   * `own` when absent — a personal view of the reader's own numbers needs no
   * explicit tier. Reports that compare or aggregate *across* agents (AI Bot
   * config health, agent leaderboards, knowledge-ops coverage, and the two
   * desk-wide Chats views) are set to `team`, since there is nothing to
   * compare at `own` scope — a CSR only ever sees their own numbers.
   */
  minScope?: Scope
}

export type DateRange = '7d' | '30d' | '90d'
