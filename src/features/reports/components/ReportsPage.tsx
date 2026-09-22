import { useMemo, useState } from 'react'
import { CalendarDays, Download, Mail, Search } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/PageHeader'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import { usePermission, useScope } from '@/stores/useWorkspaceRoleStore'
import type { DateRange } from '../types'
import { reportDefinitions, reportGroupOrder } from '../data/mockReportsData'
import { ReportBlockView } from './ReportBlockView'
import { StatTile } from './StatTile'

const dateRanges: { value: DateRange; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
]

const SCOPE_RANK: Record<string, number> = { none: -1, own: 0, team: 1, all: 2 }

export function ReportsPage() {
  const scope = useScope('reports')
  const canExport = usePermission('reports.export')
  const canSchedule = usePermission('reports.schedule')

  const [activeId, setActiveId] = useState('dashboard')
  const [range, setRange] = useState<DateRange>('7d')
  const [search, setSearch] = useState('')

  const debouncedSearch = useDebounce(search)

  // Scope decides the analytical reports (own vs. team-wide comparisons);
  // the two Export-group entries are actions, not data, so they are gated on
  // the matching permission instead — a CSR Admin can generate a report but
  // not schedule one, independent of how much data they can see.
  const accessibleReports = useMemo(() => {
    return reportDefinitions.filter((entry) => {
      if (entry.id === 'generate-report') return canExport
      if (entry.id === 'scheduled-reports') return canSchedule
      return SCOPE_RANK[scope] >= SCOPE_RANK[entry.minScope ?? 'own']
    })
  }, [scope, canExport, canSchedule])

  const effectiveId = accessibleReports.some((entry) => entry.id === activeId)
    ? activeId
    : (accessibleReports[0]?.id ?? 'dashboard')
  const report = accessibleReports.find((entry) => entry.id === effectiveId) ?? accessibleReports[0]

  const groupedReports = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()
    const matching = query
      ? accessibleReports.filter((entry) =>
          `${entry.title} ${entry.description} ${entry.group}`.toLowerCase().includes(query),
        )
      : accessibleReports

    return reportGroupOrder
      .map((group) => ({ group, reports: matching.filter((entry) => entry.group === group) }))
      .filter((entry) => entry.reports.length > 0)
  }, [accessibleReports, debouncedSearch])

  // Guaranteed non-empty in practice: reaching this page at all requires one
  // of the `reports.view.*` tiers, and Overview carries no `minScope` — but
  // TS can't see that, so guard rather than assert.
  if (!report) return null

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-4">
      <PageHeader title="Reports" description="How the desk, the agents and the AI are actually performing" />

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex w-full shrink-0 flex-col gap-3 lg:w-60">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find a report"
              aria-label="Find a report"
              className="h-9 w-full rounded-lg border border-gray-200 pr-3 pl-9 text-sm outline-none focus:border-[#1B5E20]"
            />
          </div>

          <nav className="flex flex-col gap-3">
            {groupedReports.length === 0 ? (
              <p className="px-2 text-xs text-gray-400">No report matches that.</p>
            ) : (
              groupedReports.map(({ group, reports }) => (
                <div key={group} className="flex flex-col gap-0.5">
                  <p className="px-2 pt-1 pb-1 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
                    {group}
                  </p>
                  {reports.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setActiveId(entry.id)}
                      className={cn(
                        'rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors',
                        effectiveId === entry.id
                          ? 'bg-[#E8EFE9] font-medium text-[#1B5E20]'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      )}
                    >
                      {entry.title}
                    </button>
                  ))}
                </div>
              ))
            )}
          </nav>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Filters sit in one row above the charts, never inside a chart card. */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-gray-900">{report.title}</h2>
              <p className="mt-0.5 text-xs text-[#6E7678]">{report.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5">
                <CalendarDays className="mx-1.5 h-3.5 w-3.5 text-gray-400" />
                {dateRanges.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRange(option.value)}
                    className={cn(
                      'rounded-md px-2 py-1 text-xs font-medium transition-colors',
                      range === option.value
                        ? 'bg-[#E8EFE9] text-[#1B5E20]'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {canExport && (
                <Button variant="outline" size="sm" onClick={() => toast.success(`${report.title} exported as CSV`)}>
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
              )}
            </div>
          </div>

          {report.stats && report.stats.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {report.stats.map((stat) => (
                <StatTile key={stat.label} stat={stat} />
              ))}
            </div>
          )}

          {report.isTool && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {canExport && (
                  <>
                    <Button
                      onClick={() => toast.success('CSV export queued, we will email you the link')}
                      className="bg-[#1B5E20] text-white hover:bg-[#1B5E20]/90"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button variant="outline" onClick={() => toast.success('PDF summary queued')}>
                      <Download className="h-4 w-4" />
                      PDF summary
                    </Button>
                  </>
                )}
                {canSchedule && (
                  <Button variant="outline" onClick={() => toast.info('Pick a report and a frequency to schedule it')}>
                    <Mail className="h-4 w-4" />
                    Schedule by email
                  </Button>
                )}
              </div>
              <p className="mt-3 text-xs text-[#6E7678]">
                Exports cover the selected period ({dateRanges.find((r) => r.value === range)?.label.toLowerCase()}).
              </p>
            </div>
          )}

          {report.blocks?.map((block) => <ReportBlockView key={block.title} block={block} />)}

          {!report.blocks && !report.isTool && (
            <p className="rounded-2xl border border-dashed border-gray-200 px-6 py-12 text-center text-sm text-gray-400">
              No data for this period.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
