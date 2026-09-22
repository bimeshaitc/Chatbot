import { Lock, Pencil, Trash2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { CannedResponseConfig } from '../types'

interface CannedResponseTableProps {
  responses: CannedResponseConfig[]
  canManage: (response: CannedResponseConfig) => boolean
  onEdit: (response: CannedResponseConfig) => void
  onDelete: (id: string) => void
}

export function CannedResponseTable({ responses, canManage, onEdit, onDelete }: CannedResponseTableProps) {
  if (responses.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-400">No canned responses found.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-[#F7F7F8] text-xs tracking-wide text-gray-600 uppercase">
            <th className="p-4 font-medium">Shortcut</th>
            <th className="p-4 font-medium">Title</th>
            <th className="p-4 font-medium">Visibility</th>
            <th className="p-4 font-medium">Owner</th>
            <th className="p-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {responses.map((response, index) => {
            const manageable = canManage(response)
            return (
              <tr key={response.id} className={index !== responses.length - 1 ? 'border-b border-gray-100' : ''}>
                <td className="p-4">
                  <code className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700">{response.shortcut}</code>
                </td>
                <td className="p-4">
                  <p className="text-gray-800">{response.title}</p>
                  <p className="mt-0.5 max-w-xs truncate text-xs text-gray-400">{response.body}</p>
                </td>
                <td className="p-4">
                  {response.visibility === 'private' ? (
                    <Badge variant="gray" className="gap-1">
                      <Lock className="h-3 w-3" />
                      Private
                    </Badge>
                  ) : (
                    <span className="flex flex-col gap-1">
                      <Badge variant="emerald" className="w-fit gap-1">
                        <Users className="h-3 w-3" />
                        Shared
                      </Badge>
                      {response.groups.length > 0 && (
                        <span className="text-[11px] text-gray-500">{response.groups.join(', ')}</span>
                      )}
                    </span>
                  )}
                </td>
                <td className="p-4 text-gray-600">{response.ownerName}</td>
                <td className="p-4">
                  {manageable ? (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(response)}
                        aria-label={`Edit ${response.title}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(response.id)}
                        aria-label={`Delete ${response.title}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="block text-right text-[11px] text-gray-300">Not yours to manage</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
