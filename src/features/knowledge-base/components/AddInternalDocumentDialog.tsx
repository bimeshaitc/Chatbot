import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
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
import type { ArticleCategory, InternalDocument, KnowledgeVisibility } from '../types'
import { GroupPicker } from './GroupPicker'
import { VisibilityToggle } from './VisibilityToggle'

interface AddInternalDocumentDialogProps {
  open: boolean
  groupOptions: string[]
  onOpenChange: (open: boolean) => void
  onAdd: (document: InternalDocument) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024

function formatFileSize(bytes: number) {
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} mb` : `${Math.max(1, Math.round(bytes / 1024))} kb`
}

export function AddInternalDocumentDialog({ open, groupOptions, onOpenChange, onAdd }: AddInternalDocumentDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState<ArticleCategory | null>(null)
  const [groups, setGroups] = useState<string[]>([])
  const [visibility, setVisibility] = useState<KnowledgeVisibility>('internal')
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setFile(null)
    setCategory(null)
    setGroups([])
    setVisibility('internal')
    setError(null)
  }

  function toggleGroup(group: string) {
    setGroups((prev) => (prev.includes(group) ? prev.filter((entry) => entry !== group) : [...prev, group]))
  }

  function handleFileSelect(selected: File | null) {
    if (!selected) return
    if (!/\.(pdf|docx?)$/i.test(selected.name)) {
      setError('Only PDF or Word documents are supported.')
      return
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError('File must be 10MB or smaller.')
      return
    }
    setError(null)
    setFile(selected)
  }

  function handleSubmit() {
    if (!file) {
      setError('Please upload a document.')
      return
    }
    if (!category) {
      setError('Select a category.')
      return
    }

    onAdd({
      id: generateId(),
      name: file.name,
      sizeLabel: formatFileSize(file.size),
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
          <DialogTitle>Add document</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Upload document</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                handleFileSelect(e.dataTransfer.files[0] ?? null)
              }}
              className="flex flex-col items-center gap-1 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 hover:border-emerald-300"
            >
              <UploadCloud className="h-6 w-6 text-emerald-600" />
              {file ? (
                <span className="font-medium text-gray-700">{file.name}</span>
              ) : (
                <span>
                  Drag &amp; drop or <span className="text-emerald-600 underline">click to upload</span>
                </span>
              )}
              <span className="text-xs text-gray-400">PDF or Word, max 10MB</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            />
          </div>

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
            {visibility === 'internal'
              ? 'Staff only — this never reaches the chatbot or a customer.'
              : 'Public — eligible to feed the chatbot once added under Chatbot Knowledge.'}
          </p>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </DialogBody>
        <DialogFooter>
          <DialogPrimaryButton onClick={handleSubmit}>Add document</DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
