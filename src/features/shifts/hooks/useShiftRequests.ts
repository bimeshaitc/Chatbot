import { useQuery, useQueryClient } from '@tanstack/react-query'
import { shiftRequests as seedRequests } from '../data/mockShiftsData'
import type { ShiftRequest } from '../types'

const requestsQueryKey = ['shifts', 'requests'] as const

/**
 * "Never their own" (the `shifts.approve` catalog text) is enforced here as
 * well as in `ApprovalRow` — the UI hides the buttons, but `decide` itself
 * refuses the write so nothing depends on the UI guard alone.
 */
export function useShiftRequests() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: requestsQueryKey,
    queryFn: () => Promise.resolve(seedRequests),
    initialData: () => seedRequests,
  })

  const requests = query.data ?? []

  function createRequest(request: ShiftRequest) {
    queryClient.setQueryData<ShiftRequest[]>(requestsQueryKey, (prev) => [request, ...(prev ?? [])])
  }

  function decide(
    requestId: string,
    decision: 'approved' | 'declined',
    deciderAgentId: string,
    declineReason?: string,
  ) {
    const request = requests.find((entry) => entry.id === requestId)
    if (!request || request.requestedBy === deciderAgentId) return

    queryClient.setQueryData<ShiftRequest[]>(requestsQueryKey, (prev) =>
      (prev ?? []).map((entry) =>
        entry.id === requestId
          ? {
              ...entry,
              status: decision,
              decidedBy: deciderAgentId,
              decidedAt: new Date().toISOString(),
              declineReason: decision === 'declined' ? declineReason : undefined,
            }
          : entry,
      ),
    )
  }

  return { requests, createRequest, decide }
}
