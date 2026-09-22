import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface SettingToggleProps {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** For a value that only reflects another setting — e.g. the post-chat rating step tracking "Let customers rate agents". */
  disabled?: boolean
}

/** One on/off setting row — label, optional description, switch. Used across every tab here. */
export function SettingToggle({ label, description, checked, onCheckedChange, disabled }: SettingToggleProps) {
  return (
    <label className={cn('flex items-start justify-between gap-4', disabled && 'opacity-60')}>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-700">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-gray-500">{description}</span>}
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} className="mt-0.5 shrink-0" />
    </label>
  )
}
