import { useQuery, useQueryClient } from '@tanstack/react-query'
import { shifts as seedShifts } from '../data/mockShiftsData'
import type { Shift } from '../types'

const shiftsQueryKey = ['shifts', 'shifts'] as const

export function useShifts() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: shiftsQueryKey,
    queryFn: () => Promise.resolve(seedShifts),
    initialData: () => seedShifts,
  })

  function patchShift(shiftId: string, patch: Partial<Shift>) {
    queryClient.setQueryData<Shift[]>(shiftsQueryKey, (prev) =>
      (prev ?? []).map((shift) => (shift.id === shiftId ? { ...shift, ...patch } : shift)),
    )
  }

  function addShift(shift: Shift) {
    queryClient.setQueryData<Shift[]>(shiftsQueryKey, (prev) => [...(prev ?? []), shift])
  }

  return { shifts: query.data ?? [], patchShift, addShift }
}
