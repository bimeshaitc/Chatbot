import { cn } from '@/lib/utils'

interface GroupPickerProps {
  groups: string[]
  selected: string[]
  onToggle: (group: string) => void
}

/**
 * Which agent groups may read this. Empty means the whole workspace — that is
 * the default and is left unstated rather than requiring "select all" to mean
 * the same thing, since a page with no groups checked reads more naturally as
 * "open to everyone" than "open to no one".
 */
export function GroupPicker({ groups, selected, onToggle }: GroupPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">Visible to</span>
      <div className="flex flex-wrap gap-1.5">
        {groups.map((group) => {
          const isSelected = selected.includes(group)
          return (
            <button
              key={group}
              type="button"
              onClick={() => onToggle(group)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                isSelected
                  ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50',
              )}
            >
              {group}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-gray-400">
        {selected.length === 0 ? 'Nothing selected — visible to the whole workspace.' : 'Visible only to the selected groups.'}
      </p>
    </div>
  )
}
