import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPrimaryButton,
  DialogTitle,
} from '@/components/ui/dialog'

interface AddTagDialogProps {
  existingTags: string[]
  onClose: () => void
  onAddTag: (tag: string) => void
}

export function AddTagDialog({ existingTags, onClose, onAddTag }: AddTagDialogProps) {
  const [tag, setTag] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    const value = tag.trim()
    if (!value) {
      setError('Enter a tag name.')
      return
    }
    if (existingTags.some((existing) => existing.toLowerCase() === value.toLowerCase())) {
      setError('That tag is already on this chat.')
      return
    }

    onAddTag(value)
    onClose()
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New Tag</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Input
            label="Tag name"
            placeholder="E.g, Refund"
            value={tag}
            autoFocus
            onChange={(e) => {
              setTag(e.target.value)
              setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSubmit()
              }
            }}
            error={error ?? undefined}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <DialogPrimaryButton className="w-auto px-6" onClick={handleSubmit}>
            Add
          </DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
