import { useState } from 'react'
import { BarChart3, Table2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { INK } from '@/lib/vizTokens'

interface LegendEntry {
  label: string
  color: string
}

interface ChartCardProps {
  title: string
  caption?: string
  /** Always supplied for 2+ series, so identity is never colour alone. */
  legend?: LegendEntry[]
  /** The same numbers as a table — the required relief for low-contrast hues. */
  table: { columns: string[]; rows: (string | number)[][] }
  children: React.ReactNode
}

export function ChartCard({ title, caption, legend, table, children }: ChartCardProps) {
  const [showTable, setShowTable] = useState(false)

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {caption && <p className="mt-0.5 text-xs text-[#6E7678]">{caption}</p>}
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5">
          <button
            type="button"
            onClick={() => setShowTable(false)}
            aria-pressed={!showTable}
            title="Chart view"
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-md transition-colors',
              !showTable ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <BarChart3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowTable(true)}
            aria-pressed={showTable}
            title="Table view"
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-md transition-colors',
              showTable ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <Table2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {legend && legend.length > 1 && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {legend.map((entry) => (
            <span key={entry.label} className="flex items-center gap-1.5 text-xs" style={{ color: INK.secondary }}>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.label}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4">
        {showTable ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-[#F7F7F8] text-xs tracking-wide text-gray-600 uppercase">
                  {table.columns.map((column) => (
                    <th key={column} className="p-3 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex !== table.rows.length - 1 ? 'border-b border-gray-100' : ''}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={cn('p-3', cellIndex === 0 ? 'text-gray-800' : 'text-gray-600 tabular-nums')}
                      >
                        {typeof cell === 'number' ? cell.toLocaleString() : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  )
}
