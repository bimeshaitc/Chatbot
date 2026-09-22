import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogPrimaryButton, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { NewTagInput, Tag, TagColor } from '../types'

const COLOR_OPTIONS: { value: TagColor; swatchClassName: string }[] = [
  { value: 'blue', swatchClassName: 'bg-blue-500' },
  { value: 'emerald', swatchClassName: 'bg-emerald-500' },
  { value: 'amber', swatchClassName: 'bg-amber-500' },
  { value: 'rose', swatchClassName: 'bg-rose-500' },
  { value: 'violet', swatchClassName: 'bg-violet-500' },
  { value: 'cyan', swatchClassName: 'bg-cyan-500' },
  { value: 'gray', swatchClassName: 'bg-gray-400' },
]

interface AddTagDialogProps {
  tag: Tag | null
  existingNames: string[]
  onClose: () => void
  onSave: (input: NewTagInput) => void
}

export function AddTagDialog({ tag, existingNames, onClose, onSave }: AddTagDialogProps) {
  const isEditing = Boolean(tag)
  const [name, setName] = useState(tag?.name ?? '')
  const [color, setColor] = useState<TagColor>(tag?.color ?? 'blue')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Tag name is required.')
      return
    }
    const isDuplicate = existingNames.some(
      (existing) => existing.toLowerCase() === trimmed.toLowerCase() && existing !== tag?.name,
    )
    if (isDuplicate) {
      setError('A tag with this name already exists.')
      return
    }

    onSave({ name: trimmed, color })
    onClose()
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Tag' : 'Add New Tag'}</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <div>
            <Input label="Tag Name" placeholder="Enter tag name" value={name} onChange={(e) => setName(e.target.value)} />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Color</span>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-label={option.value}
                  onClick={() => setColor(option.value)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-offset-2 transition-shadow',
                    option.swatchClassName,
                    color === option.value ? 'ring-gray-900' : 'ring-transparent',
                  )}
                >
                  {color === option.value && <Check className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <DialogPrimaryButton className="w-auto px-6" onClick={handleSubmit}>
            {isEditing ? 'Save' : 'Add'}
          </DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
