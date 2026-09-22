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
import { createFaqAuthor, faqCategories } from '../data/mockBotTrainingData'
import { formatToday } from '../utils/formatDate'
import { generateId } from '@/lib/utils'
import type { FaqCategory, SourceFaq } from '../types'

interface FaqDialogProps {
  faq: SourceFaq | null
  onClose: () => void
  onSave: (faq: SourceFaq) => void
}

export function FaqDialog({ faq, onClose, onSave }: FaqDialogProps) {
  const isEditing = Boolean(faq)
  const [category, setCategory] = useState<FaqCategory | null>(faq?.category ?? null)
  const [question, setQuestion] = useState(faq?.question ?? '')
  const [answer, setAnswer] = useState(faq?.answer ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    if (!category) {
      setError('Select a category.')
      return
    }
    if (!question.trim() || !answer.trim()) {
      setError('Question and answer are required.')
      return
    }

    onSave({
      id: faq?.id ?? generateId(),
      category,
      question: question.trim(),
      answer: answer.trim(),
      isEnabled: faq?.isEnabled ?? true,
      answersServed: faq?.answersServed ?? 0,
      author: faq?.author ?? createFaqAuthor(),
      addedOn: faq?.addedOn ?? formatToday(),
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
          <DialogTitle>{isEditing ? 'Edit FAQs' : 'Add FAQs'}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Select Category *</span>
            <Select value={category} onValueChange={(value) => setCategory(value as FaqCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="select category" />
              </SelectTrigger>
              <SelectContent>
                {faqCategories.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Textarea label="Question" placeholder="Enter question here" value={question} onChange={(e) => setQuestion(e.target.value)} rows={2} />

          <Textarea label="Answer" placeholder="Enter answer here" value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} />

          {error && <p className="text-xs text-red-600">{error}</p>}
        </DialogBody>
        <DialogFooter>
          <DialogPrimaryButton onClick={handleSubmit}>{isEditing ? 'Save' : 'Add'}</DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
