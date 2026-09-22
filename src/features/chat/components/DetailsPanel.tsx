import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Ticket } from '@/features/tickets'
import type { ActivityLogEntry, Conversation, CustomerProfile, DetailsSideTab } from '../types'
import { CustomerInfoAndNotes } from './CustomerInfoAndNotes'
import { HistoryList } from './HistoryList'
import { TicketSection } from './TicketSection'

const tabs: { value: DetailsSideTab; label: string }[] = [
  { value: 'details', label: 'Details' },
  { value: 'ticket', label: 'Ticket' },
  { value: 'history', label: 'History' },
]

interface DetailsPanelProps {
  conversation: Conversation | null
  activityEntries: ActivityLogEntry[]
  customerProfile: CustomerProfile | null
  tickets: Ticket[]
  viewerAgentId: string
  activeTab: DetailsSideTab
  isOpen: boolean
  onTabChange: (tab: DetailsSideTab) => void
  onAddNote: (note: string) => void
  onIdentifyCustomer: (name: string) => void
  onCreateTicket: () => void
  onClose: () => void
}

export function DetailsPanel({
  conversation,
  activityEntries,
  customerProfile,
  tickets,
  viewerAgentId,
  activeTab,
  isOpen,
  onTabChange,
  onAddNote,
  onIdentifyCustomer,
  onCreateTicket,
  onClose,
}: DetailsPanelProps) {
  // Rendered only when open. It used to sit permanently in the flex row and be
  // slid off-canvas with a transform, which meant that on any viewport between
  // 1024px and ~1300px it competed for width it could not get and ended up
  // squeezed to nothing.
  if (!isOpen) return null

  return (
    <>
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 xl:hidden"
      />
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-gray-100 bg-white',
          // Docked as a real column from 1280px up (matching ChatView's media
          // query) and never allowed to shrink; an overlay drawer below that.
          'xl:static xl:z-auto xl:w-80 xl:max-w-none xl:shrink-0',
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 pt-3">
          <div className="flex items-center gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => onTabChange(tab.value)}
                className={cn(
                  'flex items-center gap-1.5 border-b-2 pb-2.5 text-sm font-medium transition-colors',
                  activeTab === tab.value
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700',
                )}
              >
                {tab.label}
                {tab.value === 'ticket' && tickets.length > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-100 px-1 text-[10px] font-medium text-gray-600">
                    {tickets.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="mb-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!conversation ? (
            <p className="text-sm text-gray-400">Select a chat to see its details.</p>
          ) : activeTab === 'details' ? (
            <CustomerInfoAndNotes
              conversation={conversation}
              customerProfile={customerProfile}
              activityEntries={activityEntries}
              viewerAgentId={viewerAgentId}
              onAddNote={onAddNote}
              onIdentifyCustomer={onIdentifyCustomer}
            />
          ) : activeTab === 'ticket' ? (
            <TicketSection tickets={tickets} onCreateTicket={onCreateTicket} />
          ) : (
            <HistoryList entries={activityEntries} />
          )}
        </div>
      </aside>
    </>
  )
}
