import { Input } from '@/components/ui/Input'

interface ColorFieldProps {
  label: string
  description: string
  value: string
  onChange: (value: string) => void
}

export function ColorField({ label, description, value, onChange }: ColorFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <p className="text-xs text-gray-500">{description}</p>
      <div className="mt-1 flex items-center gap-2">
        <label
          className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-md border border-gray-200"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={label}
          />
        </label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="max-w-[160px] uppercase" />
      </div>
    </div>
  )
}
