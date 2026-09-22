import { useQuery, useQueryClient } from '@tanstack/react-query'
import { generateId } from '@/lib/utils'
import { initialCategories } from '../data/mockCategoryData'
import type { Category, NewCategoryInput } from '../types'

const categoriesQueryKey = ['categories'] as const

const currentUser = { name: 'James Katwal', initials: 'JK', avatarColor: 'bg-sky-200 text-sky-700', role: 'Admin' }

function today() {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * The one shared category store (BE-05). Tickets and chat both read from
 * this — see the feature doc comment on `types/index.ts` for why it replaced
 * three disconnected lists.
 */
export function useCategories() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: async () => initialCategories,
    initialData: () => initialCategories,
  })

  const categories = query.data ?? []
  const activeCategories = categories.filter((category) => category.enabled)

  function addCategory(input: NewCategoryInput) {
    const category: Category = {
      id: generateId(),
      name: input.name,
      enabled: true,
      addedBy: currentUser,
      addedOn: today(),
    }
    queryClient.setQueryData<Category[]>(categoriesQueryKey, (prev) => [category, ...(prev ?? [])])
    return category
  }

  function renameCategory(id: string, name: string) {
    queryClient.setQueryData<Category[]>(categoriesQueryKey, (prev) =>
      (prev ?? []).map((category) => (category.id === id ? { ...category, name } : category)),
    )
  }

  /** Disables/re-enables without touching existing chat/ticket references — deleting would orphan them. */
  function setCategoryEnabled(id: string, enabled: boolean) {
    queryClient.setQueryData<Category[]>(categoriesQueryKey, (prev) =>
      (prev ?? []).map((category) => (category.id === id ? { ...category, enabled } : category)),
    )
  }

  function deleteCategory(id: string) {
    queryClient.setQueryData<Category[]>(categoriesQueryKey, (prev) => (prev ?? []).filter((category) => category.id !== id))
  }

  return { categories, activeCategories, addCategory, renameCategory, setCategoryEnabled, deleteCategory }
}
