import { useMemo, useState } from 'react'
import { Search, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/lib/utils'
import { useVisitors } from '../hooks/useVisitors'
import type { Visitor } from '../types'
import { VisitorDetailDialog } from './VisitorDetailDialog'

type IdentityFilter = 'all' | 'identified' | 'anonymous'

const identityFilters: { value: IdentityFilter; label: string }[] = [
  { value: 'all', label: 'All visitors' },
  { value: 'identified', label: 'Identified' },
  { value: 'anonymous', label: 'Anonymous' },
]

export function VisitorsPage() {
  const { visitors } = useVisitors()
  const [search, setSearch] = useState('')
  const [identityFilter, setIdentityFilter] = useState<IdentityFilter>('all')
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null)

  const filteredVisitors = useMemo(() => {
    const query = search.trim().toLowerCase()
    return visitors
      .filter((visitor) => {
        if (identityFilter === 'identified') return visitor.isIdentified
        if (identityFilter === 'anonymous') return !visitor.isIdentified
        return true
      })
      .filter((visitor) => {
        if (!query) return true
        return [visitor.name, visitor.email, visitor.location].join(' ').toLowerCase().includes(query)
      })
      .sort((a, b) => (a.lastSeen < b.lastSeen ? 1 : -1))
  }, [visitors, identityFilter, search])

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-2xl">
      <PageHeader
        title="Visitors"
        description="Everyone who has landed on the widget — identified customers and anonymous browsers alike."
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {identityFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setIdentityFilter(filter.value)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  identityFilter === filter.value
                    ? 'border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or location"
              className="pl-9"
            />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-[#F7F7F8] text-xs tracking-wide text-gray-600 uppercase">
                <th className="p-4 font-medium">Visitor</th>
                <th className="p-4 font-medium">Location</th>
                <th className="p-4 font-medium">Device</th>
                <th className="p-4 font-medium">Last seen</th>
                <th className="p-4 font-medium">Chats</th>
                <th className="p-4 font-medium">Tickets</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                    No visitors match that.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((visitor, index) => (
                  <tr
                    key={visitor.id}
                    onClick={() => setSelectedVisitor(visitor)}
                    className={cn(
                      'cursor-pointer hover:bg-gray-50',
                      index !== filteredVisitors.length - 1 && 'border-b border-gray-100',
                    )}
                  >
                    <td className="p-4">
                      <span className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                            visitor.avatarColor,
                          )}
                        >
                          {visitor.initials || <UserRound className="h-3.5 w-3.5" />}
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <span className={cn('truncate', visitor.isIdentified ? 'text-gray-900' : 'text-gray-500 italic')}>
                            {visitor.name || 'Anonymous visitor'}
                          </span>
                          <span className="truncate text-xs text-gray-400">{visitor.email || 'No email on file'}</span>
                        </span>
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{visitor.location}</td>
                    <td className="p-4 text-gray-600">{visitor.device}</td>
                    <td className="p-4 text-gray-600">{visitor.lastSeen}</td>
                    <td className="p-4">
                      {visitor.totalConversations > 0 ? (
                        <Badge variant="blue">{visitor.totalConversations}</Badge>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {visitor.totalTickets > 0 ? (
                        <Badge variant="violet">{visitor.totalTickets}</Badge>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedVisitor && <VisitorDetailDialog visitor={selectedVisitor} onClose={() => setSelectedVisitor(null)} />}
    </div>
  )
}
