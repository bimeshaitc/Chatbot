import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { SourceFaq } from '../types'

interface FaqListProps {
  faqs: SourceFaq[]
  /** `knowledge.bot.manage` — editing or removing an FAQ. */
  canManage: boolean
  onEdit: (faq: SourceFaq) => void
  onDelete: (id: string) => void
}

export function FaqList({ faqs, canManage, onEdit, onDelete }: FaqListProps) {
  if (faqs.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-400">No FAQs found.</p>
  }

  return (
    <ul className="flex flex-col divide-y divide-gray-100">
      {faqs.map((faq) => (
        <li key={faq.id} className="flex items-start justify-between gap-4 py-4 first:pt-0">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">{faq.question}</p>
              <Badge variant="blue">{faq.category}</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-600">{faq.answer}</p>
            <p className="mt-2 text-xs text-gray-400">
              Added by {faq.author.name} <span className="font-medium text-gray-500">{faq.author.role}</span> on {faq.addedOn}
            </p>
          </div>

          {canManage && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(faq)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Edit FAQ"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(faq.id)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Delete FAQ"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
