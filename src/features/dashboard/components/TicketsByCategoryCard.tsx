import { useMemo } from 'react'
import { InfoTip } from '@/components/InfoTip'
import { CATEGORICAL, INK } from '@/lib/vizTokens'
import { ticketsByCategory } from '../data/mockDashboardData'

export function TicketsByCategoryCard() {
  const rows = useMemo(() => {
    // Aggregate by label rather than trusting one row per category: two rows
    // for the same category must read as one bar, never as two.
    const totals = new Map<string, number>()
    for (const entry of ticketsByCategory) {
      totals.set(entry.label, (totals.get(entry.label) ?? 0) + entry.count)
    }

    // Ranked, because the question this card answers is "what is biggest?".
    // Unsorted bars force the reader to compare every number by eye.
    return [...totals.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  }, [])

  const total = rows.reduce((sum, row) => sum + row.count, 0)
  const max = Math.max(0, ...rows.map((row) => row.count))

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-[15px] leading-[1.4] font-semibold text-gray-900">
          Tickets by Category
          <InfoTip label="Currently open tickets grouped by the category assigned to them. Percentages are each category's share of all open tickets; bar length is relative to the largest category." />
        </h2>
        {/* An anchor for every bar: "18" means nothing without a denominator. */}
        <span className="text-xs" style={{ color: INK.secondary }}>
          {total.toLocaleString()} open
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No open tickets.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {rows.map((row) => {
            const share = total > 0 ? Math.round((row.count / total) * 100) : 0

            return (
              <li key={row.label}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium text-gray-800" title={row.label}>
                    {row.label}
                  </span>
                  <span className="shrink-0 tabular-nums" style={{ color: INK.secondary }}>
                    <span className="font-semibold text-gray-900">{row.count.toLocaleString()}</span>
                    <span className="ml-1.5 text-xs">{share}%</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: INK.grid }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      // Scaled against the largest category, not the total, so
                      // the biggest bar fills the track and small differences
                      // stay visible.
                      width: `${max > 0 ? Math.min(100, (row.count / max) * 100) : 0}%`,
                      backgroundColor: CATEGORICAL[0],
                    }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
