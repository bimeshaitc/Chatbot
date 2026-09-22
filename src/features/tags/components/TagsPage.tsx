import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/PageHeader'
import { useTags } from '../hooks/useTags'
import type { NewTagInput, Tag } from '../types'
import { TagTable } from './TagTable'
import { AddTagDialog } from './AddTagDialog'

export function TagsPage() {
  const { tags, addTag, updateTag, deleteTag } = useTags()
  const [search, setSearch] = useState('')
  const [dialogState, setDialogState] = useState<{ open: boolean; tag: Tag | null }>({ open: false, tag: null })

  const filteredTags = useMemo(
    () => tags.filter((tag) => tag.name.toLowerCase().includes(search.toLowerCase())),
    [tags, search],
  )

  function handleSave(input: NewTagInput) {
    if (dialogState.tag) {
      updateTag(dialogState.tag.id, input)
      toast.success(`Updated "${input.name}"`)
    } else {
      addTag(input)
      toast.success(`Added "${input.name}"`)
    }
  }

  function handleDelete(id: string) {
    const tag = tags.find((entry) => entry.id === id)
    if (!tag) return
    if (!window.confirm(`Delete the "${tag.name}" tag? It stays on tickets/chats that already have it, but disappears from the picker.`)) return
    deleteTag(id)
    toast.success(`Deleted "${tag.name}"`)
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-2xl">
      <PageHeader
        title="Tags"
        description="The shared tag list agents pick from when labelling a chat or a ticket."
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tags" className="pl-9" />
          </div>

          <Button
            onClick={() => setDialogState({ open: true, tag: null })}
            className="bg-[#1B5E20] text-white hover:bg-[#1B5E20]/90"
          >
            + Add New Tag
          </Button>
        </div>

        <div className="mt-5">
          <TagTable
            tags={filteredTags}
            onEdit={(tag) => setDialogState({ open: true, tag })}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {dialogState.open && (
        <AddTagDialog
          tag={dialogState.tag}
          existingNames={tags.map((tag) => tag.name)}
          onClose={() => setDialogState({ open: false, tag: null })}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
