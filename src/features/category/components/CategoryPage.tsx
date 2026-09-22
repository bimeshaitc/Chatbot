import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/PageHeader'
import { useCategories } from '../hooks/useCategories'
import type { Category } from '../types'
import { CategoryTable } from './CategoryTable'
import { AddCategoryDialog } from './AddCategoryDialog'

export function CategoryPage() {
  const { categories, addCategory, renameCategory, setCategoryEnabled, deleteCategory } = useCategories()
  const [search, setSearch] = useState('')
  const [dialogState, setDialogState] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null })

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.name.toLowerCase().includes(search.toLowerCase())),
    [categories, search],
  )

  function handleDeleteCategory(id: string) {
    if (!window.confirm('Delete this category? Existing chats/tickets referencing it will show it as unavailable — disabling it instead keeps it visible on them.')) return
    deleteCategory(id)
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-2xl">
      <PageHeader
        title="Categories List"
        description="Categories are used for ticket management and to assign tickets to CSRs according to their expertise."
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name" className="pl-9" />
          </div>

          <Button
            onClick={() => setDialogState({ open: true, category: null })}
            className="bg-[#1B5E20] text-white hover:bg-[#1B5E20]/90"
          >
            + Add New Category
          </Button>
        </div>

        <div className="mt-5">
          <CategoryTable
            categories={filteredCategories}
            onEdit={(category) => setDialogState({ open: true, category })}
            onToggleEnabled={(category) => setCategoryEnabled(category.id, !category.enabled)}
            onDelete={handleDeleteCategory}
          />
        </div>
      </div>

      {dialogState.open && (
        <AddCategoryDialog
          category={dialogState.category}
          onClose={() => setDialogState({ open: false, category: null })}
          onCreate={(name) => addCategory({ name })}
          onRename={renameCategory}
        />
      )}
    </div>
  )
}
