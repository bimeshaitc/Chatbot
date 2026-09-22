import type { ReportBlock } from '../types'
import { CATEGORICAL, ORDINAL_3 } from '@/lib/vizTokens'
import { BarChart } from './charts/BarChart'
import { ChartCard } from './charts/ChartCard'
import { HBarChart } from './charts/HBarChart'
import { LineChart } from './charts/LineChart'

/** Turns a block's series into the table view every chart card carries. */
function seriesTable(labels: string[], series: { label: string; values: number[] }[]) {
  return {
    columns: ['Period', ...series.map((entry) => entry.label)],
    rows: labels.map((label, index) => [label, ...series.map((entry) => entry.values[index] ?? 0)]),
  }
}

export function ReportBlockView({ block }: { block: ReportBlock }) {
  if (block.kind === 'line') {
    return (
      <ChartCard
        title={block.title}
        caption={block.caption}
        legend={block.series.map((entry, index) => ({
          label: entry.label,
          color: CATEGORICAL[index % CATEGORICAL.length],
        }))}
        table={seriesTable(block.labels, block.series)}
      >
        <LineChart labels={block.labels} series={block.series} unit={block.unit} />
      </ChartCard>
    )
  }

  if (block.kind === 'bar') {
    const palette = block.ordered ? ORDINAL_3 : CATEGORICAL
    return (
      <ChartCard
        title={block.title}
        caption={block.caption}
        legend={block.series.map((entry, index) => ({
          label: entry.label,
          color: palette[index % palette.length],
        }))}
        table={seriesTable(block.labels, block.series)}
      >
        <BarChart
          labels={block.labels}
          series={block.series}
          stacked={block.stacked}
          ordered={block.ordered}
          unit={block.unit}
        />
      </ChartCard>
    )
  }

  if (block.kind === 'hbar') {
    return (
      <ChartCard
        title={block.title}
        caption={block.caption}
        table={{ columns: ['Item', 'Value'], rows: block.rows.map((row) => [row.label, row.value]) }}
      >
        <HBarChart rows={block.rows} unit={block.unit} />
      </ChartCard>
    )
  }

  // A table block is already the table view, so the toggle would be a no-op.
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">{block.title}</h3>
      {block.caption && <p className="mt-0.5 text-xs text-[#6E7678]">{block.caption}</p>}

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-[#F7F7F8] text-xs tracking-wide text-gray-600 uppercase">
              {block.columns.map((column) => (
                <th key={column} className="p-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex !== block.rows.length - 1 ? 'border-b border-gray-100' : ''}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={cellIndex === 0 ? 'p-3 text-gray-800' : 'p-3 text-gray-600 tabular-nums'}
                  >
                    {typeof cell === 'number' ? cell.toLocaleString() : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
