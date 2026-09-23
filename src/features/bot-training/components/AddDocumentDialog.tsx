import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { generateId } from '@/lib/utils'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPrimaryButton,
  DialogTitle,
} from '@/components/ui/dialog'
import { createDefaultAuthor } from '../data/mockBotTrainingData'
import { formatToday } from '../utils/formatDate'
import type { SourceDocument } from '../types'

interface AddDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (document: SourceDocument) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024

function formatFileSize(bytes: number) {
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} mb` : `${Math.max(1, Math.round(bytes / 1024))} kb`
}

export function AddDocumentDialog({ open, onOpenChange, onAdd }: AddDocumentDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setName('')
    setFile(null)
    setError(null)
  }

  function handleFileSelect(selected: File | null) {
    if (!selected) return
    if (!/\.(pdf|docx)$/i.test(selected.name)) {
      setError('Only PDF or DOCX files are supported.')
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
    if (!name.trim()) {
      setError('Document name is required.')
      return
    }
    if (!file) {
      setError('Please upload a document.')
      return
    }

    onAdd({
      id: generateId(),
      name: name.trim(),
      sizeLabel: formatFileSize(file.size),
      status: 'queued',
      audience: 'public',
      isEnabled: true,
      chunks: 0,
      answersServed: 0,
      lastTrainedOn: 'Never',
      author: createDefaultAuthor(),
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
          <DialogTitle>Add training document</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Input label="Document Name *" placeholder="Enter document name" value={name} onChange={(e) => setName(e.target.value)} />

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Upload Document</span>
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
                  Drag &amp; Drop or <span className="text-emerald-600 underline">Click To Upload</span> Your File
                </span>
              )}
              <span className="text-xs text-gray-400">Supported file type: PDF, DOCX Max 10MB</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </DialogBody>
        <DialogFooter>
          <DialogPrimaryButton onClick={handleSubmit}>Upload</DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
