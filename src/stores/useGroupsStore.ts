import { useEffect } from 'react'
import { create } from 'zustand'

/**
 * Canonical vocabulary of workspace groups — routes chats/tickets, gates
 * knowledge base and canned-response visibility, and tags shift queues.
 * Single source of truth so a group created or removed here is immediately
 * reflected everywhere it's picked from, replacing the three duplicated
 * `groupOptions` arrays (user-management, knowledge-base, canned-responses)
 * that used to have to be kept in sync by hand.
 */
const DEFAULT_GROUPS = ['Technical', 'Finance', 'Service', 'Product']

type GroupUsageCounts = Record<string, number>

type GroupMutationResult = { ok: true } | { ok: false; error: string }

interface GroupsState {
  groups: string[]
  /** Usage counts reported by each feature with group-tagged records, keyed by feature name — see `useReportGroupUsage`. */
  usageByFeature: Record<string, GroupUsageCounts>
  addGroup: (name: string) => GroupMutationResult
  removeGroup: (name: string) => GroupMutationResult
  reportUsage: (feature: string, counts: GroupUsageCounts) => void
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: DEFAULT_GROUPS,
  usageByFeature: {},

  addGroup: (name) => {
    const trimmed = name.trim()
    if (!trimmed) return { ok: false, error: 'Enter a group name.' }
    if (get().groups.some((group) => group.toLowerCase() === trimmed.toLowerCase())) {
      return { ok: false, error: 'A group with that name already exists.' }
    }
    set((state) => ({ groups: [...state.groups, trimmed] }))
    return { ok: true }
  },

  // Blocks deletion while any feature still has a record tagged with this
  // group — otherwise a user/article/canned response is left pointing at a
  // group that no longer exists in the vocabulary.
  removeGroup: (name) => {
    const count = Object.values(get().usageByFeature).reduce((sum, counts) => sum + (counts[name] ?? 0), 0)
    if (count > 0) {
      return {
        ok: false,
        error: `${count} ${count === 1 ? 'record' : 'records'} still use this group — reassign them before removing it.`,
      }
    }
    set((state) => ({ groups: state.groups.filter((group) => group !== name) }))
    return { ok: true }
  },

  reportUsage: (feature, counts) => set((state) => ({ usageByFeature: { ...state.usageByFeature, [feature]: counts } })),
}))

/**
 * Lets a feature declare how many of its own records reference each group, so
 * `removeGroup` can refuse to delete one still in use elsewhere. Call with a
 * `counts` object memoized from that feature's own entity list — e.g.
 * `useReportGroupUsage('knowledge-base', groupUsage)` where `groupUsage` is a
 * `useMemo` tally over `articles`/`documents`/`links`.
 */
export function useReportGroupUsage(feature: string, counts: GroupUsageCounts) {
  const reportUsage = useGroupsStore((state) => state.reportUsage)
  useEffect(() => {
    reportUsage(feature, counts)
  }, [feature, counts, reportUsage])
}
