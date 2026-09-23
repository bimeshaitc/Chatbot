import { useState } from 'react'
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
import { articleCategories, createArticleAuthor } from '../data/mockBotTrainingData'
import { formatToday } from '../utils/formatDate'
import { generateId } from '@/lib/utils'
import type { ArticleCategory, SourceArticle } from '../types'

interface ArticleDialogProps {
  article: SourceArticle | null
  onClose: () => void
  onSave: (article: SourceArticle) => void
}

export function ArticleDialog({ article, onClose, onSave }: ArticleDialogProps) {
  const isEditing = Boolean(article)
  const [category, setCategory] = useState<ArticleCategory | null>(article?.category ?? null)
  const [title, setTitle] = useState(article?.title ?? '')
  const [content, setContent] = useState(article?.content ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    if (!category) {
      setError('Select a category.')
      return
    }
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.')
      return
    }

    onSave({
      id: article?.id ?? generateId(),
      category,
      title: title.trim(),
      content: content.trim(),
      status: article?.status ?? 'queued',
      audience: article?.audience ?? 'public',
      isEnabled: article?.isEnabled ?? true,
      chunks: article?.chunks ?? 0,
      answersServed: article?.answersServed ?? 0,
      lastTrainedOn: article?.lastTrainedOn ?? 'Never',
      author: article?.author ?? createArticleAuthor(),
      addedOn: article?.addedOn ?? formatToday(),
      matchedIntents: article?.matchedIntents,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Article' : 'Add Article'}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Select Category *</span>
            <Select value={category} onValueChange={(value) => setCategory(value as ArticleCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="select category" />
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

          <Textarea label="Title" placeholder="Enter article title here" value={title} onChange={(e) => setTitle(e.target.value)} rows={2} />

          <Textarea label="Content" placeholder="Enter article content here" value={content} onChange={(e) => setContent(e.target.value)} rows={4} />

          {error && <p className="text-xs text-red-600">{error}</p>}
        </DialogBody>
        <DialogFooter>
          <DialogPrimaryButton onClick={handleSubmit}>{isEditing ? 'Save' : 'Add'}</DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
