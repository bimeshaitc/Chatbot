import {
  BarChart3,
  BookOpen,
  CalendarClock,
  CreditCard,
  Globe,
  History,
  LayoutDashboard,
  Megaphone,
  MessageSquareQuote,
  MessagesSquare,
  Settings,
  Tag,
  Tags,
  TicketIcon,
  Users,
} from 'lucide-react'
import type { Permission } from '@/config/roles'

/**
 * The sidebar model, lifted out of `Sidebar.tsx` so the router can gate the
 * same list the rail filters on — one source of truth for "who may see what",
 * rather than a nav that hides a page the URL still serves.
 */
export interface NavChild {
  label: string
  to: string
  /** An array means "any of these". */
  permission?: Permission | Permission[]
  /** Only shown when the global app version (`useAppVersionStore`) is V2. */
  v2Only?: boolean
}

export interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  to?: string
  permission?: Permission | Permission[]
  children?: NavChild[]
  /** Only shown when the global app version (`useAppVersionStore`) is V2. */
  v2Only?: boolean
}

export const navItems: NavItem[] = [
  // Ungated on purpose: every role needs a landing page.
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'User Management', icon: Users, to: '/user-management', permission: 'people.view' },
  // A single link, not a submenu: the chat feature has its own inbox rail
  // (My chats / AI Bot / Team chats / Archive) inside the page, with counts,
  // a handoff alert and the active scope spelled out — richer than a sidebar
  // submenu could be. Splitting the same four names across both places just
  // made the sidebar say the page's first sentence back to it.
  {
    label: 'Chat',
    icon: MessagesSquare,
    to: '/chat',
    permission: ['chats.view.own', 'chats.view.team', 'chats.view.all', 'bot.queue.view'],
  },
  {
    // "Tickets" rather than "Help Desk" — the feature is called Ticket
    // everywhere in the code (the type, the page, the hooks); the nav label
    // is the only place a borrowed vendor-category name ("Help Desk" is
    // literally what Zendesk/Freshdesk call their product) had drifted in.
    label: 'Tickets',
    icon: TicketIcon,
    to: '/tickets',
    permission: ['tickets.view.own', 'tickets.view.team', 'tickets.view.all'],
  },
  { label: 'Visitors', icon: Globe, to: '/visitors', permission: 'workspace.visitors.view' },
  // A single link, not a submenu: switching between that page's own v1/v2
  // *layout* is the header's per-page dropdown's job. `v2Only` here is a
  // different axis — the global app-version switch — and decides whether
  // this feature exists in the product at all.
  { label: 'Shifts', icon: CalendarClock, to: '/shifts', permission: 'shifts.view', v2Only: true },
  { label: 'Business Plan', icon: CreditCard, to: '/business-plan', v2Only: true },
  { label: 'Category', icon: Tags, to: '/category', permission: 'workspace.categories.manage' },
  { label: 'Tags', icon: Tag, to: '/tags', permission: 'workspace.tags.manage' },
  {
    label: 'Canned Responses',
    icon: MessageSquareQuote,
    to: '/canned-responses',
    permission: 'chats.cannedResponses.manage',
  },
  {
    label: 'Knowledge',
    icon: BookOpen,
    children: [
      { label: 'Knowledge Base', to: '/knowledge-base', permission: 'knowledge.internal.view' },
      { label: 'Chatbot Knowledge', to: '/bot-training', permission: 'knowledge.bot.view' },
    ],
  },
  { label: 'Campaigns', icon: Megaphone, to: '/campaigns', permission: 'workspace.campaigns.manage' },
  {
    label: 'Reports',
    icon: BarChart3,
    to: '/reports',
    permission: ['reports.view.own', 'reports.view.team', 'reports.view.all'],
  },
  {
    label: 'Settings',
    icon: Settings,
    children: [
      { label: 'Bot Setting', to: '/bot-setting', permission: 'bot.settings.view' },
      { label: 'Integration', to: '/integration', permission: 'workspace.integrations.manage', v2Only: true },
    ],
  },
  { label: 'Activities log', icon: History, to: '/activities-log', permission: 'workspace.activityLog.view' },
]
