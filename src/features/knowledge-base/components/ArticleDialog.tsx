import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
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
import type { ArticleCategory, InternalArticle, KnowledgeVisibility } from '../types'
import { GroupPicker } from './GroupPicker'
import { VisibilityToggle } from './VisibilityToggle'

interface ArticleDialogProps {
  /** `null` means adding; a value means editing that article in place. */
  article: InternalArticle | null
  groupOptions: string[]
  onClose: () => void
  onSave: (article: InternalArticle) => void
}

export function ArticleDialog({ article, groupOptions, onClose, onSave }: ArticleDialogProps) {
  const isEditing = Boolean(article)
  const [category, setCategory] = useState<ArticleCategory | null>(article?.category ?? null)
  const [title, setTitle] = useState(article?.title ?? '')
  const [summary, setSummary] = useState(article?.summary ?? '')
  const [body, setBody] = useState(article?.body ?? '')
  const [groups, setGroups] = useState<string[]>(article?.groups ?? [])
  const [visibility, setVisibility] = useState<KnowledgeVisibility>(article?.visibility ?? 'internal')
  const [error, setError] = useState<string | null>(null)

  function toggleGroup(group: string) {
    setGroups((prev) => (prev.includes(group) ? prev.filter((entry) => entry !== group) : [...prev, group]))
  }

  function handleSubmit() {
    if (!category) {
      setError('Select a category.')
      return
    }
    if (!title.trim() || !summary.trim() || !body.trim()) {
      setError('Title, summary and body are all required.')
      return
    }

    const today = formatToday()
    onSave({
      id: article?.id ?? generateId(),
      title: title.trim(),
      summary: summary.trim(),
      body: body.trim(),
      category,
      groups,
      visibility,
      // A new page starts as a draft until someone confirms it — the same
      // reason "First week as a CSR" is seeded that way. Editing an existing
      // article does not reset a review that already happened.
      reviewStatus: article?.reviewStatus ?? 'draft',
      lastReviewedOn: article?.lastReviewedOn ?? 'Not yet reviewed',
      owner: article?.owner ?? createDefaultOwner(),
      updatedOn: today,
      views: article?.views ?? 0,
      isPinned: article?.isPinned ?? false,
    })
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
          <DialogTitle>{isEditing ? 'Edit article' : 'Add article'}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Input label="Title *" placeholder="e.g. Refund authority limits" value={title} onChange={(e) => setTitle(e.target.value)} />

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

          <Textarea
            label="Summary *"
            placeholder="One line shown in the list before anyone opens it"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
          />

          <Textarea
            label="Body *"
            placeholder="The full playbook, procedure or policy text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
          />

          <GroupPicker groups={groupOptions} selected={groups} onToggle={toggleGroup} />

          <VisibilityToggle value={visibility} onChange={setVisibility} />

          {error && <p className="text-xs text-red-600">{error}</p>}
        </DialogBody>
        <DialogFooter>
          <DialogPrimaryButton onClick={handleSubmit}>{isEditing ? 'Save' : 'Add article'}</DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
