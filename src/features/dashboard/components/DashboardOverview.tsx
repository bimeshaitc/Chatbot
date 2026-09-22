import { ChevronDown } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { StatsRow } from './StatsRow'
import { TicketsByCategoryCard } from './TicketsByCategoryCard'
import { ConversationsTrendCard } from './ConversationsTrendCard'
import { RecentConversationsCard } from './RecentConversationsCard'
import { TopAgentsCard } from './TopAgentsCard'

export function DashboardOverview() {
  return (
    <div className="flex flex-col gap-6 p-4 bg-white rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title="Hi Arjun, Welcome Back 👋" description="Track chatbot performance and agent activity in one place." />
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Today
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <StatsRow />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TicketsByCategoryCard />
        <ConversationsTrendCard />
        <RecentConversationsCard />
        <TopAgentsCard />
      </div>
    </div>
  )
}
