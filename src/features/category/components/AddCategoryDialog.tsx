import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogPrimaryButton, DialogTitle } from '@/components/ui/dialog'
import type { Category } from '../types'

interface AddCategoryDialogProps {
  category: Category | null
  onClose: () => void
  onCreate: (name: string) => void
  onRename: (id: string, name: string) => void
}

export function AddCategoryDialog({ category, onClose, onCreate, onRename }: AddCategoryDialogProps) {
  const isEditing = Boolean(category)
  const [name, setName] = useState(category?.name ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Category name is required.')
      return
    }

    if (category) {
      onRename(category.id, trimmed)
    } else {
      onCreate(trimmed)
    }
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
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Input label="Category Name" placeholder="Enter category name here" value={name} onChange={(e) => setName(e.target.value)} />
          {error && <p className="text-xs text-red-600">{error}</p>}
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
