import { useRef } from 'react'
import { MessageCircle, MessageSquare, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { BotAppearanceSettings, LauncherPreset, WidgetPosition } from '../types'
import { ColorField } from './ColorField'

interface AppearanceTabProps {
  value: BotAppearanceSettings
  onChange: (value: BotAppearanceSettings) => void
}

const LAUNCHER_PRESETS: { key: LauncherPreset; icon: typeof MessageSquare; label: string }[] = [
  { key: 'bubble', icon: MessageSquare, label: 'Chat bubble icon' },
  { key: 'circle', icon: MessageCircle, label: 'Chat circle icon' },
]

export function AppearanceTab({ value, onChange }: AppearanceTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function update(patch: Partial<BotAppearanceSettings>) {
    onChange({ ...value, ...patch })
  }

  function handleCustomIcon(file: File | null) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update({ customLauncherIcon: reader.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <ColorField
          label="Primary colour"
          description="Customize the widget's color scheme"
          value={value.primaryColor}
          onChange={(primaryColor) => update({ primaryColor })}
        />
        <ColorField
          label="Secondary Color"
          description="Refine secondary color palette for better contrast"
          value={value.secondaryColor}
          onChange={(secondaryColor) => update({ secondaryColor })}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Widget Launcher</span>
          <div className="mt-1 flex items-center gap-2">
            {LAUNCHER_PRESETS.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => update({ launcherIcon: key, customLauncherIcon: null })}
                aria-label={label}
                aria-pressed={value.launcherIcon === key && !value.customLauncherIcon}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-md border text-gray-500 hover:border-gray-300',
                  value.launcherIcon === key && !value.customLauncherIcon
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200',
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload a custom launcher icon"
              aria-pressed={Boolean(value.customLauncherIcon)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-md border text-gray-500 hover:border-gray-300',
                value.customLauncherIcon ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200',
              )}
            >
              <Upload className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleCustomIcon(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Widget Position</span>
          <RadioGroup
            value={value.widgetPosition}
            onValueChange={(position) => update({ widgetPosition: position as WidgetPosition })}
            className="mt-2 flex flex-row gap-6"
          >
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <RadioGroupItem value="left" />
              Button left
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <RadioGroupItem value="right" />
              Button Right
            </label>
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}
