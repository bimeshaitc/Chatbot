import { Outlet, useLocation } from 'react-router-dom'
import { HandoverBatchModal } from '@/features/shifts'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/knowledge-base': 'Knowledge Base',
  '/bot-training': 'Chatbot Knowledge',
  '/user-management': 'User Management',
  '/tickets': 'Tickets',
  '/shifts': 'Shifts',
  '/shifts-v2': 'Shifts',
  '/bot-setting-v2': 'Setting',
  '/business-plan': 'Business Plan',
  '/business-plan-v2': 'Business Plan',
  '/category': 'Category',
  '/tags': 'Tags',
  '/canned-responses': 'Canned Responses',
  '/visitors': 'Visitors',
  '/campaigns': 'Campaigns',
  '/reports': 'Reports',
  '/activities-log': 'Activities log',
  '/bot-setting': 'Setting',
  '/integration': 'Setting',
  '/integration-v2': 'Setting',
}

/** Keyed by the inbox segment of `/chat/:inbox`. */
const chatInboxTitles: Record<string, string> = {
  '': 'Chat',
  mine: 'My chats',
  bot: 'AI bot chats',
  team: 'Team chats',
  archive: 'Chat archive',
}

export function AppLayout() {
  const location = useLocation()
  const isFullBleed = location.pathname === '/chat' || location.pathname.startsWith('/chat/')
  const title = isFullBleed
    ? (chatInboxTitles[location.pathname.split('/')[2] ?? ''] ?? 'Chat')
    : (pageTitles[location.pathname] ?? 'Dashboard')

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} />
        <main className={isFullBleed ? 'flex-1 overflow-hidden p-4' : 'flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6'}>
          <Outlet />
        </main>
      </div>
      <HandoverBatchModal />
    </div>
  )
}
