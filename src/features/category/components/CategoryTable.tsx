import { Pencil, Power, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Category } from '../types'

interface CategoryTableProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onToggleEnabled: (category: Category) => void
  onDelete: (id: string) => void
}

export function CategoryTable({ categories, onEdit, onToggleEnabled, onDelete }: CategoryTableProps) {
  if (categories.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-400">No categories found.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-[#F7F7F8] text-xs tracking-wide text-gray-600 uppercase">
            <th className="p-4 font-medium">Category name</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium">Added by</th>
            <th className="p-4 font-medium">Added on</th>
            <th className="p-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={category.id} className={index !== categories.length - 1 ? 'border-b border-gray-100' : ''}>
              <td className="p-4 text-gray-800">{category.name}</td>
              <td className="p-4">
                <Badge variant={category.enabled ? 'emerald' : 'gray'}>{category.enabled ? 'Enabled' : 'Disabled'}</Badge>
              </td>
              <td className="p-4">
                <span className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${category.addedBy.avatarColor}`}
                  >
                    {category.addedBy.initials}
                  </span>
                  <span className="text-gray-700">{category.addedBy.name}</span>
                  <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">{category.addedBy.role}</span>
                </span>
              </td>
              <td className="p-4 text-gray-600">{category.addedOn}</td>
              <td className="p-4">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onToggleEnabled(category)}
                    aria-label={category.enabled ? 'Disable category' : 'Enable category'}
                    title={category.enabled ? 'Disable — stays on existing chats/tickets, hidden for new ones' : 'Re-enable this category'}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Power className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(category)}
                    aria-label="Edit category"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(category.id)}
                    aria-label="Delete category"
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
