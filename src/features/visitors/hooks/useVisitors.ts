import { useQuery } from '@tanstack/react-query'
import { initialVisitors } from '../data/mockVisitorsData'

const visitorsQueryKey = ['visitors'] as const

/** Read-only for now — tracking, not editing. */
export function useVisitors() {
  const query = useQuery({
    queryKey: visitorsQueryKey,
    queryFn: async () => initialVisitors,
    initialData: () => initialVisitors,
  })

  return { visitors: query.data ?? [] }
}
