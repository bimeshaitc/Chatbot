import { useQuery, useQueryClient } from '@tanstack/react-query'
import { initialTags } from '../data/mockTagsData'
import type { NewTagInput, Tag } from '../types'

const tagsQueryKey = ['tags'] as const

function today() {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * The one shared tag store. Tickets and chat both read from this — see the
 * feature doc comment on `types/index.ts` for why it replaced two hardcoded
 * lists.
 */
export function useTags() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: tagsQueryKey,
    queryFn: async () => initialTags,
    initialData: () => initialTags,
  })

  const tags = query.data ?? []

  function addTag(input: NewTagInput) {
    const tag: Tag = {
      id: input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      ...input,
      createdAt: today(),
    }
    queryClient.setQueryData<Tag[]>(tagsQueryKey, (prev) => [...(prev ?? []), tag])
    return tag
  }

  function updateTag(id: string, changes: NewTagInput) {
    queryClient.setQueryData<Tag[]>(tagsQueryKey, (prev) =>
      (prev ?? []).map((tag) => (tag.id === id ? { ...tag, ...changes } : tag)),
    )
  }

  function deleteTag(id: string) {
    queryClient.setQueryData<Tag[]>(tagsQueryKey, (prev) => (prev ?? []).filter((tag) => tag.id !== id))
  }

  return { tags, addTag, updateTag, deleteTag }
}
