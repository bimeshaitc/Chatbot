import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Tag } from '../types'

interface TagTableProps {
  tags: Tag[]
  onEdit: (tag: Tag) => void
  onDelete: (id: string) => void
}

export function TagTable({ tags, onEdit, onDelete }: TagTableProps) {
  if (tags.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-400">No tags found.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-[#F7F7F8] text-xs tracking-wide text-gray-600 uppercase">
            <th className="p-4 font-medium">Tag</th>
            <th className="p-4 font-medium">Added on</th>
            <th className="p-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag, index) => (
            <tr key={tag.id} className={index !== tags.length - 1 ? 'border-b border-gray-100' : ''}>
              <td className="p-4">
                <Badge variant={tag.color}>{tag.name}</Badge>
              </td>
              <td className="p-4 text-gray-600">{tag.createdAt}</td>
              <td className="p-4">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(tag)}
                    aria-label={`Edit ${tag.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(tag.id)}
                    aria-label={`Delete ${tag.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
