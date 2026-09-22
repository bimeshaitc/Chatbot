import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPrimaryButton,
  DialogTitle,
} from '@/components/ui/dialog'
import { generateId } from '@/lib/utils'
import { articleCategories, createDefaultOwner } from '../data/mockKnowledgeBaseData'
import { formatToday } from '../utils/formatDate'
import type { ArticleCategory, InternalLink, KnowledgeVisibility } from '../types'
import { GroupPicker } from './GroupPicker'
import { VisibilityToggle } from './VisibilityToggle'

interface AddInternalLinkDialogProps {
  open: boolean
  groupOptions: string[]
  onOpenChange: (open: boolean) => void
  onAdd: (link: InternalLink) => void
}

function isLikelyUrl(value: string): boolean {
  try {
    // Bare domains (e.g. "wiki.example.com") are common when pasting quickly,
    // so a missing scheme is filled in before validating rather than rejected.
    new URL(/^[a-z]+:\/\//i.test(value) ? value : `https://${value}`)
    return true
  } catch {
    return false
  }
}

export function AddInternalLinkDialog({ open, groupOptions, onOpenChange, onAdd }: AddInternalLinkDialogProps) {
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState<ArticleCategory | null>(null)
  const [groups, setGroups] = useState<string[]>([])
  const [visibility, setVisibility] = useState<KnowledgeVisibility>('internal')
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setLabel('')
    setUrl('')
    setCategory(null)
    setGroups([])
    setVisibility('internal')
    setError(null)
  }

  function toggleGroup(group: string) {
    setGroups((prev) => (prev.includes(group) ? prev.filter((entry) => entry !== group) : [...prev, group]))
  }

  function handleSubmit() {
    if (!label.trim()) {
      setError('Give the link a name agents will recognise.')
      return
    }
    if (!url.trim() || !isLikelyUrl(url.trim())) {
      setError('Enter a valid web address.')
      return
    }
    if (!category) {
      setError('Select a category.')
      return
    }

    const normalisedUrl = /^[a-z]+:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`

    onAdd({
      id: generateId(),
      label: label.trim(),
      url: normalisedUrl,
      category,
      groups,
      visibility,
      owner: createDefaultOwner(),
      addedOn: formatToday(),
    })
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) resetForm()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add website link</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Input
            label="Name *"
            placeholder="e.g. Carrier claims portal"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <Input
            label="Web address *"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Category *</span>
            <Select value={category} onValueChange={(value) => setCategory(value as ArticleCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {articleCategories.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <GroupPicker groups={groupOptions} selected={groups} onToggle={toggleGroup} />

          <VisibilityToggle value={visibility} onChange={setVisibility} />

          <p className="text-xs text-gray-400">
            A bookmark for agents, not a crawl — this is never fetched or indexed on its own. To feed the chatbot from a
            website, add the URL under Chatbot Knowledge{visibility === 'public' ? ', which can also import this link once saved' : ''}.
          </p>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </DialogBody>
        <DialogFooter>
          <DialogPrimaryButton onClick={handleSubmit}>Add link</DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
