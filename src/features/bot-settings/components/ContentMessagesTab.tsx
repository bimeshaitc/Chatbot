import { useRef, useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import type { BotContentSettings } from '../types'

interface ContentMessagesTabProps {
  value: BotContentSettings
  onChange: (value: BotContentSettings) => void
}

export function ContentMessagesTab({ value, onChange }: ContentMessagesTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  function update(patch: Partial<BotContentSettings>) {
    onChange({ ...value, ...patch })
  }

  function handleLogoSelect(file: File | null) {
    if (!file) return
    if (!/^image\/(jpe?g|png)$/i.test(file.type)) {
      setError('Only JPG, JPEG or PNG files are supported.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => update({ logoUrl: reader.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input label="Company Name" value={value.companyName} onChange={(e) => update({ companyName: e.target.value })} />
        <Input label="Header Text" value={value.headerText} onChange={(e) => update({ headerText: e.target.value })} />
      </div>

      <Textarea
        label="Greeting Message"
        value={value.greetingMessage}
        onChange={(e) => update({ greetingMessage: e.target.value })}
        rows={3}
      />

      <Textarea
        label="Away Message"
        value={value.awayMessage}
        onChange={(e) => update({ awayMessage: e.target.value })}
        rows={2}
      />

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Upload Logo</span>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            handleLogoSelect(e.dataTransfer.files[0] ?? null)
          }}
          className="flex w-fit flex-col items-center gap-1 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-4 text-center text-xs text-gray-500 hover:border-primary/40"
        >
          {value.logoUrl ? (
            <img src={value.logoUrl} alt="Widget logo" className="h-10 w-10 rounded object-contain" />
          ) : (
            <ImageIcon className="h-6 w-6 text-gray-400" />
          )}
          <span>Max. 1500x1000 px</span>
          <span>jpg, jpeg, png</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          className="hidden"
          onChange={(e) => handleLogoSelect(e.target.files?.[0] ?? null)}
        />
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  )
}
