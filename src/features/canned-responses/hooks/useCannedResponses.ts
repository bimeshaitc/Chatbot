import { useQuery, useQueryClient } from '@tanstack/react-query'
import { initialCannedResponses } from '../data/mockCannedResponsesData'
import type { CannedResponseConfig, NewCannedResponseInput } from '../types'

const cannedResponsesQueryKey = ['canned-responses'] as const

function today() {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function normalizeShortcut(shortcut: string) {
  const trimmed = shortcut.trim().replace(/\s+/g, '')
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

interface Owner {
  id: string
  name: string
}

/** The one shared canned-response store — the admin page and the composer both read this. */
export function useCannedResponses() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: cannedResponsesQueryKey,
    queryFn: async () => initialCannedResponses,
    initialData: () => initialCannedResponses,
  })

  const responses = query.data ?? []

  function addResponse(input: NewCannedResponseInput, owner: Owner) {
    const response: CannedResponseConfig = {
      id: `cr-${Date.now()}`,
      title: input.title,
      body: input.body,
      shortcut: normalizeShortcut(input.shortcut),
      visibility: input.visibility,
      groups: input.visibility === 'shared' ? input.groups : [],
      ownerId: owner.id,
      ownerName: owner.name,
      createdAt: today(),
    }
    queryClient.setQueryData<CannedResponseConfig[]>(cannedResponsesQueryKey, (prev) => [...(prev ?? []), response])
    return response
  }

  function updateResponse(id: string, changes: NewCannedResponseInput) {
    queryClient.setQueryData<CannedResponseConfig[]>(cannedResponsesQueryKey, (prev) =>
      (prev ?? []).map((response) =>
        response.id === id
          ? {
              ...response,
              ...changes,
              shortcut: normalizeShortcut(changes.shortcut),
              groups: changes.visibility === 'shared' ? changes.groups : [],
            }
          : response,
      ),
    )
  }

  function deleteResponse(id: string) {
    queryClient.setQueryData<CannedResponseConfig[]>(cannedResponsesQueryKey, (prev) =>
      (prev ?? []).filter((response) => response.id !== id),
    )
  }

  return { responses, addResponse, updateResponse, deleteResponse }
}
