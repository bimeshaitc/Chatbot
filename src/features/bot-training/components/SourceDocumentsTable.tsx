import { FileText, TriangleAlert } from 'lucide-react'
import type { SourceDocument } from '../types'
import { AudienceBadge, TrainingStatusBadge } from './TrainingStatusBadge'
import { AuthorCell } from './AuthorCell'
import { SourceActionsMenu } from './SourceActionsMenu'

interface SourceDocumentsTableProps {
  documents: SourceDocument[]
  canManage: boolean
  canRetrain: boolean
  onDelete: (id: string) => void
  onToggleEnabled: (id: string) => void
  onRetrain: (id: string) => void
}

export function SourceDocumentsTable({
  documents,
  canManage,
  canRetrain,
  onDelete,
  onToggleEnabled,
  onRetrain,
}: SourceDocumentsTableProps) {
  if (documents.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-400">No documents found.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[1000px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-[#F7F7F8] text-xs tracking-wide text-gray-600 uppercase">
            <th className="p-4 font-medium">Document name</th>
            <th className="p-4 font-medium">Training</th>
            <th className="p-4 font-medium">Chunks</th>
            <th className="p-4 font-medium">Answers</th>
            <th className="p-4 font-medium">Audience</th>
            <th className="p-4 font-medium">Added by</th>
            <th className="p-4 font-medium">Last trained</th>
            <th className="p-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc, index) => (
            <tr key={doc.id} className={index !== documents.length - 1 ? 'border-b border-gray-100' : ''}>
              <td className="p-4">
                <span className="flex items-start gap-2 text-gray-800">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="flex flex-col">
                    <span>{doc.name}</span>
                    <span className="text-xs text-gray-400">{doc.sizeLabel}</span>
                  </span>
                </span>
              </td>
              <td className="p-4">
                <TrainingStatusBadge status={doc.status} isEnabled={doc.isEnabled} />
                {doc.failureReason && (
                  <span className="mt-1 flex items-start gap-1 text-xs text-rose-600">
                    <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" />
                    {doc.failureReason}
                  </span>
                )}
              </td>
              <td className="p-4 text-gray-600">{doc.chunks || '—'}</td>
              <td className="p-4 text-gray-600">{doc.answersServed || '—'}</td>
              <td className="p-4">
                <AudienceBadge audience={doc.audience} />
              </td>
              <td className="p-4">
                <AuthorCell author={doc.author} />
              </td>
              <td className="p-4 text-gray-600">{doc.lastTrainedOn}</td>
              <td className="p-4 text-right">
                <SourceActionsMenu
                  isEnabled={doc.isEnabled}
                  canManage={canManage}
                  canRetrain={canRetrain}
                  onToggleEnabled={() => onToggleEnabled(doc.id)}
                  onRetrain={() => onRetrain(doc.id)}
                  onDelete={() => onDelete(doc.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
