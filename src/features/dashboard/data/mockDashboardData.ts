import type { CategoryTicket, RecentConversation, StatCard, TopAgent, TrendPoint } from '../types'

export const statCards: StatCard[] = [
  {
    label: 'Total Chat',
    value: '225',
    changeLabel: '+12.5% from last week',
    accent: 'green',
    description: 'Conversations started in the selected period, across every channel and including both bot-only and agent-handled chats.',
  },
  {
    label: 'Online Agent',
    value: '25/30',
    changeLabel: '+12.5% from last week',
    accent: 'blue',
    description: 'Agents currently marked available out of all agents rostered on shift right now.',
  },
  {
    label: 'Resolution Rate',
    value: '20%',
    changeLabel: '+12.5% from last week',
    accent: 'purple',
    description: 'Share of conversations in the period that reached a resolved status. Chats still open at period end count against it.',
  },
  {
    label: 'CSAT Score',
    value: '4/5',
    changeLabel: '+12.5% from last week',
    accent: 'orange',
    description: 'Average customer satisfaction rating out of 5, from post-chat surveys answered in the period.',
  },
]

/**
 * One row per category. This used to contain 'Services' and 'Financial
 * Support' twice with different counts, which rendered as six bars for four
 * categories and made the chart unreadable — the same name twice showing
 * different numbers has no interpretation.
 *
 * The card still aggregates by label defensively, so a real endpoint returning
 * split rows sums them rather than drawing duplicates.
 */
export const ticketsByCategory: CategoryTicket[] = [
  { label: 'Billing and Subscription', count: 18 },
  { label: 'Services', count: 15 },
  { label: 'Financial Support', count: 10 },
  { label: 'Technical Support', count: 7 },
  { label: 'Onboarding', count: 4 },
]

export const conversationsTrend: TrendPoint[] = [
  { day: 'Sun', received: 120, resolved: 90 },
  { day: 'Monday', received: 180, resolved: 140 },
  { day: 'Tuesday', received: 260, resolved: 210 },
  { day: 'Wednesday', received: 340, resolved: 260 },
  { day: 'Thurs day', received: 300, resolved: 250 },
  { day: 'Fri day', received: 360, resolved: 300 },
  { day: 'Saturday', received: 260, resolved: 200 },
]

export const recentConversations: RecentConversation[] = [
  {
    id: '1',
    customer: 'Alex Thompson',
    initials: 'MD',
    avatarColor: 'bg-indigo-200 text-indigo-700',
    message: 'Hello, is anyone available to help me? ...',
    tags: ['Pricing', 'Products'],
    status: 'pending',
    unreadCount: 2,
    time: '1:00 AM',
  },
  {
    id: '2',
    customer: 'Alex Thompson',
    initials: 'MD',
    avatarColor: 'bg-indigo-200 text-indigo-700',
    message: 'Hello, is anyone available to help me? ...',
    tags: ['Pricing', 'Products'],
    status: 'resolved',
    unreadCount: 2,
    time: '1:00 AM',
  },
  {
    id: '3',
    customer: 'Alex Thompson',
    initials: 'MD',
    avatarColor: 'bg-indigo-200 text-indigo-700',
    message: 'Hello, is anyone available to help me? ...',
    tags: ['Pricing', 'Products'],
    status: 'unassigned',
    unreadCount: 2,
    time: '1:00 AM',
  },
]

export const topAgents: TopAgent[] = [
  { id: '1', name: 'Peter Thornton', initials: 'PT', avatarColor: 'bg-rose-200 text-rose-700', chatsHandled: 10, avgHandledTime: '5 min', csatScore: 4.5 },
  { id: '2', name: 'Brian Tanner', initials: 'BT', avatarColor: 'bg-amber-200 text-amber-700', chatsHandled: 15, avgHandledTime: '5 min', csatScore: 4.5 },
  { id: '3', name: 'Hillary Banks', initials: 'HB', avatarColor: 'bg-emerald-200 text-emerald-700', chatsHandled: 20, avgHandledTime: '5 min', csatScore: 4.5 },
  { id: '4', name: 'Ashley Banks', initials: 'AB', avatarColor: 'bg-sky-200 text-sky-700', chatsHandled: 10, avgHandledTime: '5 min', csatScore: 4.5 },
  { id: '5', name: 'Paul Pfeiffer', initials: 'PP', avatarColor: 'bg-violet-200 text-violet-700', chatsHandled: 25, avgHandledTime: '5 min', csatScore: 4.5 },
]
