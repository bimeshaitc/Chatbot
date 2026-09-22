import { Globe2, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KnowledgeVisibility } from '../types'

interface VisibilityToggleProps {
  value: KnowledgeVisibility
  onChange: (value: KnowledgeVisibility) => void
}

const OPTIONS: { value: KnowledgeVisibility; label: string; description: string; icon: typeof Lock }[] = [
  { value: 'internal', label: 'Internal', description: 'Staff only. Never reachable by a customer or the chatbot.', icon: Lock },
  {
    value: 'public',
    label: 'Public',
    description: 'Approved for customer-facing use — eligible to feed the chatbot once added under Chatbot Knowledge.',
    icon: Globe2,
  },
]

/**
 * Internal ↔ Public (BE-16). Switching to Public does not, by itself, put
 * anything in front of a customer or the chatbot — it only makes the item
 * *eligible*. Feeding the chatbot still requires adding it under Chatbot
 * Knowledge (`features/bot-training`), which only offers Public items.
 */
export function VisibilityToggle({ value, onChange }: VisibilityToggleProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">Visibility</span>
      <div className="flex flex-col gap-1.5 sm:flex-row">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'flex flex-1 items-start gap-2 rounded-lg border px-3 py-2 text-left transition-colors',
              value === option.value
                ? 'border-[#1B5E20] bg-[#1B5E20]/5'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
            )}
          >
            <option.icon className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', value === option.value ? 'text-[#1B5E20]' : 'text-gray-400')} />
            <span>
              <span className={cn('block text-sm font-medium', value === option.value ? 'text-[#1B5E20]' : 'text-gray-900')}>
                {option.label}
              </span>
              <span className="block text-xs text-gray-500">{option.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
