import { useState } from 'react'
import { Check, ChevronDown, Lock, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogPrimaryButton, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { CannedResponseConfig, CannedResponseVisibility, NewCannedResponseInput } from '../types'

const VISIBILITY_OPTIONS: { value: CannedResponseVisibility; label: string; description: string; icon: typeof Users }[] = [
  { value: 'shared', label: 'Shared', description: 'Any agent in the selected group(s) can use it.', icon: Users },
  { value: 'private', label: 'Private', description: 'Only you can use it.', icon: Lock },
]

interface AddCannedResponseDialogProps {
  response: CannedResponseConfig | null
  groupOptions: string[]
  onClose: () => void
  onSave: (input: NewCannedResponseInput) => void
}

export function AddCannedResponseDialog({ response, groupOptions, onClose, onSave }: AddCannedResponseDialogProps) {
  const isEditing = Boolean(response)
  const [title, setTitle] = useState(response?.title ?? '')
  const [shortcut, setShortcut] = useState(response?.shortcut ?? '')
  const [body, setBody] = useState(response?.body ?? '')
  const [visibility, setVisibility] = useState<CannedResponseVisibility>(response?.visibility ?? 'shared')
  const [groups, setGroups] = useState<string[]>(response?.groups ?? [])
  const [error, setError] = useState<string | null>(null)

  function toggleGroup(group: string) {
    setGroups((prev) => (prev.includes(group) ? prev.filter((entry) => entry !== group) : [...prev, group]))
  }

  function handleSubmit() {
    if (!title.trim() || !shortcut.trim() || !body.trim()) {
      setError('Title, shortcut and response text are all required.')
      return
    }
    onSave({ title: title.trim(), shortcut: shortcut.trim(), body: body.trim(), visibility, groups })
    onClose()
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Canned Response' : 'Add New Canned Response'}</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Title" placeholder="e.g. Greeting" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input
              label="Shortcut"
              placeholder="/greeting"
              value={shortcut}
              onChange={(e) => setShortcut(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Response text</span>
            <Textarea
              rows={4}
              placeholder="What the agent sends"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Visibility</span>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 self-start rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50">
                {(() => {
                  const Icon = VISIBILITY_OPTIONS.find((option) => option.value === visibility)!.icon
                  return <Icon className="h-3.5 w-3.5 text-gray-500" />
                })()}
                {VISIBILITY_OPTIONS.find((option) => option.value === visibility)!.label}
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-64">
                {VISIBILITY_OPTIONS.map((option) => (
                  <DropdownMenuItem key={option.value} className="flex-col items-start gap-0.5" onClick={() => setVisibility(option.value)}>
                    <span className="flex w-full items-center gap-1.5">
                      <option.icon className="h-3.5 w-3.5 text-gray-500" />
                      <span className="flex-1 text-sm font-medium text-gray-900">{option.label}</span>
                      {visibility === option.value && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </span>
                    <span className="pl-5 text-xs text-[#6E7678]">{option.description}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {visibility === 'shared' && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Groups</span>
              <p className="text-xs text-[#6E7678]">Leave all unselected to share it with every group.</p>
              <div className="flex flex-wrap gap-1.5">
                {groupOptions.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => toggleGroup(group)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      groups.includes(group)
                        ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
          )}

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
