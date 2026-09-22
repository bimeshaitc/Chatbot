import { Globe } from 'lucide-react'
import type { SourceUrl } from '../types'
import { AudienceBadge } from './TrainingStatusBadge'
import { FetchingStatusCell } from './FetchingStatusCell'
import { AuthorCell } from './AuthorCell'
import { SourceActionsMenu } from './SourceActionsMenu'

interface SourceUrlsTableProps {
  urls: SourceUrl[]
  canManage: boolean
  canRetrain: boolean
  onDelete: (id: string) => void
  onToggleEnabled: (id: string) => void
  onRetrain: (id: string) => void
}

export function SourceUrlsTable({ urls, canManage, canRetrain, onDelete, onToggleEnabled, onRetrain }: SourceUrlsTableProps) {
  if (urls.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-400">No website URLs found.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[1180px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-[#F7F7F8] text-xs tracking-wide text-gray-600 uppercase">
            <th className="p-4 font-medium">URL source</th>
            <th className="p-4 font-medium">Training</th>
            <th className="p-4 font-medium">Depth</th>
            <th className="p-4 font-medium">Chunks</th>
            <th className="p-4 font-medium">Audience</th>
            <th className="p-4 font-medium">Answers</th>
            <th className="p-4 font-medium">Author</th>
            <th className="p-4 font-medium">Last trained</th>
            <th className="p-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {urls.map((entry, index) => (
            <tr key={entry.id} className={index !== urls.length - 1 ? 'border-b border-gray-100' : ''}>
              <td className="p-4">
                <span className="flex items-start gap-2">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <span className="flex flex-col">
                    <span className="text-gray-800">{entry.label}</span>
                    <a href={entry.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                      {entry.url}
                    </a>
                  </span>
                </span>
              </td>
              <td className="p-4">
                <FetchingStatusCell
                  status={entry.status}
                  isEnabled={entry.isEnabled}
                  url={entry.url}
                  failureReason={entry.failureReason}
                />
              </td>
              <td className="p-4 text-gray-600">{entry.crawlDepth}</td>
              <td className="p-4 text-gray-600">{entry.chunks || '—'}</td>
              <td className="p-4">
                <AudienceBadge audience={entry.audience} />
              </td>
              <td className="p-4">
                <AuthorCell author={entry.author} />
              </td>
              <td className="p-4 text-gray-600">{entry.lastTrainedOn}</td>
              <td className="p-4 text-right">
                <SourceActionsMenu
                  isEnabled={entry.isEnabled}
                  canManage={canManage}
                  canRetrain={canRetrain}
                  onToggleEnabled={() => onToggleEnabled(entry.id)}
                  onRetrain={() => onRetrain(entry.id)}
                  onDelete={() => onDelete(entry.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
